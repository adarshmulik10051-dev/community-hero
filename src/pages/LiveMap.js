import React, { useEffect, useRef, useState } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';

const sevColor = { Critical: '#E24B4A', High: '#EF9F27', Medium: '#F0C300', Low: '#639922' };

export default function LiveMap() {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);
  const [issues, setIssues] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'issues'), (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setIssues(data);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (mapInstance.current) return;
    const L = window.L;
    if (!L) return;
    mapInstance.current = L.map(mapRef.current).setView([19.076, 72.877], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(mapInstance.current);
  }, []);

  useEffect(() => {
    const L = window.L;
    if (!L || !mapInstance.current) return;

    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    const filtered = filter === 'all' ? issues : issues.filter(i => i.category?.toLowerCase().includes(filter));

    filtered.forEach(issue => {
      if (!issue.lat || !issue.lng) return;
      const color = sevColor[issue.severity] || '#178FDD';
      const icon = L.divIcon({
        html: `<div style="background:${color};width:16px;height:16px;border-radius:50%;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.4);"></div>`,
        iconSize: [16, 16],
        className: ''
      });
      const marker = L.marker([issue.lat, issue.lng], { icon })
        .addTo(mapInstance.current)
        .bindPopup(`<b>${issue.title}</b><br>📍 ${issue.location}<br>🔴 ${issue.severity}<br>✅ ${issue.status}<br>🤖 ${issue.issue}<br>👍 ${issue.votes || 0} votes`);
      markersRef.current.push(marker);
    });
  }, [issues, filter]);

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontWeight: 600, fontSize: 16 }}>🗺️ Live Issue Map — Mumbai</span>
        <span style={{ marginLeft: 'auto', fontSize: 12, color: '#639922', fontWeight: 600 }}>● Live ({issues.length} real issues)</span>
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
      <p style={{ fontSize: 11, color: '#888', marginTop: 8 }}>Real-time data from Firebase Firestore 🔥</p>
    </div>
  );
}