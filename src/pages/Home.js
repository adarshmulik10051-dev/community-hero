import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const targets = [1284, 939, 187, 47, 3842, 358];
const labels = ['Total Issues', 'Resolved', 'In Progress', 'Critical', 'Citizens', 'Open'];
const colors = ['#178FDD', '#639922', '#EF9F27', '#E24B4A', '#1D9E75', '#7F77DD'];

export default function Home({ setActivePage }) {
  const [counts, setCounts] = useState([0, 0, 0, 0, 0, 0]);

  useEffect(() => {
    const ivs = targets.map((target, i) => {
      const step = Math.ceil(target / 50);
      return setInterval(() => {
        setCounts(prev => {
          const next = [...prev];
          next[i] = Math.min(next[i] + step, target);
          return next;
        });
      }, 30);
    });
    return () => ivs.forEach(clearInterval);
  }, []);

  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      { label: 'Reported', data: [34, 52, 41, 67, 48, 39, 28], backgroundColor: '#178FDD', borderRadius: 6 },
      { label: 'Resolved', data: [20, 38, 35, 50, 41, 32, 22], backgroundColor: '#639922', borderRadius: 6 },
    ],
  };

  return (
    <div>
      {/* HERO */}
      <div style={{ background: 'linear-gradient(135deg, #0C5A9C, #178FDD)', borderRadius: 16, padding: '40px 32px', color: 'white', marginBottom: 24, textAlign: 'center' }}>
        <div style={{ fontSize: 13, letterSpacing: '0.1em', opacity: 0.8, marginBottom: 8 }}>AI-POWERED CIVIC INTELLIGENCE PLATFORM</div>
        <h1 style={{ fontSize: 36, fontWeight: 700, marginBottom: 10 }}>Community Hero</h1>
        <p style={{ fontSize: 16, opacity: 0.9, marginBottom: 24 }}>Report issues. Track resolutions. Improve your city.</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button className="btn-primary" style={{ background: 'white', color: '#0C5A9C', fontSize: 15 }} onClick={() => setActivePage('report')}>📝 Report Issue</button>
          <button className="btn-primary" style={{ background: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.5)', fontSize: 15 }} onClick={() => setActivePage('map')}>🗺️ Explore Live Map</button>
        </div>
      </div>

      {/* STATS */}
      <div className="grid-6" style={{ marginBottom: 24 }}>
        {targets.map((_, i) => (
          <div key={i} className="card" style={{ textAlign: 'center', padding: '16px 8px' }}>
            <div style={{ fontSize: 26, fontWeight: 700, color: colors[i] }}>{counts[i].toLocaleString()}</div>
            <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>{labels[i]}</div>
          </div>
        ))}
      </div>

      {/* CHART */}
      <div className="card">
        <h3 style={{ marginBottom: 16, fontSize: 15 }}>📈 Weekly Issue Trend</h3>
        <Bar data={chartData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} height={80} />
      </div>

      {/* QUICK LINKS */}
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