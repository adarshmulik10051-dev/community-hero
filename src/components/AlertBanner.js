import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import './AlertBanner.css';

export default function AlertBanner({ lang }) {
  const [idx, setIdx] = useState(0);
  const [alerts, setAlerts] = useState([
    '⚠️ Loading live alerts...'
  ]);

  useEffect(() => {
    const q = query(collection(db, 'issues'), orderBy('timestamp', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const issues = snap.docs.map(d => ({ id: d.id, ...d.data() }));

      const liveAlerts = [];

      // Critical issues
      const critical = issues.filter(i => i.severity === 'Critical');
      critical.forEach(i => {
        liveAlerts.push(`🔴 Critical Issue — ${i.title} at ${i.location || 'Mumbai'}. Immediate action required.`);
      });

      // High issues
      const high = issues.filter(i => i.severity === 'High').slice(0, 2);
      high.forEach(i => {
        liveAlerts.push(`🟠 High Priority — ${i.title} at ${i.location || 'Mumbai'}. Action needed.`);
      });

      // Pending issues
      const pending = issues.filter(i => i.status === 'Pending').length;
      if (pending > 0) {
        liveAlerts.push(`⚠️ ${pending} issues pending resolution. Community action needed.`);
      }

      if (liveAlerts.length === 0) {
        liveAlerts.push('✅ No critical alerts at this time. Community is safe!');
      }

      setAlerts(liveAlerts);
      setIdx(0);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (alerts.length <= 1) return;
    const iv = setInterval(() => setIdx(i => (i + 1) % alerts.length), 4000);
    return () => clearInterval(iv);
  }, [alerts]);

  const isRed = alerts[idx]?.includes('🔴');

  return (
    <div className="alert-banner" style={{ background: isRed ? '#c0392b' : '#8B1A1A' }}>
      {alerts[idx]}
    </div>
  );
}