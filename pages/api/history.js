// pages/api/history.js
import { verifyToken, getToken } from '../../lib/auth';
import { getSessionMessages } from '../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  const user = verifyToken(getToken(req));
  if (!user) return res.status(401).json({ error: 'login kar' });

  const { sessionId } = req.query;
  if (!sessionId) return res.status(400).json({ error: 'sessionId chahiye' });

  const messages = await getSessionMessages(user.name, sessionId);
  return res.status(200).json({ messages });
}