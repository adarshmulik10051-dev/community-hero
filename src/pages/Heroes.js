import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';

const getBadge = (pts) => {
  if (pts >= 500) return '🥇 Gold Hero';
  if (pts >= 100) return '🥈 Silver Hero';
  if (pts >= 10) return '🥉 Bronze Hero';
  return '🌱 Newcomer';
};

const avatarColors = [
  { bg: '#FAEEDA', color: '#633806' },
  { bg: '#E1F5EE', color: '#085041' },
  { bg: '#EEEDFE', color: '#3C3489' },
  { bg: '#E6F1FB', color: '#0C447C' },
  { bg: '#FCEBEB', color: '#791F1F' },
  { bg: '#f0f4f8', color: '#444' },
];

const rankColor = ['#BA7517', '#BA7517', '#BA7517', '#5F5E5A', '#5F5E5A', '#854F0B'];

export default function Heroes() {
  const [heroes, setHeroes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'issues'), (snap) => {
      const issues = snap.docs.map(d => ({ id: d.id, ...d.data() }));

      // Group by location - each unique report = points
      const userMap = {};
      issues.forEach(issue => {
        const key = issue.location || 'Unknown';
        if (!userMap[key]) {
          userMap[key] = { location: key, reports: 0, resolved: 0, pts: 0 };
        }
        userMap[key].reports += 1;
        userMap[key].pts += 10;
        if (issue.status === 'Resolved') {
          userMap[key].resolved += 1;
          userMap[key].pts += 30;
        }
        if (issue.priority >= 8) userMap[key].pts += 10;
      });

      const sorted = Object.values(userMap).sort((a, b) => b.pts - a.pts);
      setHeroes(sorted);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) return (
    <div style={{ textAlign: 'center', padding: 60 }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>🏆</div>
      <div style={{ color: '#178FDD', fontWeight: 600 }}>Loading real leaderboard...</div>
    </div>
  );

  return (
    <div>
      <h2 style={{ marginBottom: 6, fontSize: 20 }}>🏆 Community Heroes</h2>
      <p style={{ fontSize: 13, color: '#888', marginBottom: 16 }}>Report Issue = 10 pts · High Priority = +10 pts · Resolved = +30 pts</p>

      <div className="grid-3" style={{ marginBottom: 20 }}>
        {[['🥉 Bronze', '10–99 pts', '#854F0B'], ['🥈 Silver', '100–499 pts', '#5F5E5A'], ['🥇 Gold', '500+ pts', '#BA7517']].map(([title, sub, color]) => (
          <div key={title} className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color }}>{title}</div>
            <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>{sub}</div>
          </div>
        ))}
      </div>

      {heroes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>
          <div style={{ fontSize: 40 }}>📭</div>
          <div>No heroes yet. Report issues to earn points!</div>
        </div>
      ) : (
        heroes.map((h, i) => {
          const initials = h.location.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
          const colorSet = avatarColors[i % avatarColors.length];
          return (
            <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: rankColor[i] || '#444', width: 32 }}>#{i + 1}</div>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: colorSet.bg, color: colorSet.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                {initials}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{h.location}</div>
                <div style={{ fontSize: 12, color: '#888' }}>{getBadge(h.pts)} · {h.reports} reports · {h.resolved} resolved</div>
              </div>
              <div style={{ fontWeight: 700, fontSize: 16, color: '#178FDD' }}>{h.pts.toLocaleString()} pts</div>
            </div>
          );
        })
      )}
    </div>
  );
}