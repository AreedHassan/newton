// pages/api/login.js
import bcrypt from 'bcryptjs';
import { getUserByEmail, saveUser } from '../../lib/db';
import { signToken } from '../../lib/auth';

function checkIsAdmin(name) {
  const adminName = process.env.ADMIN_NAME || 'Areed Hasan';
  return name.toLowerCase() === adminName.toLowerCase();
}

function getIP(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.socket?.remoteAddress || 'unknown';
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { name: email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password are required.' });

  const user = await getUserByEmail(email.trim().toLowerCase());
  if (!user) return res.status(401).json({ error: 'no account found with that email.' });

  if (user.banned) {
    return res.status(403).json({
      error: 'banned',
      banReason: user.banReason || ''
    });
  }

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ error: 'wrong password.' });

  const lastLoginIp = getIP(req);
  const lastLoginAt = new Date().toISOString();
  await saveUser({ ...user, lastLoginIp, lastLoginAt });

  const isAdmin = checkIsAdmin(user.name);
  const token = signToken({ name: user.name, email: user.email, isAdmin });

  return res.status(200).json({
    token,
    user: { name: user.name, email: user.email },
    isAdmin
  });
}
