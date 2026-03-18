// pages/api/admin.js
import { getRequests, removeRequest, saveInvite, getUsers } from '../../lib/db';
import { v4 as uuid } from 'uuid';

const MAIL_USER = 'supportnewton@gmail.com';
const MAIL_PASS = 'eice tgqe spfy zcfu';

async function sendInviteEmail(to, name, link) {
  try {
    const nodemailer = await import('nodemailer');
    const transporter = nodemailer.default.createTransport({
      service: 'gmail',
      auth: { user: MAIL_USER, pass: MAIL_PASS }
    });
    await transporter.sendMail({
      from: `newton <${MAIL_USER}>`,
      to,
      subject: `you're in, ${name}.`,
      html: `
        <div style="background:#000000;padding:48px 32px;font-family:-apple-system,'Helvetica Neue',Arial,sans-serif;max-width:480px;margin:0 auto;">
          
          <div style="margin-bottom:40px;">
            <span style="font-size:28px;font-weight:700;letter-spacing:-1px;color:#ffffff;">newton</span>
          </div>

          <div style="background:#111111;border-radius:20px;padding:32px;border:1px solid #222222;">
            
            <h2 style="font-size:22px;font-weight:600;color:#ffffff;margin:0 0 8px;letter-spacing:-0.5px;">hey ${name},</h2>
            <p style="color:#888888;font-size:15px;line-height:1.6;margin:0 0 28px;">
              your request was approved. click below to set up your account and start talking to newton.
            </p>

            <a href="${link}" style="display:block;text-align:center;padding:15px 28px;background:#ffffff;color:#000000;border-radius:12px;font-weight:600;font-size:15px;text-decoration:none;letter-spacing:-0.2px;">
              join newton &rarr;
            </a>

            <p style="color:#444444;font-size:12px;margin:20px 0 0;text-align:center;line-height:1.6;">
              this link expires in 48 hours.<br/>it's for you only — don't share it.
            </p>

          </div>

          <p style="color:#333333;font-size:11px;margin:24px 0 0;text-align:center;">
            you received this because someone requested access to newton.
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
  try {
    const key = req.headers['x-admin-key'];
    if (key !== 'areed@areed') return res.status(401).json({ error: 'nope' });

    if (req.method === 'GET') {
      const [rawRequests, rawUsers] = await Promise.all([getRequests(), getUsers()]);
      const requests = unwrap(rawRequests) || [];
      const users = unwrap(rawUsers) || {};
      return res.status(200).json({
        requests: Array.isArray(requests) ? requests : [],
        users: Object.values(users)
      });
    }

    if (req.method === 'POST') {
      const { action, email, name } = req.body;

      if (action === 'approve') {
        const token = uuid();
        const expiresAt = new Date(Date.now() + 48 * 3600 * 1000).toISOString();
        await saveInvite(token, { email, name, expiresAt });
        await removeRequest(email);
        const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://asknewton.vercel.app';
        const link = `${site}/invite/${token}`;
        let emailSent = false;
        try { emailSent = await sendInviteEmail(email, name, link); } catch (e) { console.error(e); }
        return res.status(200).json({ ok: true, link, emailSent });
      }

      if (action === 'reject') {
        await removeRequest(email);
        return res.status(200).json({ ok: true });
      }
    }

    return res.status(405).end();
  } catch (e) {
    console.error('admin error:', e);
    return res.status(500).json({ error: e.message });
  }
}