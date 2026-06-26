import React, { useState } from 'react';
import './ChatBot.css';

const GEMINI_API_KEY = 'AQ.Ab8RN6INa3BJzqhPU9lAtAXqGF8spBizHj_o2fzJTBoOKm_uuA';

const askGemini = async (userMessage) => {
  const systemContext = `You are a City AI Assistant for Community Hero app in Mumbai, India.
You help citizens with civic issues like potholes, garbage, water leakage, street lights, sewage.
You know about these current issues:
- 5 critical potholes in Andheri West
- Garbage dump in Kurla (In Progress)
- Water leakage in Bandra East (Open)
- Sewage overflow in Mulund (Critical)
- Street light out in Dadar (Assigned)
- Flood risk 82% in low lying areas
- Ward B has 89 unresolved issues
- Andheri East has most complaints this week

Answer in 2-3 short sentences. Be helpful and specific.`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY
      },
      body: JSON.stringify({
        contents: [
          { role: 'user', parts: [{ text: systemContext }] },
          { role: 'model', parts: [{ text: 'I am City AI Assistant. I will help you with civic issues in Mumbai.' }] },
          { role: 'user', parts: [{ text: userMessage }] }
        ],
        generationConfig: { temperature: 0.7, maxOutputTokens: 200 }
      })
    }
  );

  if (!response.ok) throw new Error('API Error');
  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
};

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([{ from: 'ai', text: '👋 Hello! I am your City AI Assistant. Ask me about issues, departments, or civic help!' }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { from: 'user', text: input };
    setMsgs(m => [...m, userMsg]);
    const question = input;
    setInput('');
    setLoading(true);

    try {
      const reply = await askGemini(question);
      setMsgs(m => [...m, { from: 'ai', text: reply }]);
    } catch (err) {
      setMsgs(m => [...m, { from: 'ai', text: '⚠️ Sorry, I am having trouble connecting. Please try again.' }]);
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