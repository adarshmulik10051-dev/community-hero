import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, orderBy, query, doc, updateDoc } from 'firebase/firestore';

export default function AdminPanel() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [pass, setPass] = useState('');
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState(null);

  useEffect(() => {
    if (!loggedIn) return;
    const q = query(collection(db, 'issues'), orderBy('timestamp', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setIssues(data);
      setLoading(false);
    });
    return () => unsub();
  }, [loggedIn]);

  const updateIssue = async (id, field, value) => {
    try {
      await updateDoc(doc(db, 'issues', id), { [field]: value });
    } catch (err) {
      alert('Update failed: ' + err.message);
    }
  };

  const uploadAfterImage = async (issueId, file) => {
    setUploadingId(issueId);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'community_hero');
      const res = await fetch('https://api.cloudinary.com/v1_1/ddbdnciti/image/upload', {
        method: 'POST', body: formData
      });
      const data = await res.json();
      await updateDoc(doc(db, 'issues', issueId), {
        afterImageURL: data.secure_url,
        resolvedAt: new Date().toISOString()
      });
      alert('✅ After image uploaded! Gallery updated!');
    } catch (e) {
      alert('Upload failed: ' + e.message);
    }
    setUploadingId(null);
  };

  if (!loggedIn) return (
    <div style={{ maxWidth: 360, margin: '60px auto', textAlign: 'center' }}>
      <div className="card">
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔐</div>
        <h2 style={{ marginBottom: 20 }}>Admin Login</h2>
        <input
          type="password"
          style={{ width: '100%', padding: '10px 14px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, marginBottom: 12 }}
          placeholder="Enter admin password"
          value={pass}
          onChange={e => setPass(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && (pass === 'admin123' ? setLoggedIn(true) : alert('Wrong password!'))}
        />
        <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 12 }}
          onClick={() => { if (pass === 'admin123') setLoggedIn(true); else alert('Wrong password! Use: admin123'); }}>
          Login to Admin Panel
        </button>
        <div style={{ fontSize: 12, color: '#888', marginTop: 10 }}>Demo password: admin123</div>
      </div>
    </div>
  );

  const counts = {
    Pending: issues.filter(i => i.status === 'Pending').length,
    'In Progress': issues.filter(i => i.status === 'In Progress').length,
    Assigned: issues.filter(i => i.status === 'Assigned').length,
    Resolved: issues.filter(i => i.status === 'Resolved').length,
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: 20 }}>⚙️ Admin Panel
          <span style={{ fontSize: 12, color: '#639922', marginLeft: 8 }}>● Live Firebase ({issues.length} issues)</span>
        </h2>
        <button className="btn-danger" onClick={() => setLoggedIn(false)}>Logout</button>
      </div>

      <div className="grid-4" style={{ marginBottom: 20 }}>
        {[['Pending', counts['Pending'], '#E24B4A'], ['In Progress', counts['In Progress'], '#EF9F27'], ['Assigned', counts['Assigned'], '#178FDD'], ['Resolved', counts['Resolved'], '#639922']].map(([l, v, c]) => (
          <div key={l} className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: c }}>{v}</div>
            <div style={{ fontSize: 12, color: '#666' }}>{l}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>🔄 Loading live issues...</div>
      ) : issues.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>No issues in Firebase.</div>
      ) : (
        issues.map(iss => (
          <div key={iss.id} className="card" style={{ marginBottom: 12, border: iss.status === 'Resolved' ? '2px solid #639922' : '1px solid #eee' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{iss.title}</div>
                <div style={{ fontSize: 12, color: '#888' }}>📍 {iss.location} · 👍 {iss.votes || 0} votes</div>
                {iss.imageURL && (
                  <img src={iss.imageURL} alt="before"
                    style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 6, marginTop: 6, border: '2px solid #E24B4A' }} />
                )}
              </div>
              <span className={`badge ${iss.severity === 'Critical' ? 'badge-red' : iss.severity === 'High' ? 'badge-orange' : 'badge-blue'}`}>
                {iss.severity}
              </span>
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <select
                style={{ padding: '6px 10px', border: '1px solid #ddd', borderRadius: 6, fontSize: 13 }}
                value={iss.status || 'Pending'}
                onChange={e => updateIssue(iss.id, 'status', e.target.value)}>
                <option>Pending</option>
                <option>Assigned</option>
                <option>In Progress</option>
                <option>Resolved</option>
              </select>
              <select
                style={{ padding: '6px 10px', border: '1px solid #ddd', borderRadius: 6, fontSize: 13 }}
                value={iss.department || ''}
                onChange={e => updateIssue(iss.id, 'department', e.target.value)}>
                <option value="">Assign Department</option>
                <option>Road Maintenance</option>
                <option>Solid Waste</option>
                <option>Water Works</option>
                <option>Electrical</option>
                <option>Drainage</option>
              </select>
              <span style={{ fontSize: 11, color: '#639922' }}>✅ Auto-saves to Firebase</span>
            </div>

            {/* After Image Upload - Resolved issues saathi */}
            {iss.status === 'Resolved' && (
              <div style={{ marginTop: 12, padding: 10, background: '#EAF3DE', borderRadius: 8 }}>
                {iss.afterImageURL ? (
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <img src={iss.afterImageURL} alt="after"
                      style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 6, border: '2px solid #639922' }} />
                    <span style={{ fontSize: 12, color: '#639922', fontWeight: 600 }}>✅ After image uploaded - Visible in Gallery!</span>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: 12, color: '#2D5A00', fontWeight: 600, marginBottom: 6 }}>
                      📸 Upload After Image for Gallery
                    </div>
                    <input type="file" accept="image/*" id={`after-${iss.id}`} style={{ display: 'none' }}
                      onChange={e => uploadAfterImage(iss.id, e.target.files[0])} />
                    <label htmlFor={`after-${iss.id}`}
                      style={{ background: '#639922', color: 'white', padding: '6px 14px', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>
                      {uploadingId === iss.id ? '⏳ Uploading...' : '📸 Upload After Image'}
                    </label>
                  </div>
                )}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}