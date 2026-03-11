// pages/admin.js
import { useState } from 'react';
import Head from 'next/head';

const S = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #050505; color: #e0e0e0; font-family: -apple-system, sans-serif; min-height: 100vh; }

  .body { background: #050505; min-height: 100vh; padding: 32px 20px; }
  .wrap { max-width: 560px; margin: 0 auto; }
  h1 { font-size: 28px; font-weight: 700; margin-bottom: 28px; }

  .field-input {
    width: 100%; padding: 12px 14px;
    background: #0a0a0a; border: 1px solid #1e1e1e;
    border-radius: 10px; color: #e0e0e0; font-size: 15px;
    outline: none; margin-bottom: 12px;
  }
  .btn {
    padding: 11px 20px; border: none; border-radius: 10px;
    font-size: 14px; font-weight: 600; cursor: pointer;
    background: #e0e0e0; color: #000; width: 100%;
  }
  .btn:disabled { opacity: 0.5; cursor: default; }

  .label {
    font-size: 11px; font-weight: 600; letter-spacing: 1.5px;
    text-transform: uppercase; color: #555;
    margin: 28px 0 10px; display: block;
  }
  .card {
    background: #0e0e0e; border: 1px solid #1a1a1a;
    border-radius: 12px; padding: 14px 16px; margin-bottom: 8px;
    display: flex; justify-content: space-between;
    align-items: center; gap: 12px; flex-wrap: wrap;
  }
  .card-name { font-size: 15px; font-weight: 500; }
  .card-meta { font-size: 12px; color: #555; margin-top: 2px; }
  .card-actions { display: flex; gap: 6px; }

  .approve-btn {
    padding: 7px 14px; border-radius: 8px; font-size: 13px;
    font-weight: 600; cursor: pointer;
    background: rgba(50,200,100,0.15); color: #4ade80;
    border: 1px solid rgba(50,200,100,0.2);
  }
  .reject-btn {
    padding: 7px 14px; border-radius: 8px; font-size: 13px;
    font-weight: 600; cursor: pointer;
    background: rgba(200,60,60,0.1); color: #f87171;
    border: 1px solid rgba(200,60,60,0.15);
  }

  .empty { color: #333; font-size: 14px; padding-bottom: 8px; }
  .err { color: #f87171; margin-top: 10px; font-size: 13px; }

  .status-box {
    background: #0d1a0d; border: 1px solid #1a3a1a;
    border-radius: 10px; padding: 12px 16px; margin-top: 16px;
    font-size: 13px; color: #4ade80;
    word-break: break-all; line-height: 1.6;
  }
  .invite-link { margin-top: 6px; font-size: 12px; color: #a3a3a3; }
`;

export default function Admin() {
  const [key, setKey] = useState('');
  const [authed, setAuthed] = useState(false);
  const [requests, setRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [inviteLink, setInviteLink] = useState('');

  async function load(k) {
    try {
      const r = await fetch('/api/admin', { headers: { 'x-admin-key': k } });
      if (!r.ok) return false;
      const d = await r.json();
      setRequests(d.requests || []);
      setUsers(d.users || []);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  async function auth(e) {
    e.preventDefault();
    setLoading(true);
    setErr('');
    const ok = await load(key);
    if (ok) setAuthed(true);
    else setErr('wrong password');
    setLoading(false);
  }

  async function act(action, email, name) {
    setStatus('');
    setInviteLink('');
    try {
      const r = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': key },
        body: JSON.stringify({ action, email, name })
      });
      const d = await r.json();
      if (d.link) {
        setInviteLink(d.link);
        setStatus(name + ' approved.');
      } else {
        setStatus(d.error || 'done');
      }
      await load(key);
    } catch (e) {
      setStatus('error: ' + e.message);
    }
  }

  if (!authed) return (
    <>
      <Head><title>newton admin</title></Head>
      <style>{S}</style>
      <div className="body">
        <div className="wrap">
          <h1>admin</h1>
          <form onSubmit={auth}>
            <input className="field-input" type="password" value={key} onChange={e => setKey(e.target.value)} placeholder="admin password" />
            <button className="btn" type="submit" disabled={loading}>{loading ? '...' : 'enter'}</button>
            {err && <div className="err">{err}</div>}
          </form>
        </div>
      </div>
    </>
  );

  return (
    <>
      <Head><title>newton admin</title></Head>
      <style>{S}</style>
      <div className="body">
        <div className="wrap">
          <h1>admin</h1>

          <span className="label">pending requests ({requests.length})</span>
          {requests.length === 0 && <div className="empty">no pending requests</div>}
          {requests.map((r, i) => (
            <div className="card" key={i}>
              <div>
                <div className="card-name">{r.name}</div>
                <div className="card-meta">{r.email}</div>
              </div>
              <div className="card-actions">
                <button className="approve-btn" onClick={() => act('approve', r.email, r.name)}>approve</button>
                <button className="reject-btn" onClick={() => act('reject', r.email, r.name)}>reject</button>
              </div>
            </div>
          ))}

          <span className="label">members ({users.length})</span>
          {users.length === 0 && <div className="empty">no members yet</div>}
          {users.map((u, i) => (
            <div className="card" key={i}>
              <div>
                <div className="card-name">{u.name}</div>
                <div className="card-meta">{u.email}</div>
              </div>
            </div>
          ))}

          {(status || inviteLink) && (
            <div className="status-box">
              {status}
              {inviteLink && <div className="invite-link">invite link: {inviteLink}</div>}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
