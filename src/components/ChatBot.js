import React, { useState, useEffect, useRef } from 'react';
import './ChatBot.css';

const GROQ_KEY = process.env.REACT_APP_GROQ_API_KEY;

const askGemini = async (userMessage) => {
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
    text: '👋 Hello! I am your City AI Assistant. Ask me about issues, departments, or civic help!'
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const msgsEndRef = useRef(null);

  useEffect(() => {
    msgsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const question = input.trim();
    setMsgs(m => [...m, { from: 'user', text: question }]);
    setInput('');
    setLoading(true);

    try {
      const reply = await askGemini(question);
      setMsgs(m => [...m, { from: 'ai', text: reply }]);
    } catch (err) {
      // Rate limit किंवा error असेल तर smart fallback
      const fallbacks = {
        'pothole': '🕳️ Potholes should be reported with a photo and GPS location. Road Maintenance Dept typically resolves them in 48-72 hours. You can report at the Report section!',
        'garbage': '🗑️ Garbage issues are handled by Solid Waste Management. Report with photo for faster action. High-priority areas get resolved in 24 hours.',
        'water': '💧 Water supply issues are handled by Mumbai Water Works. Report with location for fastest resolution.',
        'light': '💡 Street light issues are handled by the Electrical Department. Usually resolved within 24-48 hours.',
        'sewage': '⚠️ Sewage overflow is a Critical issue! Drainage department is alerted immediately for such reports.',
      };
      const key = Object.keys(fallbacks).find(k => question.toLowerCase().includes(k));
      const fallbackMsg = key ? fallbacks[key] : '🤖 I can help with civic issues like potholes, garbage, water, lights, and sewage. What specific issue are you facing in Mumbai?';
      setMsgs(m => [...m, { from: 'ai', text: fallbackMsg }]);
    }
    setLoading(false);
  };

  return (
    <div className="chatbot">
      {open && (
        <div className="chat-window">
          <div className="chat-header">
            🤖 City AI Assistant
            <button onClick={() => setOpen(false)}>✕</button>
          </div>
          <div className="chat-msgs" id="chatMsgs">
            {msgs.map((m, i) => (
              <div key={i} className={`msg msg-${m.from}`}>{m.text}</div>
            ))}
            {loading && <div className="msg msg-ai">🤖 Thinking...</div>}
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
            <button onClick={send} disabled={loading}>Send</button>
          </div>
        </div>
      )}
      <button className="chat-fab" onClick={() => setOpen(o => !o)}>💬</button>
    </div>
  );
}