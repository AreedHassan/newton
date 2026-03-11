// pages/api/login.js
import bcrypt from 'bcryptjs';
import { getUserByName } from '../../lib/db';
import { signToken } from '../../lib/auth';

// admin is whoever's name matches ADMIN_NAME env var (set this in vercel to your own name)
// fallback: first user ever created is admin — but explicit env var is cleaner
function checkIsAdmin(name) {
  const adminName = process.env.ADMIN_NAME || 'Areed Hasan';
  if (adminName) return name.toLowerCase() === adminName.toLowerCase();
  return false;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { name, password } = req.body;
  if (!name || !password) return res.status(400).json({ error: 'naam aur password dono daal' });

  const user = await getUserByName(name.trim());
  if (!user) return res.status(401).json({ error: `"${name}" kaun hai? sahi naam daal.` });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ error: 'galat password. dimag laga.' });

  const isAdmin = checkIsAdmin(user.name);
  const token = signToken({ name: user.name, email: user.email, isAdmin });

  return res.status(200).json({
    token,
    user: { name: user.name, email: user.email },
    isAdmin
  });
}