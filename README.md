# SafeTrace

A real-time personal safety web application that helps users navigate to safe locations during emergencies, report incidents with encrypted evidence, and get immediate access to emergency services.

Built for the GDG WomenTechies 2026 Hackathon.

## What It Does

SafeTrace is a mobile-first safety companion that works in three ways:

**Emergency SOS** - A two-tap emergency alert system. First tap arms it, second tap confirms. Sends an alert to the nearest police station with the user's location.

**Safe Navigation** - Drop a pin on the map to see nearby safe places (police stations, hospitals, schools, public areas) and active crime/risk zones. Select a destination and get turn-by-turn walking navigation. When you arrive, the app checks if you're okay and offers direct-dial to police (100), women helpline (1091), and emergency services (112) if you need help.

**Incident Reporting** - File a complaint with incident type, pin location on map, upload photo/video/audio evidence, and receive a unique case ID. All sensitive data is AES-256-GCM encrypted before it leaves the browser. The case ID doubles as the decryption key for the police portal.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite |
| Map | Leaflet with CartoDB dark tiles |
| Routing | OSRM (fallback from Google Directions) |
| Database | Supabase (PostgreSQL + Row Level Security) |
| Encryption | Web Crypto API (AES-256-GCM, PBKDF2) |
| Live Data | NewsAPI (crime/hazard news), Google Places API |
| Realtime | Supabase Realtime (WebSocket subscriptions) |
| Styling | Inline React styles, Poppins + DM Mono fonts |

## Features

### Map and Navigation
- Dark-themed Leaflet map with CartoDB tiles
- Tap-to-drop pin for current location
- 8 nearest safe places displayed with distance and walk time
- Safe place categories: police stations, hospitals, schools, public areas
- Walking route calculation with turn-by-turn step navigation
- Animated navigation dot that follows the route
- Collapsible bottom drawer for place list

### Risk Zones (Heatmap)
- 33 static crime-prone zones across Chennai with 4-layer gradient heatmap rendering
- Live news-based hazard zones from NewsAPI
- Dynamic risk scoring formula based on 5 weighted factors:
  - Crime density (0.35) - nearby incident clustering
  - Infrastructure (0.20) - lighting, CCTV, police proximity
  - Recency (0.20) - exponential decay with 48-hour half-life
  - Time of day (0.15) - night hours score higher
  - Crowd density (0.10) - deserted areas score higher
- News article risk uses keyword severity weights (0.40-0.85), log-scaled term frequency, additive multi-threat stacking, and exponential time decay
- Risk always clamped between 10% and 99%

### SOS System
- Landing page SOS button with pulse animation
- Two-tap confirmation: first tap arms (pink), second tap confirms (red)
- "Are you sure you want to alert the police?" confirmation
- Dashboard SOS with bounce animation on the bottom nav
- Bottom sheet overlay (doesn't cover full screen)
- Sending spinner and success states

### Arrival Check-In
- After completing navigation, asks "Are you okay? Do you need help?"
- "I'm Safe" - green checkmark animation, auto-dismisses
- "Need Help" - sends police alert, then shows direct-dial cards:
  - Call Police (100)
  - Women Helpline (1091)
  - Emergency Services (112)

### Incident Reporting
- Incident type selection: Harassment, Stalking, Theft/Robbery, Assault, Eve-Teasing, Unsafe Area, Poor Lighting, Other
- "Other" reveals a custom description field
- Pin incident location on an interactive map
- Date and time pickers
- Evidence upload (photos, videos, audio) with thumbnail previews
- Sticky submit button always visible
- Unique case ID generated on submission (e.g. ST-X7K2M9PB)
- All sensitive data encrypted client-side before database insert

### Encryption
- Algorithm: AES-256-GCM via Web Crypto API
- Key derivation: PBKDF2 with SHA-256, 100,000 iterations, fixed salt
- The case ID is the encryption/decryption passphrase
- Report data (type, description, location, date, time) encrypted into a single blob
- Evidence metadata (file name, type, size) encrypted separately per file
- GCM authentication tag detects any tampering of stored data
- Only case_id, status, and created_at are stored as plaintext for querying

### Database Schema

**reports** - `id (uuid)`, `case_id (text, unique)`, `status (text)`, `uid (uuid)`, `created_at (timestamptz)`, `updated_at (timestamptz)`, `status_note (text)`, `encrypted_data (text)`, `iv (text)`

**evidence** - `id (uuid)`, `evidence_id (text, unique)`, `case_id (text, FK)`, `uid (uuid)`, `uploaded_at (timestamptz)`, `encrypted_data (text)`, `iv (text)`

**zones** - `id (uuid)`, `zone_id (text)`, `name (text)`, `city (text)`, `risk_score (int)`, `risk_level (text)`, `incident_count (int)`, `coordinates (jsonb)`

**users** - `uid (uuid)`, `email (text)`, `auth_provider (text)`, `case_ids (text[])`

## Setup

### Prerequisites
- Node.js 18+
- Supabase project
- (Optional) Google Maps API key
- (Optional) NewsAPI key

### Installation

```bash
git clone https://github.com/your-org/safetrace.git
cd safetrace
npm install
```

### Environment Variables

Create a `.env` file in the root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GOOGLE_API_KEY=your-google-key        # optional
VITE_NEWSAPI_KEY=your-newsapi-key          # optional
```

### Supabase Setup

Run these in the Supabase SQL editor:

```sql
-- Enable realtime for live status updates
alter publication supabase_realtime add table reports;

-- RLS policies
create policy "Anyone can insert reports" on reports for insert with check (true);
create policy "Anyone can read reports by case_id" on reports for select using (true);
create policy "Anyone can update report status" on reports for update using (true) with check (true);
create policy "Anyone can insert evidence" on evidence for insert with check (true);
create policy "Users can read own evidence" on evidence for select using (auth.uid() = uid or uid is null);
create policy "Anyone can read zones" on zones for select using (true);
```

### Run Locally

```bash
npm run dev
```

Opens at `http://localhost:5173`

### Deploy

npm run dev and launch it on locally

## Project Structure

```
safetrace/
  src/
    App.jsx              # Main app with all components
    data/
      config.js          # API keys, static data, helpers
    components/
      SafeMap.jsx         # Leaflet map component
      SidePanel.jsx       # Place list drawer
      NavOverlay.jsx      # Turn-by-turn navigation UI
  .env                    # Environment variables (not committed)
  index.html
  package.json
  vite.config.js
```

## Team

Built for GDG WomenTechies 2026 Hackathon at VIT Vellore.

## License

MIT
