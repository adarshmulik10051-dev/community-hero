import React, { useEffect, useRef, useState } from 'react';

const issues = [
  { lat: 19.1136, lng: 72.8697, title: 'Large Pothole', loc: 'Andheri West', sev: 'Critical', status: 'Open', votes: 142, cat: 'road' },
  { lat: 19.0728, lng: 72.8826, title: 'Garbage Dump', loc: 'Kurla', sev: 'High', status: 'In Progress', votes: 98, cat: 'garbage' },
  { lat: 19.0596, lng: 72.8295, title: 'Water Leakage', loc: 'Bandra East', sev: 'High', status: 'Open', votes: 76, cat: 'water' },
  { lat: 19.0210, lng: 72.8449, title: 'Street Light Out', loc: 'Dadar', sev: 'Medium', status: 'Assigned', votes: 54, cat: 'light' },
  { lat: 19.1741, lng: 72.9560, title: 'Sewage Overflow', loc: 'Mulund', sev: 'Critical', status: 'Open', votes: 189, cat: 'sewage' },
  { lat: 19.1197, lng: 72.9070, title: 'Road Crack', loc: 'Ghatkopar', sev: 'High', status: 'In Progress', votes: 63, cat: 'road' },
  { lat: 19.0330, lng: 72.8654, title: 'Illegal Dumping', loc: 'Sion', sev: 'Medium', status: 'Open', votes: 41, cat: 'garbage' },
  { lat: 19.0883, lng: 72.8317, title: 'Broken Pipeline', loc: 'Santacruz', sev: 'Critical', status: 'Open', votes: 112, cat: 'water' },
];

const sevColor = { Critical: '#E24B4A', High: '#EF9F27', Medium: '#F0C300', Low: '#639922' };

export default function LiveMap() {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (mapInstance.current) return;
    const L = window.L;
    if (!L) return;
    mapInstance.current = L.map(mapRef.current).setView([19.076, 72.877], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(mapInstance.current);
    issues.forEach(issue => {
      const color = sevColor[issue.sev];
      const icon = L.divIcon({ html: `<div style="background:${color};width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`, iconSize: [14, 14], className: '' });
      L.marker([issue.lat, issue.lng], { icon }).addTo(mapInstance.current)
        .bindPopup(`<b>${issue.title}</b><br>📍 ${issue.loc}<br>🔴 ${issue.sev}<br>✅ ${issue.status}<br>👍 ${issue.votes} votes`);
    });
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontWeight: 600, fontSize: 16 }}>🗺️ Live Issue Map — Mumbai</span>
        <span style={{ marginLeft: 'auto', fontSize: 12, color: '#639922', fontWeight: 600 }}>● Live</span>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        {['all', 'road', 'garbage', 'water', 'light', 'sewage'].map(cat => (
          <button key={cat} onClick={() => setFilter(cat)} style={{ padding: '5px 14px', borderRadius: 20, border: '1px solid #ddd', background: filter === cat ? '#178FDD' : 'white', color: filter === cat ? 'white' : '#666', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
        {Object.entries(sevColor).map(([sev, color]) => (
          <div key={sev} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12 }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: color }}></div> {sev}
          </div>
        ))}
      </div>
      <div ref={mapRef} style={{ height: '500px', borderRadius: 12, overflow: 'hidden', border: '1px solid #ddd' }} />
      <p style={{ fontSize: 11, color: '#888', marginTop: 8 }}>Click any marker to see issue details.</p>
    </div>
  );
}