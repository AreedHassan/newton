// pages/api/signup.js
import { getUserByEmail, saveOTP } from '../../lib/db';

const MAIL_USER = 'supportnewton@gmail.com';
const MAIL_PASS = 'eice tgqe spfy zcfu';

async function sendOTPEmail(to, name, otp) {
  try {
    const nodemailer = await import('nodemailer');
    const transporter = nodemailer.default.createTransport({
      service: 'gmail',
      auth: { user: MAIL_USER, pass: MAIL_PASS }
    });
    await transporter.sendMail({
      from: `newton <${MAIL_USER}>`,
      to,
      subject: `your newton verification code`,
      html: `
        <div style="background:#000000;padding:48px 32px;font-family:-apple-system,'Helvetica Neue',Arial,sans-serif;max-width:480px;margin:0 auto;">
          <div style="margin-bottom:40px;">
            <span style="font-size:28px;font-weight:700;letter-spacing:-1px;color:#ffffff;">newton</span>
          </div>
          <div style="background:#111111;border-radius:20px;padding:32px;border:1px solid #222222;">
            <h2 style="font-size:22px;font-weight:600;color:#ffffff;margin:0 0 8px;letter-spacing:-0.5px;">hey ${name},</h2>
            <p style="color:#888888;font-size:15px;line-height:1.6;margin:0 0 28px;">
              here is your verification code to complete your newton signup.
            </p>
            <div style="text-align:center;padding:24px;background:#1a1a1a;border-radius:14px;border:1px solid #2a2a2a;margin-bottom:24px;">
              <span style="font-size:42px;font-weight:700;letter-spacing:12px;color:#ffffff;">${otp}</span>
            </div>
            <p style="color:#444444;font-size:12px;margin:0;text-align:center;line-height:1.6;">
              this code expires in 10 minutes.<br/>do not share it with anyone.
            </p>
          </div>
          <p style="color:#333333;font-size:11px;margin:24px 0 0;text-align:center;">
            you received this because someone signed up for newton with this email.
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

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { firstName, lastName, email, phone, countryCode, password } = req.body;

  if (!firstName?.trim() || !lastName?.trim() || !email?.trim() || !password?.trim()) {
    return res.status(400).json({ error: 'all fields are required.' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'password must be at least 8 characters.' });
  }

  const e = email.trim().toLowerCase();
  const name = `${firstName.trim()} ${lastName.trim()}`;

  if (await getUserByEmail(e)) {
    return res.status(400).json({ error: 'an account with this email already exists.' });
  }

  // generate 6 digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  await saveOTP(e, {
    otp,
    expiresAt,
    name,
    email: e,
    phone: phone || '',
    countryCode: countryCode || '',
    password, // stored temporarily, hashed on verify
  });

  const sent = await sendOTPEmail(e, firstName.trim(), otp);
  if (!sent) return res.status(500).json({ error: 'failed to send email. try again.' });

  return res.status(200).json({ ok: true });
}
