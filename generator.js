import fs from 'fs';

// 🔐 Use env later (for now ok)
const API_KEY = "AIzaSyAUpUANI5PbpCYxbTaIwScHwiCYBQNYfNQ";

// Chennai
const CITY_CENTER = { lat: 13.0827, lng: 80.2707 };
const RADIUS_METERS = 15000;

const PLACE_TYPES = [
  { type: 'police', tag: 'police' },
  { type: 'hospital', tag: 'hospital' },
  { type: 'school', tag: 'school' },
  { type: 'shopping_mall', tag: 'crowd' },
];

// ✅ Fetch
async function fetchPlaces(type) {
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${CITY_CENTER.lat},${CITY_CENTER.lng}&radius=${RADIUS_METERS}&type=${type}&key=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.results || [];
}

// ✅ Map to UI format
function mapPlace(place, tag, id) {
  return {
    id,
    name: place.name,
    lat: place.geometry.location.lat,
    lng: place.geometry.location.lng,
    tags: [tag],
    tagLabels: [tag],
    scores: {
      safe: 90,
      crowd: 80,
      lit: 75,
      fastest: 70,
    },
    distKm: 2,
    timeMin: 10,
    checks: [`Near ${tag}`],
  };
}

// ✅ MAIN
async function run() {
  let SAFE_PLACES = [];
  let id = 1;

  for (let p of PLACE_TYPES) {
    const results = await fetchPlaces(p.type);

    for (let place of results) {
      SAFE_PLACES.push(mapPlace(place, p.tag, id++));
    }
  }

  const CONFIG_PATH = './src/data/config.js';

  const content = `// AUTO-GENERATED FILE — DO NOT EDIT SAFE_PLACES

export const MAP_CENTER = [13.0827, 80.2707];
export const USER_LOCATION = [13.0827, 80.2707];
export const MAP_ZOOM = 12;

export const CRIME_HEAT_POINTS = [
  [13.0950, 80.2850, 0.9],
  [13.0900, 80.2800, 0.85]
];

export const DANGER_ZONES = [
  { lat: 13.0950, lng: 80.2850, radius: 400 }
];

export const SAFE_PLACES = ${JSON.stringify(SAFE_PLACES, null, 2)};

export const ROUTE_MODES = [
  { id: 'safe', icon: '🛡', label: 'Safest' },
  { id: 'crowd', icon: '👥', label: 'Crowded' },
  { id: 'lit', icon: '💡', label: 'Well Lit' },
  { id: 'fastest', icon: '⚡', label: 'Fastest' },
];

export const MODE_COLORS = {
  safe: '#00ff87',
  crowd: '#00c9ff',
  lit: '#ffaa00',
  fastest: '#a78bfa',
};
`;

  fs.writeFileSync(CONFIG_PATH, content, 'utf-8');

  console.log("✅ config.js updated with SAFE_PLACES");
}

run();