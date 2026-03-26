import { useEffect } from 'react';

export default function BanChecker({ onUnbanned }) {
  useEffect(() => {
    const email = (() => {
      try { return JSON.parse(localStorage.getItem('nt_usr'))?.email; }
      catch { return null; }
    })();
    if (!email) return;

    // check immediately when user comes back to the tab
    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') check();
    }
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // fallback polling every 8s
    const iv = setInterval(check, 8000);

    async function check() {
      try {
        const r = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: email, password: '___check___' })
        });
        const d = await r.json();
        if (d.error !== 'banned') onUnbanned();
      } catch {}
    }

    return () => {
      clearInterval(iv);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return null;
}
