import { useState } from 'react';

export default function SessionPanel({
  sessions, currentSession, showSessions,
  onClose, onNewChat, onSwitch, onDelete, onRename, onLogout
}) {
  const [renamingId, setRenamingId] = useState(null);
  const [renameVal, setRenameVal] = useState('');

  return (
    <>
      <div className="sess-overlay" onClick={onClose} />
      <div className="sess-panel">
        <div className="sess-header">
          <div className="sess-title">chats</div>
          <button className="sess-close" onClick={onClose}>✕</button>
        </div>
        <button className="new-chat-btn" onClick={onNewChat}>
          <span>✏️</span> new chat
        </button>
        <div className="sess-list">
          {sessions.map(s => (
            <div
              key={s.id}
              className={`sess-item ${currentSession?.id === s.id ? 'active' : ''}`}
              onClick={() => { if (renamingId !== s.id) onSwitch(s); }}
            >
              <div className="sess-item-icon">💬</div>
              <div className="sess-item-info">
                {renamingId === s.id ? (
                  <input
                    autoFocus
                    value={renameVal}
                    onChange={e => setRenameVal(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') { onRename(s.id, renameVal); setRenamingId(null); }
                      if (e.key === 'Escape') setRenamingId(null);
                      e.stopPropagation();
                    }}
                    onClick={e => e.stopPropagation()}
                    style={{
                      background: 'transparent', border: 'none', outline: 'none',
                      color: '#fff', fontFamily: 'inherit', fontSize: 13, width: '100%'
                    }}
                  />
                ) : (
                  <div
                    className="sess-item-name"
                    onDoubleClick={e => {
                      e.stopPropagation();
                      setRenamingId(s.id);
                      setRenameVal(s.name || '');
                    }}
                  >
                    {s.name || <span style={{ color: 'rgba(255,255,255,0.25)', fontStyle: 'italic' }}>naming...</span>}
                  </div>
                )}
                <div className="sess-item-meta" suppressHydrationWarning>
                  {s.createdAt ? new Date(s.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : ''}
                </div>
              </div>
              <button className="sess-delete" onClick={e => { e.stopPropagation(); onDelete(s.id); }}>🗑</button>
            </div>
          ))}
        </div>
        <button onClick={onLogout} style={{
          margin: '12px 16px 16px', padding: '10px',
          background: 'rgba(255,60,60,0.1)', border: '1px solid rgba(255,60,60,0.2)',
          borderRadius: '10px', color: '#f87171', fontSize: '13px', fontWeight: '600',
          cursor: 'pointer', width: 'calc(100% - 32px)', textAlign: 'center'
        }}>logout</button>
      </div>
    </>
  );
}
