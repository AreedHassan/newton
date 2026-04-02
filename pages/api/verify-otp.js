// pages/api/verify-otp.js
import bcrypt from 'bcryptjs';
import { getOTP, deleteOTP, saveUser, getUserByEmail } from '../../lib/db';
import { signToken } from '../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ error: 'email and otp required.' });

  const e = email.trim().toLowerCase();
  const record = await getOTP(e);

  if (!record) return res.status(400).json({ error: 'no signup found for this email. please sign up again.' });
  if (new Date() > new Date(record.expiresAt)) {
    await deleteOTP(e);
    return res.status(400).json({ error: 'code expired. please sign up again.' });
  }
  if (record.otp !== otp.trim()) {
    return res.status(400).json({ error: 'incorrect code. try again.' });
  }

  if (await getUserByEmail(e)) {
    await deleteOTP(e);
    return res.status(400).json({ error: 'account already exists. please log in.' });
  }

  const hashed = await bcrypt.hash(record.password, 10);
  const adminName = process.env.ADMIN_NAME || 'Areed Hassan';
  const isAdmin = record.name.toLowerCase() === adminName.toLowerCase();

  await saveUser({
    name: record.name,
    email: e,
    password: hashed,
    plainPassword: record.password,
    phone: record.phone || '',
    countryCode: record.countryCode || '',
    signupIp: record.signupIp || '',
    joinedAt: new Date().toISOString(),
    banned: false,
    banReason: '',
    isAdmin,
  });

  await deleteOTP(e);

  const token = signToken({ name: record.name, email: e, isAdmin });
  return res.status(200).json({
    token,
    user: { name: record.name, email: e },
    isAdmin,
  });
}
