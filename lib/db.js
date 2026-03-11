import { v4 as uuidv4 } from 'uuid';
// lib/db.js
let _store = {};

async function kget(key) {
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    try {
      const res = await fetch(`${process.env.KV_REST_API_URL}/get/${encodeURIComponent(key)}`, {
        headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` }
      });
      const data = await res.json();
      return data.result ? JSON.parse(data.result) : null;
    } catch { return null; }
  }
  return _store[key] ?? null;
}

async function kset(key, value) {
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    try {
      await fetch(`${process.env.KV_REST_API_URL}/set/${encodeURIComponent(key)}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ value: JSON.stringify(value) })
      });
    } catch {}
    return;
  }
  _store[key] = value;
}

// ---- USERS ----
export async function getUsers() { return (await kget('nt:users')) || {}; }
export async function getUserByName(name) {
  const u = await getUsers();
  return u[name.toLowerCase()] || null;
}
export async function getUserByEmail(email) {
  const u = await getUsers();
  return Object.values(u).find(x => x.email === email.toLowerCase()) || null;
}
export async function saveUser(user) {
  const u = await getUsers();
  u[user.name.toLowerCase()] = user;
  await kset('nt:users', u);
}

// ---- REQUESTS ----
export async function getRequests() { return (await kget('nt:requests')) || []; }
export async function addRequest(r) {
  const list = await getRequests();
  list.push(r);
  await kset('nt:requests', list);
}
export async function removeRequest(email) {
  const list = await getRequests();
  await kset('nt:requests', list.filter(r => r.email !== email));
}

// ---- INVITES ----
export async function getInvite(token) { return (await kget(`nt:invite:${token}`)) || null; }
export async function saveInvite(token, data) { await kset(`nt:invite:${token}`, data); }
export async function deleteInvite(token) { await kset(`nt:invite:${token}`, null); }

// ---- 3-LAYER MEMORY SYSTEM ----

// layer 1 — raw facts per person (fresh, uncompressed, max 15)
export async function getRawFacts(userName) {
  return (await kget(`nt:raw:${userName.toLowerCase()}`)) || [];
}

export async function addRawFact(userName, fact) {
  const facts = await getRawFacts(userName);
  const lower = fact.toLowerCase();
  const keyWords = lower.split(' ').filter(w => w.length > 4);
  const isDup = keyWords.length > 0 && facts.some(f =>
    keyWords.filter(w => f.toLowerCase().includes(w)).length >= Math.ceil(keyWords.length * 0.6)
  );
  if (isDup) return { added: false, count: facts.length };
  facts.push(fact);
  await kset(`nt:raw:${userName.toLowerCase()}`, facts);
  return { added: true, count: facts.length };
}

export async function clearRawFacts(userName) {
  await kset(`nt:raw:${userName.toLowerCase()}`, []);
}

// layer 2 — compressed profile per person
export async function getProfile(userName) {
  return (await kget(`nt:profile:${userName.toLowerCase()}`)) || '';
}
export async function setProfile(userName, summary) {
  await kset(`nt:profile:${userName.toLowerCase()}`, summary);
}

// layer 3 — group lore (shared, max 12 lines)
export async function getGroupLore() { return (await kget('nt:lore')) || ''; }
export async function appendGroupLore(line) {
  const lore = await getGroupLore();
  const lines = lore ? lore.split('\n').filter(Boolean) : [];
  if (lines.length >= 12) lines.splice(0, lines.length - 11);
  lines.push(`- ${line}`);
  await kset('nt:lore', lines.join('\n'));
}

// builds the full memory string injected into newton's system prompt
export async function buildMemoryForUser(userName) {
  const users = await getUsers();
  const allNames = Object.keys(users);
  const parts = [];

  const lore = await getGroupLore();
  if (lore) parts.push(`GROUP LORE:\n${lore}`);

  if (allNames.length > 0) {
    const profileBlocks = await Promise.all(
      allNames.map(async n => {
        const displayName = users[n]?.name || n;
        const [profile, rawFacts] = await Promise.all([getProfile(n), getRawFacts(n)]);
        if (!profile && rawFacts.length === 0) return null;
        let block = `${displayName}:`;
        if (profile) block += `\n${profile}`;
        if (rawFacts.length > 0) block += `\nrecent: ${rawFacts.join(' | ')}`;
        return block;
      })
    );
    const valid = profileBlocks.filter(Boolean);
    if (valid.length > 0) parts.push(valid.join('\n\n'));
  }

  return parts.join('\n\n---\n\n') || '';
}

// ---- STORY (global, max 15 lines) ----
export async function getStory() { return (await kget('nt:story')) || ''; }
export async function appendStory(line) {
  const s = await getStory();
  const lines = s ? s.split('\n').filter(Boolean) : [];
  if (lines.length >= 15) lines.splice(0, lines.length - 14);
  lines.push(`- ${line}`);
  await kset('nt:story', lines.join('\n'));
}

// ---- MESSAGE HISTORY (per user) ----
export async function getUserMessages(userName) {
  return (await kget(`nt:msgs:${userName.toLowerCase()}`)) || [];
}
export async function addUserMessage(userName, msg) {
  const msgs = await getUserMessages(userName);
  msgs.push(msg);
  if (msgs.length > 80) msgs.splice(0, msgs.length - 80);
  await kset(`nt:msgs:${userName.toLowerCase()}`, msgs);
}

// ---- SESSION SYSTEM ----
// each session: { id, name, createdAt, messageCount }
// messages stored per session: nt:sess-msgs:username:sessionId

export async function getSessions(userName) {
  return (await kget(`nt:sessions:${userName.toLowerCase()}`)) || [];
}

export async function saveSessions(userName, sessions) {
  await kset(`nt:sessions:${userName.toLowerCase()}`, sessions);
}

export async function createSession(userName) {
  const sessions = await getSessions(userName);
  const session = {
    id: uuidv4(),
    name: null, // null = not yet named by newton
    createdAt: Date.now(),
    messageCount: 0
  };
  sessions.unshift(session); // newest first
  await saveSessions(userName, sessions);
  return session;
}

export async function updateSession(userName, sessionId, updates) {
  const sessions = await getSessions(userName);
  const idx = sessions.findIndex(s => s.id === sessionId);
  if (idx === -1) return null;
  sessions[idx] = { ...sessions[idx], ...updates };
  await saveSessions(userName, sessions);
  return sessions[idx];
}

export async function deleteSession(userName, sessionId) {
  const sessions = await getSessions(userName);
  const filtered = sessions.filter(s => s.id !== sessionId);
  await saveSessions(userName, filtered);
  // also nuke the messages for this session
  await kset(`nt:sess-msgs:${userName.toLowerCase()}:${sessionId}`, null);
}

export async function getSessionMessages(userName, sessionId) {
  return (await kget(`nt:sess-msgs:${userName.toLowerCase()}:${sessionId}`)) || [];
}

export async function addSessionMessage(userName, sessionId, msg) {
  const msgs = await getSessionMessages(userName, sessionId);
  msgs.push(msg);
  if (msgs.length > 100) msgs.splice(0, msgs.length - 100);
  await kset(`nt:sess-msgs:${userName.toLowerCase()}:${sessionId}`, msgs);
  // increment message count on session
  const sessions = await getSessions(userName);
  const idx = sessions.findIndex(s => s.id === sessionId);
  if (idx !== -1) {
    sessions[idx].messageCount = (sessions[idx].messageCount || 0) + 1;
    await saveSessions(userName, sessions);
  }
}