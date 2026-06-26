import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const colors = ['#178FDD', '#639922', '#EF9F27', '#E24B4A', '#1D9E75', '#7F77DD'];
const labels = ['Total Issues', 'Resolved', 'In Progress', 'Critical', 'Pending', 'Open'];

export default function Home({ setActivePage }) {
  const [stats, setStats] = useState([0, 0, 0, 0, 0, 0]);
  const [weekData, setWeekData] = useState([0,0,0,0,0,0,0]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'issues'), (snap) => {
      const issues = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const total = issues.length;
      const resolved = issues.filter(i => i.status === 'Resolved').length;
      const inProgress = issues.filter(i => i.status === 'In Progress').length;
      const critical = issues.filter(i => i.severity === 'Critical').length;
      const pending = issues.filter(i => i.status === 'Pending').length;
      const open = issues.filter(i => i.status === 'Open').length;
      setStats([total, resolved, inProgress, critical, pending, open]);

      // Weekly trend - last 7 days
      const days = [0,0,0,0,0,0,0];
      issues.forEach(issue => {
        if (issue.timestamp) {
          const diff = Math.floor((Date.now() - issue.timestamp.seconds * 1000) / (1000 * 60 * 60 * 24));
          if (diff >= 0 && diff < 7) days[6 - diff]++;
        }
      });
      setWeekData(days);
    });
    return () => unsub();
  }, []);

  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      { label: 'Reported', data: weekData, backgroundColor: '#178FDD', borderRadius: 6 },
    ],
  };

  return (
    <div>
      <div style={{ background: 'linear-gradient(135deg, #0C5A9C, #178FDD)', borderRadius: 16, padding: '40px 32px', color: 'white', marginBottom: 24, textAlign: 'center' }}>
        <div style={{ fontSize: 13, letterSpacing: '0.1em', opacity: 0.8, marginBottom: 8 }}>AI-POWERED CIVIC INTELLIGENCE PLATFORM</div>
        <h1 style={{ fontSize: 36, fontWeight: 700, marginBottom: 10 }}>Community Hero</h1>
        <p style={{ fontSize: 16, opacity: 0.9, marginBottom: 24 }}>Report issues. Track resolutions. Improve your city.</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button className="btn-primary" style={{ background: 'white', color: '#0C5A9C', fontSize: 15 }} onClick={() => setActivePage('report')}>📝 Report Issue</button>
          <button className="btn-primary" style={{ background: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.5)', fontSize: 15 }} onClick={() => setActivePage('map')}>🗺️ Explore Live Map</button>
        </div>
      </div>

      <div className="grid-6" style={{ marginBottom: 24 }}>
        {labels.map((label, i) => (
          <div key={i} className="card" style={{ textAlign: 'center', padding: '16px 8px' }}>
            <div style={{ fontSize: 26, fontWeight: 700, color: colors[i] }}>{stats[i].toLocaleString()}</div>
            <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>{label}</div>
            <div style={{ fontSize: 9, color: '#aaa', marginTop: 2 }}>🔥 Live</div>
          </div>
        ))}
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 16, fontSize: 15 }}>📈 Weekly Issue Trend (Real)</h3>
        <Bar data={chartData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} height={80} />
      </div>

      <div className="grid-4" style={{ marginTop: 16 }}>
        {[
          { icon: '🤖', title: 'AI Insights', sub: 'Predictive analytics', page: 'dashboard' },
          { icon: '🖼️', title: 'Before/After', sub: 'Resolution proof', page: 'gallery' },
          { icon: '🏆', title: 'Leaderboard', sub: 'Top contributors', page: 'heroes' },
          { icon: '⚙️', title: 'Admin Panel', sub: 'Manage issues', page: 'admin' },
        ].map((item, i) => (
          <div key={i} className="card" style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => setActivePage(item.page)}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>{item.icon}</div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{item.title}</div>
            <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>{item.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}