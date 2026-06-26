import React, { useState, useEffect } from 'react';
import './AlertBanner.css';

const alerts = {
  en: ['🔴 Flood Alert — Andheri West drainage overflow. Avoid low-lying areas.', '🔥 Fire Alert — Dharavi area. Stay away.', '🚧 Road Accident — Western Express Highway. Avoid route.'],
  hi: ['🔴 बाढ़ चेतावनी — अंधेरी वेस्ट में नाला ओवरफ्लो।', '🔥 आग की चेतावनी — धारावी क्षेत्र।', '🚧 सड़क दुर्घटना — वेस्टर्न एक्सप्रेस हाईवे।'],
  mr: ['🔴 पूर सूचना — अंधेरी पश्चिम नाला तुंबला.', '🔥 आग सूचना — धारावी परिसर.', '🚧 अपघात — वेस्टर्न एक्सप्रेस हायवे.'],
};

export default function AlertBanner({ lang }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setIdx(i => (i + 1) % 3), 4000);
    return () => clearInterval(iv);
  }, []);
  return (
    <div className="alert-banner">
      ⚠️ {alerts[lang][idx]}
    </div>
  );
}