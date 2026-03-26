import { useState } from 'react';

export function useSessions(token) {
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [showSessions, setShowSessions] = useState(false);

  async function loadSessions(t) {
    try {
      const r = await fetch('/api/sessions', {
        headers: { Authorization: `Bearer ${t || token}` }
      });
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
      const r = await fetch(`/api/history?sessionId=${sessionId}`, {
        headers: { Authorization: `Bearer ${t || token}` }
      });
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
        if (remaining.length > 0) {
          setCurrentSession(remaining[0]);
          loadSessionHistory(remaining[0].id);
        } else {
          newChat();
        }
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
    } catch {}
  }

  async function refreshSessions() {
    try {
      const r = await fetch('/api/sessions', { headers: { Authorization: `Bearer ${token}` } });
      const d = await r.json();
      if (d.sessions) setSessions(d.sessions);
    } catch {}
  }

  return {
    sessions, setSessions,
    currentSession, setCurrentSession,
    msgs, setMsgs,
    showSessions, setShowSessions,
    loadSessions, loadSessionHistory,
    switchSession, newChat, deleteSession,
    renameSession, refreshSessions
  };
}
