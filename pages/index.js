// pages/index.js
import { useState, useEffect, useRef, useCallback } from 'react';
import Head from 'next/head';

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=SF+Pro+Display:wght@300;400;500;600;700&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }

  :root {
    --blur: blur(40px) saturate(180%);
    --blur-sm: blur(20px) saturate(160%);
    --glass: rgba(255,255,255,0.08);
    --glass-border: rgba(255,255,255,0.15);
    --glass-strong: rgba(255,255,255,0.13);
    --text: rgba(255,255,255,0.95);
    --text-2: rgba(255,255,255,0.6);
    --text-3: rgba(255,255,255,0.35);
    --accent: #ffffff;
    --bubble-user: rgba(255,255,255,0.14);
    --bubble-newton: rgba(255,255,255,0.07);
    --font: 'Plus Jakarta Sans', -apple-system, sans-serif;
  }

  html, body {
    height: 100%;
    overflow: hidden;
    background: #000;
    font-family: var(--font);
    color: var(--text);
    -webkit-font-smoothing: antialiased;
  }

  /* animated mesh background */
  .bg {
    position: fixed;
    inset: 0;
    z-index: 0;
    overflow: hidden;
  }
  .bg::before {
    content: '';
    position: absolute;
    inset: -50%;
    background:
      radial-gradient(ellipse 60% 50% at 20% 20%, rgba(120,80,255,0.25) 0%, transparent 60%),
      radial-gradient(ellipse 50% 60% at 80% 10%, rgba(0,160,255,0.2) 0%, transparent 55%),
      radial-gradient(ellipse 70% 40% at 60% 80%, rgba(255,80,120,0.15) 0%, transparent 55%),
      radial-gradient(ellipse 40% 70% at 10% 70%, rgba(0,200,150,0.12) 0%, transparent 60%);
    animation: meshFloat 18s ease-in-out infinite alternate;
  }
  .bg::after {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(0,0,0,0.45);
  }
  @keyframes meshFloat {
    0% { transform: translate(0, 0) rotate(0deg); }
    33% { transform: translate(-3%, 2%) rotate(1deg); }
    66% { transform: translate(2%, -3%) rotate(-0.5deg); }
    100% { transform: translate(-1%, 1%) rotate(0.5deg); }
  }

  /* app shell */
  .app {
    position: relative;
    z-index: 1;
    height: 100dvh;
    display: flex;
    flex-direction: column;
    max-width: 680px;
    margin: 0 auto;
  }
  @media (min-width: 720px) {
    .app {
      border-left: 1px solid rgba(255,255,255,0.06);
      border-right: 1px solid rgba(255,255,255,0.06);
    }
    .header {
      border-radius: 0;
    }
    .input-area {
      padding-bottom: 20px;
    }
  }

  /* ---- LOGIN SCREEN ---- */
  .login-screen {
    position: relative;
    z-index: 1;
    min-height: 100dvh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px 20px;
  }
  .login-card {
    width: 100%;
    max-width: 380px;
    background: rgba(255,255,255,0.07);
    backdrop-filter: var(--blur);
    -webkit-backdrop-filter: var(--blur);
    border: 1px solid var(--glass-border);
    border-radius: 28px;
    padding: 40px 32px 36px;
    box-shadow: 0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.2);
    animation: cardIn 0.5s cubic-bezier(0.16,1,0.3,1);
  }
  @keyframes cardIn {
    from { opacity: 0; transform: translateY(24px) scale(0.97); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
  .login-logo {
    font-size: 42px;
    font-weight: 700;
    letter-spacing: -2px;
    color: var(--text);
    margin-bottom: 4px;
  }
  .login-sub {
    font-size: 13px;
    color: var(--text-3);
    font-weight: 400;
    margin-bottom: 32px;
    letter-spacing: 0.2px;
  }
  .seg-control {
    display: flex;
    background: rgba(255,255,255,0.06);
    border-radius: 12px;
    padding: 3px;
    margin-bottom: 28px;
    border: 1px solid rgba(255,255,255,0.08);
  }
  .seg-btn {
    flex: 1;
    padding: 8px;
    border: none;
    border-radius: 10px;
    background: transparent;
    color: var(--text-3);
    font-family: var(--font);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }
  .seg-btn.active {
    background: rgba(255,255,255,0.14);
    color: var(--text);
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  }
  .field { margin-bottom: 14px; }
  .field-label {
    font-size: 11px;
    font-weight: 600;
    color: var(--text-3);
    letter-spacing: 0.8px;
    text-transform: uppercase;
    margin-bottom: 7px;
    display: block;
  }
  .field-input {
    width: 100%;
    padding: 13px 16px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 14px;
    color: var(--text);
    font-family: var(--font);
    font-size: 15px;
    font-weight: 400;
    outline: none;
    transition: all 0.2s;
    -webkit-appearance: none;
  }
  .field-input::placeholder { color: var(--text-3); }
  .field-input:focus {
    border-color: rgba(255,255,255,0.3);
    background: rgba(255,255,255,0.1);
    box-shadow: 0 0 0 3px rgba(255,255,255,0.06);
  }
  .primary-btn {
    width: 100%;
    padding: 14px;
    background: rgba(255,255,255,0.95);
    color: #000;
    border: none;
    border-radius: 14px;
    font-family: var(--font);
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    margin-top: 8px;
    transition: all 0.15s;
    box-shadow: 0 4px 20px rgba(255,255,255,0.15);
  }
  .primary-btn:active { transform: scale(0.98); opacity: 0.85; }
  .primary-btn:disabled { opacity: 0.3; cursor: default; }
  .status-msg {
    margin-top: 14px;
    font-size: 13px;
    color: rgba(255,120,120,0.9);
    text-align: center;
    line-height: 1.5;
    padding: 10px 12px;
    background: rgba(255,60,60,0.08);
    border-radius: 10px;
    border: 1px solid rgba(255,60,60,0.12);
  }
  .status-msg.ok {
    color: rgba(120,255,160,0.9);
    background: rgba(60,255,120,0.06);
    border-color: rgba(60,255,120,0.12);
  }

  /* ---- CHAT SCREEN ---- */
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px 14px;
    background: rgba(0,0,0,0.01);
    backdrop-filter: var(--blur-sm);
    -webkit-backdrop-filter: var(--blur-sm);
    border-bottom: 1px solid rgba(255,255,255,0.06);
    gap: 12px;
    flex-shrink: 0;
  }
  .header-left { display: flex; align-items: center; gap: 10px; }
  .avatar {
    width: 38px; height: 38px;
    background: rgba(255,255,255,0.1);
    backdrop-filter: var(--blur-sm);
    -webkit-backdrop-filter: var(--blur-sm);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    border: 1px solid rgba(255,255,255,0.15);
    flex-shrink: 0;
  }
  .header-info {}
  .header-name { font-size: 16px; font-weight: 600; color: var(--text); line-height: 1.2; }
  .header-status { font-size: 12px; color: var(--text-3); font-weight: 400; }
  .header-right { display: flex; gap: 6px; }
  .hbtn {
    width: 36px; height: 36px;
    background: rgba(255,255,255,0.07);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 15px;
    cursor: pointer;
    transition: all 0.15s;
    color: var(--text-2);
    flex-shrink: 0;
  }
  .hbtn:active { background: rgba(255,255,255,0.14); transform: scale(0.93); }
  .hbtn.lit { border-color: rgba(255,255,255,0.3); color: var(--text); }

  /* messages */
  .msgs {
    flex: 1;
    overflow-y: auto;
    padding: 16px 16px 8px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    overscroll-behavior: contain;
  }
  .msgs::-webkit-scrollbar { display: none; }

  .msg-row {
    display: flex;
    flex-direction: column;
    animation: msgIn 0.28s cubic-bezier(0.16,1,0.3,1);
  }
  @keyframes msgIn {
    from { opacity: 0; transform: translateY(10px) scale(0.96); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
  .msg-row.user { align-items: flex-end; }
  .msg-row.newton { align-items: flex-start; }

  .msg-bubble {
    max-width: 78%;
    padding: 11px 15px;
    border-radius: 20px;
    font-size: 15px;
    line-height: 1.55;
    word-break: break-word;
    white-space: pre-wrap;
    backdrop-filter: var(--blur-sm);
    -webkit-backdrop-filter: var(--blur-sm);
  }
  .msg-row.user .msg-bubble {
    background: rgba(255,255,255,0.13);
    border: 1px solid rgba(255,255,255,0.18);
    border-bottom-right-radius: 6px;
    color: var(--text);
    box-shadow: 0 4px 20px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.2);
  }
  .msg-row.newton .msg-bubble {
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.09);
    border-bottom-left-radius: 6px;
    color: rgba(255,255,255,0.88);
    box-shadow: 0 4px 20px rgba(0,0,0,0.2);
  }
  .msg-time {
    font-size: 10px;
    color: var(--text-3);
    margin-top: 3px;
    padding: 0 4px;
    font-weight: 400;
  }

  /* date separator */
  .date-sep {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 10px 0;
  }
  .date-sep span {
    font-size: 11px;
    color: var(--text-3);
    font-weight: 500;
    white-space: nowrap;
    padding: 4px 10px;
    background: rgba(255,255,255,0.05);
    border-radius: 20px;
    border: 1px solid rgba(255,255,255,0.07);
  }
  .date-sep::before, .date-sep::after {
    content: '';
    flex: 1;
    height: 1px;
    background: rgba(255,255,255,0.06);
  }

  /* typing indicator */
  .typing-row { align-items: flex-start; }
  .typing-bubble {
    padding: 13px 18px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.09);
    border-radius: 20px;
    border-bottom-left-radius: 6px;
    backdrop-filter: var(--blur-sm);
    -webkit-backdrop-filter: var(--blur-sm);
    display: flex;
    gap: 5px;
    align-items: center;
  }
  .typing-dot {
    width: 7px; height: 7px;
    background: rgba(255,255,255,0.4);
    border-radius: 50%;
    animation: typingPulse 1.3s ease-in-out infinite;
  }
  .typing-dot:nth-child(2) { animation-delay: 0.15s; }
  .typing-dot:nth-child(3) { animation-delay: 0.3s; }
  @keyframes typingPulse {
    0%, 100% { opacity: 0.3; transform: scale(0.8); }
    50% { opacity: 1; transform: scale(1.1); }
  }

  /* empty state */
  .empty {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 40px 24px;
  }
  .empty-orb {
    width: 72px; height: 72px;
    background: rgba(255,255,255,0.06);
    backdrop-filter: var(--blur-sm);
    -webkit-backdrop-filter: var(--blur-sm);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    border: 1px solid rgba(255,255,255,0.1);
    box-shadow: 0 0 40px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.15);
    margin-bottom: 4px;
  }
  .empty-title { font-size: 18px; font-weight: 600; color: var(--text-2); }
  .empty-sub { font-size: 14px; color: var(--text-3); text-align: center; max-width: 240px; line-height: 1.5; }

  /* input area */
  .input-area {
    padding: 10px 14px 16px;
    display: flex;
    align-items: flex-end;
    gap: 8px;
    background: transparent;
    flex-shrink: 0;
  }
  .input-wrap {
    flex: 1;
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.13);
    border-radius: 22px;
    display: flex;
    align-items: flex-end;
    padding: 4px 4px 4px 16px;
    backdrop-filter: var(--blur-sm);
    -webkit-backdrop-filter: var(--blur-sm);
    transition: border-color 0.2s, background 0.2s;
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.08);
    gap: 6px;
  }
  .input-wrap:focus-within {
    border-color: rgba(255,255,255,0.25);
    background: rgba(255,255,255,0.11);
  }
  .input-textarea {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: var(--text);
    font-family: var(--font);
    font-size: 15px;
    font-weight: 400;
    resize: none;
    min-height: 34px;
    max-height: 120px;
    line-height: 1.5;
    padding: 7px 0;
    -webkit-appearance: none;
  }
  .input-textarea::placeholder { color: var(--text-3); }
  .send-btn {
    width: 34px; height: 34px;
    background: rgba(255,255,255,0.9);
    border: none;
    border-radius: 50%;
    color: #000;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    flex-shrink: 0;
    transition: all 0.15s;
    box-shadow: 0 2px 10px rgba(255,255,255,0.15);
    align-self: flex-end;
    margin-bottom: 0;
  }
  .send-btn:active { transform: scale(0.9); }
  .send-btn:disabled { opacity: 0.2; cursor: default; }

  /* lore sheet */
  .sheet-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    z-index: 40;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    animation: fadeIn 0.2s ease;
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  .sheet {
    position: fixed;
    bottom: 0;
    left: max(0px, calc(50vw - 340px));
    right: max(0px, calc(50vw - 340px));
    max-height: 65dvh;
    background: rgba(18,18,18,0.85);
    backdrop-filter: var(--blur);
    -webkit-backdrop-filter: var(--blur);
    border-top-left-radius: 24px;
    border-top-right-radius: 24px;
    border-top: 1px solid rgba(255,255,255,0.1);
    z-index: 41;
    display: flex;
    flex-direction: column;
    animation: sheetUp 0.3s cubic-bezier(0.16,1,0.3,1);
  }
  @keyframes sheetUp {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }
  .sheet-handle {
    width: 36px; height: 4px;
    background: rgba(255,255,255,0.2);
    border-radius: 2px;
    margin: 12px auto 0;
    flex-shrink: 0;
  }
  .sheet-header {
    padding: 14px 20px 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    flex-shrink: 0;
  }
  .sheet-title { font-size: 15px; font-weight: 600; color: var(--text-2); }
  .sheet-close {
    width: 28px; height: 28px;
    background: rgba(255,255,255,0.08);
    border: none;
    border-radius: 50%;
    color: var(--text-3);
    font-size: 14px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .sheet-body {
    flex: 1;
    overflow-y: auto;
    padding: 16px 20px 32px;
    font-size: 13px;
    color: var(--text-2);
    font-family: 'SF Mono', 'Menlo', monospace;
    line-height: 1.8;
    white-space: pre-wrap;
  }
  .sheet-body::-webkit-scrollbar { display: none; }
  .sheet-empty { color: var(--text-3); font-style: italic; font-family: var(--font); }

  /* flash pulse */
  @keyframes flashPulse {
    0%, 100% { box-shadow: none; }
    50% { box-shadow: 0 0 0 3px rgba(255,255,255,0.2); }
  }
  .hbtn.flashing { animation: flashPulse 0.5s ease 4; }

  /* session panel */
  .sess-panel {
    position: fixed;
    top: 0; bottom: 0;
    right: max(0px, calc(50vw - 340px));
    width: min(300px, 85vw);
    background: rgba(10,10,10,0.92);
    backdrop-filter: var(--blur);
    -webkit-backdrop-filter: var(--blur);
    border-left: 1px solid rgba(255,255,255,0.08);
    z-index: 30;
    display: flex;
    flex-direction: column;
    animation: slideRight 0.28s cubic-bezier(0.16,1,0.3,1);
  }
  @keyframes slideRight {
    from { transform: translateX(100%); }
    to { transform: translateX(0); }
  }
  .sess-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.4);
    z-index: 29;
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    animation: fadeIn 0.2s ease;
  }
  .sess-header {
    padding: 16px 16px 12px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-shrink: 0;
  }
  .sess-title { font-size: 13px; font-weight: 600; color: var(--text-3); letter-spacing: 1px; text-transform: uppercase; }
  .sess-close {
    width: 28px; height: 28px;
    background: rgba(255,255,255,0.07);
    border: none; border-radius: 50%;
    color: var(--text-3); font-size: 14px;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
  }
  .new-chat-btn {
    margin: 12px;
    padding: 11px;
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 12px;
    color: var(--text);
    font-family: var(--font);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.15s;
    flex-shrink: 0;
  }
  .new-chat-btn:active { background: rgba(255,255,255,0.13); }
  .sess-list {
    flex: 1;
    overflow-y: auto;
    padding: 4px 8px 16px;
  }
  .sess-list::-webkit-scrollbar { display: none; }
  .sess-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 10px;
    border-radius: 10px;
    cursor: pointer;
    transition: background 0.15s;
    margin-bottom: 2px;
    position: relative;
  }
  .sess-item:active { background: rgba(255,255,255,0.07); }
  .sess-item.active { background: rgba(255,255,255,0.09); }
  .sess-item-icon { font-size: 14px; flex-shrink: 0; opacity: 0.5; }
  .sess-item-info { flex: 1; min-width: 0; }
  .sess-item-name {
    font-size: 13px;
    font-weight: 500;
    color: var(--text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .sess-item.active .sess-item-name { color: #fff; }
  .sess-item-meta { font-size: 11px; color: var(--text-3); margin-top: 1px; }
  .sess-delete {
    width: 26px; height: 26px;
    background: transparent;
    border: none;
    color: rgba(255,80,80,0.4);
    font-size: 14px;
    cursor: pointer;
    border-radius: 6px;
    display: flex; align-items: center; justify-content: center;
    opacity: 0;
    transition: all 0.15s;
    flex-shrink: 0;
  }
  .sess-item:hover .sess-delete,
  .sess-item:active .sess-delete { opacity: 1; }
  .sess-naming {
    font-size: 11px;
    color: var(--text-3);
    font-style: italic;
    padding: 2px 10px 8px;
    text-align: center;
  }

`;

export default function App() {
  const [screen, setScreen] = useState('login');
  const [tab, setTab] = useState('login');
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [statusOk, setStatusOk] = useState(false);
  const [sheet, setSheet] = useState(null);
  const [myMemory, setMyMemory] = useState('');
  const [storyData, setStoryData] = useState('');
  const [memFlash, setMemFlash] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [showSessions, setShowSessions] = useState(false);
  const [renamingId, setRenamingId] = useState(null);
  const [renameVal, setRenameVal] = useState('');
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const taRef = useRef(null);

  useEffect(() => {
    const t = localStorage.getItem('nt_tok');
    const u = localStorage.getItem('nt_usr');
    const admin = localStorage.getItem('nt_admin');
    if (t && u) {
      const parsedUser = JSON.parse(u);
      setToken(t); setUser(parsedUser);
      setIsAdmin(admin === 'true');
      setScreen('chat');
      loadSessions(t);
    }
  }, []);

  useEffect(() => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  }, [msgs]);

  useEffect(() => {
    if (taRef.current) {
      taRef.current.style.height = 'auto';
      taRef.current.style.height = Math.min(taRef.current.scrollHeight, 120) + 'px';
    }
  }, [input]);

  async function loadSessions(t) {
    try {
      const r = await fetch('/api/sessions', { headers: { Authorization: `Bearer ${t || token}` } });
      const d = await r.json();
      if (d.sessions) {
        setSessions(d.sessions);
        if (d.sessions.length > 0) {
          setCurrentSession(d.sessions[0]);
          await loadSessionHistory(d.sessions[0].id, t || token);
        }
      }
    } catch {}
  }

  async function loadSessionHistory(sessionId, t) {
    try {
      const r = await fetch(`/api/history?sessionId=${sessionId}`, { headers: { Authorization: `Bearer ${t || token}` } });
      const d = await r.json();
      if (d.messages) setMsgs(d.messages);
    } catch {}
  }

  async function switchSession(session) {
    setCurrentSession(session);
    setMsgs([]);
    setShowSessions(false);
    await loadSessionHistory(session.id);
  }

  async function newChat() {
    try {
      const r = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action: 'create' })
      });
      const d = await r.json();
      if (d.session) {
        setSessions(p => [d.session, ...p]);
        setCurrentSession(d.session);
        setMsgs([]);
        setShowSessions(false);
      }
    } catch {}
  }

  async function deleteSession(sessionId) {
    try {
      await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action: 'delete', sessionId })
      });
      const remaining = sessions.filter(s => s.id !== sessionId);
      setSessions(remaining);
      if (currentSession?.id === sessionId) {
        if (remaining.length > 0) { setCurrentSession(remaining[0]); loadSessionHistory(remaining[0].id); }
        else { newChat(); }
      }
    } catch {}
  }

  async function renameSession(sessionId, name) {
    try {
      await fetch('/api/rename-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ sessionId, name })
      });
      setSessions(p => p.map(s => s.id === sessionId ? { ...s, name } : s));
      if (currentSession?.id === sessionId) setCurrentSession(p => ({ ...p, name }));
      setRenamingId(null);
    } catch {}
  }

  async function loadMyMemory() {
    try {
      const r = await fetch('/api/my-memory', { headers: { Authorization: `Bearer ${token}` } });
      const d = await r.json();
      setMyMemory(d.memory || '');
    } catch {}
  }

  async function loadStory() {
    try {
      const r = await fetch('/api/lore', { headers: { Authorization: `Bearer ${token}` } });
      const d = await r.json();
      setStoryData(d.story || '');
    } catch {}
  }

  async function handleLogin(e) {
    e.preventDefault();
    const f = e.target;
    setLoading(true); setStatusMsg('');
    try {
      const r = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: f.name.value.trim().toLowerCase(), password: f.password.value })
      });
      const d = await r.json();
      if (!r.ok) { setStatusMsg(d.error); setStatusOk(false); }
      else {
        localStorage.setItem('nt_tok', d.token);
        localStorage.setItem('nt_usr', JSON.stringify(d.user));
        localStorage.setItem('nt_admin', d.isAdmin ? 'true' : 'false');
        setToken(d.token); setUser(d.user);
        setIsAdmin(!!d.isAdmin);
        setScreen('chat'); loadSessions(d.token);
      }
    } catch { setStatusMsg('something went wrong. try again.'); setStatusOk(false); }
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
        body: JSON.stringify({ name: (f.firstName.value.trim() + ' ' + f.lastName.value.trim()), email: f.email.value.trim() })
      });
      const d = await r.json();
      if (!r.ok) { setStatusMsg(d.error); setStatusOk(false); }
      else { setStatusMsg('request sent. you will get an invite link once approved.'); setStatusOk(true); }
    } catch { setStatusMsg('error. try again.'); setStatusOk(false); }
    setLoading(false);
  }

  async function send() {
    const msg = input.trim();
    if (!msg || loading) return;
    setInput('');
    setLoading(true);

    const userMsg = { role: 'user', content: msg, ts: Date.now() };
    setMsgs(p => [...p, userMsg]);

    try {
      let sessionId = currentSession?.id;
      if (!sessionId) {
        try {
          const sr = await fetch('/api/sessions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ action: 'create' })
          });
          const sd = await sr.json();
          if (sd.session) {
            setCurrentSession(sd.session);
            setSessions(p => [sd.session, ...p]);
            sessionId = sd.session.id;
          }
        } catch {}
      }

      const r = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: msg, sessionId })
      });
      const d = await r.json();
      if (d.response) {
        setMsgs(p => [...p, { role: 'assistant', content: d.response, ts: Date.now() }]);
        if (d.memoryUpdated) { setMemFlash(true); setTimeout(() => setMemFlash(false), 3000); }
        setTimeout(() => {
          fetch('/api/sessions', { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.json()).then(d => { if (d.sessions) setSessions(d.sessions); }).catch(() => {});
        }, 2000);
      } else {
        setMsgs(p => [...p, { role: 'assistant', content: d.error || 'something broke.', ts: Date.now() }]);
      }
    } catch {
      setMsgs(p => [...p, { role: 'assistant', content: 'lost connection. try again.', ts: Date.now() }]);
    }
    setLoading(false);
    inputRef.current?.focus();
  }

  function onKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  }

  function logout() {
    if (!confirm('sure you want to log out?')) return;
    localStorage.removeItem('nt_tok'); localStorage.removeItem('nt_usr'); localStorage.removeItem('nt_admin');
    setToken(null); setUser(null); setScreen('login'); setMsgs([]); setSessions([]); setCurrentSession(null);
  }

  function openSheet(s) {
    setSheet(s);
    if (s === 'memory') loadMyMemory();
    if (s === 'story') loadStory();
  }

  function fmt(ts) {
    if (!ts) return '';
    const d = new Date(ts);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  }

  function fmtDate(ts) {
    const d = new Date(ts);
    const today = new Date();
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return 'today';
    if (d.toDateString() === yesterday.toDateString()) return 'yesterday';
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  }

  function renderMessages() {
    const out = [];
    let lastDate = null;
    msgs.forEach((m, i) => {
      const d = m.ts ? new Date(m.ts).toDateString() : null;
      if (d && d !== lastDate) {
        out.push(<div key={`sep-${i}`} className="date-sep"><span>{fmtDate(m.ts)}</span></div>);
        lastDate = d;
      }
      out.push(
        <div key={i} className={`msg-row ${m.role === 'user' ? 'user' : 'newton'}`}>
          <div className="msg-bubble">{m.content}</div>
          <div className="msg-time">{fmt(m.ts)}</div>
        </div>
      );
    });
    return out;
  }

  // LOGIN SCREEN
  if (screen === 'login') return (
    <>
      <Head>
        <title>newton</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </Head>
      <style>{CSS}</style>
      <div className="bg" />
      <div className="login-screen">
        <div className="login-card">
          <div className="login-logo">newton</div>
          <div className="login-sub">{tab === "request" ? "want to talk to newton?" : "welcome back"}</div>
          <div className="seg-control">
            <button className={`seg-btn ${tab === 'login' ? 'active' : ''}`} onClick={() => { setTab('login'); setStatusMsg(''); }}>login</button>
            <button className={`seg-btn ${tab === 'request' ? 'active' : ''}`} onClick={() => { setTab('request'); setStatusMsg(''); }}>request access</button>
          </div>
          {tab === 'login' ? (
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
                <div style={{display:'flex',gap:10}}>
                  <div style={{flex:1}}>
                    <label className="field-label">first name</label>
                    <input className="field-input" name="firstName" placeholder="first name" required />
                  </div>
                  <div style={{flex:1}}>
                    <label className="field-label">last name</label>
                    <input className="field-input" name="lastName" placeholder="last name" required />
                  </div>
                </div>
                <div style={{fontSize:11,color:'rgba(255,255,255,0.28)',marginTop:6,lineHeight:1.5,paddingLeft:2}}>
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
    </>
  );

  // CHAT SCREEN
  return (
    <>
      <Head>
        <title>newton</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover" />
      </Head>
      <style>{CSS}</style>
      <div className="bg" />
      <div className="app">
        <div className="header">
          <div className="header-left">
            <div className="avatar">⚛</div>
            <div className="header-info">
              <div className="header-name">newton</div>
              <div className="header-status">{loading ? 'typing...' : (currentSession?.name || 'new chat')}</div>
            </div>
          </div>
          <div className="header-right">
            <button className="hbtn" onClick={() => setShowSessions(p => !p)} title="chats">💬</button>
            <button className={`hbtn ${memFlash ? 'flashing' : ''}`} onClick={() => openSheet(sheet === 'memory' ? null : 'memory')} title="what newton remembers about you">🧠</button>
            {isAdmin && <button className="hbtn" onClick={() => openSheet(sheet === 'story' ? null : 'story')} title="shared story">📖</button>}
          </div>
        </div>

        <div className="msgs">
          {msgs.length === 0 && (
            <div className="empty">
              <div className="empty-orb">⚛</div>
              <div className="empty-title">newton</div>
              <div className="empty-sub">say something.</div>
            </div>
          )}
          {renderMessages()}
          {loading && (
            <div className="msg-row typing-row">
              <div className="typing-bubble">
                <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="input-area">
          <div className="input-wrap">
            <textarea
              ref={el => { taRef.current = el; inputRef.current = el; }}
              className="input-textarea"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKey}
              placeholder={`message newton...`}
              rows={1}
              disabled={loading}
            />
            <button className="send-btn" onClick={send} disabled={loading || !input.trim()}>↑</button>
          </div>
        </div>
      </div>

      {showSessions && (
        <>
          <div className="sess-overlay" onClick={() => setShowSessions(false)} />
          <div className="sess-panel">
            <div className="sess-header">
              <div className="sess-title">chats</div>
              <button className="sess-close" onClick={() => setShowSessions(false)}>✕</button>
            </div>
            <button className="new-chat-btn" onClick={newChat}>
              <span>✏️</span> new chat
            </button>
            <div className="sess-list">
              {sessions.map(s => (
                <div key={s.id} className={`sess-item ${currentSession?.id === s.id ? 'active' : ''}`}
                  onClick={() => { if (renamingId !== s.id) switchSession(s); }}>
                  <div className="sess-item-icon">💬</div>
                  <div className="sess-item-info">
                    {renamingId === s.id ? (
                      <input
                        autoFocus
                        value={renameVal}
                        onChange={e => setRenameVal(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') renameSession(s.id, renameVal);
                          if (e.key === 'Escape') setRenamingId(null);
                          e.stopPropagation();
                        }}
                        onClick={e => e.stopPropagation()}
                        style={{ background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontFamily: 'inherit', fontSize: 13, width: '100%' }}
                      />
                    ) : (
                      <div className="sess-item-name" onDoubleClick={e => { e.stopPropagation(); setRenamingId(s.id); setRenameVal(s.name || ''); }}>
                        {s.name || <span style={{color:'rgba(255,255,255,0.25)',fontStyle:'italic'}}>naming...</span>}
                      </div>
                    )}
                    <div className="sess-item-meta" suppressHydrationWarning>{s.createdAt ? new Date(s.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : ''}</div>
                  </div>
                  <button className="sess-delete" onClick={e => { e.stopPropagation(); deleteSession(s.id); }}>🗑</button>
                </div>
              ))}
            </div>
            <button onClick={logout} style={{ margin: '12px 16px 16px', padding: '10px', background: 'rgba(255,60,60,0.1)', border: '1px solid rgba(255,60,60,0.2)', borderRadius: '10px', color: '#f87171', fontSize: '13px', fontWeight: '600', cursor: 'pointer', width: 'calc(100% - 32px)', textAlign: 'center' }}>
              logout
            </button>
          </div>
        </>
      )}

      {sheet && (
        <>
          <div className="sheet-overlay" onClick={() => setSheet(null)} />
          <div className="sheet">
            <div className="sheet-handle" />
            <div className="sheet-header">
              <div className="sheet-title">{sheet === 'memory' ? `🧠  what newton knows about you` : '📖  shared story'}</div>
              <button className="sheet-close" onClick={() => setSheet(null)}>✕</button>
            </div>
            <div className="sheet-body">
              {sheet === 'memory'
                ? (myMemory || <span className="sheet-empty">newton doesn't know anything about you yet. start talking.</span>)
                : (storyData || <span className="sheet-empty">no story built yet.</span>)
              }
            </div>
          </div>
        </>
      )}
    </>
  );
}