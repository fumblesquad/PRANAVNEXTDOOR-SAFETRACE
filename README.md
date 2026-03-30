# 🛡 MAPTEST — React App

> Intelligent safety routing web app for hackathons.  
> Shows a crime heatmap and guides users through the **safest path**, not the shortest.

---

## Tech Stack

| Library | Version | Purpose |
|---|---|---|
| React | 18 | UI framework |
| Vite | 5 | Dev server & bundler |
| Leaflet | 1.9.4 | Interactive map |
| react-leaflet | 4.2.1 | React bindings for Leaflet |
| leaflet.heat | 0.2.0 | Crime heatmap layer |
| lucide-react | 0.383.0 | Icons (optional) |

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev

# 3. Open http://localhost:5173
```

---

## Project Structure

```
src/
├── App.jsx                     ← Root component, wires everything together
├── main.jsx                    ← React DOM entry point
├── index.css                   ← Global styles + Leaflet overrides
│
├── data/
│   └── config.js               ← ALL map data & constants (edit this for your city)
│
├── hooks/
│   ├── useRouting.js           ← Routing state & waypoint generation
│   └── useToast.js             ← Toast notification state
│
└── components/
    ├── MAPTESTMap.jsx        ← Leaflet map with heatmap, danger zones, markers
    ├── Panel.jsx               ← Left sidebar (metrics, modes, destinations, SOS)
    ├── DestCard.jsx            ← Individual destination card
    ├── RouteResult.jsx         ← Active route stats panel
    ├── Legend.jsx              ← Top-right map key
    └── Toast.jsx               ← Toast notification
```

---

## Customise for Your City

**All data lives in `src/data/config.js`.**

### 1. Change location
```js
export const MAP_CENTER    = [YOUR_LAT, YOUR_LNG]
export const USER_LOCATION = [YOUR_LAT, YOUR_LNG]  // or use geolocation hook
```

### 2. Add crime hotspots
```js
export const CRIME_HEAT_POINTS = [
  [lat, lng, intensity],  // intensity: 0.0 → 1.0
  ...
]
```

### 3. Add danger zone circles
```js
export const DANGER_ZONES = [
  { lat, lng, radius },  // radius in metres
]
```

### 4. Add safe destinations
```js
export const SAFE_PLACES = [
  {
    id: 0,
    name: 'Place Name',
    lat, lng,
    tags: ['crowd', 'police', 'light', 'hospital'],
    tagLabels: ['High Crowd', 'Police Post', 'Well Lit', 'Hospital'],
    scores: { safe: 94, crowd: 88, lit: 90, fastest: 72 },
    distKm: 1.2,
    timeMin: 16,
    checks: ['Bullet point 1', 'Bullet point 2', 'Bullet point 3'],
  },
]
```

---

## Enable Real GPS

In `App.jsx`, replace the static `USER_LOCATION` import with:

```js
const [userLocation, setUserLocation] = useState(null)

useEffect(() => {
  const watchId = navigator.geolocation.watchPosition(
    (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
    (err) => console.error('GPS error', err),
    { enableHighAccuracy: true }
  )
  return () => navigator.geolocation.clearWatch(watchId)
}, [])
```

---

## Connect Real Routing (Post-Hackathon)

Replace `buildSafeWaypoints()` in `src/hooks/useRouting.js` with a real router API call:

```js
// OSRM example (self-hostable, free)
const res = await fetch(
  `https://router.project-osrm.org/route/v1/foot/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson`
)
const data = await res.json()
const coords = data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng])
```

Then weight edges by: crime density · lighting score · crowd density.

---

## Hackathon Demo Script

1. Load the app — heatmap shows red/orange crime clusters immediately
2. Click any destination card → two routes appear:
   - **Dashed red line** = risky direct shortcut
   - **Solid coloured line** = safe detoured route
3. Toggle **routing modes** (Safest → Crowded → Well Lit → Fastest):
   - Route redraws, safety score and checks update live
4. Hit **SOS** — simulates broadcasting location to emergency services
5. Pitch line: *"Fastest isn't always safest. MAPTEST knows the difference."*

---

## Build for Production

```bash
npm run build
# Output in /dist — deploy to Vercel, Netlify, or any static host
```
