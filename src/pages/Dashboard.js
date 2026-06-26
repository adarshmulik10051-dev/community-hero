import React, { useState, useEffect } from 'react';
import { Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend } from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend);

const GEMINI_API_KEY = 'AQ.Ab8RN6INa3BJzqhPU9lAtAXqGF8spBizHj_o2fzJTBoOKm_uuA';
const getAIInsights = async () => {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: `You are an AI analyst for a Mumbai civic issue platform.
Generate 4 short AI insights based on this data:
- Andheri East: 234 issues (highest)
- Garbage complaints up this week
- Road damage complaints down after Ward A repairs
- Ward B: 89 unresolved issues
- Water complaints spiked near Kurla
- Flood risk high due to blocked drainage

Return ONLY a JSON array with 4 items:
[
  {"type": "warn", "icon": "📈", "text": "insight text here"},
  {"type": "good", "icon": "📉", "text": "insight text here"},
  {"type": "bad", "icon": "⚠️", "text": "insight text here"},
  {"type": "warn", "icon": "💧", "text": "insight text here"}
]
type must be: good, bad, or warn
Keep each insight under 15 words.` }]
        }],
        generationConfig: { temperature: 0.8, maxOutputTokens: 300 }
      })
    }
  );
  const data = await response.json();
  const text = data.candidates[0].content.parts[0].text;
  const clean = text.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
};

export default function Dashboard() {
  const [insights, setInsights] = useState([
    { icon: '📈', text: 'Garbage complaints increased by 32% in Andheri East.', type: 'warn' },
    { icon: '📉', text: 'Road damage complaints down 15% after Ward A repairs.', type: 'good' },
    { icon: '⚠️', text: 'Ward B has highest unresolved issues — 89 pending.', type: 'bad' },
    { icon: '💧', text: 'Water complaints spiked 45% near Kurla this week.', type: 'warn' },
  ]);
  const [aiLoading, setAiLoading] = useState(false);

  const refreshInsights = async () => {
    setAiLoading(true);
    try {
      const newInsights = await getAIInsights();
      setInsights(newInsights);
    } catch (err) {
      console.error('Insights error:', err);
    }
    setAiLoading(false);
  };

  const lineData = {
    labels: ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'],
    datasets: [
      { label: 'Reported', data: [180, 220, 195, 310, 280, 240], borderColor: '#178FDD', tension: 0.4, fill: false },
      { label: 'Resolved', data: [120, 170, 155, 240, 230, 190], borderColor: '#639922', tension: 0.4, fill: false, borderDash: [6, 3] },
    ],
  };

  const doughnutData = {
    labels: ['Road', 'Garbage', 'Water', 'Light', 'Sewage', 'Other'],
    datasets: [{ data: [34, 22, 18, 12, 9, 5], backgroundColor: ['#178FDD', '#639922', '#1D9E75', '#EF9F27', '#E24B4A', '#7F77DD'] }],
  };

  const risks = [
    { label: 'Flood Risk', pct: 82, reason: 'Heavy rain + blocked drainage', color: '#E24B4A' },
    { label: 'Road Damage', pct: 65, reason: 'Multiple cluster complaints', color: '#EF9F27' },
    { label: 'Power Outage', pct: 41, reason: 'Street light failures increasing', color: '#EF9F27' },
    { label: 'Water Crisis', pct: 28, reason: 'Pipe leakages in 3 wards', color: '#639922' },
  ];

  const insightColors = {
    good: { bg: '#EAF3DE', color: '#27500A' },
    bad: { bg: '#FCEBEB', color: '#791F1F' },
    warn: { bg: '#FAEEDA', color: '#633806' }
  };

  return (
    <div>
      <h2 style={{ marginBottom: 20, fontSize: 20 }}>📊 AI Insights Dashboard</h2>

      <div className="grid-3" style={{ marginBottom: 20 }}>
        {[['Total Issues', '1,284', '#178FDD'], ['Resolved', '73%', '#639922'], ['Critical', '47', '#E24B4A']].map(([l, v, c]) => (
          <div key={l} className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: c }}>{v}</div>
            <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>{l}</div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ marginBottom: 20 }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ fontSize: 14 }}>🤖 AI-Generated Insights</h3>
            <button
              onClick={refreshInsights}
              disabled={aiLoading}
              style={{ fontSize: 11, padding: '4px 10px', background: '#178FDD', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}
            >
              {aiLoading ? '⏳ Loading...' : '🔄 Refresh AI'}
            </button>
          </div>
          {insights.map((ins, i) => (
            <div key={i} style={{ ...insightColors[ins.type], borderRadius: 8, padding: '8px 12px', marginBottom: 8, fontSize: 13, display: 'flex', gap: 8 }}>
              <span>{ins.icon}</span><span>{ins.text}</span>
            </div>
          ))}
        </div>

        <div className="card">
          <h3 style={{ fontSize: 14, marginBottom: 12 }}>🎯 Predictive Risk Analysis</h3>
          {risks.map((r, i) => (
            <div key={i} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                <span style={{ fontWeight: 600 }}>{r.label}</span>
                <span style={{ color: r.color, fontWeight: 700 }}>{r.pct}%</span>
              </div>
              <div style={{ background: '#f0f4f8', borderRadius: 4, height: 8, overflow: 'hidden' }}>
                <div style={{ width: `${r.pct}%`, height: '100%', background: r.color, borderRadius: 4 }} />
              </div>
              <div style={{ fontSize: 11, color: '#888', marginTop: 3 }}>{r.reason}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <h3 style={{ fontSize: 14, marginBottom: 12 }}>📈 Monthly Trend</h3>
          <Line data={lineData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
        </div>
        <div className="card">
          <h3 style={{ fontSize: 14, marginBottom: 12 }}>🏷️ Issues by Category</h3>
          <Doughnut data={doughnutData} options={{ responsive: true, plugins: { legend: { position: 'right' } } }} />
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3 style={{ fontSize: 14, marginBottom: 12 }}>📍 Most Affected Areas</h3>
        {[['Andheri East', 234, 100], ['Kurla West', 189, 81], ['Dadar', 156, 67], ['Bandra East', 98, 42], ['Mulund', 72, 31]].map(([area, count, pct]) => (
          <div key={area} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <div style={{ width: 100, fontSize: 13, fontWeight: 500 }}>{area}</div>
            <div style={{ flex: 1, background: '#f0f4f8', borderRadius: 4, height: 8, overflow: 'hidden' }}>
              <div style={{ width: `${pct}%`, height: '100%', background: '#178FDD', borderRadius: 4 }} />
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#178FDD', width: 40 }}>{count}</div>
          </div>
        ))}
      </div>
    </div>
  );
}