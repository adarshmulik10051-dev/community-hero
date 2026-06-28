import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, orderBy, query, doc, updateDoc, increment } from 'firebase/firestore';

const sevBadge = { Critical: 'badge-red', High: 'badge-orange', Medium: 'badge-blue', Low: 'badge-green' };
const stBadge = { Open: 'badge-red', 'In Progress': 'badge-orange', Assigned: 'badge-blue', Resolved: 'badge-green', Pending: 'badge-orange' };
const catEmoji = { 'Road Damage': '🕳️', 'Garbage': '🗑️', 'Water Supply': '💧', 'Street Light': '💡', 'Sewage': '⚠️', 'Other': '📌' };

export default function Feed() {
  const [issues, setIssues] = useState([]);
  const [sort, setSort] = useState('Newest');
  const [loading, setLoading] = useState(true);
  const [voted, setVoted] = useState(() => JSON.parse(localStorage.getItem('ch_voted') || '{}'));
  const [confirmed, setConfirmed] = useState(() => JSON.parse(localStorage.getItem('ch_confirmed') || '{}'));
  const [falseRep, setFalseRep] = useState(() => JSON.parse(localStorage.getItem('ch_false') || '{}'));

  useEffect(() => {
    const q = query(collection(db, 'issues'), orderBy('timestamp', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setIssues(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleVote = async (id) => {
    if (voted[id]) return;
    await updateDoc(doc(db, 'issues', id), { votes: increment(1) });
    const updated = { ...voted, [id]: true };
    setVoted(updated);
    localStorage.setItem('ch_voted', JSON.stringify(updated));
  };

  const handleConfirm = async (id) => {
    if (confirmed[id]) return;
    await updateDoc(doc(db, 'issues', id), { confirms: increment(1) });
    const updated = { ...confirmed, [id]: true };
    setConfirmed(updated);
    localStorage.setItem('ch_confirmed', JSON.stringify(updated));
  };

  const handleFalse = async (id) => {
    if (falseRep[id]) return;
    await updateDoc(doc(db, 'issues', id), { falseReports: increment(1) });
    const updated = { ...falseRep, [id]: true };
    setFalseRep(updated);
    localStorage.setItem('ch_false', JSON.stringify(updated));
  };

  const sorted = [...issues].sort((a, b) => {
    if (sort === 'Most Voted') return (b.votes || 0) - (a.votes || 0);
    if (sort === 'Critical First') return a.severity === 'Critical' ? -1 : 1;
    return 0;
  });

  if (loading) return (
    <div style={{ textAlign: 'center', padding: 60 }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>🔄</div>
      <div style={{ color: '#178FDD', fontWeight: 600 }}>Loading real issues from Firebase...</div>
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <h2 style={{ fontSize: 20, flex: 1 }}>📋 Issues Feed
          <span style={{ fontSize: 12, color: '#639922', marginLeft: 8, fontWeight: 600 }}>● Live ({issues.length} issues)</span>
        </h2>
        <select style={{ padding: '6px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 13 }} onChange={e => setSort(e.target.value)}>
          <option>Newest</option><option>Most Voted</option><option>Critical First</option>
        </select>
      </div>

      {sorted.map((iss) => (
        <div key={iss.id} className="card" style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
            <div style={{ width: 72, height: 72, borderRadius: 10, overflow: 'hidden', flexShrink: 0, background: '#f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {iss.imageURL ? (
                <img src={iss.imageURL} alt={iss.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: 32 }}>{catEmoji[iss.category] || '📌'}</span>
              )}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{iss.title}</div>
              <div style={{ fontSize: 12, color: '#888', marginBottom: 6 }}>
                📍 {iss.location} · {iss.timestamp ? new Date(iss.timestamp.seconds * 1000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <span className={`badge ${sevBadge[iss.severity] || 'badge-blue'}`}>{iss.severity}</span>
                <span className={`badge ${stBadge[iss.status] || 'badge-blue'}`}>{iss.status}</span>
                <span className="badge badge-purple">{iss.category}</span>
              </div>
            </div>
          </div>

          {iss.issue && (
            <div style={{ fontSize: 12, color: '#666', marginBottom: 8, background: '#f8f9fa', padding: '6px 10px', borderRadius: 6 }}>
              🤖 AI: {iss.issue} · Dept: {iss.department}
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, borderTop: '1px solid #f0f4f8', paddingTop: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <button onClick={() => handleVote(iss.id)}
              style={{ background: voted[iss.id] ? '#E6F1FB' : 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: voted[iss.id] ? '#178FDD' : '#666', padding: '4px 8px', borderRadius: 6, fontWeight: voted[iss.id] ? 600 : 400 }}>
              👍 {iss.votes || 0} Support
            </button>
            <button onClick={() => handleConfirm(iss.id)}
              style={{ background: confirmed[iss.id] ? '#E6FBE6' : 'none', border: '1px solid #ddd', cursor: 'pointer', fontSize: 13, color: confirmed[iss.id] ? '#22a722' : '#666', padding: '4px 8px', borderRadius: 6 }}>
              ✅ {iss.confirms || 0} Confirm
            </button>
            <button onClick={() => handleFalse(iss.id)}
              style={{ background: falseRep[iss.id] ? '#FBE6E6' : 'none', border: '1px solid #ddd', cursor: 'pointer', fontSize: 13, color: falseRep[iss.id] ? '#e74c3c' : '#666', padding: '4px 8px', borderRadius: 6 }}>
              ❌ False Report
            </button>
            {(iss.confirms || 0) >= 5 && (
              <span style={{ background: '#22a722', color: 'white', fontSize: 11, padding: '3px 8px', borderRadius: 20, fontWeight: 700 }}>
                🏅 Community Verified
              </span>
            )}
            <span style={{ fontSize: 12, color: '#888', padding: '4px 8px' }}>🎯 Priority: {iss.priority}/10</span>
            <span style={{ fontSize: 12, color: '#888', padding: '4px 8px' }}>⏱️ {iss.time}</span>
          </div>
        </div>
      ))}
    </div>
  );
}