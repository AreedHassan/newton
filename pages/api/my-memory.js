// pages/api/my-memory.js
// returns only this person's own memory — profile + raw facts
// nobody else's data is ever sent
import { verifyToken, getToken } from '../../lib/auth';
import { getProfile, getRawFacts } from '../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  const user = verifyToken(getToken(req));
  if (!user) return res.status(401).json({ error: 'login kar' });

  const [profile, rawFacts] = await Promise.all([
    getProfile(user.name),
    getRawFacts(user.name)
  ]);

  // build a clean readable string of what newton knows about this person
  const parts = [];
  if (profile) parts.push(profile);
  if (rawFacts.length > 0) {
    parts.push(rawFacts.map(f => `- ${f}`).join('\n'));
  }

  const memory = parts.join('\n\n') || '';

  return res.status(200).json({ memory });
}