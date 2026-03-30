// ═══════════════════════════════════════════════════════════════════
// SafeTrace — config.js
// Dynamic safe places (Google Places API) + live hazard zones (NewsAPI)
// ═══════════════════════════════════════════════════════════════════

// ── API Keys ───────────────────────────────────────────────────────
// Replace with your actual keys
export const GOOGLE_API_KEY  = 'AIzaSyAUpUANI5PbpCYxbTaIwScHwiCYBQNYfNQ';
export const NEWSAPI_KEY     = 'e8d48558cb3e46a3a0944a80a1857cbc';

// ── Static fallback safe places — Chennai ──────────────────────────
// These are used as fallback when Google Places API is unavailable
export const STATIC_SAFE_PLACES = [
  // Police stations
  { id: 'ps-01', name: 'Adyar Police Station',          lat: 13.0012, lng: 80.2565, tags: ['police'] },
  { id: 'ps-02', name: 'Anna Nagar Police Station',     lat: 13.0850, lng: 80.2101, tags: ['police'] },
  { id: 'ps-03', name: 'T Nagar Police Station',        lat: 13.0418, lng: 80.2341, tags: ['police'] },
  { id: 'ps-04', name: 'Mylapore Police Station',       lat: 13.0368, lng: 80.2676, tags: ['police'] },
  { id: 'ps-05', name: 'Kodambakkam Police Station',    lat: 13.0519, lng: 80.2248, tags: ['police'] },
  { id: 'ps-06', name: 'Egmore Police Station',         lat: 13.0732, lng: 80.2609, tags: ['police'] },
  { id: 'ps-07', name: 'Tambaram Police Station',       lat: 12.9229, lng: 80.1275, tags: ['police'] },
  { id: 'ps-08', name: 'Velachery Police Station',      lat: 12.9815, lng: 80.2209, tags: ['police'] },
  { id: 'ps-09', name: 'Perambur Police Station',       lat: 13.1143, lng: 80.2452, tags: ['police'] },
  { id: 'ps-10', name: 'Nungambakkam Police Station',   lat: 13.0569, lng: 80.2425, tags: ['police'] },
  { id: 'ps-11', name: 'Sholinganallur Police Station', lat: 12.9010, lng: 80.2279, tags: ['police'] },
  { id: 'ps-12', name: 'Tondiarpet Police Station',     lat: 13.1213, lng: 80.2883, tags: ['police'] },
  { id: 'ps-13', name: 'Washermanpet Police Station',   lat: 13.1090, lng: 80.2904, tags: ['police'] },
  { id: 'ps-14', name: 'Guindy Police Station',         lat: 13.0067, lng: 80.2206, tags: ['police'] },
  { id: 'ps-15', name: 'Besant Nagar Police Station',   lat: 12.9990, lng: 80.2707, tags: ['police'] },

  // Hospitals
  { id: 'h-01', name: 'Government General Hospital',   lat: 13.0818, lng: 80.2791, tags: ['hospital'] },
  { id: 'h-02', name: 'Apollo Hospital - Greams Road', lat: 13.0623, lng: 80.2537, tags: ['hospital'] },
  { id: 'h-03', name: 'MIOT Hospital',                  lat: 13.0097, lng: 80.1847, tags: ['hospital'] },
  { id: 'h-04', name: 'Fortis Malar Hospital',          lat: 13.0041, lng: 80.2570, tags: ['hospital'] },
  { id: 'h-05', name: 'Vijaya Hospital',                lat: 13.0487, lng: 80.2123, tags: ['hospital'] },
  { id: 'h-06', name: 'Stanley Medical Hospital',       lat: 13.1088, lng: 80.2897, tags: ['hospital'] },
  { id: 'h-07', name: 'Kilpauk Medical College',        lat: 13.0843, lng: 80.2435, tags: ['hospital'] },
  { id: 'h-08', name: 'Rajiv Gandhi Govt Hospital',     lat: 13.0827, lng: 80.2711, tags: ['hospital'] },
  { id: 'h-09', name: 'Sri Ramachandra Hospital',       lat: 13.0397, lng: 80.1573, tags: ['hospital'] },
  { id: 'h-10', name: 'Gleneagles Global Health',       lat: 13.0765, lng: 80.2197, tags: ['hospital'] },

  // Schools / Colleges
  { id: 'sc-01', name: 'Loyola College',                lat: 13.0680, lng: 80.2398, tags: ['school'] },
  { id: 'sc-02', name: 'Presidency College',            lat: 13.0760, lng: 80.2788, tags: ['school'] },
  { id: 'sc-03', name: 'IIT Madras Main Gate',          lat: 12.9921, lng: 80.2337, tags: ['school'] },
  { id: 'sc-04', name: 'Anna University',               lat: 13.0101, lng: 80.2352, tags: ['school'] },
  { id: 'sc-05', name: 'Stella Maris College',          lat: 13.0597, lng: 80.2588, tags: ['school'] },
  { id: 'sc-06', name: "Women's Christian College",     lat: 13.0611, lng: 80.2639, tags: ['school'] },

  // Crowded public areas
  { id: 'cr-01', name: 'Chennai Central Station',       lat: 13.0827, lng: 80.2757, tags: ['crowd'] },
  { id: 'cr-02', name: 'Koyambedu Bus Terminal',        lat: 13.0701, lng: 80.1948, tags: ['crowd'] },
  { id: 'cr-03', name: 'T Nagar Panagal Park',          lat: 13.0409, lng: 80.2330, tags: ['crowd'] },
  { id: 'cr-04', name: 'Express Avenue Mall',           lat: 13.0596, lng: 80.2680, tags: ['crowd'] },
  { id: 'cr-05', name: 'Marina Beach Promenade',        lat: 13.0500, lng: 80.2824, tags: ['crowd'] },
  { id: 'cr-06', name: 'Spencer Plaza',                 lat: 13.0684, lng: 80.2691, tags: ['crowd'] },
  { id: 'cr-07', name: 'Vadapalani Bus Stop',           lat: 13.0504, lng: 80.2121, tags: ['crowd'] },
  { id: 'cr-08', name: 'Guindy Metro Station',          lat: 13.0095, lng: 80.2190, tags: ['crowd'] },
  { id: 'cr-09', name: 'Tambaram Railway Station',      lat: 12.9257, lng: 80.1270, tags: ['crowd'] },
  { id: 'cr-10', name: 'Perambur Railway Station',      lat: 13.1155, lng: 80.2445, tags: ['crowd'] },
  { id: 'cr-11', name: 'Phoenix MarketCity',            lat: 12.9914, lng: 80.2183, tags: ['crowd'] },
  { id: 'cr-12', name: 'Forum Vijaya Mall',             lat: 13.0411, lng: 80.2104, tags: ['crowd'] },
];

// ── Static unsafe zones (baseline) ────────────────────────────────
// These are always shown; NewsAPI zones get MERGED on top
export const STATIC_UNSAFE_ZONES = [
  {
    id: 'uz-01', lat: 13.0067, lng: 80.2206,
    type: 'isolated_flyover',       risk: 0.80, radius: 220,
    label: 'Guindy Flyover Underpass',
    note: 'Isolated underpass, poor lighting at night',
    source: 'static',
  },
  {
    id: 'uz-02', lat: 12.9800, lng: 80.2500,
    type: 'empty_it_corridor_night', risk: 0.70, radius: 350,
    label: 'OMR Empty IT Stretch',
    note: 'Deserted after office hours, limited foot traffic',
    source: 'static',
  },
  {
    id: 'uz-03', lat: 13.0700, lng: 80.2600,
    type: 'busy_junction',          risk: 0.60, radius: 180,
    label: 'Royapettah Busy Junction',
    note: 'High traffic chaos, reported harassment',
    source: 'static',
  },
  {
    id: 'uz-04', lat: 13.1020, lng: 80.2924,
    type: 'waterway_edge',          risk: 0.75, radius: 200,
    label: 'Buckingham Canal - Tondiarpet',
    note: 'No railing, poor lighting, isolated stretch',
    source: 'static',
  },
  {
    id: 'uz-05', lat: 13.0482, lng: 80.2791,
    type: 'isolated_beach_stretch', risk: 0.78, radius: 300,
    label: 'Marina North - Unlit Beach',
    note: 'Unlit northern stretch, isolated at night',
    source: 'static',
  },
  {
    id: 'uz-06', lat: 12.9753, lng: 80.2148,
    type: 'isolated_flyover',       risk: 0.72, radius: 180,
    label: 'Velachery Flyover Underbelly',
    note: 'Narrow passage under elevated expressway',
    source: 'static',
  },
  {
    id: 'uz-07', lat: 13.0910, lng: 80.1743,
    type: 'deserted_industrial',    risk: 0.82, radius: 280,
    label: 'Ambattur Old Industrial Estate',
    note: 'Abandoned mill sheds, poor visibility at night',
    source: 'static',
  },
  {
    id: 'uz-08', lat: 13.1342, lng: 80.2892,
    type: 'waterway_edge',          risk: 0.73, radius: 200,
    label: 'Ennore Creek Bank',
    note: 'Remote creek bank, no street lighting',
    source: 'static',
  },
  {
    id: 'uz-09', lat: 12.9524, lng: 80.1381,
    type: 'construction_zone',      risk: 0.68, radius: 240,
    label: 'Tambaram West - Construction Belt',
    note: 'Active construction, poor lighting after dusk',
    source: 'static',
  },
  {
    id: 'uz-10', lat: 13.0621, lng: 80.1681,
    type: 'waste_ground',           risk: 0.71, radius: 260,
    label: 'Maduravoyal Vacant Lots',
    note: 'Large vacant land parcels, minimal surveillance',
    source: 'static',
  },
  {
    id: 'uz-11', lat: 13.0212, lng: 80.2987,
    type: 'isolated_beach_stretch', risk: 0.76, radius: 300,
    label: 'Thiruvanmiyur Unlit Beach',
    note: 'Poorly lit beachfront south of ECR junction',
    source: 'static',
  },
  {
    id: 'uz-12', lat: 13.0839, lng: 80.2191,
    type: 'dark_alleyway',          risk: 0.69, radius: 140,
    label: 'Kilpauk Back Lanes',
    note: 'Narrow unlit residential lanes',
    source: 'static',
  },
  {
    id: 'uz-13', lat: 13.1178, lng: 80.2603,
    type: 'late_night_bus_stand',   risk: 0.65, radius: 150,
    label: 'Perambur Night Bus Shelter',
    note: 'Poorly lit stop, isolated after midnight',
    source: 'static',
  },
  {
    id: 'uz-14', lat: 12.9145, lng: 80.1952,
    type: 'empty_it_corridor_night', risk: 0.73, radius: 320,
    label: 'Sholinganallur Night Stretch',
    note: 'Empty OMR tech-park roads post-10 PM',
    source: 'static',
  },
  {
    id: 'uz-15', lat: 13.0029, lng: 80.1769,
    type: 'deserted_industrial',    risk: 0.77, radius: 300,
    label: 'Ramapuram Industrial Back Road',
    note: 'Godown lanes with no pedestrian lighting',
    source: 'static',
  },
  {
    id: 'uz-16', lat: 13.0943, lng: 80.2804,
    type: 'waterway_edge',          risk: 0.70, radius: 180,
    label: 'Cooum River - Perambur Stretch',
    note: 'Unguarded riverbank, poor street visibility',
    source: 'static',
  },
  {
    id: 'uz-17', lat: 13.0614, lng: 80.2902,
    type: 'dark_alleyway',          risk: 0.67, radius: 120,
    label: 'Royapuram Fish Market Alleys',
    note: 'Deserted narrow lanes after market hours',
    source: 'static',
  },
  {
    id: 'uz-18', lat: 12.9892, lng: 80.1586,
    type: 'construction_zone',      risk: 0.74, radius: 260,
    label: 'Porur Flyover Construction',
    note: 'Ongoing metro construction, dark detour lanes',
    source: 'static',
  },
  {
    id: 'uz-19', lat: 13.0375, lng: 80.2478,
    type: 'busy_junction',          risk: 0.62, radius: 170,
    label: 'Kodambakkam Junction',
    note: 'High congestion, harassment risk at night',
    source: 'static',
  },
  {
    id: 'uz-20', lat: 13.1254, lng: 80.2318,
    type: 'waste_ground',           risk: 0.72, radius: 240,
    label: 'Kolathur Vacant Ground',
    note: 'Undeveloped land, no lighting or surveillance',
    source: 'static',
  },
  {
    id: 'uz-21', lat: 12.9631, lng: 80.2393,
    type: 'isolated_flyover',       risk: 0.78, radius: 200,
    label: 'Medavakkam Flyover Underpass',
    note: 'Long isolated underpass with no lighting',
    source: 'static',
  },
  {
    id: 'uz-22', lat: 13.0752, lng: 80.1893,
    type: 'deserted_industrial',    risk: 0.80, radius: 290,
    label: 'Padi Industrial Area - Night',
    note: 'Old factory zone, deserted after 8 PM',
    source: 'static',
  },
  {
    id: 'uz-23', lat: 13.1467, lng: 80.2489,
    type: 'late_night_bus_stand',   risk: 0.63, radius: 140,
    label: 'Thiruvottiyur Night Bus Stop',
    note: 'Isolated shelter, minimal night-time foot traffic',
    source: 'static',
  },
  {
    id: 'uz-24', lat: 12.9301, lng: 80.2111,
    type: 'empty_it_corridor_night', risk: 0.69, radius: 300,
    label: 'Perungudi IT Park - Late Night',
    note: 'Deserted tech-park service road post-midnight',
    source: 'static',
  },
  {
    id: 'uz-25', lat: 13.0154, lng: 80.2634,
    type: 'dark_alleyway',          risk: 0.66, radius: 130,
    label: 'Adyar Market Back Lanes',
    note: 'Unlit service alley behind wholesale market',
    source: 'static',
  },
  {
    id: 'uz-26', lat: 13.0831, lng: 80.3007,
    type: 'waterway_edge',          risk: 0.71, radius: 180,
    label: 'Otteri Nullah - North Chennai',
    note: 'Open nullah edge, unlit and unguarded',
    source: 'static',
  },
  {
    id: 'uz-27', lat: 12.9458, lng: 80.1743,
    type: 'waste_ground',           risk: 0.74, radius: 250,
    label: 'Chitlapakkam Open Ground',
    note: 'Large unlit vacant area, isolated at night',
    source: 'static',
  },
  {
    id: 'uz-28', lat: 13.0697, lng: 80.3048,
    type: 'isolated_beach_stretch', risk: 0.80, radius: 320,
    label: 'Foreshore Estate Beach',
    note: 'Remote northern beach, no lighting or patrols',
    source: 'static',
  },
  {
    id: 'uz-29', lat: 13.0253, lng: 80.1984,
    type: 'construction_zone',      risk: 0.70, radius: 220,
    label: 'Alandur Metro Construction Zone',
    note: 'Dark detour around active construction',
    source: 'static',
  },
  {
    id: 'uz-30', lat: 13.1379, lng: 80.2714,
    type: 'deserted_industrial',    risk: 0.76, radius: 270,
    label: 'Manali Industrial Estate',
    note: 'Chemical & refinery back roads, isolated at night',
    source: 'static',
  },
  {
    id: 'uz-31', lat: 13.0489, lng: 80.2048,
    type: 'dark_alleyway',          risk: 0.64, radius: 130,
    label: 'Vadapalani Back Streets',
    note: 'Narrow temple-area lanes, unlit after 10 PM',
    source: 'static',
  },
  {
    id: 'uz-32', lat: 12.9720, lng: 80.1916,
    type: 'isolated_flyover',       risk: 0.75, radius: 190,
    label: 'Pallavaram Flyover Underpass',
    note: 'Dimly lit underpass near burial ground',
    source: 'static',
  },
  {
    id: 'uz-33', lat: 13.0907, lng: 80.2485,
    type: 'busy_junction',          risk: 0.61, radius: 160,
    label: 'Ayanavaram Bus Junction',
    note: 'Chaotic junction, crowding and harassment risk',
    source: 'static',
  },
];

// ── Google Places type → SafeTrace tag mapping ─────────────────────
const PLACE_TYPE_TO_TAG = {
  police:              'police',
  hospital:            'hospital',
  university:          'school',
  school:              'school',
  shopping_mall:       'crowd',
  transit_station:     'crowd',
  train_station:       'crowd',
  bus_station:         'crowd',
  subway_station:      'crowd',
};

// ── Google Places Nearby Search ────────────────────────────────────
// Fetches real-time safe places around a lat/lng using Places API
// Returns array in SAFE_PLACES format
//
// Search types: police, hospital, university, shopping_mall, train_station
export async function fetchNearbyPlaces(lat, lng, apiKey) {
  const searchTypes = [
    { type: 'police',         tag: 'police',   radius: 5000 },
    { type: 'hospital',       tag: 'hospital', radius: 5000 },
    { type: 'university',     tag: 'school',   radius: 5000 },
    { type: 'shopping_mall',  tag: 'crowd',    radius: 5000 },
    { type: 'train_station',  tag: 'crowd',    radius: 5000 },
  ];

  const allPlaces = [];
  const seenIds   = new Set();

  const requests = searchTypes.map(async ({ type, tag, radius }) => {
    try {
      const url =
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json` +
        `?location=${lat},${lng}` +
        `&radius=${radius}` +
        `&type=${type}` +
        `&key=${apiKey}`;

      const res  = await fetch(url);
      const data = await res.json();

      if (data.status === 'OK' && data.results) {
        for (const place of data.results) {
          const pid = place.place_id;
          if (seenIds.has(pid)) continue;
          seenIds.add(pid);

          allPlaces.push({
            id:   `gp-${pid}`,
            name: place.name,
            lat:  place.geometry.location.lat,
            lng:  place.geometry.location.lng,
            tags: [tag],
            source: 'google',
            rating: place.rating || null,
            vicinity: place.vicinity || '',
            openNow: place.opening_hours?.open_now ?? null,
          });
        }
      }
    } catch (err) {
      console.warn(`[SafeTrace] Google Places fetch failed for type="${type}":`, err);
    }
  });

  await Promise.allSettled(requests);
  return allPlaces;
}

// ── NewsAPI hazard zone fetcher ────────────────────────────────────
// Searches for recent safety-related news in the city area
// and converts articles into dynamic hazard zone entries.
//
// Keywords: crime, accident, flood, fire, assault, robbery, etc.
// Each article with a recognized Chennai locality gets mapped to
// a lat/lng and added as a live hazard zone.
//
// Note: NewsAPI free tier returns articles up to ~30 days old.
// ───────────────────────────────────────────────────────────────────

// Known Chennai locality coordinates for geocoding news headlines
const CHENNAI_LOCALITIES = {
  'anna nagar':      { lat: 13.0850, lng: 80.2101 },
  't nagar':         { lat: 13.0418, lng: 80.2341 },
  't. nagar':        { lat: 13.0418, lng: 80.2341 },
  'tnagar':          { lat: 13.0418, lng: 80.2341 },
  'adyar':           { lat: 13.0012, lng: 80.2565 },
  'mylapore':        { lat: 13.0368, lng: 80.2676 },
  'velachery':       { lat: 12.9815, lng: 80.2209 },
  'tambaram':        { lat: 12.9229, lng: 80.1275 },
  'guindy':          { lat: 13.0067, lng: 80.2206 },
  'egmore':          { lat: 13.0732, lng: 80.2609 },
  'nungambakkam':    { lat: 13.0569, lng: 80.2425 },
  'kodambakkam':     { lat: 13.0519, lng: 80.2248 },
  'royapettah':      { lat: 13.0596, lng: 80.2616 },
  'perambur':        { lat: 13.1143, lng: 80.2452 },
  'tondiarpet':      { lat: 13.1213, lng: 80.2883 },
  'washermanpet':    { lat: 13.1090, lng: 80.2904 },
  'sholinganallur':  { lat: 12.9010, lng: 80.2279 },
  'omr':             { lat: 12.9600, lng: 80.2400 },
  'ecr':             { lat: 12.9700, lng: 80.2600 },
  'marina':          { lat: 13.0500, lng: 80.2824 },
  'besant nagar':    { lat: 12.9990, lng: 80.2707 },
  'thiruvanmiyur':   { lat: 13.0212, lng: 80.2987 },
  'chromepet':       { lat: 12.9516, lng: 80.1462 },
  'pallavaram':      { lat: 12.9720, lng: 80.1916 },
  'porur':           { lat: 12.9892, lng: 80.1586 },
  'vadapalani':      { lat: 13.0504, lng: 80.2121 },
  'koyambedu':       { lat: 13.0701, lng: 80.1948 },
  'ambattur':        { lat: 13.0910, lng: 80.1743 },
  'avadi':           { lat: 13.1145, lng: 80.1098 },
  'kilpauk':         { lat: 13.0843, lng: 80.2435 },
  'royapuram':       { lat: 13.0614, lng: 80.2902 },
  'ennore':          { lat: 13.1342, lng: 80.2892 },
  'manali':          { lat: 13.1379, lng: 80.2714 },
  'kolathur':        { lat: 13.1254, lng: 80.2318 },
  'medavakkam':      { lat: 12.9631, lng: 80.2393 },
  'madipakkam':      { lat: 12.9631, lng: 80.2100 },
  'perungudi':       { lat: 12.9301, lng: 80.2111 },
  'padi':            { lat: 13.0752, lng: 80.1893 },
  'alandur':         { lat: 13.0253, lng: 80.1984 },
  'saidapet':        { lat: 13.0236, lng: 80.2279 },
  'ashok nagar':     { lat: 13.0365, lng: 80.2132 },
  'teynampet':       { lat: 13.0474, lng: 80.2540 },
  'george town':     { lat: 13.0870, lng: 80.2850 },
  'parrys':          { lat: 13.0870, lng: 80.2850 },
  'purasawalkam':    { lat: 13.0880, lng: 80.2560 },
  'chetpet':         { lat: 13.0740, lng: 80.2400 },
  'anna salai':      { lat: 13.0600, lng: 80.2650 },
  'mount road':      { lat: 13.0600, lng: 80.2650 },
  'luz':             { lat: 13.0340, lng: 80.2680 },
  'mandaveli':       { lat: 13.0290, lng: 80.2660 },
  'kotturpuram':     { lat: 13.0150, lng: 80.2450 },
  'thiruvottiyur':   { lat: 13.1467, lng: 80.2489 },
  'madhavaram':      { lat: 13.1520, lng: 80.2330 },
  'mogappair':       { lat: 13.0870, lng: 80.1750 },
  'valasaravakkam':  { lat: 13.0450, lng: 80.1720 },
  'ramapuram':       { lat: 13.0310, lng: 80.1780 },
  'manapakkam':      { lat: 13.0100, lng: 80.1680 },
  'nandanam':        { lat: 13.0300, lng: 80.2430 },
  'teynampet':       { lat: 13.0474, lng: 80.2540 },
  'thousand lights':  { lat: 13.0560, lng: 80.2600 },
  'triplicane':      { lat: 13.0586, lng: 80.2750 },
  'ice house':       { lat: 13.0560, lng: 80.2780 },
  'chepauk':         { lat: 13.0640, lng: 80.2800 },
  'chintadripet':    { lat: 13.0720, lng: 80.2700 },
};

// Hazard keyword patterns and their type/risk mappings
const HAZARD_KEYWORDS = [
  { pattern: /murder|homicide|kill/i,                  type: 'crime_violent',     risk: 0.92 },
  { pattern: /assault|attack|stab|shoot/i,             type: 'crime_violent',     risk: 0.88 },
  { pattern: /robbery|loot|snatch|theft|burglary/i,    type: 'crime_property',    risk: 0.78 },
  { pattern: /rape|sexual|molest|harass/i,             type: 'crime_sexual',      risk: 0.90 },
  { pattern: /accident|crash|collision|hit.and.run/i,  type: 'road_accident',     risk: 0.75 },
  { pattern: /flood|waterlog|inundat/i,                type: 'flood',             risk: 0.80 },
  { pattern: /fire|blaze|burn/i,                       type: 'fire',              risk: 0.82 },
  { pattern: /protest|riot|agitation|bandh/i,          type: 'civil_unrest',      risk: 0.70 },
  { pattern: /kidnap|abduct|missing/i,                 type: 'crime_kidnap',      risk: 0.85 },
  { pattern: /drug|narcotic|smuggl/i,                  type: 'crime_drugs',       risk: 0.72 },
  { pattern: /electrocution|electric|shock/i,          type: 'infrastructure',    risk: 0.78 },
  { pattern: /collapse|cave.in|sinkhole/i,             type: 'infrastructure',    risk: 0.80 },
  { pattern: /drown|river|canal|water.body/i,          type: 'waterway_edge',     risk: 0.76 },
  { pattern: /chain.snatch|pickpocket/i,               type: 'crime_property',    risk: 0.74 },
];

// News hazard type icons (extend the static TYPE_ICON map)
export const NEWS_TYPE_ICON = {
  crime_violent:    '🔪',
  crime_property:   '💰',
  crime_sexual:     '🚨',
  road_accident:    '🚗',
  flood:            '🌊',
  fire:             '🔥',
  civil_unrest:     '📢',
  crime_kidnap:     '🚨',
  crime_drugs:      '💊',
  infrastructure:   '⚡',
  waterway_edge:    '💧',
  news_general:     '📰',
};

export async function fetchNewsHazards(newsApiKey, city = 'Chennai') {
  const zones = [];

  try {
    // Search for safety-related news in the city
    const queries = [
      `${city} crime`,
      `${city} accident`,
      `${city} flood fire`,
    ];

    const allArticles = [];

    for (const q of queries) {
      try {
        const url =
          `https://newsapi.org/v2/everything` +
          `?q=${encodeURIComponent(q)}` +
          `&language=en` +
          `&sortBy=publishedAt` +
          `&pageSize=15` +
          `&apiKey=${newsApiKey}`;

        const res  = await fetch(url);
        const data = await res.json();

        if (data.status === 'ok' && data.articles) {
          allArticles.push(...data.articles);
        }
      } catch (err) {
        console.warn(`[SafeTrace] NewsAPI query failed for "${q}":`, err);
      }
    }

    // Deduplicate by URL
    const seen = new Set();
    const unique = allArticles.filter(a => {
      if (!a.url || seen.has(a.url)) return false;
      seen.add(a.url);
      return true;
    });

    // Process each article
    for (const article of unique) {
      const text = `${article.title || ''} ${article.description || ''}`.toLowerCase();

      // Find matching locality
      let matchedLocality = null;
      let matchedCoords   = null;

      for (const [locality, coords] of Object.entries(CHENNAI_LOCALITIES)) {
        if (text.includes(locality)) {
          matchedLocality = locality;
          matchedCoords   = coords;
          break;
        }
      }

      if (!matchedCoords) continue; // Skip if we can't geolocate the article

      // Determine hazard type from keywords
      let hazardType = 'news_general';
      let hazardRisk = 0.65;

      for (const { pattern, type, risk } of HAZARD_KEYWORDS) {
        if (pattern.test(text)) {
          hazardType = type;
          hazardRisk = risk;
          break;
        }
      }

      // Add slight random offset so overlapping zones don't stack perfectly
      const jitterLat = (Math.random() - 0.5) * 0.003;
      const jitterLng = (Math.random() - 0.5) * 0.003;

      // Compute how recent the article is (boost risk for very recent news)
      const ageHours = (Date.now() - new Date(article.publishedAt).getTime()) / (1000 * 60 * 60);
      const recencyBoost = ageHours < 24 ? 0.08 : ageHours < 72 ? 0.04 : 0;
      const finalRisk = Math.min(0.98, hazardRisk + recencyBoost);

      zones.push({
        id:     `nz-${zones.length + 1}`,
        lat:    matchedCoords.lat + jitterLat,
        lng:    matchedCoords.lng + jitterLng,
        type:   hazardType,
        risk:   parseFloat(finalRisk.toFixed(2)),
        radius: 250,
        label:  (article.title || 'News Alert').slice(0, 80),
        note:   (article.description || '').slice(0, 120) || `Reported near ${matchedLocality}`,
        source: 'newsapi',
        publishedAt: article.publishedAt,
        articleUrl:   article.url,
      });
    }
  } catch (err) {
    console.warn('[SafeTrace] NewsAPI fetch failed entirely:', err);
  }

  return zones;
}

// ── Risk colour helpers ────────────────────────────────────────────
export function riskColor(risk) {
  if (risk >= 0.75) return '#ff2d55';   // high   - red
  if (risk >= 0.60) return '#ff9500';   // medium - amber
  return '#ffcc00';                      // low    - yellow
}

export function riskLabel(risk) {
  if (risk >= 0.75) return 'HIGH';
  if (risk >= 0.60) return 'MEDIUM';
  return 'LOW';
}

// Combined type icon map (static + news types)
export const TYPE_ICON = {
  isolated_flyover:        '🌉',
  empty_it_corridor_night: '🏢',
  busy_junction:           '⚠️',
  isolated_beach_stretch:  '🌊',
  dark_alleyway:           '🚷',
  construction_zone:       '🚧',
  waterway_edge:           '💧',
  waste_ground:            '⛔',
  late_night_bus_stand:    '🚌',
  deserted_industrial:     '🏭',
  // News-derived types
  crime_violent:           '🔪',
  crime_property:          '💰',
  crime_sexual:            '🚨',
  road_accident:           '🚗',
  flood:                   '🌊',
  fire:                    '🔥',
  civil_unrest:            '📢',
  crime_kidnap:            '🚨',
  crime_drugs:             '💊',
  infrastructure:          '⚡',
  news_general:            '📰',
};
