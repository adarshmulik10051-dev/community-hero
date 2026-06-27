import React, { useState, useEffect } from 'react';
import './App.css';
import Home from './pages/Home';
import ReportIssue from './pages/ReportIssue';
import LiveMap from './pages/LiveMap';
import Feed from './pages/Feed';
import Dashboard from './pages/Dashboard';
import Gallery from './pages/Gallery';
import Heroes from './pages/Heroes';
import AdminPanel from './pages/AdminPanel';
import ChatBot from './components/ChatBot';
import AlertBanner from './components/AlertBanner';
import Navbar from './components/Navbar';

function App() {
  const [activePage, setActivePage] = useState('home');
  const [lang, setLang] = useState('en');
  const [userName, setUserName] = useState(localStorage.getItem('chUserName') || '');
  const [nameInput, setNameInput] = useState('');

  const saveName = () => {
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    localStorage.setItem('chUserName', trimmed);
    setUserName(trimmed);
  };

  if (!userName) {
    return (
      <div style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
      }}>
        <div style={{ background: 'white', borderRadius: 12, padding: 30, width: 320, textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>👋</div>
          <h3 style={{ marginBottom: 8 }}>Welcome to Community Hero!</h3>
          <p style={{ fontSize: 13, color: '#666', marginBottom: 16 }}>
            Enter your name to start reporting issues and earning points.
          </p>
          <input
            value={nameInput}
            onChange={e => setNameInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && saveName()}
            placeholder="Your name"
            style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, marginBottom: 12, boxSizing: 'border-box' }}
          />
          <button
            onClick={saveName}
            style={{ width: '100%', padding: 12, background: '#178FDD', color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <AlertBanner lang={lang} />
      <Navbar activePage={activePage} setActivePage={setActivePage} lang={lang} setLang={setLang} />
      <div className="page-content">
        {activePage === 'home' && <Home setActivePage={setActivePage} />}
        {activePage === 'report' && <ReportIssue userName={userName} />}
        {activePage === 'map' && <LiveMap />}
        {activePage === 'feed' && <Feed />}
        {activePage === 'dashboard' && <Dashboard />}
        {activePage === 'gallery' && <Gallery />}
        {activePage === 'heroes' && <Heroes />}
        {activePage === 'admin' && <AdminPanel />}
      </div>
      <ChatBot />
    </div>
  );
}

export default App;