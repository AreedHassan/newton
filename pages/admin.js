// pages/admin.js
import { useState } from 'react';
import Head from 'next/head';

const S = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #050505; color: #e0e0e0; font-family: -apple-system, sans-serif; padding: 0; min-height: 100vh; }
  .wrap { max-width: 560px; margin: 0 auto; padding: 32px 20px; }
  h1 { font-size: 28px; font-weight: 700; margin-bottom: 28px; letter-spacing: -0.5px; }
  h2 { font-size: 11px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; color: #555; margin: 28px 0 10px; }
  .auth { background: #111; border: 1px solid #1e1e1e; border-radius: 16px; padding: 28px; }
  input { width: 100%; padding: 12px 14px; background: #0a0a0a; border: 1px solid #1e1e1e; border-radius: 10px; color: #e0e0e0; font-size: 15px; outline: none; margin-bottom: 12px; }
  input:focus { border-color: #333; }
  .btn { padding: 11px 20px; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; transition: opacity 0.15s; }
  .btn:disabled { opacity: 0.4; cursor: default; }
  .btn-primary { background: #e0e0e0; color: #000; width: 100%; }
  .btn-approve { background: rgba(50,200,100,0.15); color: #4ade80; border: 1px solid rgba(50,200,100,0.2); font-size: 13px; padding: 7px 14px; border-radius: 8px; }
  .btn-reject { background: rgba(200,60,60,0.1); color: #f87171; border: 1px solid rgba(200,60,60,0.15); font-size: 13px; padding: 7px 14px; border-radius: 8px; }
  .card { background: #0e0e0e; border: 1px solid #1a1a1a; border-radius: 12px; padding: 14px 16px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; }
  .name { font-size: 15px; font-weight: 500; }
  .meta { font-size: 12px; color: #555; margin-top: 2px; }
  .btns { display: flex; gap: 6px; }
  .status { background: #0d1a0d; border: 1px solid #1a3a1a; border-radius: 10px; padding: 12px 16px; margin-top: 16px; font-size: 13px; color: #4ade80; word-break: break-all; line-height: 1.6; }
  .err { color: #f87171; }
  .empty { color: #333; font-size: 14px; padding: 12px 0; }
  .link { color: #a3a3a3; word-break: break-all; font-size: 12px; margin-top: 4px; }
`;

export default function Admin() {
  const [key, setKey] = useState('');
  const [authed, setAuthed] = useState(false);
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [inviteLink, setInviteLink] = useState('');

  async function load(k) {
    const r = await fetch('/api/admin', { headers: { 'x-admin-key': k } });
    if (!r.ok) return false;
    setData(await r.json()); return true;
  }

  async function auth(e) {
    e.preventDefault(); setLoading(true); setErr('');
    const ok = await load(key);
    if (ok) setAuthed(true); else setErr('wrong password');
    setLoading(false);
  }

  async function act(action, email, name) {
    setStatus(''); setInviteLink('');
    const r = await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': key },
      body: JSON.stringify({ action, email, name })
    });
    const d = await r.json();
    if (d.link) { setInviteLink(d.link); setStatus(`${name} approved.`); }
    else setStatus(d.error || 'done');
    await load(key);
  }

  if (!authed) return (
    <>
      <Head><title>newton admin</title></Head>
      <style>{S}</style>
      <div className="wrap">
        <h1>admin</h1>
        <div className="auth">
          <form onSubmit={auth}>
            <input type="password" value={key} onChange={e => setKey(e.target.value)} placeholder="admin password" />
            <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? '...' : 'enter'}</button>
            {err && <div style={{color:'#f87171',marginTop:10,fontSize:13}}>{err}</div>}
          </form>
        </div>
      </div>
    </>
  );

  return (
    <>
      <Head><title>newton admin</title></Head>
      <style>{S}</style>
      <div className="wrap">
        <h1>admin</h1>

        <h2>pending requests ({data?.requests?.length || 0})</h2>
        {!data?.requests?.length && <div className="empty">no pending requests</div>}
        {data?.requests?.map(r => (
          <div className="card" key={r.email}>
            <div>
              <div className="name">{r.name}</div>
              <div className="meta">{r.email} · {new Date(r.at).toLocaleString('en-IN')}</div>
            </div>
            <div className="btns">
              <button className="btn btn-approve" onClick={() => act('approve', r.email, r.name)}>approve</button>
              <button className="btn btn-reject" onClick={() => act('reject', r.email, r.name)}>reject</button>
            </div>
          </div>
        ))}

        <h2>members ({data?.users?.length || 0})</h2>
        {data?.users?.map(u => (
          <div className="card" key={u.email}>
            <div>
              <div className="name">{u.name}</div>
              <div className="meta">{u.email} · joined {new Date(u.joinedAt).toLocaleDateString('en-IN')}</div>
            </div>
          </div>
        ))}

        {(status || inviteLink) && (
          <div className="status">
            {status}
            {inviteLink && (
              <>
                <div className="link">invite link: {inviteLink}</div>
                <div style={{marginTop:8,fontSize:12,color:'#555'}}>copy and send this manually if email is not configured.</div>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}