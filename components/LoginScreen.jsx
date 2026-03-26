import { useState } from 'react';

export default function LoginScreen({ loginTab, setLoginTab, onLoginSuccess, onBan }) {
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [statusOk, setStatusOk] = useState(false);

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

  async function handleRequest(e) {
    e.preventDefault();
    const f = e.target;
    setLoading(true); setStatusMsg('');
    try {
      const r = await fetch('/api/request-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: f.firstName.value.trim() + ' ' + f.lastName.value.trim(),
          email: f.email.value.trim()
        })
      });
      const d = await r.json();
      if (!r.ok) { setStatusMsg(d.error); setStatusOk(false); }
      else { setStatusMsg('request sent. you will get an invite link once approved.'); setStatusOk(true); }
    } catch {
      setStatusMsg('error. try again.');
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
      <style>{`@keyframes slideUpIn { from { transform: translateY(100%); opacity:0; } to { transform: translateY(0); opacity:1; } }`}</style>
      <div className="login-card">
        <div className="login-logo">newton</div>
        <div className="login-sub">{loginTab === 'request' ? 'want to talk to newton?' : 'welcome back'}</div>
        <div className="login-dev">developed by Areed Hassan</div>
        <div className="seg-control">
          <button className={`seg-btn ${loginTab === 'login' ? 'active' : ''}`} onClick={() => { setLoginTab('login'); setStatusMsg(''); }}>login</button>
          <button className={`seg-btn ${loginTab === 'request' ? 'active' : ''}`} onClick={() => { setLoginTab('request'); setStatusMsg(''); }}>request access</button>
        </div>
        {loginTab === 'login' ? (
          <form onSubmit={handleLogin}>
            <div className="field">
              <label className="field-label">email</label>
              <input className="field-input" name="name" type="email" placeholder="your email address" autoComplete="email" required />
            </div>
            <div className="field">
              <label className="field-label">password</label>
              <input className="field-input" name="password" type="password" placeholder="••••••••" required />
            </div>
            <button className="primary-btn" type="submit" disabled={loading}>{loading ? '...' : 'sign in'}</button>
            {statusMsg && <div className={`status-msg ${statusOk ? 'ok' : ''}`}>{statusMsg}</div>}
          </form>
        ) : (
          <form onSubmit={handleRequest}>
            <div className="field">
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <label className="field-label">first name</label>
                  <input className="field-input" name="firstName" placeholder="first name" required />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="field-label">last name</label>
                  <input className="field-input" name="lastName" placeholder="last name" required />
                </div>
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)', marginTop: 6, lineHeight: 1.5, paddingLeft: 2 }}>
                use your real name. that's how you get invited.
              </div>
            </div>
            <div className="field">
              <label className="field-label">email</label>
              <input className="field-input" name="email" type="email" placeholder="your email address" required />
            </div>
            <button className="primary-btn" type="submit" disabled={loading}>{loading ? '...' : 'send request'}</button>
            {statusMsg && <div className={`status-msg ${statusOk ? 'ok' : ''}`}>{statusMsg}</div>}
          </form>
        )}
      </div>
    </div>
  );
}
