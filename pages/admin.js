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
    cursor: pointer; transition: border-color 0.15s;
  }
  .card:hover { border-color: #2a2a2a; }
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

  .banned-badge {
    font-size: 11px; font-weight: 600; color: #f87171;
    background: rgba(200,60,60,0.1); border: 1px solid rgba(200,60,60,0.2);
    border-radius: 6px; padding: 2px 8px;
  }

  /* overlay */
  .overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.7);
    z-index: 50; display: flex; align-items: flex-end; justify-content: center;
    padding: 20px;
  }
  .panel {
    background: #0e0e0e; border: 1px solid #1a1a1a;
    border-radius: 20px; padding: 24px; width: 100%;
    max-width: 520px; max-height: 85vh; overflow-y: auto;
  }
  .panel-header {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 20px;
  }
  .panel-title { font-size: 18px; font-weight: 600; }
  .close-btn {
    background: #1a1a1a; border: none; border-radius: 50%;
    width: 28px; height: 28px; color: #555; font-size: 14px;
    cursor: pointer; display: flex; align-items: center; justify-content: center;
  }
  .info-row { margin-bottom: 16px; }
  .info-label { font-size: 11px; color: #555; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
  .info-value { font-size: 14px; color: #e0e0e0; font-family: monospace; background: #0a0a0a; padding: 8px 12px; border-radius: 8px; border: 1px solid #1a1a1a; word-break: break-all; }

  .section-label { font-size: 11px; color: #555; text-transform: uppercase; letter-spacing: 1px; margin: 20px 0 10px; display: block; }

  .ban-btn {
    width: 100%; padding: 10px; border-radius: 10px; font-size: 13px;
    font-weight: 600; cursor: pointer; margin-top: 8px;
    background: rgba(200,60,60,0.1); color: #f87171;
    border: 1px solid rgba(200,60,60,0.2);
  }
  .unban-btn {
    width: 100%; padding: 10px; border-radius: 10px; font-size: 13px;
    font-weight: 600; cursor: pointer; margin-top: 8px;
    background: rgba(50,200,100,0.1); color: #4ade80;
    border: 1px solid rgba(50,200,100,0.2);
  }

  .sess-item {
    background: #0a0a0a; border: 1px solid #1a1a1a; border-radius: 10px;
    padding: 10px 14px; margin-bottom: 6px; cursor: pointer;
    transition: border-color 0.15s;
  }
  .sess-item:hover { border-color: #2a2a2a; }
  .sess-item-name { font-size: 13px; font-weight: 500; color: #e0e0e0; }
  .sess-item-meta { font-size: 11px; color: #555; margin-top: 2px; }

  .msg-list { margin-top: 12px; }
  .msg-item { margin-bottom: 10px; }
  .msg-role { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #555; margin-bottom: 2px; }
  .msg-content {
    font-size: 13px; line-height: 1.5; padding: 8px 12px;
    border-radius: 8px; white-space: pre-wrap; word-break: break-word;
  }
  .msg-content.user { background: rgba(255,255,255,0.05); color: #e0e0e0; }
  .msg-content.assistant { background: rgba(255,255,255,0.03); color: #a0a0a0; }
  .back-btn {
    background: #1a1a1a; border: none; border-radius: 8px;
    padding: 7px 14px; color: #a0a0a0; font-size: 13px;
    cursor: pointer; margin-bottom: 14px;
  }

  /* confirm modal */
  .modal-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.8);
    z-index: 60; display: flex; align-items: center; justify-content: center;
    padding: 20px;
  }
  .modal {
    background: #111; border: 1px solid #222; border-radius: 16px;
    padding: 24px; width: 100%; max-width: 360px;
  }
  .modal-title { font-size: 16px; font-weight: 600; margin-bottom: 8px; }
  .modal-sub { font-size: 13px; color: #666; margin-bottom: 16px; line-height: 1.5; }
  .modal-input {
    width: 100%; padding: 10px 12px;
    background: #0a0a0a; border: 1px solid #222;
    border-radius: 8px; color: #e0e0e0; font-size: 13px;
    outline: none; margin-bottom: 14px;
  }
  .modal-actions { display: flex; gap: 8px; }
  .modal-cancel {
    flex: 1; padding: 10px; border-radius: 8px; font-size: 13px;
    font-weight: 600; cursor: pointer;
    background: #1a1a1a; color: #a0a0a0; border: 1px solid #222;
  }
  .modal-confirm {
    flex: 1; padding: 10px; border-radius: 8px; font-size: 13px;
    font-weight: 600; cursor: pointer;
    background: rgba(200,60,60,0.15); color: #f87171;
    border: 1px solid rgba(200,60,60,0.2);
  }
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

  // user detail panel
  const [selectedUser, setSelectedUser] = useState(null);
  const [userSessions, setUserSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // ban confirm modal
  const [banModal, setBanModal] = useState(null); // { user }
  const [banReason, setBanReason] = useState('');

  async function load(k) {
    try {
      const r = await fetch('/api/admin', { headers: { 'x-admin-key': k } });
      if (!r.ok) return false;
      const d = await r.json();
      setRequests(d.requests || []);
      setUsers(d.users || []);
      return true;
    } catch { return false; }
  }

  async function auth(e) {
    e.preventDefault();
    setLoading(true); setErr('');
    const ok = await load(key);
    if (ok) setAuthed(true);
    else setErr('wrong password');
    setLoading(false);
  }

  async function act(action, email, name) {
    setStatus(''); setInviteLink('');
    try {
      const r = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': key },
        body: JSON.stringify({ action, email, name })
      });
      const d = await r.json();
      if (d.link) { setInviteLink(d.link); setStatus(name + ' approved.'); }
      else { setStatus(d.error || 'done'); }
      await load(key);
    } catch (e) { setStatus('error: ' + e.message); }
  }

  async function openUser(u) {
    setSelectedUser(u);
    setSelectedSession(null);
    setLoadingHistory(true);
    try {
      const r = await fetch(`/api/admin?action=history&userName=${encodeURIComponent(u.name)}`, {
        headers: { 'x-admin-key': key }
      });
      const d = await r.json();
      setUserSessions(d.sessions || []);
    } catch {}
    setLoadingHistory(false);
  }

  async function confirmBan() {
    const u = banModal;
    setBanModal(null);
    try {
      await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': key },
        body: JSON.stringify({ action: 'ban', userName: u.name, reason: banReason })
      });
      setBanReason('');
      await load(key);
      if (selectedUser?.name === u.name) setSelectedUser(prev => ({ ...prev, banned: true, banReason }));
    } catch {}
  }

  async function unban(u) {
    try {
      await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': key },
        body: JSON.stringify({ action: 'unban', userName: u.name })
      });
      await load(key);
      if (selectedUser?.name === u.name) setSelectedUser(prev => ({ ...prev, banned: false, banReason: '' }));
    } catch {}
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
            <div className="card" key={i} style={{cursor:'default'}}>
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
            <div className="card" key={i} onClick={() => openUser(u)}>
              <div>
                <div className="card-name" style={{display:'flex',alignItems:'center',gap:8}}>
                  {u.name}
                  {u.banned && <span className="banned-badge">banned</span>}
                </div>
                <div className="card-meta">{u.email}</div>
              </div>
              <div style={{color:'#333',fontSize:13}}>tap to view</div>
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

      {/* user detail panel */}
      {selectedUser && (
        <div className="overlay" onClick={() => { setSelectedUser(null); setSelectedSession(null); }}>
          <div className="panel" onClick={e => e.stopPropagation()}>
            <div className="panel-header">
              <div className="panel-title">{selectedUser.name}</div>
              <button className="close-btn" onClick={() => { setSelectedUser(null); setSelectedSession(null); }}>✕</button>
            </div>

            {selectedSession ? (
              <>
                <button className="back-btn" onClick={() => setSelectedSession(null)}>← back</button>
                <div style={{fontSize:14,fontWeight:600,marginBottom:12,color:'#a0a0a0'}}>
                  {selectedSession.name || 'unnamed chat'}
                </div>
                <div className="msg-list">
                  {selectedSession.messages.length === 0 && <div style={{color:'#333',fontSize:13}}>no messages</div>}
                  {selectedSession.messages.map((m, i) => (
                    <div className="msg-item" key={i}>
                      <div className="msg-role">{m.role === 'user' ? selectedUser.name : 'newton'}</div>
                      <div className={`msg-content ${m.role}`}>{m.content}</div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="info-row">
                  <div className="info-label">email</div>
                  <div className="info-value">{selectedUser.email}</div>
                </div>
                <div className="info-row">
                  <div className="info-label">password</div>
                  <div className="info-value">{selectedUser.plainPassword || '(set before this update)'}</div>
                </div>
                <div className="info-row">
                  <div className="info-label">joined</div>
                  <div className="info-value">{selectedUser.joinedAt ? new Date(selectedUser.joinedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'unknown'}</div>
                </div>

                {selectedUser.banned ? (
                  <>
                    <div className="info-row">
                      <div className="info-label">ban reason</div>
                      <div className="info-value">{selectedUser.banReason || 'no reason given'}</div>
                    </div>
                    <button className="unban-btn" onClick={() => unban(selectedUser)}>unban</button>
                  </>
                ) : (
                  <button className="ban-btn" onClick={() => { setBanModal(selectedUser); setBanReason(''); }}>ban user</button>
                )}

                <span className="section-label">chat history</span>
                {loadingHistory && <div style={{color:'#333',fontSize:13}}>loading...</div>}
                {!loadingHistory && userSessions.length === 0 && <div style={{color:'#333',fontSize:13}}>no chats yet</div>}
                {userSessions.map((s, i) => (
                  <div className="sess-item" key={i} onClick={() => setSelectedSession(s)}>
                    <div className="sess-item-name">{s.name || 'unnamed chat'}</div>
                    <div className="sess-item-meta">{s.messages?.length || 0} messages</div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}

      {/* ban confirm modal */}
      {banModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-title">ban {banModal.name}?</div>
            <div className="modal-sub">they won't be able to use newton. you can unban anytime.</div>
            <input
              className="modal-input"
              placeholder="reason (optional)"
              value={banReason}
              onChange={e => setBanReason(e.target.value)}
            />
            <div className="modal-actions">
              <button className="modal-cancel" onClick={() => { setBanModal(null); setBanReason(''); }}>cancel</button>
              <button className="modal-confirm" onClick={confirmBan}>ban</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}