export default function BottomSheet({ sheet, myMemory, storyData, token, onClose }) {
  async function clearMemory() {
    if (!confirm('clear everything newton knows about you?')) return;
    await fetch('/api/clear-memory', { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
    onClose();
  }

  return (
    <>
      <div className="sheet-overlay" onClick={onClose} />
      <div className="sheet">
        <div className="sheet-handle" />
        <div className="sheet-header">
          <div className="sheet-title">
            {sheet === 'memory' ? '🧠  what newton knows about you' : '📖  shared story'}
          </div>
          <button className="sheet-close" onClick={onClose}>✕</button>
        </div>
        <div className="sheet-body">
          {sheet === 'memory' ? (
            <>
              {myMemory || <span className="sheet-empty">newton doesn't know anything about you yet. start talking.</span>}
              <button onClick={clearMemory} style={{
                marginTop: 20, width: '100%', padding: '10px',
                background: 'rgba(255,60,60,0.1)', border: '1px solid rgba(255,60,60,0.2)',
                borderRadius: '10px', color: '#f87171', fontSize: '13px', fontWeight: '600',
                cursor: 'pointer', fontFamily: 'var(--font)'
              }}>clear memory</button>
            </>
          ) : (storyData || <span className="sheet-empty">no story built yet.</span>)}
        </div>
      </div>
    </>
  );
}
