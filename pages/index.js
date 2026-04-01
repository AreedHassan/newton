import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useAuth } from '../hooks/useAuth';
import { useSessions } from '../hooks/useSessions';
import LandingScreen from '../components/LandingScreen';
import LoginScreen from '../components/LoginScreen';
import ChatScreen from '../components/ChatScreen';
import BanChecker from '../components/BanChecker';

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }

  :root {
    --blur: blur(40px) saturate(180%);
    --blur-sm: blur(20px) saturate(160%);
    --glass-border: rgba(255,255,255,0.15);
    --text: rgba(255,255,255,0.95);
    --text-2: rgba(255,255,255,0.6);
    --text-3: rgba(255,255,255,0.35);
    --font: 'Plus Jakarta Sans', -apple-system, sans-serif;
  }

  html, body {
.bg::before {
    content: '';
    position: absolute;
    inset: 0;
    background: #000;
  }
  .bg::after {
    content: ''; position: absolute; inset: 0; background: rgba(0,0,0,0.45);
  }
`;

export default function App() {
  const [sliding, setSliding] = useState(false);
  const [loginTab, setLoginTab] = useState('login');

  const {
    user, token, isAdmin, screen, setScreen,
    banReason, logout, handleBan, handleLoginSuccess, handleUnban
  } = useAuth();

  const {
    sessions, setSessions,
    currentSession, setCurrentSession,
    msgs, setMsgs,
    showSessions, setShowSessions,
    loadSessions, switchSession, newChat, deleteSession, renameSession
  } = useSessions(token);

  useEffect(() => {
    if (screen === 'chat' && token) loadSessions(token);
  }, [screen, token]);

  function goToLogin(tab) {
    setLoginTab(tab);
    setSliding(true);
    setTimeout(() => { setScreen('login'); setSliding(false); }, 450);
  }

  if (screen === 'banned') return (
    <>
      <Head><title>newton</title></Head>
      <style>{CSS}</style>
      <BanChecker onUnbanned={handleUnban} />
      <div style={{
        position: 'fixed', inset: 0, background: '#000',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: 32, fontFamily: "'Plus Jakarta Sans',-apple-system,sans-serif"
      }}>
        <div style={{ fontSize: 32, fontWeight: 700, color: '#fff', letterSpacing: -1, marginBottom: banReason ? 10 : 0 }}>you are banned</div>
        {banReason && <div style={{ fontSize: 14, color: '#444', textAlign: 'center', maxWidth: 280, lineHeight: 1.6 }}>{banReason}</div>}
      </div>
    </>
  );

  if (screen === 'landing') return (
    <>
      <Head>
        <title>newton</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </Head>
      <style>{CSS}</style>
      <div className="bg" />
      <LandingScreen
        sliding={sliding}
        onLogin={() => goToLogin('login')}
        onSignup={() => goToLogin('signup')}
      />
    </>
  );

  if (screen === 'login') return (
    <>
      <Head>
        <title>newton</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </Head>
      <style>{CSS}</style>
      <div className="bg" />
      <LoginScreen
        loginTab={loginTab}
        setLoginTab={setLoginTab}
        onLoginSuccess={(data) => {
          handleLoginSuccess(data);
          loadSessions(data.token);
        }}
        onBan={handleBan}
      />
    </>
  );

  return (
    <>
      <Head>
        <title>newton</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover" />
      </Head>
      <style>{CSS}</style>
      <div className="bg" />
      <ChatScreen
        user={user}
        token={token}
        isAdmin={isAdmin}
        sessions={sessions}
        currentSession={currentSession}
        setCurrentSession={setCurrentSession}
        setSessions={setSessions}
        msgs={msgs}
        setMsgs={setMsgs}
        showSessions={showSessions}
        setShowSessions={setShowSessions}
        switchSession={switchSession}
        newChat={newChat}
        deleteSession={deleteSession}
        renameSession={renameSession}
        handleBan={handleBan}
        logout={logout}
      />
    </>
  );
}