import { verifyToken, getToken } from '../../lib/auth';
import { clearRawFacts, setProfile } from '../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const user = verifyToken(getToken(req));
  if (!user) return res.status(401).end();
  await clearRawFacts(user.name);
  await setProfile(user.name, '');
  return res.status(200).json({ ok: true });
}