// pages/api/lore.js
import { verifyToken, getToken } from '../../lib/auth';
import { buildMemoryForUser, getStory, getGroupLore } from '../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  const user = verifyToken(getToken(req));
  if (!user) return res.status(401).json({ error: 'login kar' });

  const [memory, story, lore] = await Promise.all([
    buildMemoryForUser(user.name),
    getStory(),
    getGroupLore()
  ]);

  return res.status(200).json({ memory, story, lore });
}