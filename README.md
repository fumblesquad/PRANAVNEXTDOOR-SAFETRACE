# SafeTrace

A privacy-first personal safety platform for urban areas. Anonymously report incidents, trigger SOS emergencies, and access real-time safety insights through an intelligent risk mapping system — no account required.

Built for GDG WTM '26 Hackathon — Problem Statement 8: Unified Safety Platform for Incident Reporting and Real-Time Urban Safety.

---

## The Problem

Urban areas like Chennai and Bangalore face:
- Underreported safety incidents due to fear of exposure
- No real-time, localized safety visibility for commuters
- No unified platform for anonymous reporting
- Limited access to actionable safety intelligence

---

## What SafeTrace Does

SafeTrace addresses personal safety at two levels:

1. **Anonymous incident reporting** — file safety complaints without revealing identity, with tamper-proof evidence hashing and real-time case tracking
2. **Intelligent safety map** — real-time risk zones powered by crowd-sourced reports, static data, and live news feeds

---

## Features

### SOS Emergency System
- One-tap SOS button — instantly calls 112 (Indian emergency services)
- Two-tap confirmation overlay to prevent accidental triggers
- Auto-captures geolocation and files an anonymous SOS alert to Supabase simultaneously
- Fires and forgets — never blocks the user in an emergency

### Anonymous Incident Reporting
- Eight incident categories — harassment, stalking, theft/robbery, assault, eve-teasing, unsafe area, poor lighting, other
- Interactive map-based location picker — click to pin exact location
- Date and time picker for accurate incident logging
- Optional evidence upload — up to 5 files (images, video, audio); SHA-256 hash generated client-side for tamper-proof integrity; files are stored, not discarded
- Auto-generated case ID (`ST-XXXXXX`) saved to localStorage for tracking
- Zero personal information required or stored

### Real-Time Safety Map
- Interactive Leaflet map with CartoDB dark tiles, centered on Chennai
- Safe place markers — police stations, hospitals, schools, high-crowd public areas (50+ locations)
- Unsafe zone circles colored by risk score (High / Medium / Low) — 33 predefined Chennai zones
- Live news zones pulled from NewsAPI — real Chennai incident headlines mapped to localities
- Tap any zone for details — risk score, incident note, data source, timestamp

### Turn-by-Turn Navigation
- Search for any destination via Google Maps Places API
- Risk-aware route display — highlights unsafe zones along the path
- Turn-by-turn directions via Google Maps Directions API
- OSRM fallback routing when Google Maps is unavailable

### Case Tracking
- Track any report by case ID — no sign-in required
- Four-stage progress tracker — Submitted → Under Review → Escalated → Resolved
- Saved cases from localStorage shown automatically

### Evidence Locker
- Authenticated-only page for viewing evidence linked to your account
- Displays evidence files with SHA-256 integrity hashes for verification

### Authentication (Optional)
- Google OAuth via @react-oauth/google
- Email + password sign in via Supabase Auth
- Full app access without any account — anonymous by default
- Signed-in users get reports and evidence linked to their profile
- Link previously anonymous cases (saved in localStorage) to your account after sign-in

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite |
| Map | Leaflet + react-leaflet + CartoDB dark tiles |
| Database | Supabase (Postgres + Realtime) |
| Auth | Supabase Auth (email/password + Google OAuth) |
| Evidence Integrity | Web Crypto API — SHA-256 |
| Navigation | Google Maps Directions & Places API + OSRM fallback |
| Live data | NewsAPI |
| Deployment | Vercel |

---

## Project Structure

```
safetrace/
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   ├── index.css
│   ├── assets/
│   ├── components/
│   │   ├── FloatingNav.jsx
│   │   ├── Navbar.jsx
│   │   ├── IncidentFeed.jsx
│   │   ├── MapPreview.jsx
│   │   ├── SwipeableApp.jsx
│   │   └── tabs/
│   │       ├── MapTab.jsx
│   │       ├── ReportTab.jsx
│   │       ├── TrackTab.jsx
│   │       └── ProfileTab.jsx
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   └── PageNavContext.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── MainApp.jsx
│   │   ├── SignIn.jsx
│   │   ├── Map.jsx
│   │   ├── Report.jsx
│   │   ├── Track.jsx
│   │   └── EvidenceLocker.jsx
│   ├── services/
│   │   ├── supabase.js
│   │   ├── dbService.js
│   │   └── authService.js
│   ├── config/
│   │   └── emergency.js
│   └── utils/
│       └── hashFile.js
├── supabase/
│   └── sos_alerts.sql
├── public/
├── .env
├── .gitignore
└── index.html
```

---

## Getting Started

### Prerequisites
- Node.js v18+
- A Supabase project
- A NewsAPI key (free tier)
- A Google Cloud project with Maps JavaScript API, Directions API, and Places API enabled
- A Google OAuth 2.0 client ID (for Google sign-in)

### Installation

```bash
git clone https://github.com/your-username/safetrace.git
cd safetrace
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_NEWSAPI_KEY=your_newsapi_key
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

Never commit `.env` to GitHub. It is already in `.gitignore`.

### Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the schema:

```sql
create table reports (
  id uuid default gen_random_uuid() primary key,
  case_id text unique not null,
  type text,
  description text,
  location jsonb,
  status text default 'submitted',
  uid uuid references auth.users(id) null,
  evidence_refs text[] default '{}',
  created_at timestamptz default now()
);

create table users (
  uid uuid references auth.users(id) primary key,
  email text,
  auth_provider text,
  case_ids text[] default '{}',
  created_at timestamptz default now()
);

create table zones (
  id uuid default gen_random_uuid() primary key,
  zone_id text unique not null,
  name text not null,
  city text not null,
  risk_score int check (risk_score between 0 and 100),
  risk_level text check (risk_level in ('low', 'medium', 'high')),
  incident_count int default 0,
  coordinates jsonb,
  last_updated timestamptz default now()
);

create table evidence (
  id uuid default gen_random_uuid() primary key,
  evidence_id text unique not null,
  case_id text references reports(case_id),
  file_name text,
  file_type text,
  sha256_hash text,
  uid uuid references auth.users(id) null,
  uploaded_at timestamptz default now()
);

create table sos_alerts (
  id uuid default gen_random_uuid() primary key,
  alert_id text unique not null,
  location_lat numeric,
  location_lng numeric,
  status text default 'active',
  created_at timestamptz default now(),
  resolved_at timestamptz,
  resolved_by text
);

alter table reports enable row level security;
alter table users enable row level security;
alter table zones enable row level security;
alter table evidence enable row level security;
alter table sos_alerts enable row level security;

create policy "Anyone can insert reports" on reports for insert with check (true);
create policy "Anyone can read reports" on reports for select using (true);
create policy "Anyone can update report status" on reports for update using (true);
create policy "Anyone can read zones" on zones for select using (true);
create policy "Anyone can insert evidence" on evidence for insert with check (true);
create policy "Anyone can read evidence" on evidence for select using (true);
create policy "Anyone can insert SOS alerts" on sos_alerts for insert with check (true);
create policy "Anyone can read SOS alerts" on sos_alerts for select using (true);

alter publication supabase_realtime add table reports;
alter publication supabase_realtime add table sos_alerts;
```

3. Enable Email/Password and Google auth:
   - Supabase Console → Authentication → Providers → Email → Enable
   - Supabase Console → Authentication → Providers → Google → Enable → add your Google OAuth client ID and secret

### Run Locally

```bash
npm run dev
```

App runs at `http://localhost:5173`

---

## How Evidence Integrity Works

SafeTrace generates a SHA-256 hash of any uploaded evidence file client-side before submission. The hash is stored alongside the file reference in the database. This creates a tamper-proof fingerprint — anyone with the original file can verify it has not been altered since submission by recomputing the hash and comparing.

---

## Deployment

### Vercel

```bash
npm run build
```

1. Push to GitHub
2. Import repo in [vercel.com](https://vercel.com)
3. Add environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_NEWSAPI_KEY`
   - `VITE_GOOGLE_CLIENT_ID`
4. Deploy

---

## Team

Built at GDG WTM '26 Hackathon
- Pranav Shankar — user portal, backend, maps, navigation

---

## License

MIT
