# 🛡️ Community Hero — AI-Powered Civic Intelligence Platform

> Report issues. Track resolutions. Improve your city.

🔴 **Live Demo (Google Cloud):** https://community-hero-729174041897.asia-south1.run.app
🎬 **Demo Video:** https://youtu.be/dwKSOdaZkWM?si=58fbfJpaYXBXkRZc

---

## 🚨 Problem Statement

Communities face daily issues — potholes, water leakages, garbage dumps, broken streetlights. Reporting is fragmented, tracking is opaque, and resolution is slow. Citizens have no platform to report, track, and verify civic issues transparently.

---

## 💡 Solution Overview

**Community Hero** is a hyperlocal AI-powered civic intelligence platform that enables citizens to identify, report, validate, track, and resolve community issues through collaboration, data, and intelligent automation.

---

## ✨ Key Features

### 🤖 Agentic AI Features
- **AI Issue Categorization** — Upload photo → AI automatically detects issue type, severity, priority score, and assigns correct government department
- **AI Agent Actions** — Auto-assigns municipal officers, sends SMS notifications, escalates critical issues to senior officers, schedules field inspections
- **AI Insights Dashboard** — Real-time AI-generated insights based on live Firebase data
- **AI Agent Recommendations** — Dynamic action recommendations based on issue patterns (e.g. "17 road damage issues — assign additional PWD workers")
- **Predictive Risk Analysis** — AI predicts Flood Risk, Road Damage Risk, Water Crisis, Sewage Risk

### 💬 AI-Powered Civic Chatbot
- **24/7 City Assistant** — Citizens can ask queries about civic issues, departments, and reporting procedures
- **Instant AI Responses** — Powered by Groq AI (LLaMA 3.1) for fast and accurate civic assistance
- **Smart Fallback** — Intelligent responses for common issues like potholes, garbage, water, lights, and sewage
- **Quick Action Chips** — One-tap shortcuts for common civic queries

### 📋 Live Issues Feed
- **Real-time Feed** — All reported issues displayed instantly with AI categorization and department assignment
- **Community Verification** — Citizens confirm or flag issues directly from the feed
- **Community Verified Badge** — Auto-awarded after 5+ confirmations
- **Fake Report Badge** — Auto-flagged after 5+ false reports
- **Priority & Resolution Time** — Each issue shows priority score and estimated resolution time

### 👥 Community Verification
- **✅ Confirm Issue** — Citizens verify real issues
- **❌ False Report** — Citizens flag fake reports
- **🏅 Community Verified Badge** — Auto-awarded after 5+ confirms
- **⚠️ Fake Report Badge** — Auto-flagged after 5+ false reports

### 🗺️ Live Tracking
- **Real-time Mumbai Map** — All issues plotted with severity color coding
- **GPS Auto-capture** — Auto-detect location while reporting
- **Smart Geocoding** — Manual addresses converted to coordinates via Nominatim
- **Category Filters** — Road, Garbage, Water, Light, Sewage

### 📊 Impact Dashboard
- Live stats from Firebase — Total, Resolved, Critical, Pending
- Monthly trend charts
- Issues by category (Doughnut chart)
- Real-time AI-generated stats summary

### 🏆 Gamification
- Points system — Report Issue = 10pts, High Priority = +10pts, Resolved = +30pts
- Bronze / Silver / Gold badges
- Community Heroes Leaderboard

### 🔔 Live Alert System
- Real-time critical alerts from Firebase data
- Auto-rotating banner with High/Critical issue notifications

### 🌐 Multilingual Support
- English, Hindi, Marathi

### ⚙️ Admin Panel
- Real-time issue management with live Firebase sync
- Department assignment — Road Maintenance, Water Works, Electrical, Drainage, Solid Waste
- Status tracking — Pending, Assigned, In Progress, Resolved
- Upload Before/After resolution images

### 🖼️ Before/After Gallery
- Visual proof of resolved civic issues
- Resolution timeline tracking

---

## 🛠️ Tech Stack

| Technology | Usage |
|-----------|-------|
| React.js | Frontend SPA |
| Firebase Firestore | Real-time live database |
| Firebase Storage | Image uploads |
| Google Cloud Run | Primary deployment (Docker) |
| Groq AI (LLaMA 3.1) | AI categorization, insights, chatbot |
| Leaflet Maps | Live issue mapping |
| Cloudinary | After-image storage for gallery |
| Docker | Containerization |
| Recharts | Data visualization |

---

## 🌐 Google Technologies Used

| Technology | Purpose |
|-----------|---------|
| ✅ **Google Cloud Run** | Primary app deployment via Docker container — scalable and fully managed |
| ✅ **Firebase Firestore** | Real-time database for all civic issues, live sync across app |
| ✅ **Firebase Storage** | Secure storage for citizen-uploaded photo evidence |

---

## 🚀 Demo Flow

1. 👤 User opens app → enters name
2. 📝 Reports issue with photo + GPS location
3. 🤖 AI analyzes image → assigns category, severity, department, priority score
4. ⚡ AI Agent auto-assigns municipal officer, sends notification, escalates if critical
5. 🗺️ Issue appears on Live Map instantly
6. 👥 Community verifies (✅ Confirm) or flags (❌ False Report)
7. 🏅 5+ confirms = Community Verified Badge
8. ⚙️ Admin assigns department, updates status
9. 📊 Dashboard auto-updates with AI insights and recommendations
10. 🏆 Reporter earns points on Heroes Leaderboard
11. 💬 Citizens get 24/7 help via AI Civic Chatbot

---

## 📈 Impact

- Citizens can report civic issues in **under 30 seconds**
- AI reduces manual categorization time by **90%**
- Real-time transparency increases community trust
- Gamification increases citizen participation
- Predictive analytics helps authorities prevent issues before they escalate

---

## 🔗 Links

- 🚀 **Live App (Google Cloud Run):** https://community-hero-729174041897.asia-south1.run.app
- 🎬 **Demo Video:** https://youtu.be/dwKSOdaZkWM?si=58fbfJpaYXBXkRZc
- 💻 **GitHub:** https://github.com/adarshmulik10051-dev/community-hero

---

## 🔮 Future Scope

- WhatsApp bot integration for issue reporting
- Government API integration for auto-resolution
- Predictive AI for seasonal issue forecasting
- Mobile app (React Native)
- Voice-based issue reporting
- Google Gemini Vision for advanced image analysis

---

## 👨‍💻 Developer

**Adarsh Mulik**
Hackathon: Community Hero — Hyperlocal Problem Solver
Submission: 29th June 2026
