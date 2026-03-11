              <div className="empty-orb">⚛</div>
              <div className="empty-title">newton</div>
              <div className="empty-sub">bol kuch. judge karta hun baad mein.</div>
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
                    <div className="sess-item-meta">{new Date(s.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                  </div>
                  <button className="sess-delete" onClick={e => { e.stopPropagation(); deleteSession(s.id); }}>🗑</button>
                </div>
              ))}
            </div>
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
                ? (myMemory || <span className="sheet-empty">newton abhi kuch nahi jaanta tere baare mein. baat kar isse.</span>)
                : (storyData || <span className="sheet-empty">no story built yet.</span>)
              }
            </div>
          </div>
        </>
      )}
    </>
  );
}