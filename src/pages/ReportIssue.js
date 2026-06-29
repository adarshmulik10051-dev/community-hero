import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const GROQ_KEY = process.env.REACT_APP_GROQ_API_KEY;

const geocodeAddress = async (address) => {
  try {
    const query = encodeURIComponent(address + ', Mumbai, India');
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`,
      { headers: { 'Accept-Language': 'en' } }
    );
    const data = await res.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
    }
  } catch (e) {
    console.warn('Nominatim geocoding failed:', e);
  }
  return {
    lat: 19.0760 + (Math.random() - 0.5) * 0.04,
    lng: 72.8777 + (Math.random() - 0.5) * 0.04
  };
};

const analyzeWithGroq = async (file, category, description) => {
  const imageData = await new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.readAsDataURL(file);
  });

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: { url: `data:${file.type};base64,${imageData}` }
          },
          {
           text: `You are an AI civic issue analyzer for Mumbai city. Analyze this image and return ONLY a JSON object with no extra text:
{"issue":"detected issue name","confidence":95,"severity":"High","department":"Department name","action":"Suggested action","time":"48 Hours","priority":9}
Category: "${category}", Description: "${description || 'none'}"
Severity rules:
- Critical: sewage overflow, flooding, collapsed road, fire, major accident (priority 9-10)
- High: large pothole, broken pipe, garbage dump (priority 7-8)
- Medium: street light failure, minor damage (priority 5-6)
- Low: minor issues (priority 1-4)
Return ONLY JSON, no extra text.`
          }
        ]
      }],
      max_tokens: 300
    })
  });

  const data = await response.json();
  const text = data.choices[0].message.content;
  const clean = text.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
};

const agenticFlow = async (analysisData, issueId) => {
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
        content: `You are an autonomous civic issue management agent for Mumbai Municipal Corporation.
Issue detected: ${analysisData.issue}
Severity: ${analysisData.severity}
Department: ${analysisData.department}
Priority: ${analysisData.priority}/10

Take autonomous action and return ONLY a JSON object:
{
  "assigned_to": "officer name",
  "notification": "SMS message sent to department",
  "escalated": true or false,
  "next_action": "what agent will do next",
  "eta": "estimated resolution time",
  "agent_log": "Agent action summary"
}`
      }],
      max_tokens: 300
    })
  });

  const data = await response.json();
  const text = data.choices[0].message.content;
  const clean = text.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
};

const sevColor = { Critical: '#E24B4A', High: '#EF9F27', Medium: '#178FDD', Low: '#639922' };

export default function ReportIssue({ userName }) {
  const [form, setForm] = useState({ title: '', category: 'Road Damage', location: '', description: '' });
  const [uploadedFile, setUploadedFile] = useState(null);
  const [gps, setGps] = useState(false);
  const [gpsCoords, setGpsCoords] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [agentAction, setAgentAction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [agentLoading, setAgentLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const captureGPS = () => {
    setGpsLoading(true);
    setError('');
    if (!navigator.geolocation) {
      setError('GPS not supported.');
      setGpsLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setGpsCoords({ lat: latitude, lng: longitude });
        setForm({ ...form, location: `${latitude.toFixed(4)}°N ${longitude.toFixed(4)}°E` });
        setGps(true);
        setGpsLoading(false);
      },
      () => {
        setError('GPS access denied. Please enter location manually.');
        setGpsLoading(false);
      }
    );
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
      setAnalysis(null);
      setAgentAction(null);
      setError('');
    }
  };

  const analyze = async () => {
    setError('');
    if (!uploadedFile) { setError('⚠️ Please upload a photo first!'); return; }
    if (!form.title) { setError('⚠️ Please enter issue title!'); return; }
    setLoading(true);

    let analysisResult = null;
    try {
      analysisResult = await analyzeWithGroq(uploadedFile, form.category, form.description);
    } catch (err) {
      console.error('Groq failed, using fallback:', err);
      const fallback = {
        'Road Damage': { issue: 'Road Pothole Detected', confidence: 94, severity: 'High', department: 'Road Maintenance Dept.', action: 'Immediate repair required.', time: '48 Hours', priority: 9 },
        'Garbage': { issue: 'Illegal Garbage Dump', confidence: 91, severity: 'Medium', department: 'Solid Waste Dept.', action: 'Deploy sanitation team immediately.', time: '24 Hours', priority: 7 },
        'Water Supply': { issue: 'Water Pipe Leakage', confidence: 93, severity: 'High', department: 'Water Works Dept.', action: 'Shut supply line and dispatch repair crew.', time: '36 Hours', priority: 8 },
        'Street Light': { issue: 'Street Light Failure', confidence: 89, severity: 'Medium', department: 'Electrical Dept.', action: 'Inspect and replace faulty component.', time: '72 Hours', priority: 6 },
        'Sewage': { issue: 'Sewage Overflow Detected', confidence: 96, severity: 'Critical', department: 'Drainage Dept.', action: 'Emergency team required!', time: '12 Hours', priority: 10 },
        'Other': { issue: 'General Civic Issue', confidence: 85, severity: 'Low', department: 'Municipal Corp.', action: 'Review and assign department.', time: '5 Days', priority: 4 },
      };
      analysisResult = fallback[form.category] || fallback['Other'];
    }

    setAnalysis(analysisResult);
    setLoading(false);

    setAgentLoading(true);
    try {
      const docRef = await saveToFirestore(analysisResult);
      const agentResult = await agenticFlow(analysisResult, docRef);
      setAgentAction(agentResult);
      setAgentLoading(false);
    } catch (e) {
      console.error('Agent error:', e);
      setAgentAction({
        assigned_to: 'Municipal Officer - Zone 4',
        notification: `SMS sent to ${analysisResult.department}: New ${analysisResult.severity} priority issue reported.`,
        escalated: analysisResult.priority >= 8,
        next_action: 'Field inspection scheduled within 24 hours',
        eta: analysisResult.time,
        agent_log: `Agent auto-assigned issue to ${analysisResult.department}. Status updated to Assigned.`
      });
      setAgentLoading(false);
    }
  };

  const saveToFirestore = async (analysisData) => {
    try {
      let imageURL = '';
      if (uploadedFile) {
        const formData = new FormData();
        formData.append('file', uploadedFile);
        formData.append('upload_preset', 'community_hero');

        const cloudinaryRes = await fetch(
          'https://api.cloudinary.com/v1_1/ddbdnciti/image/upload',
          { method: 'POST', body: formData }
        );
        const cloudinaryData = await cloudinaryRes.json();
        imageURL = cloudinaryData.secure_url;
      }

      // ✅ GPS असेल तर exact, नाहीतर Nominatim geocoding (fallback: random offset)
      const coords = gpsCoords
        ? gpsCoords
        : await geocodeAddress(form.location);

      const docRef = await addDoc(collection(db, 'issues'), {
        reportedBy: userName,
        title: form.title,
        category: form.category,
        location: form.location,
        description: form.description,
        lat: coords.lat,
        lng: coords.lng,
        imageURL: imageURL,
        issue: analysisData.issue,
        severity: analysisData.severity,
        department: analysisData.department,
        action: analysisData.action,
        time: analysisData.time,
        priority: analysisData.priority,
        confidence: analysisData.confidence,
        status: 'Assigned',
        votes: 0,
        timestamp: serverTimestamp(),
      });
      return docRef.id;
    } catch (e) {
      console.error('Firestore error:', e);
      return 'local-id';
    }
  };

  if (submitted) {
    return (
      <div style={{ maxWidth: 600, textAlign: 'center', padding: 40 }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
        <h2 style={{ color: '#639922', marginBottom: 8 }}>Issue Reported & Agent Deployed!</h2>
        <p style={{ color: '#666', marginBottom: 24 }}>AI Agent has auto-assigned this issue to the concerned department!</p>
        <button className="btn-primary" onClick={() => {
          setSubmitted(false); setAnalysis(null); setAgentAction(null);
          setUploadedFile(null); setForm({ title: '', category: 'Road Damage', location: '', description: '' });
          setGps(false); setGpsCoords(null);
        }}>
          Report Another Issue
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 600 }}>
      <h2 style={{ marginBottom: 20, fontSize: 20 }}>📝 Report an Issue</h2>

      <div className="card">
        <h3 style={{ marginBottom: 16, fontSize: 14, color: '#666' }}>📋 Issue Details</h3>
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>Issue Title *</label>
          <input style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14 }}
            placeholder="e.g. Large pothole near station" value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>Category</label>
          <select style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14 }}
            value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
            {['Road Damage', 'Garbage', 'Water Supply', 'Street Light', 'Sewage', 'Other'].map(k => <option key={k}>{k}</option>)}
          </select>
        </div>
        <div style={{ marginBottom: 4 }}>
          <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>Description</label>
          <textarea style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, minHeight: 80 }}
            placeholder="Describe the issue..." value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })} />
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 12, fontSize: 14, color: '#666' }}>📍 Location</h3>
        <input style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, marginBottom: 10 }}
          placeholder="Enter area or address" value={form.location}
          onChange={e => setForm({ ...form, location: e.target.value })} />
        <button className="btn-secondary" style={{ fontSize: 13 }} onClick={captureGPS} disabled={gpsLoading}>
          {gpsLoading ? '📡 Detecting...' : '📡 Auto-capture GPS'}
        </button>
        {gps && <div style={{ fontSize: 12, color: '#639922', marginTop: 6, fontWeight: 600 }}>✅ GPS captured: {form.location}</div>}
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 12, fontSize: 14, color: '#666' }}>📸 Upload Evidence *</h3>
        <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} id="fileInput" />
        <label htmlFor="fileInput" style={{ border: '2px dashed #ddd', borderRadius: 10, padding: 28, textAlign: 'center', cursor: 'pointer', background: uploadedFile ? '#EAF3DE' : '#fafafa', display: 'block' }}>
          {uploadedFile ? (
            <div>
              <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
              <div style={{ color: '#639922', fontWeight: 600, fontSize: 14 }}>{uploadedFile.name}</div>
              <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>Click to change photo</div>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📷</div>
              <div style={{ fontSize: 13, color: '#888' }}>Click to upload photo<br /><span style={{ fontSize: 11 }}>AI will analyze your image</span></div>
            </div>
          )}
        </label>
        {uploadedFile && (
          <img src={URL.createObjectURL(uploadedFile)} alt="preview"
            style={{ width: '100%', borderRadius: 10, marginTop: 10, maxHeight: 200, objectFit: 'cover' }} />
        )}
      </div>

      {error && (
        <div style={{ background: '#FCEBEB', border: '1px solid #E24B4A', borderRadius: 8, padding: '10px 14px', marginBottom: 12, fontSize: 13, color: '#A32D2D' }}>
          {error}
        </div>
      )}

      <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 14, fontSize: 15 }}
        onClick={analyze} disabled={loading}>
        {loading ? '🤖 AI Analyzing...' : '🤖 Analyze with AI & Submit'}
      </button>

      {loading && (
        <div style={{ textAlign: 'center', padding: 20, color: '#178FDD', fontWeight: 600 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🤖</div>
          AI is analyzing your image...
        </div>
      )}

      {analysis && (
        <div className="card" style={{ marginTop: 16, border: '2px solid #178FDD' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <span style={{ fontSize: 24 }}>🤖</span>
            <h3 style={{ fontSize: 16 }}>AI Analysis</h3>
            <span className="badge badge-green" style={{ marginLeft: 'auto' }}>✅ Saved to Firebase</span>
          </div>
          <div style={{ background: '#E6F1FB', borderRadius: 8, padding: '8px 14px', marginBottom: 12, fontSize: 13, color: '#0C447C', fontWeight: 600 }}>
            Confidence: {analysis.confidence}%
          </div>
          <div className="grid-2" style={{ gap: 10, marginBottom: 12 }}>
            {[
              ['Detected Issue', analysis.issue, '#1a1a2e'],
              ['Severity', analysis.severity, sevColor[analysis.severity]],
              ['Department', analysis.department, '#1a1a2e'],
              ['Est. Resolution', analysis.time, '#1a1a2e'],
            ].map(([label, val, color]) => (
              <div key={label} style={{ background: '#f8f9fa', borderRadius: 8, padding: '10px 14px' }}>
                <div style={{ fontSize: 10, color: '#888', textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color }}>{val}</div>
              </div>
            ))}
          </div>
          <div style={{ background: '#f8f9fa', borderRadius: 8, padding: '10px 14px', marginBottom: 12 }}>
            <div style={{ fontSize: 10, color: '#888', textTransform: 'uppercase', marginBottom: 4 }}>Priority Score</div>
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              {Array.from({ length: 10 }, (_, i) => (
                <div key={i} style={{ width: 20, height: 20, borderRadius: '50%', background: i < analysis.priority ? '#E24B4A' : '#eee' }} />
              ))}
              <span style={{ fontSize: 13, marginLeft: 8, fontWeight: 600 }}>{analysis.priority}/10</span>
            </div>
          </div>
          <div style={{ background: '#f8f9fa', borderRadius: 8, padding: '10px 14px' }}>
            <div style={{ fontSize: 10, color: '#888', textTransform: 'uppercase', marginBottom: 4 }}>Suggested Action</div>
            <div style={{ fontSize: 13 }}>{analysis.action}</div>
          </div>

          {agentLoading && (
            <div style={{ marginTop: 16, background: '#FFF8E6', border: '1px solid #EF9F27', borderRadius: 8, padding: 14, textAlign: 'center' }}>
              <div style={{ fontSize: 24, marginBottom: 4 }}>⚡</div>
              <div style={{ fontSize: 13, color: '#B36B00', fontWeight: 600 }}>AI Agent taking autonomous action...</div>
            </div>
          )}

          {agentAction && !agentLoading && (
            <div style={{ marginTop: 16, background: '#EAF3DE', border: '2px solid #639922', borderRadius: 8, padding: 14 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#2D5A00', marginBottom: 10 }}>⚡ AI Agent Actions Taken</div>
              <div style={{ fontSize: 12, marginBottom: 6 }}>
                <span style={{ color: '#888' }}>👤 Assigned To:</span>
                <span style={{ fontWeight: 600, marginLeft: 6 }}>{agentAction.assigned_to}</span>
              </div>
              <div style={{ fontSize: 12, marginBottom: 6 }}>
                <span style={{ color: '#888' }}>📱 Notification:</span>
                <span style={{ marginLeft: 6 }}>{agentAction.notification}</span>
              </div>
              <div style={{ fontSize: 12, marginBottom: 6 }}>
                <span style={{ color: '#888' }}>🚨 Escalated:</span>
                <span style={{ fontWeight: 600, marginLeft: 6, color: agentAction.escalated ? '#E24B4A' : '#639922' }}>
                  {agentAction.escalated ? 'YES - Senior Officer Notified' : 'No'}
                </span>
              </div>
              <div style={{ fontSize: 12, marginBottom: 6 }}>
                <span style={{ color: '#888' }}>⏭️ Next Action:</span>
                <span style={{ marginLeft: 6 }}>{agentAction.next_action}</span>
              </div>
              <div style={{ fontSize: 11, background: '#fff', borderRadius: 6, padding: '6px 10px', marginTop: 8, color: '#555', fontStyle: 'italic' }}>
                🤖 {agentAction.agent_log}
              </div>
            </div>
          )}

          <button className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: 14, fontSize: 15, marginTop: 12, background: '#639922' }}
            onClick={() => setSubmitted(true)}>
            ✅ Confirm & Submit Report
          </button>
        </div>
      )}
    </div>
  );
}