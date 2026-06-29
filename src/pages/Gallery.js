import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';

const demoResolved = [
  {
    title: 'Pothole — SV Road, Andheri',
    before: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSb0R3ZfYvLzXb75Ug8PzXClRyCLvyilEkEyullqwMtVw&s=10',
    after: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT00k1QBIFFOWooDaU8jZtb-Q1-Lb-0bK43xV31ge5XEg&s=10',
    reported: '12 Jan', resolved: '14 Jan', dept: 'Road Maintenance', days: 2
  },
  {
    title: 'Garbage dump — Kurla Station',
    before: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT_KvJ1PVe7LvMct57pwJQZV6GWtp8fEOq5rvezLKBA_FOz-luPV8FP-38&s=10',
    after: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSY9EtbBko4JVxdrKOix4vC8fEAd7bZpFhTrKiPkqm5PQ&s=10',
    reported: '8 Jan', resolved: '10 Jan', dept: 'Solid Waste Dept.', days: 2
  },
  {
    title: 'Street light failure — Dadar',
    before: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQqCcdwNgwmwVSptHwPJTCKIBKfjyFZMroxF2_CjQUQkrBgqLjuMhgj_OI&s=10',
    after: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQivv_LfshjqFoILiZj1PzD2CSbz1tBu9Gfwp-XQgSw3vvdBHVdcgZsQm0&s=10',
    reported: '5 Jan', resolved: '7 Jan', dept: 'Electrical Dept.', days: 2
  },
];

const steps = ['Reported', 'Assigned', 'In Progress', 'Resolved'];

export default function Gallery() {
  const [realResolved, setRealResolved] = useState([]);

  useEffect(() => {
    const q = query(collection(db, 'issues'), where('status', '==', 'Resolved'));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(i => i.imageURL && i.afterImageURL);
      setRealResolved(data);
    });
    return () => unsub();
  }, []);

  const GalleryCard = ({ title, before, after, dept, reported, resolved, days, isReal }) => (
    <div className="card" style={{ marginBottom: 16, border: isReal ? '2px solid #639922' : '1px solid #eee' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: 15 }}>
            {isReal && <span style={{ background: '#639922', color: 'white', fontSize: 10, padding: '2px 6px', borderRadius: 10, marginRight: 6 }}>🔴 LIVE</span>}
            {title}
          </div>
          <div style={{ fontSize: 12, color: '#888' }}>
            {reported && `Reported ${reported} · `}{resolved && `Resolved ${resolved} · `}{dept}{days && ` · ⏱️ ${days} days`}
          </div>
        </div>
        <span className="badge badge-green">✅ Resolved</span>
      </div>

      <div className="grid-2" style={{ gap: 12, marginBottom: 16 }}>
        {[
          { label: 'Before', url: before, bg: '#FAEEDA', border: '#E24B4A' },
          { label: 'After', url: after, bg: '#EAF3DE', border: '#639922' },
        ].map(({ label, url, bg, border }) => (
          <div key={label} style={{ textAlign: 'center' }}>
            <div style={{ border: `2px solid ${border}`, borderRadius: 10, overflow: 'hidden', marginBottom: 6 }}>
              <img src={url} alt={label}
                style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }}
                onError={e => { e.target.style.background = bg; e.target.style.height = '160px'; }}
              />
            </div>
            <div style={{
              fontSize: 12, fontWeight: 700,
              color: label === 'Before' ? '#E24B4A' : '#639922',
              background: bg, padding: '4px 12px', borderRadius: 20, display: 'inline-block'
            }}>
              {label === 'Before' ? '🔴 Before' : '🟢 After'}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center' }}>
        {steps.map((step, si) => (
          <React.Fragment key={step}>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: '#639922', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, margin: '0 auto 4px', fontWeight: 700
              }}>✓</div>
              <div style={{ fontSize: 10, color: '#639922', fontWeight: 600 }}>{step}</div>
            </div>
            {si < steps.length - 1 && (
              <div style={{ flex: 1, height: 3, background: '#639922', marginBottom: 18 }} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  return (
    <div>
      <h2 style={{ marginBottom: 6, fontSize: 20 }}>🖼️ Before / After Resolution Gallery</h2>
      <p style={{ fontSize: 13, color: '#888', marginBottom: 20 }}>
        Proof of real civic impact — every resolved issue documented.
      </p>

      {/* Real Firebase resolved issues */}
      {realResolved.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 14, color: '#639922', marginBottom: 12 }}>🔴 Live Resolved Issues</h3>
          {realResolved.map(iss => (
            <GalleryCard
              key={iss.id}
              title={iss.title}
              before={iss.imageURL}
              after={iss.afterImageURL}
              dept={iss.department}
              reported={iss.timestamp ? new Date(iss.timestamp.seconds * 1000).toLocaleDateString() : ''}
              resolved={iss.resolvedAt ? new Date(iss.resolvedAt).toLocaleDateString() : ''}
              isReal={true}
            />
          ))}
        </div>
      )}

      {/* Demo resolved issues */}
      <h3 style={{ fontSize: 14, color: '#888', marginBottom: 12 }}>📋 Sample Resolved Issues</h3>
      {demoResolved.map((item, i) => (
        <GalleryCard
          key={i}
          title={item.title}
          before={item.before}
          after={item.after}
          dept={item.dept}
          reported={item.reported}
          resolved={item.resolved}
          days={item.days}
          isReal={false}
        />
      ))}
    </div>
  );
}