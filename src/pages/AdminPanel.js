import React, { useState } from 'react';

const initIssues = [
  { id: 1, title: 'Large pothole near Andheri Station', loc: 'Andheri West', sev: 'Critical', status: 'Open', dept: '', votes: 142 },
  { id: 2, title: 'Garbage pile near Kurla market', loc: 'Kurla', sev: 'High', status: 'Open', dept: '', votes: 98 },
  { id: 3, title: 'Water leakage — Bandra road', loc: 'Bandra East', sev: 'High', status: 'Open', dept: '', votes: 76 },
  { id: 4, title: 'Street light out for 3 days', loc: 'Dadar', sev: 'Medium', status: 'Assigned', dept: 'Electrical', votes: 54 },
  { id: 5, title: 'Sewage overflow near school', loc: 'Mulund', sev: 'Critical', status: 'Open', dept: '', votes: 189 },
];

export default function AdminPanel() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [pass, setPass] = useState('');
  const [issues, setIssues] = useState(initIssues);

  const updateIssue = (id, field, value) => {
    setIssues(issues.map(iss => iss.id === id ? { ...iss, [field]: value } : iss));
  };

  if (!loggedIn) return (
    <div style={{ maxWidth: 360, margin: '60px auto', textAlign: 'center' }}>
      <div className="card">
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔐</div>
        <h2 style={{ marginBottom: 20 }}>Admin Login</h2>
        <input type="password" style={{ width: '100%', padding: '10px 14px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, marginBottom: 12 }} placeholder="Enter admin password" value={pass} onChange={e => setPass(e.target.value)} />
        <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 12 }} onClick={() => { if (pass === 'admin123') setLoggedIn(true); else alert('Wrong password! Use: admin123'); }}>
          Login to Admin Panel
        </button>
        <div style={{ fontSize: 12, color: '#888', marginTop: 10 }}>Demo password: admin123</div>
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: 20 }}>⚙️ Admin Panel</h2>
        <button className="btn-danger" onClick={() => setLoggedIn(false)}>Logout</button>
      </div>
      <div className="grid-4" style={{ marginBottom: 20 }}>
        {[['Pending', issues.filter(i => i.status === 'Open').length, '#E24B4A'], ['In Progress', issues.filter(i => i.status === 'In Progress').length, '#EF9F27'], ['Assigned', issues.filter(i => i.status === 'Assigned').length, '#178FDD'], ['Resolved', issues.filter(i => i.status === 'Resolved').length, '#639922']].map(([l, v, c]) => (
          <div key={l} className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: c }}>{v}</div>
            <div style={{ fontSize: 12, color: '#666' }}>{l}</div>
          </div>
        ))}
      </div>
      {issues.map(iss => (
        <div key={iss.id} className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{iss.title}</div>
              <div style={{ fontSize: 12, color: '#888' }}>📍 {iss.loc} · 👍 {iss.votes} votes</div>
            </div>
            <span className={`badge ${iss.sev === 'Critical' ? 'badge-red' : iss.sev === 'High' ? 'badge-orange' : 'badge-blue'}`}>{iss.sev}</span>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <select style={{ padding: '6px 10px', border: '1px solid #ddd', borderRadius: 6, fontSize: 13 }} value={iss.status} onChange={e => updateIssue(iss.id, 'status', e.target.value)}>
              <option>Open</option><option>Assigned</option><option>In Progress</option><option>Resolved</option>
            </select>
            <select style={{ padding: '6px 10px', border: '1px solid #ddd', borderRadius: 6, fontSize: 13 }} value={iss.dept} onChange={e => updateIssue(iss.id, 'dept', e.target.value)}>
              <option value="">Assign Department</option>
              <option>Road Maintenance</option><option>Solid Waste</option><option>Water Works</option><option>Electrical</option><option>Drainage</option>
            </select>
            <button className="btn-primary" style={{ fontSize: 12, padding: '6px 14px' }} onClick={() => alert(`Issue #${iss.id} updated successfully!`)}>✅ Update</button>
            <button style={{ background: '#FAEEDA', color: '#854F0B', border: 'none', padding: '6px 14px', borderRadius: 6, fontSize: 12, cursor: 'pointer' }} onClick={() => alert('Alert sent to citizens!')}>📢 Send Alert</button>
          </div>
        </div>
      ))}
    </div>
  );
}