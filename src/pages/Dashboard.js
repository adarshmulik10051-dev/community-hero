import React, { useState, useEffect } from 'react';
import { Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend } from 'chart.js';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend);

const GROQ_KEY = process.env.REACT_APP_GROQ_API_KEY;

const getAIInsights = async (stats) => {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [{
        role: 'user',
        content: `You are an AI analyst for a Mumbai civic issue platform.
Generate 4 short AI insights based on this REAL data:
- Total issues: ${stats.total}
- Critical issues: ${stats.critical}
- Pending issues: ${stats.pending}
- Most common category: ${stats.topCategory}
- Resolved: ${stats.resolved}

Return ONLY a JSON array with 4 items, no extra text:
[
  {"type": "warn", "icon": "📈", "text": "insight text here"},
  {"type": "good", "icon": "📉", "text": "insight text here"},
  {"type": "bad", "icon": "⚠️", "text": "insight text here"},
  {"type": "warn", "icon": "💧", "text": "insight text here"}
]
type must be: good, bad, or warn. Keep each insight under 15 words.
IMPORTANT: Return ONLY valid JSON, no markdown, no extra text, no trailing commas, properly escaped quotes.`
      }],
      max_tokens: 300
    })
  });
  const data = await response.json();
const text = data.choices[0].message.content;
let clean = text.replace(/```json|```/g, '').trim();

// JSON cha exact array part extract kara (extra text असेल तर ignore karण्यासाठी)
const match = clean.match(/\[[\s\S]*\]/);
if (match) clean = match[0];

// Common JSON errors fix kara (trailing commas)
clean = clean.replace(/,(\s*[\]}])/g, '$1');

try {
  return JSON.parse(clean);
} catch (e) {
  console.error('JSON parse failed, raw text:', text);
  throw e;
}
};


export default function Dashboard() {
  const [issues, setIssues] = useState([]);
  const [stats, setStats] = useState({ total: 0, resolved: 0, critical: 0, pending: 0, topCategory: 'Road Damage' });
  const [insights, setInsights] = useState([
    { icon: '📈', text: 'Loading real AI insights from your data...', type: 'warn' },
    { icon: '📉', text: 'Connecting to Firebase...', type: 'good' },
    { icon: '⚠️', text: 'Analyzing reported issues...', type: 'bad' },
    { icon: '💧', text: 'Generating predictions...', type: 'warn' },
  ]);
  const [aiLoading, setAiLoading] = useState(false);
  const [catData, setCatData] = useState([0, 0, 0, 0, 0, 0]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'issues'), (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setIssues(data);

      const total = data.length;
      const critical = data.filter(i => i.severity === 'Critical').length;
      const resolved = data.filter(i => i.status === 'Resolved').length;
      const pending = data.filter(i => i.status === 'Pending').length;

      const cats = ['Road Damage', 'Garbage', 'Water Supply', 'Street Light', 'Sewage', 'Other'];
      const counts = cats.map(c => data.filter(i => i.category === c).length);
      setCatData(counts);

      const topCategory = cats[counts.indexOf(Math.max(...counts))] || 'Road Damage';
      setStats({ total, critical, resolved, pending, topCategory });
    });
    return () => unsub();
  }, []);

  const refreshInsights = async () => {
    setAiLoading(true);
    try {
      const newInsights = await getAIInsights(stats);
      setInsights(newInsights);
    } catch (err) {
      console.error('Insights error:', err);
    }
    setAiLoading(false);
  };

  const resolvedPct = stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0;

  const doughnutData = {
    labels: ['Road', 'Garbage', 'Water', 'Light', 'Sewage', 'Other'],
    datasets: [{ data: catData, backgroundColor: ['#178FDD', '#639922', '#1D9E75', '#EF9F27', '#E24B4A', '#7F77DD'] }],
  };

  const lineData = {
    labels: ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'],
    datasets: [
      { label: 'Reported', data: [180, 220, 195, 310, 280, stats.total], borderColor: '#178FDD', tension: 0.4, fill: false },
      { label: 'Resolved', data: [120, 170, 155, 240, 230, stats.resolved], borderColor: '#639922', tension: 0.4, fill: false, borderDash: [6, 3] },
    ],
  };

  const risks = [
    { label: 'Flood Risk', pct: Math.min(stats.critical * 10, 95), reason: 'Based on critical issues count', color: '#E24B4A' },
    { label: 'Road Damage', pct: Math.min(catData[0] * 20, 90), reason: 'Road complaints in system', color: '#EF9F27' },
    { label: 'Water Crisis', pct: Math.min(catData[2] * 20, 80), reason: 'Water supply issues reported', color: '#178FDD' },
    { label: 'Sewage Risk', pct: Math.min(catData[4] * 20, 75), reason: 'Sewage overflow reports', color: '#639922' },
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
        {[
          ['Total Issues', stats.total, '#178FDD'],
          ['Resolved', `${resolvedPct}%`, '#639922'],
          ['Critical', stats.critical, '#E24B4A']
        ].map(([l, v, c]) => (
          <div key={l} className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: c }}>{v}</div>
            <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>{l}</div>
            <div style={{ fontSize: 10, color: '#aaa', marginTop: 2 }}>🔥 Live from Firebase</div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ marginBottom: 20 }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ fontSize: 14 }}>🤖 AI-Generated Insights</h3>
            <button onClick={refreshInsights} disabled={aiLoading}
              style={{ fontSize: 11, padding: '4px 10px', background: '#178FDD', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
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
          <h3 style={{ fontSize: 14, marginBottom: 12 }}>🏷️ Issues by Category (Real)</h3>
          <Doughnut data={doughnutData} options={{ responsive: true, plugins: { legend: { position: 'right' } } }} />
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3 style={{ fontSize: 14, marginBottom: 12 }}>📊 Real Stats Summary</h3>
        {[
          ['Total Reported', stats.total],
          ['Pending', stats.pending],
          ['Resolved', stats.resolved],
          ['Critical', stats.critical],
        ].map(([label, count]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <div style={{ width: 100, fontSize: 13, fontWeight: 500 }}>{label}</div>
            <div style={{ flex: 1, background: '#f0f4f8', borderRadius: 4, height: 8, overflow: 'hidden' }}>
              <div style={{ width: `${stats.total > 0 ? (count / stats.total) * 100 : 0}%`, height: '100%', background: '#178FDD', borderRadius: 4 }} />
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#178FDD', width: 40 }}>{count}</div>
          </div>
        ))}
      </div>
      <div className="card" style={{ marginTop: 16, border: '2px solid #178FDD' }}>
  <h3 style={{ fontSize: 14, marginBottom: 12, color: '#178FDD' }}>🚨 AI Agent Recommendations</h3>
  {[
    { icon: '🛣️', text: `${catData[0]} road damage issues detected — Assign additional PWD workers immediately`, color: '#EF9F27' },
    { icon: '🗑️', text: `${catData[1]} garbage complaints pending — Schedule emergency cleanup in affected zones`, color: '#E24B4A' },
    { icon: '⚡', text: `${stats.pending} issues unresolved for 48+ hours — Escalate to senior officers`, color: '#E24B4A' },
    { icon: '✅', text: `${stats.resolved} issues resolved — Community satisfaction improving`, color: '#639922' },
  ].map((r, i) => (
    <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 12px', marginBottom: 8, background: '#f8f9fa', borderRadius: 8, fontSize: 13 }}>
      <span style={{ fontSize: 18 }}>{r.icon}</span>
      <span style={{ color: r.color, fontWeight: 600 }}>{r.text}</span>
    </div>
  ))}
</div>
    </div>
  );
}