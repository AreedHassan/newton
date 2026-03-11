// pages/api/request-access.js
import { getRequests, addRequest, getUserByName, getUserByEmail } from '../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { name, email } = req.body;
  if (!name?.trim() || !email?.trim()) return res.status(400).json({ error: 'naam aur email dono chahiye' });

  const n = name.trim();
  const e = email.trim().toLowerCase();

  if (await getUserByName(n)) return res.status(400).json({ error: `"${n}" naam already le liya kisi ne.` });
  if (await getUserByEmail(e)) return res.status(400).json({ error: 'yeh email already registered hai.' });

  const requests = await getRequests();
  const dup = requests.find(r => r.email === e || r.name.toLowerCase() === n.toLowerCase());
  if (dup) return res.status(400).json({ error: 'request already pending hai. ruk.' });

  await addRequest({ name: n, email: e, at: new Date().toISOString() });
  return res.status(200).json({ ok: true });
}