import React from 'react';

const heroes = [
  { name: 'Rahul Sharma', pts: 1240, badge: '🥇 Gold Hero', avatar: 'RS', reports: 62, resolved: 41, bg: '#FAEEDA', color: '#633806' },
  { name: 'Priya Nair', pts: 980, badge: '🥇 Gold Hero', avatar: 'PN', reports: 49, resolved: 33, bg: '#E1F5EE', color: '#085041' },
  { name: 'Amit Desai', pts: 670, badge: '🥇 Gold Hero', avatar: 'AD', reports: 34, resolved: 22, bg: '#EEEDFE', color: '#3C3489' },
  { name: 'Sneha Patil', pts: 420, badge: '🥈 Silver Hero', avatar: 'SP', reports: 21, resolved: 14, bg: '#E6F1FB', color: '#0C447C' },
  { name: 'Rohan Mehta', pts: 290, badge: '🥈 Silver Hero', avatar: 'RM', reports: 15, resolved: 9, bg: '#FCEBEB', color: '#791F1F' },
  { name: 'Neha Kulkarni', pts: 140, badge: '🥉 Bronze Hero', avatar: 'NK', reports: 8, resolved: 4, bg: '#f0f4f8', color: '#444' },
];

export default function Heroes() {
  return (
    <div>
      <h2 style={{ marginBottom: 6, fontSize: 20 }}>🏆 Community Heroes</h2>
      <p style={{ fontSize: 13, color: '#888', marginBottom: 16 }}>Report Issue = 10 pts · Verified = 20 pts · Resolved = 30 pts</p>

      <div className="grid-3" style={{ marginBottom: 20 }}>
        {[['🥉 Bronze', '10–99 pts', '#854F0B'], ['🥈 Silver', '100–499 pts', '#5F5E5A'], ['🥇 Gold', '500+ pts', '#BA7517']].map(([title, sub, color]) => (
          <div key={title} className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color }}>{title}</div>
            <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>{sub}</div>
          </div>
        ))}
      </div>

      {heroes.map((h, i) => (
        <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: ['#BA7517', '#BA7517', '#BA7517', '#5F5E5A', '#5F5E5A', '#854F0B'][i], width: 32 }}>#{i + 1}</div>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: h.bg, color: h.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{h.avatar}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 15 }}>{h.name}</div>
            <div style={{ fontSize: 12, color: '#888' }}>{h.badge} · {h.reports} reports · {h.resolved} resolved</div>
          </div>
          <div style={{ fontWeight: 700, fontSize: 16, color: '#178FDD' }}>{h.pts.toLocaleString()} pts</div>
        </div>
      ))}
    </div>
  );
}