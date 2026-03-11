// pages/api/sessions.js — list, create, delete sessions
import { verifyToken, getToken } from '../../lib/auth';
import { getSessions, createSession, deleteSession } from '../../lib/db';

export default async function handler(req, res) {
  const user = verifyToken(getToken(req));
  if (!user) return res.status(401).json({ error: 'login kar' });

  if (req.method === 'GET') {
    let sessions = await getSessions(user.name);
    // if no sessions exist yet, create the first one automatically
    if (sessions.length === 0) {
      const first = await createSession(user.name);
      sessions = [first];
    }
    return res.status(200).json({ sessions });
  }

  if (req.method === 'POST') {
    const { action, sessionId } = req.body;

    if (action === 'create') {
      const session = await createSession(user.name);
      return res.status(200).json({ session });
    }

    if (action === 'delete') {
      if (!sessionId) return res.status(400).json({ error: 'sessionId chahiye' });
      await deleteSession(user.name, sessionId);
      return res.status(200).json({ ok: true });
    }
  }

  return res.status(405).end();
}