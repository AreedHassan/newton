import { getRequests, removeRequest, saveInvite, getUsers } from '../../lib/db';
import { v4 as uuid } from 'uuid';
import nodemailer from 'nodemailer';

const MAIL_USER = 'supportnewton@gmail.com';
const MAIL_PASS = 'eice tgqe spfy zcfu';

async function sendInviteEmail(to, name, link) {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: MAIL_USER, pass: MAIL_PASS }
    });
    await transporter.sendMail({
      from: `newton <${MAIL_USER}>`,
      to,
      subject: `${name}, tu approved hai`,
      html: `
        <div style="background:#000;color:#fff;padding:40px 32px;font-family:-apple-system,sans-serif;max-width:480px;margin:0 auto;border-radius:16px">
          <h1 style="font-size:36px;font-weight:700;letter-spacing:-1px;margin:0 0 8px">newton</h1>
          <p style="color:#666;font-size:13px;margin:0 0 32px">// smarter than you since forever</p>
          <h2 style="font-size:20px;font-weight:600;margin:0 0 12px">aye ${name},</h2>
          <p style="color:#aaa;font-size:15px;line-height:1.6;margin:0 0 28px">
            admin ne approve kar diya. andar aa ja. yeh link 48 ghante valid hai, baad mein mat rona.
          </p>
          <a href="${link}" style="display:inline-block;padding:14px 28px;background:#fff;color:#000;border-radius:12px;font-weight:700;font-size:15px;text-decoration:none">
            join newton →
          </a>
          <p style="color:#333;font-size:11px;margin:28px 0 0;line-height:1.6">
            link kisi ko share mat karna. yeh sirf tere liye hai.<br/>
            koi issue ho toh seedha admin se baat kar.
          </p>
        </div>
      `
    });
    return true;
  } catch (e) {
    console.error('mail fail:', e?.message);
    return false;
  }
}

function unwrap(val) {
  if (!val) return val;
  if (val?.value !== undefined) {
    try { return JSON.parse(val.value); } catch { return val.value; }
  }
  return val;
}

export default async function handler(req, res) {
  const key = req.headers['x-admin-key'];
  if (key !== 'areed@areed') return res.status(401).json({ error: 'nope' });

  if (req.method === 'GET') {
    const [rawRequests, rawUsers] = await Promise.all([getRequests(), getUsers()]);
    const requests = unwrap(rawRequests) || [];
    const users = unwrap(rawUsers) || {};
    return res.status(200).json({ requests: Array.isArray(requests) ? requests : [], users: Object.values(users) });
  }

  if (req.method === 'POST') {
    const { action, email, name } = req.body;

    if (action === 'approve') {
      const token = uuid();
      const expiresAt = new Date(Date.now() + 48 * 3600 * 1000).toISOString();
      await saveInvite(token, { email, name, expiresAt });
      await removeRequest(email);

      const site = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
      const link = `${site}/invite/${token}`;

      const emailSent = await sendInviteEmail(email, name, link);

      return res.status(200).json({ ok: true, link, emailSent });
    }

    if (action === 'reject') {
      await removeRequest(email);
      return res.status(200).json({ ok: true });
    }
  }

  return res.status(405).end();
}