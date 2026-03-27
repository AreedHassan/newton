import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useAuth } from '../hooks/useAuth';
import { useSessions } from '../hooks/useSessions';
import LandingScreen from '../components/LandingScreen';
import LoginScreen from '../components/LoginScreen';
import ChatScreen from '../components/ChatScreen';
import BanChecker from '../components/BanChecker';

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }

  :root {
    --blur: blur(40px) saturate(180%);
    --blur-sm: blur(20px) saturate(160%);
    --glass-border: rgba(255,255,255,0.15);
    --text: rgba(255,255,255,0.95);
    --text-2: rgba(255,255,255,0.6);
    --text-3: rgba(255,255,255,0.35);
    --font: 'Plus Jakarta Sans', -apple-system, sans-serif;
  }

  html, body {
.bg::before {
    content: '';
    position: absolute;
    inset: 0;
    background: #000;
  }
  .bg::after {
    content: ''; position: absolute; inset: 0; background: rgba(0,0,0,0.45);
  }
  @keyframes meshFloat {
    0% { transform: translate(0,0) rotate(0deg); }
    33% { transform: translate(-3%,2%) rotate(1deg); }
    66% { transform: translate(2%,-3%) rotate(-0.5deg); }
    100% { transform: translate(-1%,1%) rotate(0.5deg); }
  }

  .app {
    position: relative; z-index: 1; height: 100dvh;
    display: flex; flex-direction: column;
    max-width: 680px; margin: 0 auto;
  }
  @media (min-width: 720px) {
    .app { border-left: 1px solid rgba(255,255,255,0.06); border-right: 1px solid rgba(255,255,255,0.06); }
    .input-area { padding-bottom: 20px; }
  }

  .trains-canvas { position: absolute; inset: 0; z-index: 1; pointer-events: none; }

  .login-card {
    width: 100%; max-width: 380px;
    background: rgba(255,255,255,0.07);
    backdrop-filter: var(--blur); -webkit-backdrop-filter: var(--blur);
    border: 1px solid var(--glass-border); border-radius: 28px;
    padding: 40px 32px 36px;
    box-shadow: 0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.2);
  }
  .login-logo { font-size: 42px; font-weight: 700; letter-spacing: -2px; color: var(--text); margin-bottom: 4px; }
  .login-sub { font-size: 13px; color: var(--text-3); font-weight: 400; margin-bottom: 8px; letter-spacing: 0.2px; }
  .login-dev { font-size: 13px; color: rgba(255,255,255,0.3); font-weight: 400; margin-bottom: 24px; letter-spacing: 0.2px; }
  .seg-control {
    display: flex; background: rgba(255,255,255,0.06); border-radius: 12px;
    padding: 3px; margin-bottom: 28px; border: 1px solid rgba(255,255,255,0.08);
  }
  .seg-btn {
    flex: 1; padding: 8px; border: none; border-radius: 10px;
    background: transparent; color: var(--text-3);
    font-family: var(--font); font-size: 13px; font-weight: 500;
    cursor: pointer; transition: all 0.2s;
  }
  .seg-btn.active { background: rgba(255,255,255,0.14); color: var(--text); box-shadow: 0 2px 8px rgba(0,0,0,0.3); }
  .field { margin-bottom: 14px; }
  .field-label {
    font-size: 11px; font-weight: 600; color: var(--text-3);
    letter-spacing: 0.8px; text-transform: uppercase; margin-bottom: 7px; display: block;
  }
  .field-input {
    width: 100%; padding: 13px 16px;
    background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
    border-radius: 14px; color: var(--text);
    font-family: var(--font); font-size: 15px; font-weight: 400;
    outline: none; transition: all 0.2s; -webkit-appearance: none;
  }
  .field-input::placeholder { color: var(--text-3); }
  .field-input:focus { border-color: rgba(255,255,255,0.3); background: rgba(255,255,255,0.1); box-shadow: 0 0 0 3px rgba(255,255,255,0.06); }
  .primary-btn {
    width: 100%; padding: 14px;
    background: rgba(255,255,255,0.95); color: #000;
    border: none; border-radius: 14px;
    font-family: var(--font); font-size: 15px; font-weight: 600;
    cursor: pointer; margin-top: 8px; transition: all 0.15s;
    box-shadow: 0 4px 20px rgba(255,255,255,0.15);
  }
  .primary-btn:active { transform: scale(0.98); opacity: 0.85; }
  .primary-btn:disabled { opacity: 0.3; cursor: default; }
  .status-msg {
    margin-top: 14px; font-size: 13px; color: rgba(255,120,120,0.9);
    text-align: center; line-height: 1.5; padding: 10px 12px;
    background: rgba(255,60,60,0.08); border-radius: 10px;
    border: 1px solid rgba(255,60,60,0.12);
  }
  .status-msg.ok { color: rgba(120,255,160,0.9); background: rgba(60,255,120,0.06); border-color: rgba(60,255,120,0.12); }

  .header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 20px 14px;
    background: rgba(0,0,0,0.01);
    backdrop-filter: var(--blur-sm); -webkit-backdrop-filter: var(--blur-sm);
    border-bottom: 1px solid rgba(255,255,255,0.06);
    gap: 12px; flex-shrink: 0;
  }
  .header-left { display: flex; align-items: center; gap: 10px; }
  .avatar {
    width: 38px; height: 38px; background: rgba(255,255,255,0.1);
    backdrop-filter: var(--blur-sm); -webkit-backdrop-filter: var(--blur-sm);
    border-radius: 50%; display: flex; align-items: center; justify-content: center;
    font-size: 18px; border: 1px solid rgba(255,255,255,0.15); flex-shrink: 0;
  }
  .header-name { font-size: 16px; font-weight: 600; color: var(--text); line-height: 1.2; }
  .header-status { font-size: 12px; color: var(--text-3); font-weight: 400; }
  .header-right { display: flex; gap: 6px; }
  .hbtn {
    width: 36px; height: 36px; background: rgba(255,255,255,0.07);
    border: 1px solid rgba(255,255,255,0.1); border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 15px; cursor: pointer; transition: all 0.15s;
    color: var(--text-2); flex-shrink: 0;
  }
  .hbtn:active { background: rgba(255,255,255,0.14); transform: scale(0.93); }
  .hbtn.lit { border-color: rgba(255,255,255,0.3); color: var(--text); }

  .msgs {
    flex: 1; overflow-y: auto; padding: 16px 16px 8px;
    display: flex; flex-direction: column; gap: 6px;
    overscroll-behavior: contain;
  }
  .msgs::-webkit-scrollbar { display: none; }
  .msg-row {
    display: flex; flex-direction: column;
    animation: msgIn 0.28s cubic-bezier(0.16,1,0.3,1);
  }
  @keyframes msgIn {
    from { opacity: 0; transform: translateY(10px) scale(0.96); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
  .msg-row.user { align-items: flex-end; }
  .msg-row.newton { align-items: flex-start; }
  .msg-bubble {
    max-width: 78%; padding: 11px 15px; border-radius: 20px;
    font-size: 15px; line-height: 1.55; word-break: break-word;
    font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
    backdrop-filter: var(--blur-sm); -webkit-backdrop-filter: var(--blur-sm);
  }
  .msg-row.user .msg-bubble {
    background: rgba(255,255,255,0.13); border: 1px solid rgba(255,255,255,0.18);
    border-bottom-right-radius: 6px; color: var(--text);
    box-shadow: 0 4px 20px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.2);
    white-space: pre-wrap;
  }
  .msg-row.newton .msg-bubble {
    background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.09);
    border-bottom-left-radius: 6px; color: rgba(255,255,255,0.88);
    box-shadow: 0 4px 20px rgba(0,0,0,0.2);
  }
  .msg-bubble ul { padding-left: 18px; margin: 4px 0; }
  .msg-bubble li { margin-bottom: 2px; }
  .msg-bubble strong { font-weight: 700; color: rgba(255,255,255,1); }
  .msg-bubble em { font-style: italic; color: rgba(255,255,255,0.75); }
  .msg-bubble code { background: rgba(255,255,255,0.1); padding: 1px 5px; border-radius: 4px; font-size: 13px; font-family: monospace; }
  .msg-meta { display: flex; align-items: center; gap: 6px; margin-top: 3px; padding: 0 4px; }
  .msg-time { font-size: 10px; color: var(--text-3); font-weight: 400; font-family: var(--font); }
  .copy-btn {
    background: none; border: none; cursor: pointer;
    color: rgba(255,255,255,0.2); font-size: 12px; padding: 0 2px;
    font-family: var(--font); line-height: 1; transition: color 0.15s;
  }
  .copy-btn:active { color: rgba(255,255,255,0.6); }
  .date-sep { display: flex; align-items: center; gap: 10px; margin: 10px 0; }
  .date-sep span {
    font-size: 11px; color: var(--text-3); font-weight: 500; white-space: nowrap;
    padding: 4px 10px; background: rgba(255,255,255,0.05);
    border-radius: 20px; border: 1px solid rgba(255,255,255,0.07);
  }
  .date-sep::before, .date-sep::after { content: ''; flex: 1; height: 1px; background: rgba(255,255,255,0.06); }
  .typing-row { align-items: flex-start; }
  .typing-bubble {
    padding: 13px 18px; background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.09); border-radius: 20px;
    border-bottom-left-radius: 6px;
    backdrop-filter: var(--blur-sm); -webkit-backdrop-filter: var(--blur-sm);
    display: flex; gap: 5px; align-items: center;
  }
  .typing-dot {
    width: 7px; height: 7px; background: rgba(255,255,255,0.4);
    border-radius: 50%; animation: typingPulse 1.3s ease-in-out infinite;
  }
  .typing-dot:nth-child(2) { animation-delay: 0.15s; }
  .typing-dot:nth-child(3) { animation-delay: 0.3s; }
  @keyframes typingPulse {
    0%, 100% { opacity: 0.3; transform: scale(0.8); }
    50% { opacity: 1; transform: scale(1.1); }
  }
  .empty {
    flex: 1; display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    gap: 10px; padding: 40px 24px;
  }
  .empty-orb {
    width: 72px; height: 72px; background: rgba(255,255,255,0.06);
    backdrop-filter: var(--blur-sm); -webkit-backdrop-filter: var(--blur-sm);
    border-radius: 50%; display: flex; align-items: center; justify-content: center;
    font-size: 32px; border: 1px solid rgba(255,255,255,0.1);
    box-shadow: 0 0 40px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.15);
    margin-bottom: 4px;
  }
  .empty-title { font-size: 18px; font-weight: 600; color: var(--text-2); }
  .empty-sub { font-size: 14px; color: var(--text-3); text-align: center; max-width: 240px; line-height: 1.5; }
  .input-area {
    padding: 10px 14px 16px; display: flex; align-items: flex-end;
    gap: 8px; background: transparent; flex-shrink: 0;
  }
  .input-wrap {
    flex: 1; background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.13); border-radius: 22px;
    display: flex; align-items: flex-end;
    padding: 4px 4px 4px 16px;
    backdrop-filter: var(--blur-sm); -webkit-backdrop-filter: var(--blur-sm);
    transition: border-color 0.2s, background 0.2s;
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.08); gap: 6px;
  }
  .input-wrap:focus-within { border-color: rgba(255,255,255,0.25); background: rgba(255,255,255,0.11); }
  .input-textarea {
    flex: 1; background: transparent; border: none; outline: none;
    color: var(--text); font-family: var(--font); font-size: 15px; font-weight: 400;
    resize: none; min-height: 34px; max-height: 120px; line-height: 1.5;
    padding: 7px 0; -webkit-appearance: none;
  }
  .input-textarea::placeholder { color: var(--text-3); }
  .send-btn {
    width: 34px; height: 34px; background: rgba(255,255,255,0.9);
    border: none; border-radius: 50%; color: #000; font-size: 14px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; flex-shrink: 0; transition: all 0.15s;
    box-shadow: 0 2px 10px rgba(255,255,255,0.15);
    align-self: flex-end; margin-bottom: 0;
  }
  .send-btn:active { transform: scale(0.9); }
  .send-btn:disabled { opacity: 0.2; cursor: default; }
  .sheet-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.5);
    z-index: 40; backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
    animation: fadeIn 0.2s ease;
  }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  .sheet {
    position: fixed; bottom: 0;
    left: max(0px, calc(50vw - 340px));
    right: max(0px, calc(50vw - 340px));
    max-height: 65dvh;
    background: rgba(18,18,18,0.85);
    backdrop-filter: var(--blur); -webkit-backdrop-filter: var(--blur);
    border-top-left-radius: 24px; border-top-right-radius: 24px;
    border-top: 1px solid rgba(255,255,255,0.1);
    z-index: 41; display: flex; flex-direction: column;
    animation: sheetUp 0.3s cubic-bezier(0.16,1,0.3,1);
  }
  @keyframes sheetUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
  .sheet-handle { width: 36px; height: 4px; background: rgba(255,255,255,0.2); border-radius: 2px; margin: 12px auto 0; flex-shrink: 0; }
  .sheet-header {
    padding: 14px 20px 12px; display: flex; justify-content: space-between; align-items: center;
    border-bottom: 1px solid rgba(255,255,255,0.06); flex-shrink: 0;
  }
  .sheet-title { font-size: 15px; font-weight: 600; color: var(--text-2); }
  .sheet-close {
    width: 28px; height: 28px; background: rgba(255,255,255,0.08);
    border: none; border-radius: 50%; color: var(--text-3); font-size: 14px;
    cursor: pointer; display: flex; align-items: center; justify-content: center;
  }
  .sheet-body {
    flex: 1; overflow-y: auto; padding: 16px 20px 32px;
    font-size: 13px; color: var(--text-2); font-family: var(--font);
    line-height: 1.8; white-space: pre-wrap;
  }
  .sheet-body::-webkit-scrollbar { display: none; }
  .sheet-empty { color: var(--text-3); font-style: italic; }
  @keyframes flashPulse {
    0%, 100% { box-shadow: none; }
    50% { box-shadow: 0 0 0 3px rgba(255,255,255,0.2); }
  }
  .hbtn.flashing { animation: flashPulse 0.5s ease 4; }
  .sess-panel {
    position: fixed; top: 0; bottom: 0;
    right: max(0px, calc(50vw - 340px));
    width: min(300px, 85vw);
    background: rgba(10,10,10,0.92);
    backdrop-filter: var(--blur); -webkit-backdrop-filter: var(--blur);
    border-left: 1px solid rgba(255,255,255,0.08);
    z-index: 30; display: flex; flex-direction: column;
    animation: slideRight 0.28s cubic-bezier(0.16,1,0.3,1);
  }
  @keyframes slideRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
  .sess-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.4);
    z-index: 29; backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
    animation: fadeIn 0.2s ease;
  }
  .sess-header {
    padding: 16px 16px 12px; border-bottom: 1px solid rgba(255,255,255,0.06);
    display: flex; justify-content: space-between; align-items: center; flex-shrink: 0;
  }
  .sess-title { font-size: 13px; font-weight: 600; color: var(--text-3); letter-spacing: 1px; text-transform: uppercase; }
  .sess-close {
    width: 28px; height: 28px; background: rgba(255,255,255,0.07);
    border: none; border-radius: 50%; color: var(--text-3); font-size: 14px;
    cursor: pointer; display: flex; align-items: center; justify-content: center;
  }
  .new-chat-btn {
    margin: 12px; padding: 11px;
    background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12);
    border-radius: 12px; color: var(--text); font-family: var(--font);
    font-size: 14px; font-weight: 500; cursor: pointer;
    display: flex; align-items: center; gap: 8px; transition: all 0.15s; flex-shrink: 0;
  }
  .new-chat-btn:active { background: rgba(255,255,255,0.13); }
  .sess-list { flex: 1; overflow-y: auto; padding: 4px 8px 16px; }
  .sess-list::-webkit-scrollbar { display: none; }
  .sess-item {
    display: flex; align-items: center; gap: 8px; padding: 10px 10px;
    border-radius: 10px; cursor: pointer; transition: background 0.15s;
    margin-bottom: 2px; position: relative;
  }
  .sess-item:active { background: rgba(255,255,255,0.07); }
  .sess-item.active { background: rgba(255,255,255,0.09); }
  .sess-item-icon { font-size: 14px; flex-shrink: 0; opacity: 0.5; }
  .sess-item-info { flex: 1; min-width: 0; }
  .sess-item-name {
    font-size: 13px; font-weight: 500; color: var(--text);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .sess-item.active .sess-item-name { color: #fff; }
  .sess-item-meta { font-size: 11px; color: var(--text-3); margin-top: 1px; }
  .sess-delete {
    width: 26px; height: 26px; background: transparent; border: none;
    color: rgba(255,80,80,0.4); font-size: 14px; cursor: pointer;
    border-radius: 6px; display: flex; align-items: center; justify-content: center;
    opacity: 0; transition: all 0.15s; flex-shrink: 0;
  }
  .sess-item:hover .sess-delete, .sess-item:active .sess-delete { opacity: 1; }
`;

export default function App() {
  const [sliding, setSliding] = useState(false);
  const [loginTab, setLoginTab] = useState('login');

  const {
    user, token, isAdmin, screen, setScreen,
    banReason, logout, handleBan, handleLoginSuccess, handleUnban
  } = useAuth();

  const {
    sessions, setSessions,
    currentSession, setCurrentSession,
    msgs, setMsgs,
    showSessions, setShowSessions,
    loadSessions, switchSession, newChat, deleteSession, renameSession
  } = useSessions(token);

  useEffect(() => {
    if (screen === 'chat' && token) loadSessions(token);
  }, [screen, token]);

  function goToLogin(tab) {
    setLoginTab(tab);
    setSliding(true);
    setTimeout(() => { setScreen('login'); setSliding(false); }, 450);
  }

  if (screen === 'banned') return (
    <>
      <Head><title>newton</title></Head>
      <style>{CSS}</style>
      <BanChecker onUnbanned={handleUnban} />
      <div style={{
        position: 'fixed', inset: 0, background: '#000',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: 32, fontFamily: "'Plus Jakarta Sans',-apple-system,sans-serif"
      }}>
        <div style={{ fontSize: 32, fontWeight: 700, color: '#fff', letterSpacing: -1, marginBottom: banReason ? 10 : 0 }}>you are banned</div>
        {banReason && <div style={{ fontSize: 14, color: '#444', textAlign: 'center', maxWidth: 280, lineHeight: 1.6 }}>{banReason}</div>}
      </div>
    </>
  );

  if (screen === 'landing') return (
    <>
      <Head><title>newton</title><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" /></Head>
      <style>{CSS}</style>
      <div className="bg" />
      <LandingScreen
        sliding={sliding}
        onLogin={() => goToLogin('login')}
        onRequest={() => goToLogin('request')}
      />
    </>
  );

  if (screen === 'login') return (
    <>
      <Head><title>newton</title><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" /></Head>
      <style>{CSS}</style>
      <div className="bg" />
      <LoginScreen
        loginTab={loginTab}
        setLoginTab={setLoginTab}
        onLoginSuccess={(data) => { handleLoginSuccess(data); loadSessions(data.token); }}
        onBan={handleBan}
      />
    </>
  );

  return (
    <>
      <Head><title>newton</title><meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover" /></Head>
      <style>{CSS}</style>
      <div className="bg" />
      <ChatScreen
        user={user}
        token={token}
        isAdmin={isAdmin}
        sessions={sessions}
        currentSession={currentSession}
        setCurrentSession={setCurrentSession}
        setSessions={setSessions}
        msgs={msgs}
        setMsgs={setMsgs}
        showSessions={showSessions}
        setShowSessions={setShowSessions}
        switchSession={switchSession}
        newChat={newChat}
        deleteSession={deleteSession}
        renameSession={renameSession}
        handleBan={handleBan}
        logout={logout}
      />
    </>
  );
}
