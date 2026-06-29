import React, { useState, useEffect, useRef } from 'react';
import './ChatBot.css';

const GROQ_KEY = process.env.REACT_APP_GROQ_API_KEY;

const QUICK_CHIPS = [
  { label: '🕳️ Potholes', q: 'Tell me about pothole issues in Mumbai' },
  { label: '🗑️ Garbage', q: 'Garbage collection issues' },
  { label: '💧 Water', q: 'Water leakage or supply issues' },
  { label: '💡 Street Lights', q: 'Street light outages' },
  { label: '⚠️ Sewage', q: 'Sewage overflow complaints' },
];

const askGroq = async (userMessage) => {
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
        content: `You are a City AI Assistant for Community Hero app in Mumbai, India.
You help citizens with civic issues like potholes, garbage, water leakage, street lights, sewage.
Current issues in the system:
- Multiple potholes reported in Andheri, Kurla, Kharghar
- Garbage issues in various areas
- Water leakage complaints
- Street light outages
- Sewage overflow reports
Answer in 2-3 short, helpful sentences. Be specific to Mumbai civic issues.
User question: ${userMessage}`
      }],
      max_tokens: 200
    })
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err?.error?.message || 'API Error');
  }
  const data = await response.json();
  return data.choices[0].message.content;
};

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([{
    from: 'ai',
    text: '👋 Hello! I\'m your City AI Assistant for Mumbai. Ask me about civic issues, departments, or how to report problems!'
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const msgsEndRef = useRef(null);

  useEffect(() => {
    msgsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs, loading]);

  useEffect(() => {
    if (!open && msgs.length > 1) setUnread(u => u + 1);
  }, [msgs]);

  const handleOpen = () => {
    setOpen(o => !o);
    setUnread(0);
  };

  const send = async (text) => {
    const question = (text || input).trim();
    if (!question || loading) return;
    setMsgs(m => [...m, { from: 'user', text: question }]);
    setInput('');
    setLoading(true);
    try {
      const reply = await askGroq(question);
      setMsgs(m => [...m, { from: 'ai', text: reply }]);
    } catch (err) {
      const fallbacks = {
        'pothole': '🕳️ Potholes should be reported with a photo and GPS location. Road Maintenance Dept typically resolves them in 48-72 hours.',
        'garbage': '🗑️ Garbage issues are handled by Solid Waste Management. Report with photo for faster action.',
        'water': '💧 Water supply issues are handled by Mumbai Water Works. Report with location for fastest resolution.',
        'light': '💡 Street light issues are handled by the Electrical Department. Usually resolved within 24-48 hours.',
        'sewage': '⚠️ Sewage overflow is Critical! Drainage department is alerted immediately for such reports.',
      };
      const key = Object.keys(fallbacks).find(k => question.toLowerCase().includes(k));
      setMsgs(m => [...m, { from: 'ai', text: key ? fallbacks[key] : '🤖 I can help with potholes, garbage, water, lights, and sewage. What issue are you facing?' }]);
    }
    setLoading(false);
  };

  return (
    <div className="chatbot">
      {open && (
        <div className="chat-window">
          <div className="chat-header">
            <div className="chat-header-avatar">🤖</div>
            <div className="chat-header-info">
              <div className="chat-header-name">City AI Assistant</div>
              <div className="chat-header-status">
                <span className="status-dot" />
                Online • Mumbai Civic Help
              </div>
            </div>
            <button className="chat-close-btn" onClick={() => setOpen(false)}>✕</button>
          </div>

          <div className="chat-chips">
            {QUICK_CHIPS.map((c, i) => (
              <button key={i} className="chat-chip" onClick={() => send(c.q)}>
                {c.label}
              </button>
            ))}
          </div>

          <div className="chat-msgs">
            {msgs.map((m, i) => (
              <div key={i} className={`msg msg-${m.from}`}>{m.text}</div>
            ))}
            {loading && (
              <div className="msg msg-ai typing-indicator">
                <span /><span /><span />
              </div>
            )}
            <div ref={msgsEndRef} />
          </div>

          <div className="chat-input-row">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Ask about city issues..."
              disabled={loading}
            />
            <button className="chat-send-btn" onClick={() => send()} disabled={loading}>
              ➤
            </button>
          </div>
        </div>
      )}
        
      {unread > 0 && !open && (
        <div className="chat-badge">{unread}</div>
      )}
      {!open && (
  <div className="chat-fab-label">
    <span className="label-dot" />
    City Assistant
  </div>
)}
      <button className="chat-fab" onClick={handleOpen}>
        <span className="chat-fab-icon">{open ? '✕' : '💬'}</span>
      </button>
    </div>
  );
  
}