import { useState } from 'react';

const COUNTRY_CODES = [
  { code: '+1', name: 'US/CA' },
  { code: '+44', name: 'UK' },
  { code: '+91', name: 'IN' },
  { code: '+92', name: 'PK' },
  { code: '+971', name: 'UAE' },
  { code: '+966', name: 'SA' },
  { code: '+61', name: 'AU' },
  { code: '+49', name: 'DE' },
  { code: '+33', name: 'FR' },
  { code: '+86', name: 'CN' },
  { code: '+81', name: 'JP' },
  { code: '+7', name: 'RU' },
  { code: '+55', name: 'BR' },
  { code: '+27', name: 'ZA' },
  { code: '+234', name: 'NG' },
  { code: '+20', name: 'EG' },
  { code: '+62', name: 'ID' },
  { code: '+60', name: 'MY' },
  { code: '+65', name: 'SG' },
  { code: '+880', name: 'BD' },
];

function EyeIcon({ open }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

export default function LoginScreen({ loginTab, setLoginTab, onLoginSuccess, onBan }) {
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [statusOk, setStatusOk] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [otpStep, setOtpStep] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');
  const [otp, setOtp] = useState('');

  const pwInputStyle = {
    width: '100%', padding: '13px 44px 13px 16px',
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 14, color: 'rgba(255,255,255,0.95)',
    fontFamily: "'Plus Jakarta Sans',-apple-system,sans-serif",
    fontSize: 15, outline: 'none', transition: 'all 0.2s', WebkitAppearance: 'none',
  };

  const inputStyle = {
    width: '100%', padding: '13px 16px',
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 14, color: 'rgba(255,255,255,0.95)',
    fontFamily: "'Plus Jakarta Sans',-apple-system,sans-serif",
    fontSize: 15, outline: 'none', transition: 'all 0.2s', WebkitAppearance: 'none',
  };

  const eyeBtnStyle = {
    position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
    background: 'none', border: 'none', cursor: 'pointer',
    color: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center',
    padding: 0, transition: 'color 0.15s',
  };

  async function handleLogin(e) {
    e.preventDefault();
    const f = e.target;
    setLoading(true); setStatusMsg('');
    try {
      const r = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: f.name.value.trim().toLowerCase(),
          password: f.password.value
        })
      });
      const d = await r.json();
      if (!r.ok) {
        if (d.error === 'banned') onBan(d.banReason || '');
        else { setStatusMsg(d.error); setStatusOk(false); }
      } else {
        onLoginSuccess(d);
      }
    } catch {
      setStatusMsg('something went wrong. try again.');
      setStatusOk(false);
    }
    setLoading(false);
  }

  async function handleSignup(e) {
    e.preventDefault();
    const f = e.target;
    const password = f.password.value;
    const confirm = f.confirm.value;

    if (password !== confirm) {
      setStatusMsg('passwords do not match.'); setStatusOk(false); return;
    }
    if (password.length < 8) {
      setStatusMsg('password must be at least 8 characters.'); setStatusOk(false); return;
    }

    setLoading(true); setStatusMsg('');

    try {
      const r = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: f.firstName.value.trim(),
          lastName: f.lastName.value.trim(),
          email: f.email.value.trim(),
          phone: f.phone.value.trim(),
          countryCode: f.countryCode.value,
          password,
        })
      });
      const d = await r.json();
      if (!r.ok) { setStatusMsg(d.error); setStatusOk(false); }
      else {
        setOtpEmail(f.email.value.trim());
        setOtpStep(true);
        setStatusMsg('');
      }
    } catch {
      setStatusMsg('something went wrong. try again.');
      setStatusOk(false);
    }
    setLoading(false);
  }

  async function handleVerifyOTP(e) {
    e.preventDefault();
    setLoading(true); setStatusMsg('');
    try {
      const r = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: otpEmail, otp })
      });
      const d = await r.json();
      if (!r.ok) { setStatusMsg(d.error); setStatusOk(false); }
      else { onLoginSuccess(d); }
    } catch {
      setStatusMsg('something went wrong. try again.');
      setStatusOk(false);
    }
    setLoading(false);
  }

  return (
    <div style={{
      position: 'relative', zIndex: 1, minHeight: '100dvh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px 20px', animation: 'slideUpIn 0.45s cubic-bezier(0.16,1,0.3,1)'
    }}>
      <style>{`
        @keyframes slideUpIn { from { transform: translateY(100%); opacity:0; } to { transform: translateY(0); opacity:1; } }
        .eye-btn:hover { color: rgba(255,255,255,0.7) !important; }
        select option { background: #111; color: #fff; }
      `}</style>
      <div className="login-card">
        <div className="login-logo">newton</div>
        <div className="login-sub" style={{ marginBottom: 24 }}>
          {loginTab === 'signup' ? (otpStep ? 'check your email' : 'create your account') : 'welcome back'}
        </div>

        {!otpStep && (
          <div className="seg-control">
            <button className={`seg-btn ${loginTab === 'login' ? 'active' : ''}`} onClick={() => { setLoginTab('login'); setStatusMsg(''); }}>sign in</button>
            <button className={`seg-btn ${loginTab === 'signup' ? 'active' : ''}`} onClick={() => { setLoginTab('signup'); setStatusMsg(''); }}>sign up</button>
          </div>
        )}

        {loginTab === 'login' ? (
          <form onSubmit={handleLogin}>
            <div className="field">
              <label className="field-label">email</label>
              <input className="field-input" name="name" type="email" placeholder="your email address" autoComplete="email" required />
            </div>
            <div className="field">
              <label className="field-label">password</label>
              <div style={{ position: 'relative' }}>
                <input className="field-input" name="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" style={pwInputStyle} required />
                <button type="button" className="eye-btn" style={eyeBtnStyle} onClick={() => setShowPassword(p => !p)}>
                  <EyeIcon open={showPassword} />
                </button>
              </div>
            </div>
            <button className="primary-btn" type="submit" disabled={loading}>{loading ? '...' : 'sign in'}</button>
            {statusMsg && <div className={`status-msg ${statusOk ? 'ok' : ''}`}>{statusMsg}</div>}
          </form>

        ) : otpStep ? (
          <form onSubmit={handleVerifyOTP}>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 20, lineHeight: 1.6 }}>
              we sent a 6-digit code to <span style={{ color: 'rgba(255,255,255,0.8)' }}>{otpEmail}</span>. enter it below.
            </p>
            <div className="field">
              <label className="field-label">verification code</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                style={{ ...inputStyle, letterSpacing: 8, fontSize: 22, textAlign: 'center' }}
                required
              />
            </div>
            <button className="primary-btn" type="submit" disabled={loading || otp.length !== 6}>{loading ? '...' : 'verify'}</button>
            <button type="button" onClick={() => { setOtpStep(false); setOtp(''); setStatusMsg(''); }} style={{ width: '100%', marginTop: 10, padding: '10px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: 13, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',-apple-system,sans-serif" }}>go back</button>
            {statusMsg && <div className={`status-msg ${statusOk ? 'ok' : ''}`}>{statusMsg}</div>}
          </form>

        ) : (
          <form onSubmit={handleSignup}>
            <div className="field">
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <label className="field-label">first name</label>
                  <input className="field-input" name="firstName" placeholder="first" required />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="field-label">last name</label>
                  <input className="field-input" name="lastName" placeholder="last" required />
                </div>
              </div>
            </div>
            <div className="field">
              <label className="field-label">email</label>
              <input className="field-input" name="email" type="email" placeholder="your email address" required />
            </div>
            <div className="field">
              <label className="field-label">phone number</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <select name="countryCode" defaultValue="+91" style={{
                  padding: '13px 8px', background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14,
                  color: 'rgba(255,255,255,0.95)', fontFamily: "'Plus Jakarta Sans',-apple-system,sans-serif",
                  fontSize: 13, outline: 'none', flexShrink: 0, width: 95,
                }}>
                  {COUNTRY_CODES.map(c => (
                    <option key={c.code} value={c.code}>{c.code} {c.name}</option>
                  ))}
                </select>
                <input className="field-input" name="phone" type="tel" placeholder="phone number" style={{ flex: 1 }} />
              </div>
            </div>
            <div className="field">
              <label className="field-label">password</label>
              <div style={{ position: 'relative' }}>
                <input className="field-input" name="password" type={showPassword ? 'text' : 'password'} placeholder="min 8 characters" style={pwInputStyle} required />
                <button type="button" className="eye-btn" style={eyeBtnStyle} onClick={() => setShowPassword(p => !p)}>
                  <EyeIcon open={showPassword} />
                </button>
              </div>
            </div>
            <div className="field">
              <label className="field-label">confirm password</label>
              <div style={{ position: 'relative' }}>
                <input className="field-input" name="confirm" type={showConfirm ? 'text' : 'password'} placeholder="repeat password" style={pwInputStyle} required />
                <button type="button" className="eye-btn" style={eyeBtnStyle} onClick={() => setShowConfirm(p => !p)}>
                  <EyeIcon open={showConfirm} />
                </button>
              </div>
            </div>
            <button className="primary-btn" type="submit" disabled={loading}>{loading ? '...' : 'sign up'}</button>
            {statusMsg && <div className={`status-msg ${statusOk ? 'ok' : ''}`}>{statusMsg}</div>}
          </form>
        )}
      </div>
    </div>
  );
}
