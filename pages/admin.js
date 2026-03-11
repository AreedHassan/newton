// pages/admin.js
import { useState } from 'react';
import Head from 'next/head';

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

  const s = {
    body: { background: '#050505', color: '#e0e0e0', fontFamily: '-apple-system, sans-serif', minHeight: '100vh', padding: '32px 20px' },
    wrap: { maxWidth: '560px', margin: '0 auto' },
    h1: { fontSize: '28px', fontWeight: '700', marginBottom: '28px' },
    input: { width: '100%', padding: '12px 14px', background: '#0a0a0a', border: '1px solid #1e1e1e', borderRadius: '10px', color: '#e0e0e0', fontSize: '15px', outline: 'none', marginBottom: '12px', boxSizing: 'border-box' },
    btn: { padding: '11px 20px', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', background: '#e0e0e0', color: '#000', width: '100%' },
    card: { background: '#0e0e0e', border: '1px solid #1a1a1a', borderRadius: '12px', padding: '14px 16px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' },
    name: { fontSize: '15px', fontWeight: '500' },
    meta: { fontSize: '12px', color: '#555', marginTop: '2px' },
    approveBtn: { padding: '7px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', background: 'rgba(50,200,100,0.15)', color: '#4ade80', border: '1px solid rgba(50,200,100,0.2)' },
    rejectBtn: { padding: '7px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', background: 'rgba(200,60,60,0.1)', color: '#f87171', border: '1px solid rgba(200,60,60,0.15)' },
    label: { fontSize: '11px', fontWeight: '600', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#555', margin: '28px 0 10px', display: 'block' },
    statusBox: { background: '#0d1a0d', border: '1px solid #1a3a1a', borderRadius: '10px', padding: '12px 16px', marginTop: '16px', fontSize: '13px', color: '#4ade80', wordBreak: 'break-all', lineHeight: '1.6' },
  };

  if (!authed) return (
    <>
      <Head><title>newton admin</title></Head>
      <div style={s.body}>
        <div style={s.wrap}>
          <h1 style={s.h1}>admin</h1>
          <form onSubmit={auth}>
            <input style={s.input} type="password" value={key} onChange={e => setKey(e.target.value)} placeholder="admin password" />
            <button style={s.btn} type="submit" disabled={loading}>{loading ? '...' : 'enter'}</button>
            {err && <div style={{ color: '#f87171', marginTop: 10, fontSize: 13 }}>{err}</div>}
          </form>
        </div>
      </div>
    </>
  );

  return (
    <>
      <Head><title>newton admin</title></Head>
      <div style={s.body}>
        <div style={s.wrap}>
          <h1 style={s.h1}>admin</h1>

          <span style={s.label}>pending requests ({requests.length})</span>
          {requests.length === 0 && <div style={{ color: '#333', fontSize: 14, paddingBottom: 8 }}>no pending requests</div>}
          {requests.map((r, i) => (
            <div style={s.card} key={i}>
              <div>
                <div style={s.name}>{r.name}</div>
                <div style={s.meta}>{r.email}</div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button style={s.approveBtn} onClick={() => act('approve', r.email, r.name)}>approve</button>
                <button style={s.rejectBtn} onClick={() => act('reject', r.email, r.name)}>reject</button>
              </div>
            </div>
          ))}

          <span style={s.label}>members ({users.length})</span>
          {users.length === 0 && <div style={{ color: '#333', fontSize: 14, paddingBottom: 8 }}>no members yet</div>}
          {users.map((u, i) => (
            <div style={s.card} key={i}>
              <div>
                <div style={s.name}>{u.name}</div>
                <div style={s.meta}>{u.email}</div>
              </div>
            </div>
          ))}

          {(status || inviteLink) && (
            <div style={s.statusBox}>
              {status}
              {inviteLink && <div style={{ marginTop: 6, fontSize: 12, color: '#a3a3a3' }}>invite link: {inviteLink}</div>}
            </div>
          )}
        </div>
      </div>
    </>
  );
}