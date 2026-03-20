// pages/api/chat.js
import { verifyToken, getToken } from '../../lib/auth';
import {
  buildMemoryForUser, getStory, appendStory,
  addRawFact, getRawFacts, getProfile, setProfile, clearRawFacts,
  getSessionMessages, addSessionMessage, updateSession, getSessions
} from '../../lib/db';
import { NEWTON_SYSTEM_PROMPT, SUMMARIZE_PROMPT, SESSION_NAME_PROMPT, extractUpdates, getError } from '../../lib/newton';

const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;
const NVIDIA_BASE_URL = 'https://integrate.api.nvidia.com/v1';
const MODEL = 'moonshotai/kimi-k2-instruct';

async function nvidiaChat(systemPrompt, messages, maxTokens = 1024, temperature = 0.8) {
  const res = await fetch(`${NVIDIA_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${NVIDIA_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      max_tokens: maxTokens,
      temperature,
      top_p: 0.9,
      stream: false
    })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));
  return data.choices?.[0]?.message?.content || '';
}

async function maybeSummarize(userName) {
  try {
    const facts = await getRawFacts(userName);
    if (facts.length < 15) return;
    const existingProfile = await getProfile(userName);
    const inputText = existingProfile
      ? `existing profile:\n${existingProfile}\n\nnew facts:\n${facts.map(f => `- ${f}`).join('\n')}`
      : facts.map(f => `- ${f}`).join('\n');
    const compressed = await nvidiaChat(
      'you are a memory compression engine. compress the facts into a tight paragraph. no fluff. third person.',
      [{ role: 'user', content: SUMMARIZE_PROMPT(userName, inputText) }],
      300, 0.3
    );
    if (compressed) {
      await setProfile(userName, compressed.trim());
      await clearRawFacts(userName);
    }
  } catch (e) {
    console.error('summarize failed:', e?.message);
  }
}

async function maybeNameSession(userName, sessionId, messages) {
  try {
    const userMsgs = messages.filter(m => m.role === 'user');
    if (userMsgs.length !== 3) return;
    const sessions = await getSessions(userName);
    const session = sessions.find(s => s.id === sessionId);
    if (!session || session.name) return;
    const title = await nvidiaChat(
      'you are newton. give a short punchy title for this conversation. max 5 words. no quotes. no punctuation at end. just the title.',
      [{ role: 'user', content: SESSION_NAME_PROMPT(messages.slice(-6)) }],
      20, 1.0
    );
    if (title) await updateSession(userName, sessionId, { name: title.trim().replace(/['"]/g, '') });
  } catch (e) {
    console.error('session naming failed:', e?.message);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const user = verifyToken(getToken(req));
  if (!user) return res.status(401).json({ error: getError('generic') });

  const { message, sessionId } = req.body;
  if (!message?.trim()) return res.status(400).json({ error: 'say something.' });
  if (!sessionId) return res.status(400).json({ error: 'sessionId missing' });

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
    const raw = await nvidiaChat(
      NEWTON_SYSTEM_PROMPT(memory, story, user.name),
      [...recentHistory, { role: 'user', content: message.trim() }],
      1024, 0.9
    );

    const { cleanText, memoryUpdate, storyUpdate } = extractUpdates(raw);

    await addSessionMessage(user.name, sessionId, { role: 'user', content: message.trim(), ts: Date.now() });
    await addSessionMessage(user.name, sessionId, { role: 'assistant', content: cleanText, ts: Date.now() });

    if (memoryUpdate) {
      const result = await addRawFact(user.name, memoryUpdate);
      if (result.added && result.count >= 15) maybeSummarize(user.name);
    }

    if (storyUpdate) await appendStory(storyUpdate);

    const updatedMsgs = await getSessionMessages(user.name, sessionId);
    maybeNameSession(user.name, sessionId, updatedMsgs);

    return res.status(200).json({
      response: cleanText,
      memoryUpdated: !!memoryUpdate,
      storyUpdated: !!storyUpdate
    });

  } catch (err) {
    console.error('nvidia error:', err);
    const msg = err?.message?.toLowerCase() || '';
    if (msg.includes('rate') || msg.includes('429')) return res.status(429).json({ error: getError('rate_limit') });
    if (msg.includes('network') || msg.includes('fetch') || msg.includes('econnrefused')) return res.status(503).json({ error: getError('network') });
    return res.status(500).json({ error: getError('groq_down') });
  }
}