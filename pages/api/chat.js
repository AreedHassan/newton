// pages/api/chat.js
import Groq from 'groq-sdk';
import { verifyToken, getToken } from '../../lib/auth';
import {
  buildMemoryForUser, getStory, appendStory,
  addRawFact, getRawFacts, getProfile, setProfile, clearRawFacts,
  getSessionMessages, addSessionMessage, updateSession, getSessions
} from '../../lib/db';
import { NEWTON_SYSTEM_PROMPT, SUMMARIZE_PROMPT, SESSION_NAME_PROMPT, extractUpdates, getError } from '../../lib/newton';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// silently compress raw facts into profile when threshold hit
async function maybeSummarize(userName) {
  try {
    const facts = await getRawFacts(userName);
    if (facts.length < 15) return;
    const existingProfile = await getProfile(userName);
    const inputText = existingProfile
      ? `existing profile:\n${existingProfile}\n\nnew facts:\n${facts.map(f => `- ${f}`).join('\n')}`
      : facts.map(f => `- ${f}`).join('\n');
    const res = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: SUMMARIZE_PROMPT(userName, inputText) }],
      max_tokens: 300,
      temperature: 0.3
    });
    const compressed = res.choices[0].message.content.trim();
    if (compressed) {
      await setProfile(userName, compressed);
      await clearRawFacts(userName);
    }
  } catch (e) {
    console.error('summarize failed silently:', e?.message);
  }
}

// silently name session after 3 messages
async function maybeNameSession(userName, sessionId, messages) {
  try {
    // only name if currently unnamed and we have exactly 3+ user messages
    const userMsgs = messages.filter(m => m.role === 'user');
    if (userMsgs.length !== 3) return;

    const sessions = await getSessions(userName);
    const session = sessions.find(s => s.id === sessionId);
    if (!session || session.name) return; // already named

    const res = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: SESSION_NAME_PROMPT(messages.slice(-6)) }],
      max_tokens: 20,
      temperature: 1.1
    });
    const title = res.choices[0].message.content.trim().replace(/['"]/g, '');
    if (title) await updateSession(userName, sessionId, { name: title });
  } catch (e) {
    console.error('session naming failed silently:', e?.message);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const user = verifyToken(getToken(req));
  if (!user) return res.status(401).json({ error: getError('generic') });

  const { message, sessionId } = req.body;
  if (!message?.trim()) return res.status(400).json({ error: 'kuch bol toh' });
  if (!sessionId) return res.status(400).json({ error: 'sessionId chahiye' });

  const [memory, story, history] = await Promise.all([
    buildMemoryForUser(user.name),
    getStory(),
    getSessionMessages(user.name, sessionId)
  ]);

  const recentHistory = history.slice(-30).map(m => ({
    role: m.role,
    content: m.content
  }));

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: NEWTON_SYSTEM_PROMPT(memory, story, user.name) },
        ...recentHistory,
        { role: 'user', content: message.trim() }
      ],
      max_tokens: 1024,
      temperature: 1.0
    });

    const raw = completion.choices[0].message.content;
    const { cleanText, memoryUpdate, storyUpdate } = extractUpdates(raw);

    // save both messages to this session
    await addSessionMessage(user.name, sessionId, { role: 'user', content: message.trim(), ts: Date.now() });
    await addSessionMessage(user.name, sessionId, { role: 'assistant', content: cleanText, ts: Date.now() });

    // memory update — background compression if needed
    if (memoryUpdate) {
      const result = await addRawFact(user.name, memoryUpdate);
      if (result.added && result.count >= 15) maybeSummarize(user.name);
    }

    if (storyUpdate) await appendStory(storyUpdate);

    // get updated messages for session naming check
    const updatedMsgs = await getSessionMessages(user.name, sessionId);
    maybeNameSession(user.name, sessionId, updatedMsgs);

    return res.status(200).json({
      response: cleanText,
      memoryUpdated: !!memoryUpdate,
      storyUpdated: !!storyUpdate
    });

  } catch (err) {
    console.error('groq error:', err);
    const msg = err?.message?.toLowerCase() || '';
    if (msg.includes('rate') || msg.includes('429')) return res.status(429).json({ error: getError('rate_limit') });
    if (msg.includes('network') || msg.includes('fetch') || msg.includes('econnrefused')) return res.status(503).json({ error: getError('network') });
    return res.status(500).json({ error: getError('groq_down') });
  }
}
