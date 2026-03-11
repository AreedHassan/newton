// pages/api/rename-session.js
import { verifyToken, getToken } from '../../lib/auth';
import { updateSession } from '../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const user = verifyToken(getToken(req));
  if (!user) return res.status(401).json({ error: 'login kar' });

  const { sessionId, name } = req.body;
  if (!sessionId || !name?.trim()) return res.status(400).json({ error: 'sessionId aur name chahiye' });

  const updated = await updateSession(user.name, sessionId, { name: name.trim() });
  if (!updated) return res.status(404).json({ error: 'session nahi mila' });

  return res.status(200).json({ session: updated });
}