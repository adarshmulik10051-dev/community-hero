import React, { useState } from 'react';

const issues = [
  { title: 'Large pothole near Andheri Station', cat: 'Road', loc: 'Andheri West', sev: 'Critical', status: 'Open', votes: 142, img: '🕳️', time: '2h ago', comments: 18 },
  { title: 'Garbage pile near Kurla market', cat: 'Garbage', loc: 'Kurla', sev: 'High', status: 'In Progress', votes: 98, img: '🗑️', time: '4h ago', comments: 11 },
  { title: 'Water leakage — Bandra road', cat: 'Water', loc: 'Bandra East', sev: 'High', status: 'Open', votes: 76, img: '💧', time: '6h ago', comments: 7 },
  { title: 'Street light out for 3 days', cat: 'Light', loc: 'Dadar', sev: 'Medium', status: 'Assigned', votes: 54, img: '💡', time: '1d ago', comments: 5 },
  { title: 'Sewage overflow near school', cat: 'Sewage', loc: 'Mulund', sev: 'Critical', status: 'Open', votes: 189, img: '⚠️', time: '30m ago', comments: 24 },
];

const sevBadge = { Critical: 'badge-red', High: 'badge-orange', Medium: 'badge-blue', Low: 'badge-green' };
const stBadge = { Open: 'badge-red', 'In Progress': 'badge-orange', Assigned: 'badge-blue', Resolved: 'badge-green' };

export default function Feed() {
  const [sort, setSort] = useState('Newest');
  const [voted, setVoted] = useState({});

  const sorted = [...issues].sort((a, b) => {
    if (sort === 'Most Voted') return b.votes - a.votes;
    if (sort === 'Critical First') return (a.sev === 'Critical' ? -1 : 1);
    return 0;
  });

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <h2 style={{ fontSize: 20, flex: 1 }}>📋 Issues Feed</h2>
        <select style={{ padding: '6px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 13 }} onChange={e => setSort(e.target.value)}>
          <option>Newest</option><option>Most Voted</option><option>Critical First</option>
        </select>
      </div>
      {sorted.map((iss, i) => (
        <div key={i} className="card">
          <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
            <div style={{ width: 64, height: 64, borderRadius: 10, background: '#f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, flexShrink: 0 }}>{iss.img}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{iss.title}</div>
              <div style={{ fontSize: 12, color: '#888', marginBottom: 6 }}>📍 {iss.loc} · {iss.time}</div>
              <div style={{ display: 'flex', gap: 6 }}>
                <span className={`badge ${sevBadge[iss.sev]}`}>{iss.sev}</span>
                <span className={`badge ${stBadge[iss.status]}`}>{iss.status}</span>
                <span className="badge badge-purple">{iss.cat}</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, borderTop: '1px solid #f0f4f8', paddingTop: 10 }}>
            <button onClick={() => setVoted(v => ({ ...v, [i]: !v[i] }))} style={{ background: voted[i] ? '#E6F1FB' : 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: voted[i] ? '#178FDD' : '#666', padding: '4px 8px', borderRadius: 6, fontWeight: voted[i] ? 600 : 400 }}>
              👍 {iss.votes + (voted[i] ? 1 : 0)} Support
            </button>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#666', padding: '4px 8px' }}>💬 {iss.comments} Comments</button>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#666', padding: '4px 8px' }}>🔗 Share</button>
          </div>
        </div>
      ))}
    </div>
  );
}