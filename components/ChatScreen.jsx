import { useRef, useState, useEffect } from 'react';
import { useChat } from '../hooks/useChat';
import { fmt, fmtDate } from '../utils/format';
import { renderMarkdown } from '../utils/markdown';
import SessionPanel from './SessionPanel';
import BottomSheet from './BottomSheet';

export default function ChatScreen({
  user, token, isAdmin,
  sessions, currentSession, setCurrentSession, setSessions,
  msgs, setMsgs, showSessions, setShowSessions,
  switchSession, newChat, deleteSession, renameSession,
  handleBan, logout
}) {
  const [sheet, setSheet] = useState(null);
  const [myMemory, setMyMemory] = useState('');
  const [storyData, setStoryData] = useState('');
  const [input, setInput] = useState('');
  const [copiedIdx, setCopiedIdx] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const taRef = useRef(null);

  const { loading, memFlash, send } = useChat(
    token, currentSession, setCurrentSession, setSessions, handleBan
  );

  useEffect(() => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  }, [msgs]);

  useEffect(() => {
    if (taRef.current) {
      taRef.current.style.height = 'auto';
      taRef.current.style.height = Math.min(taRef.current.scrollHeight, 120) + 'px';
    }
  }, [input]);

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

  function openSheet(s) {
    setSheet(s);
    if (s === 'memory') loadMyMemory();
    if (s === 'story') loadStory();
  }

  function copyMsg(content, idx) {
    navigator.clipboard.writeText(content);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1500);
  }

  function onKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send(input.trim(), msgs, setMsgs, inputRef);
      setInput('');
    }
  }

  function handleSend() {
    send(input.trim(), msgs, setMsgs, inputRef);
    setInput('');
  }

  function renderMessages() {
    const out = [];
    let lastDate = null;
    msgs.forEach((m, i) => {
      const d = m.ts ? new Date(m.ts).toDateString() : null;
      if (d && d !== lastDate) {
        out.push(
          <div key={`sep-${i}`} className="date-sep">
            <span>{fmtDate(m.ts)}</span>
          </div>
        );
        lastDate = d;
      }
      out.push(
        <div key={i} className={`msg-row ${m.role === 'user' ? 'user' : 'newton'}`}>
          <div className="msg-bubble">
            {m.role === 'assistant' ? renderMarkdown(m.content, i) : m.content}
          </div>
          <div className="msg-meta">
            <div className="msg-time">{fmt(m.ts)}</div>
            {m.role === 'assistant' && (
              <button className="copy-btn" onClick={() => copyMsg(m.content, i)}>
                {copiedIdx === i ? '✓' : '⧉'}
              </button>
            )}
          </div>
        </div>
      );
    });
    return out;
  }

  return (
    <div className="app">
      <div className="header">
        <div className="header-left">
          <div className="avatar">⚛</div>
          <div className="header-info">
            <div className="header-name">newton</div>
            <div className="header-status">
              {loading ? 'typing...' : (currentSession?.name || 'new chat')}
            </div>
          </div>
        </div>
        <div className="header-right">
          <button className={`hbtn ${memFlash ? 'flashing' : ''}`} onClick={() => openSheet(sheet === 'memory' ? null : 'memory')}>🧠</button>
          <button className="hbtn" onClick={() => setShowSessions(p => !p)}>💬</button>
          {isAdmin && <button className="hbtn" onClick={() => openSheet(sheet === 'story' ? null : 'story')}>📖</button>}
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
              <div className="typing-dot" />
              <div className="typing-dot" />
              <div className="typing-dot" />
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
            placeholder="message newton..."
            rows={1}
            disabled={loading}
          />
          <button className="send-btn" onClick={handleSend} disabled={loading || !input.trim()}>↑</button>
        </div>
      </div>

      {showSessions && (
        <SessionPanel
          sessions={sessions}
          currentSession={currentSession}
          onClose={() => setShowSessions(false)}
          onNewChat={newChat}
          onSwitch={switchSession}
          onDelete={deleteSession}
          onRename={renameSession}
          onLogout={logout}
        />
      )}

      {sheet && (
        <BottomSheet
          sheet={sheet}
          myMemory={myMemory}
          storyData={storyData}
          token={token}
          onClose={() => setSheet(null)}
        />
      )}
    </div>
  );
}
