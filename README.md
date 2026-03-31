# 🛡️ SafeTrace

A privacy-first personal safety platform for urban areas.  
Anonymously report incidents, trigger SOS emergencies, and access real-time safety insights through an intelligent risk mapping system — **no account required**.

Built for **GDG WTM '26 Hackathon — Problem Statement 8: Unified Safety Platform for Incident Reporting and Real-Time Urban Safety.** :contentReference[oaicite:0]{index=0}

---

## 🚨 The Problem

Urban areas like Chennai and Bangalore face:

- Underreported safety incidents due to fear of exposure  
- No real-time, localized safety visibility for commuters  
- No unified platform for anonymous reporting  
- Limited access to actionable safety intelligence  

---

## 💡 What SafeTrace Does

SafeTrace addresses personal safety at two levels:

### 1. Anonymous Incident Reporting
- File safety complaints without revealing identity  
- Tamper-proof evidence hashing  
- Real-time case tracking  

### 2. Intelligent Safety Map
- Real-time risk zones  
- Powered by crowd-sourced reports, static data, and live news feeds  

---

## ✨ Features

### 🚨 SOS Emergency System
- One-tap SOS button → calls **112 (Indian emergency services)**  
- Auto-captures geolocation  
- Files an anonymous report instantly  
- Fire-and-forget design (never blocks user)  

---

### 🕵️ Anonymous Incident Reporting
- 6 categories: harassment, theft, unsafe area, poor lighting, stalking, other  
- Auto location detection (browser geolocation API)  
- Optional evidence upload → **SHA-256 hash (no file upload)**  
- Auto-generated case ID (`ST-XXXXXX`)  
- Stored locally for tracking  
- **Zero personal data collected**  

---

### 🔐 End-to-End Encryption
- AES-256-GCM encryption  
- PBKDF2 key derivation (100,000 iterations)  
- Only ciphertext + IV stored in Supabase  
- Decryption happens **client-side only**  

---

### 🗺️ Real-Time Safety Map
- Interactive Leaflet map (CartoDB dark tiles)  
- Safe places: police stations, hospitals, schools, crowded zones  
- Unsafe zones: color-coded risk levels (High / Medium / Low)  
- Live news zones (NewsAPI integration)  
- Click zones → risk score, notes, source, timestamp  

---

### 📍 Case Tracking
- Track reports via case ID (no login required)  
- Status stages:
  - Submitted  
  - Under Review  
  - Escalated  
  - Resolved  

---

### 🔑 Optional Authentication
- Email/password via Supabase Auth  
- Fully usable **without account**  
- Logged-in users get report linking  

---

### 🏛️ Authority Portal (Separate App)
- Passcode-protected dashboard  
- Real-time complaint feed  
- Case-based decryption  
- Status updates sync instantly  
- Evidence hash verification  

---

## 🛠️ Tech Stack

| Layer        | Technology |
|--------------|-----------|
| Frontend     | React + Vite |
| Map          | Leaflet + react-leaflet + CartoDB |
| Database     | Supabase (Postgres + Realtime) |
| Auth         | Supabase Auth |
| Encryption   | Web Crypto API (AES-256-GCM, PBKDF2, SHA-256) |
| Live Data    | NewsAPI |
| Deployment   | Vercel |

---

## 📁 Project Structure


safetrace/
├── src/
│ ├── components/
│ │ └── tabs/
│ │ ├── MapTab.jsx
│ │ ├── ReportTab.jsx
│ │ ├── TrackTab.jsx
│ │ └── ProfileTab.jsx
│ ├── contexts/
│ │ └── AuthContext.jsx
│ ├── data/
│ │ ├── safePlaces.js
│ │ └── unsafeZones.js
│ ├── pages/
│ │ ├── SOSScreen.jsx
│ │ ├── HomeScreen.jsx
│ │ └── SignInPage.jsx
│ ├── services/
│ │ ├── supabase.js
│ │ ├── dbService.js
│ │ ├── authService.js
│ │ └── newsZones.js
│ └── utils/
│ ├── encryption.js
│ └── hashFile.js
├── public/
├── .env
├── .gitignore
└── index.html


---

## 🚀 Getting Started

### ✅ Prerequisites
- Node.js v18+  
- Supabase project  
- NewsAPI key  

---

### 📦 Installation

```bash
git clone https://github.com/your-username/safetrace.git
cd safetrace
npm install
🔑 Environment Variables

Create .env:

VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key
VITE_NEWSAPI_KEY=your_key

⚠️ Never commit .env

🧩 Supabase Setup

Run this schema in SQL Editor:

-- (same SQL from your original file)

Enable:

Authentication → Email/Password
▶️ Run Locally
npm run dev

👉 http://localhost:5173

🏛️ Authority Portal
cd safetrace-authority
npm install

Create .env:

VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_AUTHORITY_CODE=...

Run:

npm run dev

👉 http://localhost:5174

🌐 Deployment
User App (Vercel)
npm run build

Steps:

Push to GitHub
Import in Vercel
Add env variables
Deploy
Authority Portal
Deploy separately
Keep URL private
🔐 How Encryption Works
Case ID (ST-XXXXXX) generated
Used to derive AES key (PBKDF2)
Data encrypted → stored as ciphertext
Supabase never sees plaintext
Only case ID holder can decrypt

Evidence:

Not uploaded
SHA-256 hash stored (tamper-proof proof)
🧑‍⚖️ Authority Workflow
Receive case ID
Login with passcode
View real-time reports
Decrypt using case ID
Update status → user sees instantly
