import React from 'react';
import './Navbar.css';

const labels = {
  en: { home:'Home', report:'Report', map:'Live Map', feed:'Feed', dashboard:'Dashboard', gallery:'Gallery', heroes:'Heroes', admin:'Admin' },
  hi: { home:'होम', report:'रिपोर्ट', map:'नक्शा', feed:'फीड', dashboard:'डैशबोर्ड', gallery:'गैलरी', heroes:'हीरोज', admin:'एडमिन' },
  mr: { home:'मुख्य', report:'तक्रार', map:'नकाशा', feed:'फीड', dashboard:'डॅशबोर्ड', gallery:'गॅलरी', heroes:'हीरोज', admin:'एडमिन' },
};

export default function Navbar({ activePage, setActivePage, lang, setLang }) {
  const L = labels[lang];
  const tabs = ['home','report','map','feed','dashboard','gallery','heroes','admin'];
  const icons = { home:'🏠', report:'📝', map:'🗺️', feed:'📋', dashboard:'📊', gallery:'🖼️', heroes:'🏆', admin:'⚙️' };

  return (
    <nav className="navbar">
      <div className="nav-brand">🛡️ Community Hero</div>
      <div className="nav-tabs">
        {tabs.map(tab => (
          <button key={tab} className={`nav-tab ${activePage === tab ? 'active' : ''}`} onClick={() => setActivePage(tab)}>
            {icons[tab]} {L[tab]}
          </button>
        ))}
      </div>
      <div className="lang-switch">
        {['en','hi','mr'].map(l => (
          <button key={l} className={`lang-btn ${lang === l ? 'active' : ''}`} onClick={() => setLang(l)}>
            {l === 'en' ? 'EN' : l === 'hi' ? 'हि' : 'म'}
          </button>
        ))}
      </div>
    </nav>
  );
}