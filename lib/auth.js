// lib/auth.js
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'kYEHzeI5IdsuCulZ8hNfZJLSMaWwrK8CPvY5mnF2gyODAOCkzeTenMPyJTl9Fp3n';

export function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: '30d' });
}
export function verifyToken(token) {
  try { return jwt.verify(token, SECRET); }
  catch { return null; }
}
export function getToken(req) {
  const h = req.headers.authorization;
  return h?.startsWith('Bearer ') ? h.slice(7) : null;
}
