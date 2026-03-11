// pages/invite/[token].js
import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --blur: blur(40px) saturate(180%);
    --font: 'Plus Jakarta Sans', -apple-system, sans-serif;
    --text: rgba(255,255,255,0.95);
    --text-3: rgba(255,255,255,0.35);
  }
  html, body {
    min-height: 100vh;
    background: #000;
    font-family: var(--font);
    color: var(--text);
    -webkit-font-smoothing: antialiased;
  }
  .bg {
    position: fixed; inset: 0; z-index: 0;
  }
  .bg::before {
    content: '';
    position: absolute; inset: -50%;
    background:
      radial-gradient(ellipse 60% 50% at 30% 30%, rgba(80,120,255,0.3) 0%, transparent 60%),
      radial-gradient(ellipse 50% 60% at 70% 70%, rgba(255,80,180,0.2) 0%, transparent 55%);
    animation: float 12s ease-in-out infinite alternate;
  }
  .bg::after { content: ''; position: absolute; inset: 0; background: rgba(0,0,0,0.5); }
  @keyframes float {
    from { transform: translate(0,0); }
    to { transform: translate(-2%,3%); }
  }
  .wrap {
    position: relative; z-index: 1;
    min-height: 100dvh;
    display: flex; align-items: center; justify-content: center;
    padding: 24px 20px;
  }
  .card {
    width: 100%; max-width: 380px;
    background: rgba(255,255,255,0.07);
    backdrop-filter: var(--blur);
    -webkit-backdrop-filter: var(--blur);
    border: 1px solid rgba(255,255,255,0.13);
    border-radius: 28px;
    padding: 40px 32px 36px;
    box-shadow: 0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.18);
    animation: in 0.5s cubic-bezier(0.16,1,0.3,1);
  }
  @keyframes in { from { opacity:0; transform: translateY(20px); } to { opacity:1; transform:none; } }
  h1 { font-size: 40px; font-weight: 700; letter-spacing: -2px; margin-bottom: 4px; }
  .sub { font-size: 13px; color: var(--text-3); margin-bottom: 30px; }
  .field { margin-bottom: 14px; }
  label { display:block; font-size:11px; font-weight:600; color:var(--text-3); letter-spacing:0.8px; text-transform:uppercase; margin-bottom:7px; }
  input {
    width:100%; padding:13px 16px;
    background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1);
    border-radius:14px; color:var(--text); font-family:var(--font); font-size:15px;
    outline:none; -webkit-appearance:none; transition:all 0.2s;
  }
  input:focus { border-color:rgba(255,255,255,0.28); background:rgba(255,255,255,0.1); }
  .btn {
    width:100%; padding:14px; margin-top:8px;
    background:rgba(255,255,255,0.92); color:#000;
    border:none; border-radius:14px;
    font-family:var(--font); font-size:15px; font-weight:600;
    cursor:pointer; transition:all 0.15s;
    box-shadow: 0 4px 20px rgba(255,255,255,0.12);
  }
  .btn:active { transform:scale(0.98); opacity:0.85; }
  .btn:disabled { opacity:0.3; cursor:default; }
  .err { margin-top:12px; font-size:13px; color:rgba(255,110,110,0.9); text-align:center; padding:10px 12px; background:rgba(255,60,60,0.07); border-radius:10px; border:1px solid rgba(255,60,60,0.1); }
  .done { text-align:center; padding:20px 0; font-size:18px; font-weight:600; color:rgba(120,255,160,0.9); }
`;

export default function Invite() {
  const router = useRouter();
  const { token } = router.query;
  const [pw, setPw] = useState('');
  const [cpw, setCpw] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (pw !== cpw) { setErr('passwords match nahi kar rahe'); return; }
    if (pw.length < 6) { setErr('kam se kam 6 characters'); return; }
    setLoading(true); setErr('');
    try {
      const r = await fetch('/api/accept-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: pw })
      });
      const d = await r.json();
      if (!r.ok) { setErr(d.error); }
      else {
        localStorage.setItem('nt_tok', d.token);
        localStorage.setItem('nt_usr', JSON.stringify(d.user));
        localStorage.setItem('nt_admin', d.isAdmin ? 'true' : 'false');
        setDone(true);
        setTimeout(() => router.push('/'), 1800);
      }
    } catch { setErr('error. try again.'); }
    setLoading(false);
  }

  return (
    <>
      <Head><title>newton — join</title><meta name="viewport" content="width=device-width,initial-scale=1" /></Head>
      <style>{CSS}</style>
      <div className="bg" />
      <div className="wrap">
        <div className="card">
          <h1>newton</h1>
          <div className="sub">tu approved hai. password set kar.</div>
          {done ? (
            <div className="done">✓ welcome. aa raha hai...</div>
          ) : (
            <form onSubmit={submit}>
              <div className="field">
                <label>password</label>
                <input type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="••••••••" required />
              </div>
              <div className="field">
                <label>confirm</label>
                <input type="password" value={cpw} onChange={e => setCpw(e.target.value)} placeholder="••••••••" required />
              </div>
              <button className="btn" type="submit" disabled={loading || !token}>{loading ? '...' : 'set karo'}</button>
              {err && <div className="err">{err}</div>}
            </form>
          )}
        </div>
      </div>
    </>
  );
}