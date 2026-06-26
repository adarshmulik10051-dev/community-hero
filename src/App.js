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

  return (
    <div className="app">
      <AlertBanner lang={lang} />
      <Navbar activePage={activePage} setActivePage={setActivePage} lang={lang} setLang={setLang} />
      <div className="page-content">
        {activePage === 'home' && <Home setActivePage={setActivePage} />}
        {activePage === 'report' && <ReportIssue />}
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