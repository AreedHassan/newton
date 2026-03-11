// pages/api/accept-invite.js
import bcrypt from 'bcryptjs';
import { getInvite, deleteInvite, saveUser, getUserByName } from '../../lib/db';
import { signToken } from '../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ error: 'token aur password chahiye' });

  const invite = await getInvite(token);
  if (!invite) return res.status(400).json({ error: 'invalid ya expired invite link' });
  if (new Date() > new Date(invite.expiresAt)) {
    await deleteInvite(token);
    return res.status(400).json({ error: 'link expire ho gaya. admin se bol.' });
  }
  if (await getUserByName(invite.name)) return res.status(400).json({ error: 'naam already le liya. admin se baat kar.' });

  const hashed = await bcrypt.hash(password, 10);
  await saveUser({ name: invite.name, email: invite.email, password: hashed, joinedAt: new Date().toISOString() });
  await deleteInvite(token);

  const adminName = process.env.ADMIN_NAME || 'Areed Hasan';
  const isAdmin = adminName ? invite.name.toLowerCase() === adminName.toLowerCase() : false;
  const jwtToken = signToken({ name: invite.name, email: invite.email, isAdmin });
  return res.status(200).json({ token: jwtToken, user: { name: invite.name, email: invite.email }, isAdmin });
}