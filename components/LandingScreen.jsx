import WaterCanvas from './WaterCanvas';
<WaterCanvas />

export default function LandingScreen({ sliding, onLogin, onRequest }) {
  return (
    <div style={{
      position: 'relative', zIndex: 1, height: '100dvh',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px', overflow: 'hidden',
      transform: sliding ? 'translateY(-100%)' : 'translateY(0)',
      transition: sliding ? 'transform 0.45s cubic-bezier(0.16,1,0.3,1)' : 'none'
    }}>
      <AtomCanvas />
      <div style={{
        fontSize: 'clamp(72px,20vw,120px)', fontWeight: 700, letterSpacing: '-4px',
        color: '#fff', lineHeight: 1, marginBottom: 16, position: 'relative', zIndex: 2,
        userSelect: 'none', fontFamily: "'Plus Jakarta Sans',-apple-system,sans-serif"
      }}>newton</div>
      <div style={{
        fontSize: 15, color: 'rgba(255,255,255,0.4)', fontWeight: 400,
        letterSpacing: '0.2px', marginBottom: 48, textAlign: 'center',
        position: 'relative', zIndex: 2,
        fontFamily: "'Plus Jakarta Sans',-apple-system,sans-serif"
      }}>Master of none. Capable of all.</div>
      <div style={{ display: 'flex', gap: 12, width: '100%', maxWidth: 320, position: 'relative', zIndex: 2 }}>
        <button onClick={onLogin} style={{
          flex: 1, padding: '14px 10px', borderRadius: 16,
          fontFamily: "'Plus Jakarta Sans',-apple-system,sans-serif",
          fontSize: 15, fontWeight: 600, cursor: 'pointer', textAlign: 'center',
          border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.08)',
          color: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12)',
          transition: 'all 0.15s'
        }}>sign in</button>
        <button onClick={onRequest} style={{
          flex: 1, padding: '14px 10px', borderRadius: 16,
          fontFamily: "'Plus Jakarta Sans',-apple-system,sans-serif",
          fontSize: 15, fontWeight: 600, cursor: 'pointer', textAlign: 'center',
          border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.08)',
          color: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12)',
          transition: 'all 0.15s'
        }}>get access</button>
      </div>
      <div style={{
        position: 'absolute', bottom: 28, fontSize: 13, color: 'rgba(255,255,255,0.3)',
        fontWeight: 400, fontFamily: "'Plus Jakarta Sans',-apple-system,sans-serif",
        letterSpacing: '0.2px', zIndex: 2
      }}>developed by Areed Hassan</div>
    </div>
  );
}
