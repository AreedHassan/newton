import { useState, useEffect } from 'react';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [screen, setScreen] = useState('landing');
  const [banReason, setBanReason] = useState('');

  useEffect(() => {
    const t = localStorage.getItem('nt_tok');
    const u = localStorage.getItem('nt_usr');
    const admin = localStorage.getItem('nt_admin');
    const banned = localStorage.getItem('nt_banned');
    if (banned !== null) { setBanReason(banned); setScreen('banned'); return; }
    if (t && u) {
      setToken(t);
      setUser(JSON.parse(u));
      setIsAdmin(admin === 'true');
      setScreen('chat');
    }
  }, []);

  function logout() {
    if (!confirm('sure you want to log out?')) return;
    ['nt_tok', 'nt_usr', 'nt_admin', 'nt_banned'].forEach(k => localStorage.removeItem(k));
    setToken(null);
    setUser(null);
    setIsAdmin(false);
    setScreen('landing');
  }

  function handleBan(reason) {
    localStorage.setItem('nt_banned', reason || '');
    setBanReason(reason || '');
    setScreen('banned');
  }

  function handleLoginSuccess(data) {
    localStorage.setItem('nt_tok', data.token);
    localStorage.setItem('nt_usr', JSON.stringify(data.user));
    localStorage.setItem('nt_admin', data.isAdmin ? 'true' : 'false');
    setToken(data.token);
    setUser(data.user);
    setIsAdmin(!!data.isAdmin);
    setScreen('chat');
  }

  function handleUnban() {
    localStorage.removeItem('nt_banned');
    localStorage.removeItem('nt_tok');
    localStorage.removeItem('nt_usr');
    localStorage.removeItem('nt_admin');
    setScreen('landing');
  }

  return {
    user, token, isAdmin, screen, setScreen,
    banReason, logout, handleBan, handleLoginSuccess, handleUnban
  };
}
