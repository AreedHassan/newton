import { useState } from 'react';

export function useChat(token, currentSession, setCurrentSession, setSessions, handleBan) {
  const [loading, setLoading] = useState(false);
  const [memFlash, setMemFlash] = useState(false);

  async function send(msg, msgs, setMsgs, inputRef) {
    if (!msg || loading) return;
    setLoading(true);
    setMsgs(p => [...p, { role: 'user', content: msg, ts: Date.now() }]);

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
        if (d.memoryUpdated) {
          setMemFlash(true);
          setTimeout(() => setMemFlash(false), 3000);
        }
        setTimeout(() => {
          fetch('/api/sessions', { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.json())
            .then(d => { if (d.sessions) setSessions(d.sessions); })
            .catch(() => {});
        }, 2000);
      } else if (d.error === 'banned') {
        handleBan(d.banReason);
      } else {
        setMsgs(p => [...p, { role: 'assistant', content: d.error || 'something broke.', ts: Date.now() }]);
      }
    } catch {
      setMsgs(p => [...p, { role: 'assistant', content: 'lost connection. try again.', ts: Date.now() }]);
    }

    setLoading(false);
    inputRef.current?.focus();
  }

  return { loading, memFlash, send };
}
