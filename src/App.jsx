import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

// ═══════════════════════════════════════════════════════════════════
// SAFETRACE v2 — Phone-Frame Mobile Safety App
// ═══════════════════════════════════════════════════════════════════

// ── API Keys ─────────────────────────────────────────────────────
const GOOGLE_API_KEY = 'AIzaSyCA0T4ya5yS9k-NeiHPXZvMKyLBnNz9-3U';
const NEWSAPI_KEY = 'e8d48558cb3e46a3a0944a80a1857cbc';

// ── Data helpers ─────────────────────────────────────────────────
function riskColor(r){return r>=0.75?'#ff2d55':r>=0.60?'#ff9500':'#ffcc00';}
const TAG_COLOR={police:'#38bdf8',hospital:'#34d399',school:'#fbbf24',crowd:'#c084fc'};
const TAG_ICON={police:'🚔',hospital:'🏥',school:'🏫',crowd:'🏬'};
const TAG_LABEL={police:'Police',hospital:'Hospital',school:'School',crowd:'Public Area'};

const STATIC_SAFE_PLACES=[
  {id:'ps-01',name:'Adyar Police Station',lat:13.0012,lng:80.2565,tags:['police']},
  {id:'ps-02',name:'Anna Nagar Police Station',lat:13.0850,lng:80.2101,tags:['police']},
  {id:'ps-03',name:'T Nagar Police Station',lat:13.0418,lng:80.2341,tags:['police']},
  {id:'ps-04',name:'Mylapore Police Station',lat:13.0368,lng:80.2676,tags:['police']},
  {id:'ps-05',name:'Kodambakkam Police Station',lat:13.0519,lng:80.2248,tags:['police']},
  {id:'ps-06',name:'Egmore Police Station',lat:13.0732,lng:80.2609,tags:['police']},
  {id:'ps-07',name:'Tambaram Police Station',lat:12.9229,lng:80.1275,tags:['police']},
  {id:'ps-08',name:'Velachery Police Station',lat:12.9815,lng:80.2209,tags:['police']},
  {id:'ps-09',name:'Perambur Police Station',lat:13.1143,lng:80.2452,tags:['police']},
  {id:'ps-10',name:'Nungambakkam Police Station',lat:13.0569,lng:80.2425,tags:['police']},
  {id:'ps-11',name:'Sholinganallur Police Station',lat:12.9010,lng:80.2279,tags:['police']},
  {id:'ps-12',name:'Tondiarpet Police Station',lat:13.1213,lng:80.2883,tags:['police']},
  {id:'ps-13',name:'Washermanpet Police Station',lat:13.1090,lng:80.2904,tags:['police']},
  {id:'ps-14',name:'Guindy Police Station',lat:13.0067,lng:80.2206,tags:['police']},
  {id:'ps-15',name:'Besant Nagar Police Station',lat:12.9990,lng:80.2707,tags:['police']},
  {id:'h-01',name:'Government General Hospital',lat:13.0818,lng:80.2791,tags:['hospital']},
  {id:'h-02',name:'Apollo Hospital - Greams Road',lat:13.0623,lng:80.2537,tags:['hospital']},
  {id:'h-03',name:'MIOT Hospital',lat:13.0097,lng:80.1847,tags:['hospital']},
  {id:'h-04',name:'Fortis Malar Hospital',lat:13.0041,lng:80.2570,tags:['hospital']},
  {id:'h-05',name:'Vijaya Hospital',lat:13.0487,lng:80.2123,tags:['hospital']},
  {id:'h-06',name:'Stanley Medical Hospital',lat:13.1088,lng:80.2897,tags:['hospital']},
  {id:'h-07',name:'Kilpauk Medical College',lat:13.0843,lng:80.2435,tags:['hospital']},
  {id:'h-08',name:'Rajiv Gandhi Govt Hospital',lat:13.0827,lng:80.2711,tags:['hospital']},
  {id:'h-09',name:'Sri Ramachandra Hospital',lat:13.0397,lng:80.1573,tags:['hospital']},
  {id:'h-10',name:'Gleneagles Global Health',lat:13.0765,lng:80.2197,tags:['hospital']},
  {id:'sc-01',name:'Loyola College',lat:13.0680,lng:80.2398,tags:['school']},
  {id:'sc-02',name:'Presidency College',lat:13.0760,lng:80.2788,tags:['school']},
  {id:'sc-03',name:'IIT Madras Main Gate',lat:12.9921,lng:80.2337,tags:['school']},
  {id:'sc-04',name:'Anna University',lat:13.0101,lng:80.2352,tags:['school']},
  {id:'sc-05',name:'Stella Maris College',lat:13.0597,lng:80.2588,tags:['school']},
  {id:'sc-06',name:"Women's Christian College",lat:13.0611,lng:80.2639,tags:['school']},
  {id:'cr-01',name:'Chennai Central Station',lat:13.0827,lng:80.2757,tags:['crowd']},
  {id:'cr-02',name:'Koyambedu Bus Terminal',lat:13.0701,lng:80.1948,tags:['crowd']},
  {id:'cr-03',name:'T Nagar Panagal Park',lat:13.0409,lng:80.2330,tags:['crowd']},
  {id:'cr-04',name:'Express Avenue Mall',lat:13.0596,lng:80.2680,tags:['crowd']},
  {id:'cr-05',name:'Marina Beach Promenade',lat:13.0500,lng:80.2824,tags:['crowd']},
  {id:'cr-06',name:'Spencer Plaza',lat:13.0684,lng:80.2691,tags:['crowd']},
  {id:'cr-07',name:'Vadapalani Bus Stop',lat:13.0504,lng:80.2121,tags:['crowd']},
  {id:'cr-08',name:'Guindy Metro Station',lat:13.0095,lng:80.2190,tags:['crowd']},
  {id:'cr-09',name:'Tambaram Railway Station',lat:12.9257,lng:80.1270,tags:['crowd']},
  {id:'cr-10',name:'Perambur Railway Station',lat:13.1155,lng:80.2445,tags:['crowd']},
  {id:'cr-11',name:'Phoenix MarketCity',lat:12.9914,lng:80.2183,tags:['crowd']},
  {id:'cr-12',name:'Forum Vijaya Mall',lat:13.0411,lng:80.2104,tags:['crowd']},
];

const STATIC_UNSAFE_ZONES=[
  {id:'uz-01',lat:13.0067,lng:80.2206,type:'isolated_flyover',risk:0.80,radius:220,label:'Guindy Flyover Underpass',note:'Isolated underpass, poor lighting at night',source:'static'},
  {id:'uz-02',lat:12.9800,lng:80.2500,type:'empty_it_corridor_night',risk:0.70,radius:350,label:'OMR Empty IT Stretch',note:'Deserted after office hours',source:'static'},
  {id:'uz-03',lat:13.0700,lng:80.2600,type:'busy_junction',risk:0.60,radius:180,label:'Royapettah Busy Junction',note:'High traffic chaos',source:'static'},
  {id:'uz-04',lat:13.1020,lng:80.2924,type:'waterway_edge',risk:0.75,radius:200,label:'Buckingham Canal - Tondiarpet',note:'No railing, poor lighting',source:'static'},
  {id:'uz-05',lat:13.0482,lng:80.2791,type:'isolated_beach_stretch',risk:0.78,radius:300,label:'Marina North - Unlit Beach',note:'Unlit northern stretch',source:'static'},
  {id:'uz-06',lat:12.9753,lng:80.2148,type:'isolated_flyover',risk:0.72,radius:180,label:'Velachery Flyover Underbelly',note:'Narrow passage under expressway',source:'static'},
  {id:'uz-07',lat:13.0910,lng:80.1743,type:'deserted_industrial',risk:0.82,radius:280,label:'Ambattur Old Industrial Estate',note:'Abandoned mill sheds',source:'static'},
  {id:'uz-08',lat:13.1342,lng:80.2892,type:'waterway_edge',risk:0.73,radius:200,label:'Ennore Creek Bank',note:'Remote creek bank',source:'static'},
  {id:'uz-09',lat:12.9524,lng:80.1381,type:'construction_zone',risk:0.68,radius:240,label:'Tambaram West Construction',note:'Poor lighting after dusk',source:'static'},
  {id:'uz-10',lat:13.0621,lng:80.1681,type:'waste_ground',risk:0.71,radius:260,label:'Maduravoyal Vacant Lots',note:'Minimal surveillance',source:'static'},
  {id:'uz-11',lat:13.0212,lng:80.2987,type:'isolated_beach_stretch',risk:0.76,radius:300,label:'Thiruvanmiyur Unlit Beach',note:'Poorly lit beachfront',source:'static'},
  {id:'uz-12',lat:13.0839,lng:80.2191,type:'dark_alleyway',risk:0.69,radius:140,label:'Kilpauk Back Lanes',note:'Narrow unlit lanes',source:'static'},
  {id:'uz-13',lat:13.1178,lng:80.2603,type:'late_night_bus_stand',risk:0.65,radius:150,label:'Perambur Night Bus Shelter',note:'Isolated after midnight',source:'static'},
  {id:'uz-14',lat:12.9145,lng:80.1952,type:'empty_it_corridor_night',risk:0.73,radius:320,label:'Sholinganallur Night Stretch',note:'Empty post-10 PM',source:'static'},
  {id:'uz-15',lat:13.0029,lng:80.1769,type:'deserted_industrial',risk:0.77,radius:300,label:'Ramapuram Industrial Back Road',note:'No pedestrian lighting',source:'static'},
  // ── Additional crime-prone zones for heatmap density ──
  {id:'uz-16',lat:13.0943,lng:80.2804,type:'waterway_edge',risk:0.70,radius:180,label:'Cooum River - Perambur',note:'Unguarded riverbank',source:'static'},
  {id:'uz-17',lat:13.0614,lng:80.2902,type:'dark_alleyway',risk:0.67,radius:120,label:'Royapuram Fish Market Alleys',note:'Deserted after market hours',source:'static'},
  {id:'uz-18',lat:12.9892,lng:80.1586,type:'construction_zone',risk:0.74,radius:260,label:'Porur Flyover Construction',note:'Dark detour lanes at night',source:'static'},
  {id:'uz-19',lat:13.0375,lng:80.2478,type:'busy_junction',risk:0.62,radius:170,label:'Kodambakkam Junction',note:'Night-time harassment risk',source:'static'},
  {id:'uz-20',lat:13.1254,lng:80.2318,type:'waste_ground',risk:0.72,radius:240,label:'Kolathur Vacant Ground',note:'No lighting or surveillance',source:'static'},
  {id:'uz-21',lat:12.9631,lng:80.2393,type:'isolated_flyover',risk:0.78,radius:200,label:'Medavakkam Flyover Underpass',note:'Long isolated underpass',source:'static'},
  {id:'uz-22',lat:13.0752,lng:80.1893,type:'deserted_industrial',risk:0.80,radius:290,label:'Padi Industrial Area',note:'Deserted after 8 PM',source:'static'},
  {id:'uz-23',lat:13.1467,lng:80.2489,type:'late_night_bus_stand',risk:0.63,radius:140,label:'Thiruvottiyur Night Bus Stop',note:'Minimal foot traffic',source:'static'},
  {id:'uz-24',lat:12.9301,lng:80.2111,type:'empty_it_corridor_night',risk:0.69,radius:300,label:'Perungudi IT Park Late Night',note:'Deserted service road',source:'static'},
  {id:'uz-25',lat:13.0154,lng:80.2634,type:'dark_alleyway',risk:0.66,radius:130,label:'Adyar Market Back Lanes',note:'Unlit service alleys',source:'static'},
  {id:'uz-26',lat:13.0831,lng:80.3007,type:'waterway_edge',risk:0.71,radius:180,label:'Otteri Nullah - North Chennai',note:'Open nullah, unlit',source:'static'},
  {id:'uz-27',lat:12.9458,lng:80.1743,type:'waste_ground',risk:0.74,radius:250,label:'Chitlapakkam Open Ground',note:'Unlit vacant area',source:'static'},
  {id:'uz-28',lat:13.0697,lng:80.3048,type:'isolated_beach_stretch',risk:0.80,radius:320,label:'Foreshore Estate Beach',note:'No lighting or patrols',source:'static'},
  {id:'uz-29',lat:13.0253,lng:80.1984,type:'construction_zone',risk:0.70,radius:220,label:'Alandur Metro Construction',note:'Dark detour around site',source:'static'},
  {id:'uz-30',lat:13.1379,lng:80.2714,type:'deserted_industrial',risk:0.76,radius:270,label:'Manali Industrial Estate',note:'Isolated refinery roads',source:'static'},
  {id:'uz-31',lat:13.0489,lng:80.2048,type:'dark_alleyway',risk:0.64,radius:130,label:'Vadapalani Back Streets',note:'Unlit after 10 PM',source:'static'},
  {id:'uz-32',lat:12.9720,lng:80.1916,type:'isolated_flyover',risk:0.75,radius:190,label:'Pallavaram Flyover Underpass',note:'Dimly lit near burial ground',source:'static'},
  {id:'uz-33',lat:13.0907,lng:80.2485,type:'busy_junction',risk:0.61,radius:160,label:'Ayanavaram Bus Junction',note:'Chaotic, harassment risk',source:'static'},
];

const CHENNAI_LOCALITIES={'anna nagar':{lat:13.0850,lng:80.2101},'t nagar':{lat:13.0418,lng:80.2341},'adyar':{lat:13.0012,lng:80.2565},'mylapore':{lat:13.0368,lng:80.2676},'velachery':{lat:12.9815,lng:80.2209},'tambaram':{lat:12.9229,lng:80.1275},'guindy':{lat:13.0067,lng:80.2206},'egmore':{lat:13.0732,lng:80.2609},'nungambakkam':{lat:13.0569,lng:80.2425},'kodambakkam':{lat:13.0519,lng:80.2248},'royapettah':{lat:13.0596,lng:80.2616},'perambur':{lat:13.1143,lng:80.2452},'tondiarpet':{lat:13.1213,lng:80.2883},'omr':{lat:12.9600,lng:80.2400},'marina':{lat:13.0500,lng:80.2824},'besant nagar':{lat:12.9990,lng:80.2707}};
const HAZARD_KEYWORDS=[{pattern:/murder|homicide|kill/i,type:'crime_violent',risk:0.92},{pattern:/assault|attack|stab|shoot/i,type:'crime_violent',risk:0.88},{pattern:/robbery|loot|snatch|theft|burglary/i,type:'crime_property',risk:0.78},{pattern:/rape|sexual|molest|harass/i,type:'crime_sexual',risk:0.90},{pattern:/accident|crash|collision|hit.and.run/i,type:'road_accident',risk:0.75},{pattern:/flood|waterlog|inundat/i,type:'flood',risk:0.80},{pattern:/fire|blaze|burn/i,type:'fire',risk:0.82},{pattern:/protest|riot|agitation|bandh/i,type:'civil_unrest',risk:0.70}];

async function fetchNearbyPlaces(lat,lng,apiKey){const types=[{type:'police',tag:'police',radius:5000},{type:'hospital',tag:'hospital',radius:5000},{type:'university',tag:'school',radius:5000},{type:'shopping_mall',tag:'crowd',radius:5000},{type:'train_station',tag:'crowd',radius:5000}];const all=[],seen=new Set();await Promise.allSettled(types.map(async({type,tag,radius})=>{try{const data=await fetch(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${type}&key=${apiKey}`).then(r=>r.json());if(data.status==='OK'&&data.results)for(const p of data.results){if(seen.has(p.place_id))continue;seen.add(p.place_id);all.push({id:`gp-${p.place_id}`,name:p.name,lat:p.geometry.location.lat,lng:p.geometry.location.lng,tags:[tag],source:'google',rating:p.rating||null,vicinity:p.vicinity||'',openNow:p.opening_hours?.open_now??null});}}catch(e){}}));return all;}

async function fetchNewsHazards(newsApiKey,city='Chennai'){const zones=[];try{const queries=[`${city} crime`,`${city} accident`,`${city} flood fire`];const allA=[];for(const q of queries){try{const data=await fetch(`https://newsapi.org/v2/everything?q=${encodeURIComponent(q)}&language=en&sortBy=publishedAt&pageSize=15&apiKey=${newsApiKey}`).then(r=>r.json());if(data.status==='ok'&&data.articles)allA.push(...data.articles);}catch(e){}}const seen=new Set();const unique=allA.filter(a=>{if(!a.url||seen.has(a.url))return false;seen.add(a.url);return true;});for(const article of unique){const text=`${article.title||''} ${article.description||''}`.toLowerCase();let ml=null,mc=null;for(const[l,c] of Object.entries(CHENNAI_LOCALITIES)){if(text.includes(l)){ml=l;mc=c;break;}}if(!mc)continue;let ht='news_general',hr=0.65;for(const{pattern,type,risk} of HAZARD_KEYWORDS){if(pattern.test(text)){ht=type;hr=risk;break;}}const jL=(Math.random()-0.5)*0.003,jN=(Math.random()-0.5)*0.003,aH=(Date.now()-new Date(article.publishedAt).getTime())/(36e5),b=aH<24?0.08:aH<72?0.04:0;zones.push({id:`nz-${zones.length+1}`,lat:mc.lat+jL,lng:mc.lng+jN,type:ht,risk:parseFloat(Math.min(0.98,hr+b).toFixed(2)),radius:250,label:(article.title||'News Alert').slice(0,80),note:(article.description||'').slice(0,120)||`Reported near ${ml}`,source:'newsapi',publishedAt:article.publishedAt});}}catch(e){}return zones;}

function haversine(a,b){const R=6371000,dLat=(b.lat-a.lat)*Math.PI/180,dLng=(b.lng-a.lng)*Math.PI/180;const x=Math.sin(dLat/2)**2+Math.cos(a.lat*Math.PI/180)*Math.cos(b.lat*Math.PI/180)*Math.sin(dLng/2)**2;return R*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x));}
function decodePolyline(e){let i=0,lat=0,lng=0;const o=[];while(i<e.length){let b,s=0,r=0;do{b=e.charCodeAt(i++)-63;r|=(b&0x1f)<<s;s+=5;}while(b>=0x20);lat+=r&1?~(r>>1):r>>1;s=0;r=0;do{b=e.charCodeAt(i++)-63;r|=(b&0x1f)<<s;s+=5;}while(b>=0x20);lng+=r&1?~(r>>1):r>>1;o.push([lat/1e5,lng/1e5]);}return o;}
function stripHTML(h){return h.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();}
function buildOSRMInstruction(s){const t=s.maneuver?.type||'',m=s.maneuver?.modifier||'',n=s.name?` on ${s.name}`:'',d=s.distance>0?` for ${Math.round(s.distance)} m`:'';const v={depart:`Head ${m}${n}`,arrive:'Arrive at your destination',turn:`Turn ${m}${n}`,'new name':`Continue${n}`,continue:`Continue straight${n}`,merge:`Merge ${m}${n}`,'on ramp':`Take ramp ${m}${n}`,'off ramp':`Take exit ${m}${n}`,fork:`Keep ${m} at fork${n}`,roundabout:`At roundabout, take exit${n}`,rotary:`At rotary, take exit${n}`,'end of road':`End of road, turn ${m}${n}`,notification:`Continue${n}`};return(v[t]||`Continue${n}`)+d;}
async function fetchRoute(start,end){try{const data=await fetch(`https://maps.googleapis.com/maps/api/directions/json?origin=${start.lat},${start.lng}&destination=${end.lat},${end.lng}&mode=walking&key=${GOOGLE_API_KEY}`).then(r=>r.json());if(data.status==='OK'){const leg=data.routes[0].legs[0];const steps=leg.steps.map(s=>({instruction:stripHTML(s.html_instructions),distance:s.distance.text,distanceM:s.distance.value,maneuver:s.maneuver||'',coords:decodePolyline(s.polyline.points)}));return{allCoords:steps.flatMap(s=>s.coords),steps,totalDist:leg.distance.text,totalTime:leg.duration.text};}}catch(_){}try{const data=await fetch(`https://router.project-osrm.org/route/v1/foot/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson&steps=true&annotations=false`).then(r=>r.json());if(data.code==='Ok'){const route=data.routes[0],leg=route.legs[0];const steps=leg.steps.filter(s=>s.maneuver?.type!=='depart'||leg.steps.indexOf(s)===0).map(s=>{const raw=s.geometry?.coordinates||[];return{instruction:buildOSRMInstruction(s),distance:`${Math.round(s.distance)} m`,distanceM:s.distance,maneuver:s.maneuver?.modifier||s.maneuver?.type||'',coords:raw.length?raw.map(([ln,la])=>[la,ln]):[]};});return{allCoords:route.geometry.coordinates.map(([ln,la])=>[la,ln]),steps,totalDist:`${(route.distance/1000).toFixed(2)} km`,totalTime:`${Math.ceil(route.duration/60)} min`};}}catch(_){}return null;}
function fmDist(m){return m>=1000?`${(m/1000).toFixed(1)} km`:`${Math.round(m)} m`;}
function fmWalk(m){const mins=Math.ceil(m/80);return mins<60?`${mins} min`:`${Math.floor(mins/60)}h ${mins%60}m`;}
const DIR_ICON={'turn-left':{icon:'↰'},'turn-right':{icon:'↱'},'turn-sharp-left':{icon:'↺'},'turn-sharp-right':{icon:'↻'},'turn-slight-left':{icon:'↖'},'turn-slight-right':{icon:'↗'},'uturn-left':{icon:'↩'},'uturn-right':{icon:'↪'},straight:{icon:'↑'},'ramp-left':{icon:'↰'},'ramp-right':{icon:'↱'},merge:{icon:'⤵'},'fork-left':{icon:'⑂'},'fork-right':{icon:'⑂'},ferry:{icon:'⛴'},'roundabout-left':{icon:'⟳'},'roundabout-right':{icon:'⟳'},left:{icon:'↰'},right:{icon:'↱'},'sharp left':{icon:'↺'},'sharp right':{icon:'↻'},'slight left':{icon:'↖'},'slight right':{icon:'↗'},'u-turn':{icon:'↩'},arrive:{icon:'🏁'},depart:{icon:'↑'}};
function getDir(step){const man=(step.maneuver||'').toLowerCase(),txt=(step.instruction||'').toLowerCase();if(DIR_ICON[man])return DIR_ICON[man];if(txt.includes('arrive')||txt.includes('destination'))return DIR_ICON.arrive;if(txt.includes('left'))return DIR_ICON.left;if(txt.includes('right'))return DIR_ICON.right;if(txt.includes('straight')||txt.includes('continue'))return DIR_ICON.straight;return{icon:'↑'};}

// ═══════════════════════════════════════════════════════════════════
const Styles=()=><style>{`
@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Poppins:wght@400;500;600;700;800;900&display=swap');
*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;}
html{color-scheme:dark;}
button,input,textarea,select{color-scheme:dark;color:inherit;font:inherit;}
html,body,#root{height:100%;width:100%;overflow:hidden;background:#0a0a0a;}
::-webkit-scrollbar{width:3px;}::-webkit-scrollbar-track{background:transparent;}::-webkit-scrollbar-thumb{background:#e8185033;border-radius:2px;}
@keyframes breathe{0%,100%{opacity:.6;transform:translateX(-50%) scale(1);}50%{opacity:1;transform:translateX(-50%) scale(1.02);}}
@keyframes spin{to{transform:rotate(360deg);}}
@keyframes fadeUp{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}
@keyframes navIn{from{opacity:0;transform:translateY(-12px) scale(.97);}to{opacity:1;transform:translateY(0) scale(1);}}
@keyframes stepFadeIn{from{opacity:0;transform:translateX(-6px);}to{opacity:1;transform:translateX(0);}}
@keyframes sosPulse{0%,100%{box-shadow:0 0 0 0 rgba(232,24,80,.4);}50%{box-shadow:0 0 0 20px rgba(232,24,80,0);}}
@keyframes confirmPulse{0%,100%{box-shadow:0 0 0 0 rgba(220,38,38,.5);}50%{box-shadow:0 0 0 24px rgba(220,38,38,0);}}
@keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
@keyframes scaleIn{from{transform:scale(.85);opacity:0;}to{transform:scale(1);opacity:1;}}
@keyframes sheetUp{from{transform:translateY(100%);}to{transform:translateY(0);}}
@keyframes overlayIn{from{opacity:0;}to{opacity:1;}}
@keyframes sosNavBounce{0%{transform:scale(1);}15%{transform:scale(1.35);}30%{transform:scale(0.9);}45%{transform:scale(1.15);}60%{transform:scale(0.95);}75%{transform:scale(1.05);}100%{transform:scale(1);}}
@keyframes checkPop{0%{transform:scale(0) rotate(-45deg);opacity:0;}50%{transform:scale(1.2) rotate(0deg);opacity:1;}100%{transform:scale(1) rotate(0deg);opacity:1;}}
.st-popup .leaflet-popup-content-wrapper{background:transparent!important;border:none!important;box-shadow:none!important;padding:0!important;}
.st-popup .leaflet-popup-tip-container{display:none;}.leaflet-control-zoom{display:none;}
.nav-dot-outer{width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;animation:navRing 1.2s ease-in-out infinite;}
.nav-dot-inner{width:14px;height:14px;background:#e81850;border-radius:50%;border:2.5px solid #fff;box-shadow:0 0 10px #e81850cc;}
@keyframes navRing{0%,100%{box-shadow:0 0 0 0 #e8185055;}50%{box-shadow:0 0 0 8px #e8185000;}}
@keyframes newsPulse{0%,100%{opacity:0.85;}50%{opacity:1;}}
`}</style>;

// ═══════════════════════════════════════════════════════════════════
function PhoneFrame({children}){return(
<div style={{height:'100vh',width:'100vw',display:'flex',alignItems:'center',justifyContent:'center',background:'#0a0a0a',overflow:'hidden'}}>
<div style={{width:393,height:'100vh',maxWidth:'100vw',background:'#000000',overflow:'hidden',position:'relative',display:'flex',flexDirection:'column'}}>
<div style={{flex:1,overflow:'hidden',position:'relative',background:'#000000'}}>{children}</div>
</div></div>);}

// ═══════════════════════════════════════════════════════════════════
function SOSOverlay({onClose}){
  const[phase,setPhase]=useState('first');
  const handleTap=()=>{if(phase==='first'){setPhase('confirm');return;}if(phase==='confirm'){setPhase('sending');setTimeout(()=>{setPhase('sent');setTimeout(()=>onClose(),2200);},1800);}};
  const isRed=phase==='confirm'||phase==='sending';const isSent=phase==='sent';
  return(
    <div style={{position:'absolute',inset:0,zIndex:2000,display:'flex',flexDirection:'column',justifyContent:'flex-end',animation:'overlayIn 0.25s ease'}}>
      <div onClick={phase==='first'||phase==='confirm'?onClose:undefined} style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.6)',backdropFilter:'blur(8px)'}}/>
      <div style={{position:'relative',zIndex:1,background:isSent?'#07130e':isRed?'#14080a':'#0e0710',borderRadius:'28px 28px 0 0',padding:'20px 24px 32px',minHeight:380,display:'flex',flexDirection:'column',alignItems:'center',animation:'sheetUp 0.35s cubic-bezier(0.32,1.4,0.58,1)',transition:'background 0.5s'}}>
        <div style={{width:40,height:4,borderRadius:2,background:'#ffffff15',marginBottom:24}}/>
        <button onClick={onClose} style={{position:'absolute',top:20,right:24,background:'#ffffff0a',border:'none',borderRadius:20,width:32,height:32,display:'flex',alignItems:'center',justifyContent:'center',color:'#ffffff44',fontSize:16,cursor:'pointer',fontFamily:"'Poppins',sans-serif"}}>✕</button>
        <div style={{fontSize:11,fontWeight:700,letterSpacing:'0.2em',color:isSent?'#34d399':isRed?'#ff4444':'#e81850',marginBottom:8,fontFamily:"'Poppins',sans-serif",transition:'color 0.3s'}}>
          {isSent?'ALERT DISPATCHED':phase==='sending'?'SENDING ALERT...':'EMERGENCY SOS'}
        </div>
        <div style={{fontSize:12,color:'#ffffff33',marginBottom:28,fontFamily:"'Poppins',sans-serif",textAlign:'center',lineHeight:1.5}}>
          {isSent?'Help is on the way. Stay where you are.':phase==='sending'?'Contacting nearest police station...':isRed?'Are you sure you want to alert the police?':'Tap the button to trigger an emergency alert'}
        </div>
        <div style={{position:'relative',marginBottom:28}}>
          <button onClick={handleTap} disabled={phase==='sending'||phase==='sent'} style={{width:130,height:130,borderRadius:'50%',background:isSent?'#34d399':isRed?'#dc2626':'#e81850',border:'none',color:'#fff',fontSize:isSent?40:32,fontWeight:900,fontFamily:"'Poppins',sans-serif",cursor:phase==='sending'||phase==='sent'?'default':'pointer',animation:isRed&&phase!=='sending'?'confirmPulse 1.2s ease-in-out infinite':phase==='first'?'sosPulse 2s ease-in-out infinite':'none',transition:'all 0.4s cubic-bezier(0.4,0,0.2,1)',position:'relative',zIndex:2,boxShadow:isSent?'0 0 40px #34d39944':isRed?'0 0 50px rgba(220,38,38,0.35)':'0 0 40px rgba(232,24,80,0.3)'}}>
            {isSent?'✓':phase==='sending'?<span style={{display:'inline-block',animation:'spin 1s linear infinite',fontSize:24}}>◌</span>:'SOS'}
          </button>
          {(phase==='first'||phase==='confirm')&&<div style={{position:'absolute',top:-10,left:-10,right:-10,bottom:-10,borderRadius:'50%',border:`2px solid ${isRed?'#dc262633':'#e8185022'}`,pointerEvents:'none'}}/>}
        </div>
        {isRed&&phase==='confirm'&&<div style={{fontSize:13,fontWeight:700,color:'#ff4444',fontFamily:"'Poppins',sans-serif",animation:'fadeIn 0.3s ease',letterSpacing:'0.05em'}}>TAP AGAIN TO CONFIRM</div>}
        {phase==='first'&&<div style={{fontSize:11,color:'#ffffff22',fontFamily:"'Poppins',sans-serif"}}>Your location will be shared with authorities</div>}
      </div>
    </div>
  );
}

// ── Supabase config ──────────────────────────────────────────────
const SUPABASE_URL=import.meta.env.VITE_SUPABASE_URL||'https://lqupxuowivtypjgompkm.supabase.co';
const SUPABASE_KEY=import.meta.env.VITE_SUPABASE_ANON_KEY||'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxdXB4dW93aXZ0eXBqZ29tcGttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4NjM0NzQsImV4cCI6MjA5MDQzOTQ3NH0.HiAelrAjidEYUAFb5pam4vcE8zKNIlqpQsDlReg9BNE';
const supabase=createClient(SUPABASE_URL,SUPABASE_KEY);

async function supabaseInsert(table,data){
  const res=await fetch(`${SUPABASE_URL}/rest/v1/${table}`,{
    method:'POST',
    headers:{'Content-Type':'application/json','apikey':SUPABASE_KEY,'Authorization':`Bearer ${SUPABASE_KEY}`,'Prefer':'return=representation'},
    body:JSON.stringify(data),
  });
  if(!res.ok){console.error('[Supabase]',res.status,await res.text().catch(()=>''));return null;}
  const rows=await res.json();return rows?.[0]||null;
}

// ── AES-GCM encryption (Web Crypto API) ──────────────────────────
async function encryptData(plaintext,passphrase){
  const enc=new TextEncoder();
  const keyMaterial=await crypto.subtle.importKey('raw',enc.encode(passphrase),{name:'PBKDF2'},false,['deriveKey']);
  const salt=enc.encode('safetrace-salt-v1');
  const key=await crypto.subtle.deriveKey(
    {name:'PBKDF2',salt,iterations:100000,hash:'SHA-256'},
    keyMaterial,{name:'AES-GCM',length:256},false,['encrypt']
  );
  const iv=crypto.getRandomValues(new Uint8Array(12));
  const ciphertext=await crypto.subtle.encrypt({name:'AES-GCM',iv},key,enc.encode(plaintext));
  return{
    encrypted_data:btoa(String.fromCharCode(...new Uint8Array(ciphertext))),
    iv:btoa(String.fromCharCode(...iv)),
  };
}

// ── ID generators ─────────────────────────────────────────────────
function generateCaseId(){
  const c='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';let id='ST-';
  for(let i=0;i<8;i++)id+=c[Math.floor(Math.random()*c.length)];
  return id;
}
function generateEvidenceId(){
  const c='abcdef0123456789';let id='ev-';
  for(let i=0;i<12;i++)id+=c[Math.floor(Math.random()*c.length)];
  return id;
}

// ═══════════════════════════════════════════════════════════════════
function ComplaintPage({onBack}){
  const now=new Date();const nowDate=now.toISOString().slice(0,10);const nowTime=now.toTimeString().slice(0,5);
  const[form,setForm]=useState({type:'',description:'',otherDesc:'',date:nowDate,time:nowTime,evidence:[]});
  const[submitted,setSubmitted]=useState(false);const[trackingId,setTrackingId]=useState('');
  const[submitting,setSubmitting]=useState(false);
  const[pinningLocation,setPinningLocation]=useState(false);
  const[pinnedLocation,setPinnedLocation]=useState(null);const locMapRef=useRef(null);
  const locMapInstanceRef=useRef(null);const locMarkerRef=useRef(null);const fileInputRef=useRef(null);

  useEffect(()=>{
    if(!pinningLocation){if(locMapInstanceRef.current){locMapInstanceRef.current.remove();locMapInstanceRef.current=null;locMarkerRef.current=null;}return;}
    if(!locMapRef.current||locMapInstanceRef.current||!window.L)return;
    const L=window.L,map=L.map(locMapRef.current,{center:[13.0827,80.2707],zoom:13,zoomControl:false});
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',{attribution:'CartoDB'}).addTo(map);
    map.on('click',e=>{const{lat,lng}=e.latlng;if(locMarkerRef.current)map.removeLayer(locMarkerRef.current);
    locMarkerRef.current=L.marker([lat,lng],{icon:L.divIcon({className:'',html:`<div style="width:18px;height:18px;background:#e81850;border-radius:50%;border:3px solid #fff;box-shadow:0 0 0 4px #e8185040,0 0 16px #e8185099"></div>`,iconSize:[18,18],iconAnchor:[9,9]})}).addTo(map);
    setPinnedLocation({lat:lat.toFixed(4),lng:lng.toFixed(4)});});
    if(pinnedLocation){const lat=parseFloat(pinnedLocation.lat),lng=parseFloat(pinnedLocation.lng);
    locMarkerRef.current=L.marker([lat,lng],{icon:L.divIcon({className:'',html:`<div style="width:18px;height:18px;background:#e81850;border-radius:50%;border:3px solid #fff;box-shadow:0 0 0 4px #e8185040,0 0 16px #e8185099"></div>`,iconSize:[18,18],iconAnchor:[9,9]})}).addTo(map);map.setView([lat,lng],15);}
    locMapInstanceRef.current=map;
  },[pinningLocation]);

  const handleFileUpload=(e)=>{Array.from(e.target.files).forEach(file=>{if(file.size>10*1024*1024)return;const reader=new FileReader();reader.onload=(ev)=>{setForm(f=>({...f,evidence:[...f.evidence,{name:file.name,type:file.type,preview:ev.target.result,size:file.size}]}));};reader.readAsDataURL(file);});e.target.value='';};
  const removeEvidence=(idx)=>{setForm(f=>({...f,evidence:f.evidence.filter((_,i)=>i!==idx)}));};


  const handleSubmit=async()=>{
    if(!form.type||!pinnedLocation)return;if(form.type==='Other'&&!form.otherDesc)return;
    setSubmitting(true);
    const caseId=generateCaseId();
    try{
      const reportData=JSON.stringify({
        type:form.type==='Other'?`Other: ${form.otherDesc}`:form.type,
        description:form.description||'',
        location:{lat:parseFloat(pinnedLocation.lat),lng:parseFloat(pinnedLocation.lng)},
        incident_date:form.date||null,
        incident_time:form.time||null,
        evidence_count:form.evidence.length,
      });
      const {encrypted_data,iv}=await encryptData(reportData,caseId);
      await supabaseInsert('reports',{
        case_id:caseId,status:'submitted',uid:null,
        created_at:new Date().toISOString(),encrypted_data,iv,
      });
      for(const ev of form.evidence){
        const evId=generateEvidenceId();
        const evData=JSON.stringify({file_name:ev.name,file_type:ev.type,file_size:ev.size});
        const evEnc=await encryptData(evData,caseId);
        await supabaseInsert('evidence',{
          evidence_id:evId,case_id:caseId,uid:null,
          uploaded_at:new Date().toISOString(),
          encrypted_data:evEnc.encrypted_data,iv:evEnc.iv,
        });
      }
    }catch(e){console.warn('[SafeTrace] Submit error:',e);}
    setTrackingId(caseId);setSubmitted(true);setSubmitting(false);
  };
  const n2=new Date();const n2Date=n2.toISOString().slice(0,10);const n2Time=n2.toTimeString().slice(0,5);
  const handleNewReport=()=>{setSubmitted(false);setTrackingId('');setForm({type:'',description:'',otherDesc:'',date:n2Date,time:n2Time,evidence:[]});setPinnedLocation(null);setPinningLocation(false);};

  const incidentTypes=['Harassment','Stalking','Theft / Robbery','Assault','Eve-Teasing','Unsafe Area','Poor Lighting','Other'];
  const canSubmit=form.type&&pinnedLocation&&form.date&&form.time&&(form.type!=='Other'||form.otherDesc)&&!submitting;
  const inp={width:'100%',padding:'14px 16px',background:'#0d0d14',border:'1px solid #ffffff10',borderRadius:14,color:'#fff',fontSize:14,fontFamily:"'Poppins',sans-serif",outline:'none'};
  const lbl={fontSize:10,fontWeight:700,color:'#ffffff44',letterSpacing:'0.15em',marginBottom:8,display:'block',fontFamily:"'Poppins',sans-serif"};

  if(submitted)return(
    <div style={{height:'100%',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'#000000',animation:'scaleIn 0.4s ease',fontFamily:"'Poppins',sans-serif",padding:'0 32px',textAlign:'center'}}>
      <div style={{width:72,height:72,borderRadius:'50%',background:'#34d39915',border:'2px solid #34d399',display:'flex',alignItems:'center',justifyContent:'center',fontSize:32,marginBottom:20,animation:'checkPop 0.5s cubic-bezier(0.34,1.4,0.64,1)'}}>✓</div>
      <div style={{color:'#34d399',fontSize:18,fontWeight:800,marginBottom:6}}>Report Submitted</div>
      <div style={{color:'#ffffff33',fontSize:12,marginBottom:20}}>Your complaint has been recorded</div>
      <div style={{background:'#0d0d14',border:'1px solid #ffffff10',borderRadius:16,padding:'16px 24px',marginBottom:16,width:'100%'}}>
        <div style={{fontSize:9,color:'#ffffff33',fontWeight:600,letterSpacing:'0.12em',marginBottom:6}}>CASE ID</div>
        <div style={{fontSize:22,fontWeight:800,color:'#e81850',fontFamily:"'DM Mono',monospace",letterSpacing:'0.08em'}}>{trackingId}</div>
        <div style={{fontSize:10,color:'#ffffff22',marginTop:6}}>Save this ID to track your case</div>
      </div>
      <button onClick={()=>{navigator.clipboard?.writeText(trackingId).catch(()=>{});const el=document.createElement('textarea');el.value=trackingId;document.body.appendChild(el);el.select();document.execCommand('copy');document.body.removeChild(el);}} style={{width:'100%',padding:'11px',background:'#ffffff08',border:'1px solid #ffffff14',borderRadius:14,color:'#ffffff88',fontSize:12,fontWeight:600,fontFamily:"'Poppins',sans-serif",cursor:'pointer',marginBottom:16,display:'flex',alignItems:'center',justifyContent:'center',gap:6}}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
        Copy Case ID
      </button>
      <div style={{display:'flex',gap:10,width:'100%'}}>
        <button onClick={handleNewReport} style={{flex:1,padding:'12px',background:'transparent',border:'1px solid #ffffff12',borderRadius:16,color:'#ffffff55',fontSize:12,fontWeight:600,fontFamily:"'Poppins',sans-serif",cursor:'pointer'}}>New Report</button>
        <button onClick={onBack} style={{flex:1,padding:'12px',background:'#e81850',border:'none',borderRadius:16,color:'#fff',fontSize:12,fontWeight:700,fontFamily:"'Poppins',sans-serif",cursor:'pointer'}}>Back to Map</button>
      </div>
    </div>
  );

  if(pinningLocation)return(
    <div style={{height:'100%',display:'flex',flexDirection:'column',background:'#000000'}}>
      <div style={{padding:'16px 20px',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0,borderBottom:'1px solid #ffffff08'}}>
        <button onClick={()=>setPinningLocation(false)} style={{background:'#ffffff08',border:'none',borderRadius:14,padding:'8px 14px',color:'#fff',fontSize:13,fontWeight:600,fontFamily:"'Poppins',sans-serif",cursor:'pointer'}}>← Back</button>
        <span style={{fontSize:12,fontWeight:700,color:'#e81850',fontFamily:"'Poppins',sans-serif"}}>Pin Location</span>
        {pinnedLocation?<button onClick={()=>setPinningLocation(false)} style={{background:'#e81850',border:'none',borderRadius:14,padding:'8px 16px',color:'#fff',fontSize:12,fontWeight:700,fontFamily:"'Poppins',sans-serif",cursor:'pointer'}}>Done</button>:<div style={{width:60}}/>}
      </div>
      <div style={{flex:1,position:'relative'}}>
        <div ref={locMapRef} style={{height:'100%',width:'100%'}}/>
        {!pinnedLocation&&<><div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',width:40,height:40,borderRadius:'50%',border:'2px solid #e8185066',pointerEvents:'none',animation:'sosPulse 2s ease-in-out infinite'}}/><div style={{position:'absolute',bottom:24,left:'50%',transform:'translateX(-50%)',background:'rgba(7,7,14,0.92)',border:'1px solid #e8185028',color:'#fff',padding:'10px 24px',borderRadius:24,fontSize:12,fontFamily:"'Poppins',sans-serif",fontWeight:500,pointerEvents:'none',animation:'breathe 2.4s ease-in-out infinite'}}>Tap to pin incident location</div></>}
        {pinnedLocation&&<div style={{position:'absolute',bottom:24,left:'50%',transform:'translateX(-50%)',background:'rgba(7,7,14,0.92)',border:'1px solid #34d39933',color:'#34d399',padding:'8px 20px',borderRadius:20,fontSize:11,fontFamily:"'DM Mono',monospace",fontWeight:500}}>📍 {pinnedLocation.lat}, {pinnedLocation.lng}</div>}
      </div>
    </div>
  );

  return(
    <div style={{height:'100%',display:'flex',flexDirection:'column',background:'#000000',fontFamily:"'Poppins',sans-serif",position:'relative'}}>
      <div style={{padding:'16px 20px 14px',flexShrink:0,borderBottom:'1px solid #ffffff08'}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <button onClick={onBack} style={{background:'#ffffff08',border:'none',borderRadius:14,padding:'8px 14px',color:'#fff',fontSize:13,fontWeight:600,fontFamily:"'Poppins',sans-serif",cursor:'pointer'}}>←</button>
          <div><div style={{fontSize:17,fontWeight:800,color:'#fff'}}>Report Incident</div><div style={{fontSize:10,color:'#ffffff28',marginTop:2}}>Help keep your community safe</div><div style={{fontSize:10,color:'#e81850',marginTop:4,fontWeight:500}}>Fields marked <span style={{color:'#e81850'}}>*</span> are required</div></div>
        </div>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'16px 20px 100px',background:'#000000'}}>
        <div style={{marginBottom:18,background:'#000000'}}>
          <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:8}}>
            <label style={lbl}>WHAT HAPPENED?</label>
            <span style={{fontSize:9,color:'#e81850',fontWeight:700,letterSpacing:'0.08em'}}>*</span>
          </div>
          <div style={{display:'flex',flexWrap:'wrap',gap:8,background:'#000000'}}>
            {incidentTypes.map(t=>{const active=form.type===t;return(<button key={t} onClick={()=>setForm(f=>({...f,type:t,otherDesc:t!=='Other'?'':f.otherDesc}))} style={{padding:'10px 16px',borderRadius:20,backgroundColor:active?'#e8185018':'#0d0d14',border:`1px solid ${active?'#e81850':'#ffffff0c'}`,color:active?'#e81850':'#ffffff55',fontSize:12,fontWeight:600,fontFamily:"'Poppins',sans-serif",cursor:'pointer',transition:'all 0.15s'}}>{t}</button>);})}
          </div>
        </div>
        {form.type==='Other'&&<div style={{marginBottom:18,animation:'fadeUp 0.25s ease'}}><label style={lbl}>DESCRIBE THE INCIDENT TYPE</label><input type="text" placeholder="e.g., Suspicious activity, Vandalism..." value={form.otherDesc} onChange={e=>setForm(f=>({...f,otherDesc:e.target.value}))} style={inp}/></div>}
        <div style={{marginBottom:18}}>
          <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:8}}>
            <label style={lbl}>INCIDENT LOCATION</label>
            <span style={{fontSize:9,color:'#e81850',fontWeight:700,letterSpacing:'0.08em'}}>*</span>
          </div>
          <button onClick={()=>setPinningLocation(true)} style={{width:'100%',padding:'16px',background:pinnedLocation?'#0d1410':'#0d0d14',border:`1px solid ${pinnedLocation?'#34d39933':'#ffffff0c'}`,borderRadius:16,cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:6,transition:'all 0.2s'}}>
            <div style={{width:44,height:44,borderRadius:'50%',background:pinnedLocation?'#34d39912':'#e8185010',border:`1px solid ${pinnedLocation?'#34d39933':'#e8185033'}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>{pinnedLocation?'📍':'🗺️'}</div>
            {pinnedLocation?<><div style={{fontSize:12,color:'#34d399',fontWeight:600}}>Location Pinned</div><div style={{fontSize:10,color:'#ffffff33',fontFamily:"'DM Mono',monospace"}}>{pinnedLocation.lat}, {pinnedLocation.lng}</div></>:<div style={{fontSize:13,color:'#ffffff44'}}>Tap to pin location on map</div>}
          </button>
        </div>
        <div style={{display:'flex',gap:10,marginBottom:18}}>
          <div style={{flex:1}}>
            <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:8}}>
              <label style={lbl}>DATE</label>
              <span style={{fontSize:9,color:'#e81850',fontWeight:700}}>*</span>
            </div>
            <input type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))} style={{...inp,colorScheme:'dark'}}/>
          </div>
          <div style={{flex:1}}>
            <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:8}}>
              <label style={lbl}>TIME</label>
              <span style={{fontSize:9,color:'#e81850',fontWeight:700}}>*</span>
            </div>
            <input type="time" value={form.time} onChange={e=>setForm(f=>({...f,time:e.target.value}))} style={{...inp,colorScheme:'dark'}}/>
          </div>
        </div>
        <div style={{marginBottom:18}}>
          <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:8}}>
            <label style={lbl}>DETAILS</label>
            <span style={{fontSize:9,color:'#ffffff28',fontWeight:600,letterSpacing:'0.08em',background:'#ffffff08',padding:'2px 6px',borderRadius:4}}>OPTIONAL</span>
          </div>
          <textarea placeholder="Anything else you want to share..." value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} rows={3} style={{...inp,resize:'none',lineHeight:1.5}}/>
        </div>
        <div style={{marginBottom:24}}>
          <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:8}}>
            <label style={lbl}>EVIDENCE</label>
            <span style={{fontSize:9,color:'#ffffff28',fontWeight:600,letterSpacing:'0.08em',background:'#ffffff08',padding:'2px 6px',borderRadius:4}}>OPTIONAL</span>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*,video/*,audio/*" multiple onChange={handleFileUpload} style={{display:'none'}}/>
          <button onClick={()=>fileInputRef.current?.click()} style={{width:'100%',padding:'18px 16px',background:'#0d0d14',border:'2px dashed #ffffff12',borderRadius:16,cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:8}}>
            <div style={{width:40,height:40,borderRadius:'50%',background:'#e8185010',border:'1px solid #e8185033',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>📎</div>
            <span style={{fontSize:12,color:'#ffffff44',fontWeight:500}}>Upload photos, videos, or audio</span>
          </button>
          {form.evidence.length>0&&<div style={{display:'flex',gap:8,marginTop:10,overflowX:'auto',padding:'4px 0'}}>
            {form.evidence.map((ev,i)=><div key={i} style={{position:'relative',flexShrink:0}}>
              {ev.type.startsWith('image')?<img src={ev.preview} alt="" style={{width:64,height:64,borderRadius:12,objectFit:'cover',border:'1px solid #ffffff0f'}}/>:
              <div style={{width:64,height:64,borderRadius:12,background:'#0d0d14',border:'1px solid #ffffff0f',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:2}}>
                <span style={{fontSize:18}}>{ev.type.startsWith('video')?'🎬':'🎤'}</span>
                <span style={{fontSize:7,color:'#ffffff33',maxWidth:56,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{ev.name}</span>
              </div>}
              <button onClick={()=>removeEvidence(i)} style={{position:'absolute',top:-4,right:-4,width:18,height:18,borderRadius:'50%',background:'#e81850',border:'none',color:'#fff',fontSize:9,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700}}>✕</button>
            </div>)}
          </div>}
        </div>
      </div>
      <div style={{position:'absolute',bottom:72,left:0,right:0,padding:'12px 20px',background:'linear-gradient(0deg,rgba(7,7,14,1) 60%,rgba(7,7,14,0) 100%)',zIndex:10}}>
        <button onClick={handleSubmit} disabled={!canSubmit} style={{width:'100%',padding:'16px',background:canSubmit?'#e81850':'#1a0c14',border:'none',borderRadius:16,color:canSubmit?'#fff':'#ffffff1a',fontSize:14,fontWeight:700,fontFamily:"'Poppins',sans-serif",cursor:canSubmit?'pointer':'not-allowed',boxShadow:canSubmit?'0 0 30px #e8185033':'none',transition:'all 0.3s',display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
          {submitting&&<span style={{display:'inline-block',animation:'spin 1s linear infinite'}}>◌</span>}
          {submitting?'Submitting...':'Submit Report'}
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
function NavOverlay({steps,stepIndex,setStepIndex,totalDist,totalTime,destName,onEnd}){
  const step=steps[stepIndex],next=steps[stepIndex+1],isFirst=stepIndex===0,isLast=stepIndex===steps.length-1;
  const pct=steps.length>1?(stepIndex/(steps.length-1))*100:100,dir=getDir(step),ndir=next?getDir(next):null;
  const remDistM=steps.slice(stepIndex).reduce((a,s)=>a+(s.distanceM||0),0);
  const remDist=remDistM>1000?(remDistM/1000).toFixed(1)+' km':Math.round(remDistM)+' m';
  const remTime=stepIndex===0?totalTime:(Math.max(1,Math.ceil(remDistM/80))+' min');
  return(<div style={{position:'absolute',inset:0,zIndex:1000,display:'flex',flexDirection:'column',pointerEvents:'none'}}>
    <div style={{pointerEvents:'all',margin:'10px 12px 0',background:'rgba(7,7,14,0.97)',border:'1px solid #e8185055',borderRadius:18,padding:'14px 16px 12px',backdropFilter:'blur(24px)',boxShadow:'0 12px 48px rgba(232,24,80,0.22)',animation:'navIn 0.35s cubic-bezier(0.34,1.4,0.64,1)',fontFamily:"'DM Mono',monospace"}}>
      <div style={{height:3,background:'#ffffff08',borderRadius:2,marginBottom:12,overflow:'hidden'}}><div style={{height:'100%',width:`${pct}%`,background:'linear-gradient(90deg,#e81850,#ff6090)',borderRadius:2,transition:'width 0.6s',boxShadow:'0 0 8px #e81850'}}/></div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}><span style={{fontSize:9,color:'#e81850',letterSpacing:'0.18em'}}>STEP {stepIndex+1}/{steps.length}</span><span style={{fontSize:9,color:'#ffffff33',maxWidth:140,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>→ {destName}</span></div>
      <div style={{display:'flex',gap:12,alignItems:'center',marginBottom:12}}>
        <div style={{width:50,height:50,flexShrink:0,background:'#e8185018',border:'1px solid #e8185044',borderRadius:14,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,boxShadow:'0 0 20px #e8185033',animation:'stepFadeIn 0.3s ease both'}}>{dir.icon}</div>
        <div style={{flex:1}}><div style={{fontSize:14,color:'#fff',fontWeight:500,lineHeight:1.4,animation:'stepFadeIn 0.3s ease both'}}>{step.instruction}</div>{step.distance&&<div style={{fontSize:10,color:'#e8185077',marginTop:3}}>{step.distance}</div>}</div>
      </div>
      {next&&<div style={{padding:'8px 10px',background:'#ffffff04',border:'1px solid #ffffff07',borderRadius:10,display:'flex',alignItems:'center',gap:8,marginBottom:12}}><span style={{fontSize:9,color:'#ffffff22'}}>THEN</span><span style={{fontSize:16,color:'#ffffff55'}}>{ndir?.icon}</span><span style={{fontSize:10,color:'#ffffff44',flex:1,lineHeight:1.4}}>{next.instruction}</span></div>}
      <div style={{display:'flex',gap:8}}>
        {!isFirst&&<button onClick={()=>setStepIndex(i=>i-1)} style={{flex:1,padding:'9px',background:'transparent',border:'1px solid #ffffff0f',borderRadius:10,color:'#ffffff55',fontSize:13,fontFamily:'inherit',cursor:'pointer'}}>←</button>}
        {!isLast?<button onClick={()=>setStepIndex(i=>i+1)} style={{flex:3,padding:'10px',background:'#e81850',border:'none',borderRadius:10,color:'#fff',fontSize:11,letterSpacing:'0.14em',fontWeight:600,fontFamily:'inherit',cursor:'pointer',boxShadow:'0 0 20px #e8185044'}}>next step →</button>:<button onClick={onEnd} style={{flex:3,padding:'10px',background:'#e81850',border:'none',borderRadius:10,color:'#fff',fontSize:11,letterSpacing:'0.14em',fontWeight:600,fontFamily:'inherit',cursor:'pointer'}}>🏁 arrived!</button>}
        <button onClick={onEnd} style={{padding:'10px 12px',background:'transparent',border:'1px solid #ffffff0f',borderRadius:10,color:'#ffffff33',fontSize:12,fontFamily:'inherit',cursor:'pointer'}}>✕</button>
      </div>
    </div>
    <div style={{pointerEvents:'all',margin:'auto 12px 80px',background:'rgba(7,7,14,0.88)',border:'1px solid #ffffff0a',borderRadius:14,padding:'8px 16px',backdropFilter:'blur(16px)',display:'flex',fontFamily:"'DM Mono',monospace"}}>
      {[{l:'DIST',v:remDist},{l:'TIME',v:remTime},{l:'LEFT',v:`${steps.length-stepIndex}`}].map((x,i,a)=><div key={x.l} style={{flex:1,textAlign:'center',borderRight:i<a.length-1?'1px solid #ffffff0a':'none',padding:'0 6px'}}><div style={{fontSize:7,color:'#ffffff33',letterSpacing:'0.12em',marginBottom:2}}>{x.l}</div><div style={{fontSize:12,color:'#fff',fontWeight:500}}>{x.v}</div></div>)}
    </div>
  </div>);
}

// ═══════════════════════════════════════════════════════════════════
function PlaceDrawer({pin,nearby,dest,routeData,loading,showUnsafe,onToggleUnsafe,onSelectDest,onStartNav,onReset,onChangeDest,placesLoading}){
  const[open,setOpen]=useState(true);if(!pin)return null;
  return(<div style={{position:'absolute',bottom:72,left:0,right:0,zIndex:900,maxHeight:open?'50%':48,transition:'max-height 0.35s cubic-bezier(0.4,0,0.2,1)',display:'flex',flexDirection:'column',fontFamily:"'Poppins',sans-serif"}}>
    <div onClick={()=>setOpen(v=>!v)} style={{background:'rgba(7,7,14,0.97)',backdropFilter:'blur(20px)',borderTop:'1px solid #e8185028',borderRadius:'22px 22px 0 0',padding:'10px 20px 8px',cursor:'pointer'}}>
      <div style={{width:36,height:4,borderRadius:2,background:'#ffffff15',margin:'0 auto 10px'}}/>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div><span style={{fontSize:13,color:'#fff',fontWeight:700}}>Nearby</span><span style={{fontSize:11,color:'#ffffff28',marginLeft:8,fontWeight:500}}>{placesLoading?'loading...':dest?'route ready':`${nearby.length} places`}</span></div>
        <div style={{display:'flex',gap:6}}>
          <button onClick={e=>{e.stopPropagation();onToggleUnsafe();}} style={{background:showUnsafe?'#ff2d5510':'none',border:`1px solid ${showUnsafe?'#ff2d5530':'#ffffff08'}`,color:showUnsafe?'#ff2d55':'#ffffff28',borderRadius:20,padding:'4px 10px',fontSize:10,cursor:'pointer',fontFamily:'inherit',fontWeight:600}}>⚠</button>
          <button onClick={e=>{e.stopPropagation();onReset();}} style={{background:'none',border:'1px solid #ffffff08',color:'#ffffff28',borderRadius:20,padding:'4px 12px',fontSize:10,cursor:'pointer',fontFamily:'inherit',fontWeight:500}}>Reset</button>
        </div>
      </div>
    </div>
    {open&&<div style={{flex:1,overflowY:'auto',background:'rgba(7,7,14,0.97)',backdropFilter:'blur(20px)',padding:'6px 12px 14px'}}>
      {!dest?nearby.map((p,i)=>{const c=TAG_COLOR[p.tags[0]]||'#888';return(
        <div key={p.id} onClick={()=>onSelectDest(p)} style={{background:'#0c0c14',border:'1px solid #ffffff06',borderRadius:16,padding:'12px 14px',marginBottom:6,cursor:'pointer',animation:`fadeUp 0.25s ease both`,animationDelay:`${i*40}ms`,transition:'border-color 0.15s'}}>
          <div style={{display:'flex',gap:10,alignItems:'center'}}>
            <div style={{width:28,height:28,borderRadius:10,flexShrink:0,background:`${c}12`,border:`1px solid ${c}33`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,color:c,fontWeight:700}}>{i+1}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:12,color:'#fff',fontWeight:600,marginBottom:4,fontFamily:"'Poppins',sans-serif"}}>{p.name}</div>
              <div style={{display:'flex',gap:6,alignItems:'center',flexWrap:'wrap'}}>
                <span style={{fontSize:9,padding:'3px 8px',borderRadius:20,background:`${c}10`,color:c,border:`1px solid ${c}20`,fontWeight:600}}>{TAG_ICON[p.tags[0]]} {TAG_LABEL[p.tags[0]]}</span>
                <span style={{fontSize:10,color:'#ffffff28',fontWeight:500}}>{fmDist(p._dist)} · {fmWalk(p._dist)}</span>
              </div>
            </div>
            <span style={{fontSize:14,color:'#ffffff12'}}>›</span>
          </div>
        </div>);})
      :<div>
        <div style={{background:'#0c0814',border:'1px solid #e8185020',borderRadius:16,padding:14,marginBottom:10}}>
          <div style={{fontSize:10,color:'#e81850',fontWeight:600,marginBottom:8,letterSpacing:'0.06em'}}>DESTINATION</div>
          <div style={{fontSize:13,color:'#fff',fontWeight:600,marginBottom:4}}>{dest.name}</div>
          <div style={{fontSize:11,color:'#ffffff33',fontWeight:500}}>{fmDist(dest._dist)} · {fmWalk(dest._dist)}</div>
          {routeData&&<div style={{marginTop:10,padding:'10px',background:'#ffffff04',borderRadius:12,display:'flex',gap:12}}>
            {[{l:'Distance',v:routeData.totalDist},{l:'Walk time',v:routeData.totalTime},{l:'Steps',v:routeData.steps.length}].map((x,i,a)=><div key={x.l} style={{flex:1,textAlign:'center',borderRight:i<a.length-1?'1px solid #ffffff08':'none'}}><div style={{fontSize:9,color:'#ffffff28',fontWeight:500}}>{x.l}</div><div style={{fontSize:13,color:'#fff',fontWeight:700,marginTop:2}}>{x.v}</div></div>)}
          </div>}
        </div>
        <button onClick={onStartNav} disabled={loading||!routeData} style={{width:'100%',padding:13,background:loading||!routeData?'#1a0c14':'#e81850',border:'none',borderRadius:14,color:loading||!routeData?'#ffffff22':'#fff',fontSize:12,fontWeight:700,fontFamily:'inherit',cursor:loading||!routeData?'not-allowed':'pointer',marginBottom:6,boxShadow:!loading&&routeData?'0 0 20px #e8185033':'none'}}>{loading?'◌ Calculating...':!routeData?'Waiting...':'Start Navigation →'}</button>
        <button onClick={onChangeDest} style={{width:'100%',padding:9,background:'transparent',border:'1px solid #ffffff0a',borderRadius:12,color:'#ffffff28',fontSize:11,fontFamily:'inherit',cursor:'pointer',fontWeight:500}}>← Change destination</button>
      </div>}
    </div>}
  </div>);
}

// ═══════════════════════════════════════════════════════════════════
function LeafletMap({pin,onMapClick,nearby,safePlaces,dest,routeData,navigating,stepIndex,showUnsafe,unsafeZones}){
  const cRef=useRef(null),mRef=useRef(null),markRef=useRef([]),layRef=useRef([]),routeRef=useRef([]),navDotRef=useRef(null),navTimerRef=useRef(null);
  useEffect(()=>{if(!cRef.current||!window.L||mRef.current)return;const map=window.L.map(cRef.current,{center:[13.0827,80.2707],zoom:13,zoomControl:false});window.L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',{attribution:'CartoDB'}).addTo(map);map.on('click',e=>onMapClick({lat:e.latlng.lat,lng:e.latlng.lng}));mRef.current=map;return()=>{map.remove();mRef.current=null;};},[]);
  useEffect(()=>{if(!mRef.current)return;mRef.current.off('click');mRef.current.on('click',e=>onMapClick({lat:e.latlng.lat,lng:e.latlng.lng}));},[onMapClick]);
  useEffect(()=>{const map=mRef.current;if(!map)return;const L=window.L;
    markRef.current.forEach(m=>map.removeLayer(m));markRef.current=[];layRef.current.forEach(l=>map.removeLayer(l));layRef.current=[];routeRef.current.forEach(l=>map.removeLayer(l));routeRef.current=[];
    if(navDotRef.current){map.removeLayer(navDotRef.current);navDotRef.current=null;}if(navTimerRef.current){clearInterval(navTimerRef.current);navTimerRef.current=null;}
    const nearbySet=new Set((nearby||[]).map(p=>p.id));
    if(showUnsafe&&unsafeZones)unsafeZones.forEach(z=>{const c=riskColor(z.risk),isN=z.source==='newsapi';
      // Heatmap-style: 4 concentric rings from wide/faint to tight/intense
      const rings=[{r:1.0,fo:0.04,w:0},{r:0.7,fo:0.08,w:0},{r:0.45,fo:isN?0.16:0.13,w:0},{r:0.2,fo:isN?0.28:0.22,w:0}];
      rings.forEach(ring=>{layRef.current.push(L.circle([z.lat,z.lng],{radius:z.radius*ring.r,color:c,fillColor:c,fillOpacity:ring.fo,weight:ring.w,opacity:0}).addTo(map));});
      // Outer dashed border
      layRef.current.push(L.circle([z.lat,z.lng],{radius:z.radius,color:c,fillColor:'transparent',fillOpacity:0,weight:isN?1.5:1,opacity:isN?0.40:0.25,dashArray:isN?'6 4':'4 6'}).addTo(map));
      const s=isN?12:10;const m=L.marker([z.lat,z.lng],{icon:L.divIcon({className:'',html:`<div style="width:${s}px;height:${s}px;background:${c};border-radius:50%;opacity:0.85;border:2px solid ${isN?'#ffffffaa':'rgba(255,255,255,0.25)'};box-shadow:0 0 ${isN?12:8}px ${c}cc;${isN?'animation:newsPulse 2s ease-in-out infinite;':''}"></div>`,iconSize:[s,s],iconAnchor:[s/2,s/2]})}).addTo(map);m.bindPopup(`<div style="background:#0d060a;border:1px solid ${c}44;color:#fff;padding:8px 12px;border-radius:12px;font-size:11px;font-family:'Poppins',sans-serif;line-height:1.6;min-width:160px;max-width:240px"><div style="color:${c};font-weight:700;margin-bottom:4px">${isN?'📰':'⚠'} ${z.label}</div><div style="color:#ffffff66;font-size:10px">${z.note}</div><div style="margin-top:6px;font-size:9px;padding:3px 8px;border-radius:20px;background:${c}22;color:${c};border:1px solid ${c}44;display:inline-block;font-weight:600">${Math.round(z.risk*100)}% RISK</div></div>`,{className:'st-popup'});layRef.current.push(m);});
    safePlaces.forEach(p=>{const bright=nearbySet.has(p.id),sel=dest?.id===p.id,c=TAG_COLOR[p.tags[0]]||'#888',s=sel?18:bright?13:7;const m=L.marker([p.lat,p.lng],{icon:L.divIcon({className:'',html:`<div style="width:${s}px;height:${s}px;background:${sel?'#fff':c};border-radius:50%;opacity:${bright||sel?1:0.18};border:${sel?`3px solid ${c}`:bright?'2px solid rgba(255,255,255,.2)':'none'};box-shadow:0 0 ${sel?14:bright?8:2}px ${c}${sel?'dd':bright?'99':'22'}"></div>`,iconSize:[s,s],iconAnchor:[s/2,s/2]})}).addTo(map);if(bright||sel)m.bindPopup(`<div style="background:#080d12;color:#fff;padding:7px 11px;border-radius:7px;font-size:12px;font-family:'DM Mono',monospace;line-height:1.5"><span style="color:${c}">${TAG_ICON[p.tags[0]]} ${p.name}</span></div>`,{className:'st-popup'});markRef.current.push(m);});
    const cc=navigating&&routeData?routeData.steps.slice(0,stepIndex).flatMap(s=>s.coords):[];const rc=navigating&&routeData?routeData.steps.slice(stepIndex).flatMap(s=>s.coords):(routeData?.allCoords||[]);
    if(cc.length>1)routeRef.current.push(L.polyline(cc,{color:'#e81850',weight:3,opacity:0.2}).addTo(map));
    if(rc.length>1){routeRef.current.push(L.polyline(rc,{color:'#e81850',weight:10,opacity:0.08}).addTo(map));routeRef.current.push(L.polyline(rc,{color:'#e81850',weight:3.5,opacity:0.92,dashArray:navigating?'10,6':undefined}).addTo(map));}
    if(pin&&!navigating){const m=L.marker([pin.lat,pin.lng],{icon:L.divIcon({className:'',html:`<div style="position:relative;width:22px;height:22px"><div style="width:22px;height:22px;background:#e81850;border-radius:50%;border:3px solid #fff;box-shadow:0 0 0 5px #e8185040,0 0 20px #e8185099"></div><div style="position:absolute;bottom:-13px;left:50%;transform:translateX(-50%);width:2px;height:13px;background:linear-gradient(#e81850,transparent)"></div></div>`,iconSize:[22,35],iconAnchor:[11,35]})}).addTo(map);m.bindPopup(`<div style="background:#0d060a;color:#e81850;padding:6px 10px;border-radius:6px;font-size:12px;font-family:'DM Mono',monospace">you are here</div>`,{className:'st-popup'});markRef.current.push(m);}
    if(dest&&!navigating)markRef.current.push(L.marker([dest.lat,dest.lng],{icon:L.divIcon({className:'',html:`<div style="width:16px;height:16px;background:#fff;border:3px solid #e81850;border-radius:50%;box-shadow:0 0 14px #e8185088"></div>`,iconSize:[16,16],iconAnchor:[8,8]})}).addTo(map));
    if(dest&&pin&&!navigating)map.flyTo([(pin.lat+dest.lat)/2,(pin.lng+dest.lng)/2],15,{duration:1});
    if(navigating&&routeData?.steps?.[stepIndex]?.coords?.length){const coords=routeData.steps[stepIndex].coords;const nm=L.marker(coords[0],{icon:L.divIcon({className:'',html:`<div class="nav-dot-outer"><div class="nav-dot-inner"></div></div>`,iconSize:[24,24],iconAnchor:[12,12]})}).addTo(map);navDotRef.current=nm;let idx=0;navTimerRef.current=setInterval(()=>{if(idx>=coords.length){clearInterval(navTimerRef.current);return;}nm.setLatLng(coords[idx]);map.panTo(coords[idx],{animate:true,duration:0.15});idx++;},80);}
  },[pin,nearby,safePlaces,dest,routeData,navigating,stepIndex,showUnsafe,unsafeZones]);
  return <div ref={cRef} style={{height:'100%',width:'100%'}}/>;
}

// ═══════════════════════════════════════════════════════════════════
function BottomNav({activeTab,onMap,onComplaint,onTrack}){return(
  <div style={{position:'absolute',bottom:0,left:0,right:0,zIndex:950,height:68,background:'rgba(7,7,14,0.97)',borderTop:'1px solid #ffffff06',backdropFilter:'blur(20px)',display:'flex',alignItems:'center',justifyContent:'space-around',padding:'0 24px',fontFamily:"'Poppins',sans-serif"}}>
    <button onClick={onMap} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:3,background:'none',border:'none',cursor:'pointer',color:activeTab==='map'?'#e81850':'#ffffff28',transition:'color 0.2s',flex:1}}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>
      <span style={{fontSize:9,fontWeight:600}}>Map</span>
    </button>
    <button onClick={onComplaint} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:3,background:'none',border:'none',cursor:'pointer',color:activeTab==='complaint'?'#e81850':'#ffffff28',transition:'color 0.2s',flex:1}}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="8" y1="16" x2="12" y2="16"/></svg>
      <span style={{fontSize:9,fontWeight:600}}>Report</span>
    </button>
    <button onClick={onTrack} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:3,background:'none',border:'none',cursor:'pointer',color:activeTab==='track'?'#e81850':'#ffffff28',transition:'color 0.2s',flex:1}}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <span style={{fontSize:9,fontWeight:600}}>Track</span>
    </button>
  </div>
);}

// ═══════════════════════════════════════════════════════════════════
function LandingPage({onEnter}){
  const[phase,setPhase]=useState('first'); // first | confirm | sending | sent
  const handleTap=()=>{
    if(phase==='first'){setPhase('confirm');return;}
    if(phase==='confirm'){
      setPhase('sending');
      window.location.href='tel:100';
      setTimeout(()=>{setPhase('sent');setTimeout(()=>{setPhase('first');},2500);},1800);
    }
  };
  const isRed=phase==='confirm'||phase==='sending';const isSent=phase==='sent';
  return(
  <div style={{height:'100%',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:isSent?'#040e08':isRed?'#12060a':'#000000',fontFamily:"'Poppins',sans-serif",animation:'fadeIn 0.5s ease',position:'relative',transition:'background 0.6s'}}>
    {/* Subtle dot grid */}
    <div style={{position:'absolute',inset:0,opacity:0.03,backgroundImage:'radial-gradient(#e81850 1px, transparent 1px)',backgroundSize:'32px 32px',pointerEvents:'none'}}/>

    <div style={{position:'relative',zIndex:1,display:'flex',flexDirection:'column',alignItems:'center'}}>
      {/* Title */}
      <div style={{marginBottom:6,opacity:isRed||isSent?0.4:1,transition:'opacity 0.4s'}}>
        <span style={{fontSize:24,fontWeight:900,color:'#fff',letterSpacing:'-0.02em'}}>SAFE</span>
        <span style={{fontSize:24,fontWeight:900,color:'#e81850',letterSpacing:'-0.02em'}}>TRACE</span>
      </div>
      <div style={{fontSize:11,color:'#ffffff22',marginBottom:36,fontWeight:500,letterSpacing:'0.08em',opacity:isRed||isSent?0.3:1,transition:'opacity 0.4s'}}>Your safety companion</div>

      {/* SOS Button */}
      <div style={{position:'relative',marginBottom:24}}>
        <button onClick={handleTap} disabled={phase==='sending'||phase==='sent'} style={{
          width:140,height:140,borderRadius:'50%',
          background:isSent?'#34d399':isRed?'#dc2626':'#e81850',
          border:'none',color:'#fff',
          fontSize:isSent?44:36,fontWeight:900,
          fontFamily:"'Poppins',sans-serif",
          cursor:phase==='sending'||phase==='sent'?'default':'pointer',
          animation:isRed&&phase!=='sending'?'confirmPulse 1.2s ease-in-out infinite':phase==='first'?'sosPulse 2s ease-in-out infinite':'none',
          transition:'all 0.4s cubic-bezier(0.4,0,0.2,1)',
          position:'relative',zIndex:2,
          boxShadow:isSent?'0 0 50px #34d39944':isRed?'0 0 60px rgba(220,38,38,0.4)':'0 0 50px rgba(232,24,80,0.35)',
        }}>
          {isSent?'✓':phase==='sending'?<span style={{display:'inline-block',animation:'spin 1s linear infinite',fontSize:28}}>◌</span>:'SOS'}
        </button>
        {(phase==='first'||phase==='confirm')&&<div style={{position:'absolute',top:-12,left:-12,right:-12,bottom:-12,borderRadius:'50%',border:`2px solid ${isRed?'#dc262630':'#e8185020'}`,pointerEvents:'none'}}/>}
        {phase==='first'&&<div style={{position:'absolute',top:-20,left:-20,right:-20,bottom:-20,borderRadius:'50%',border:'1px solid #e8185010',pointerEvents:'none'}}/>}
      </div>

      {/* Status text */}
      <div style={{fontSize:12,fontWeight:700,letterSpacing:'0.12em',marginBottom:6,textAlign:'center',transition:'color 0.3s',
        color:isSent?'#34d399':isRed?'#ff4444':'#e81850',
      }}>
        {isSent?'ALERT DISPATCHED':phase==='sending'?'SENDING ALERT...':'EMERGENCY SOS'}
      </div>
      <div style={{fontSize:11,color:'#ffffff28',textAlign:'center',lineHeight:1.5,marginBottom:44,minHeight:34,transition:'color 0.3s'}}>
        {isSent?'Help is on the way. Stay where you are.'
          :phase==='sending'?'Contacting nearest police station...'
          :isRed?'Are you sure you want to alert the police?'
          :'Tap for emergency alert'}
      </div>
      {isRed&&phase==='confirm'&&<div style={{fontSize:12,fontWeight:700,color:'#ff4444',fontFamily:"'Poppins',sans-serif",animation:'fadeIn 0.3s ease',letterSpacing:'0.06em',marginBottom:44,marginTop:-36}}>TAP AGAIN TO CONFIRM</div>}

      {/* Enter SafeTrace */}
      <button onClick={onEnter} style={{
        padding:'14px 44px',
        background:isRed||isSent?'rgba(255,255,255,0.06)':'transparent',
        border:`1px solid ${isRed?'#ffffff15':isSent?'#34d39933':'#e8185033'}`,
        borderRadius:50,
        color:isRed?'#ffffff55':isSent?'#34d399':'#e81850',
        fontSize:12,fontWeight:700,letterSpacing:'0.15em',
        fontFamily:"'Poppins',sans-serif",cursor:'pointer',
        transition:'all 0.3s',
        backdropFilter:'blur(8px)',
      }}>
        ENTER SAFETRACE
      </button>
    </div>
  </div>
);}

// ═══════════════════════════════════════════════════════════════════
// ARRIVAL CHECK-IN OVERLAY
// ═══════════════════════════════════════════════════════════════════
function ArrivalCheckIn({destName,onSafe,onNeedHelp}){
  const[state,setState]=useState('ask'); // ask | safe | help | alerting | alerted
  const handleSafe=()=>{setState('safe');setTimeout(()=>onSafe(),2000);};
  const handleHelp=()=>{setState('alerting');setTimeout(()=>setState('alerted'),1800);};

  return(
    <div style={{position:'absolute',inset:0,zIndex:2000,display:'flex',flexDirection:'column',justifyContent:'flex-end',animation:'overlayIn 0.25s ease'}}>
      <div style={{position:'absolute',inset:0,background:state==='safe'?'rgba(0,20,10,0.7)':state==='alerted'?'rgba(20,5,5,0.7)':'rgba(0,0,0,0.65)',backdropFilter:'blur(10px)',transition:'background 0.5s'}}/>
      <div style={{
        position:'relative',zIndex:1,
        background:state==='safe'?'#071510':state==='alerted'||state==='alerting'?'#14080a':'#0a0a14',
        borderRadius:'28px 28px 0 0',padding:'24px 24px 36px',
        minHeight:state==='alerted'?440:340,
        display:'flex',flexDirection:'column',alignItems:'center',
        animation:'sheetUp 0.4s cubic-bezier(0.32,1.4,0.58,1)',
        transition:'background 0.5s',
        fontFamily:"'Poppins',sans-serif",
      }}>
        <div style={{width:40,height:4,borderRadius:2,background:'#ffffff15',marginBottom:20}}/>

        {state==='ask'&&<>
          <div style={{width:64,height:64,borderRadius:'50%',background:'#e8185012',border:'2px solid #e8185044',display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,marginBottom:16}}>🏁</div>
          <div style={{fontSize:18,fontWeight:800,color:'#fff',marginBottom:4}}>You've Arrived</div>
          <div style={{fontSize:12,color:'#ffffff33',marginBottom:6,textAlign:'center'}}>{destName}</div>
          <div style={{fontSize:14,fontWeight:600,color:'#ffffff88',marginBottom:28,textAlign:'center'}}>Are you okay? Do you need help?</div>
          <div style={{display:'flex',gap:12,width:'100%'}}>
            <button onClick={handleSafe} style={{flex:1,padding:'16px',background:'#34d399',border:'none',borderRadius:16,color:'#fff',fontSize:14,fontWeight:700,fontFamily:"'Poppins',sans-serif",cursor:'pointer',boxShadow:'0 0 24px #34d39933'}}>
              I'm Safe ✓
            </button>
            <button onClick={handleHelp} style={{flex:1,padding:'16px',background:'#dc2626',border:'none',borderRadius:16,color:'#fff',fontSize:14,fontWeight:700,fontFamily:"'Poppins',sans-serif",cursor:'pointer',boxShadow:'0 0 24px #dc262633'}}>
              Need Help
            </button>
          </div>
        </>}

        {state==='safe'&&<>
          <div style={{width:80,height:80,borderRadius:'50%',background:'#34d39918',border:'2px solid #34d399',display:'flex',alignItems:'center',justifyContent:'center',fontSize:36,marginBottom:16,animation:'checkPop 0.5s cubic-bezier(0.34,1.4,0.64,1)'}}>✓</div>
          <div style={{fontSize:20,fontWeight:800,color:'#34d399',marginBottom:6}}>You're Safe</div>
          <div style={{fontSize:12,color:'#ffffff33'}}>Glad you made it safely. Stay safe!</div>
        </>}

        {state==='alerting'&&<>
          <div style={{width:72,height:72,borderRadius:'50%',background:'#dc262618',border:'2px solid #dc2626',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:16}}>
            <span style={{fontSize:28,display:'inline-block',animation:'spin 1s linear infinite'}}>◌</span>
          </div>
          <div style={{fontSize:16,fontWeight:700,color:'#ff4444',marginBottom:6}}>Sending Alert...</div>
          <div style={{fontSize:12,color:'#ffffff33'}}>Contacting nearest police station</div>
        </>}

        {state==='alerted'&&<>
          <div style={{width:64,height:64,borderRadius:'50%',background:'#dc262618',border:'2px solid #dc2626',display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,marginBottom:16,animation:'checkPop 0.5s ease'}}>🚨</div>
          <div style={{fontSize:16,fontWeight:800,color:'#ff4444',marginBottom:4}}>Alert Sent</div>
          <div style={{fontSize:12,color:'#ffffff33',marginBottom:24,textAlign:'center'}}>Help is on the way. Use the buttons below to call directly.</div>

          <div style={{width:'100%',display:'flex',flexDirection:'column',gap:10}}>
            <a href="tel:100" style={{
              display:'flex',alignItems:'center',gap:12,padding:'16px 18px',
              background:'#0d0d14',border:'1px solid #dc262633',borderRadius:16,
              textDecoration:'none',cursor:'pointer',transition:'border-color 0.2s',
            }}>
              <div style={{width:44,height:44,borderRadius:14,background:'#dc262615',border:'1px solid #dc262633',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>🚔</div>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:700,color:'#fff'}}>Call Police</div>
                <div style={{fontSize:11,color:'#ffffff33',marginTop:1}}>Emergency Helpline 100</div>
              </div>
              <div style={{fontSize:16,color:'#dc2626'}}>→</div>
            </a>

            <a href="tel:1091" style={{
              display:'flex',alignItems:'center',gap:12,padding:'16px 18px',
              background:'#0d0d14',border:'1px solid #e8185033',borderRadius:16,
              textDecoration:'none',cursor:'pointer',transition:'border-color 0.2s',
            }}>
              <div style={{width:44,height:44,borderRadius:14,background:'#e8185012',border:'1px solid #e8185033',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>📞</div>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:700,color:'#fff'}}>Women Helpline</div>
                <div style={{fontSize:11,color:'#ffffff33',marginTop:1}}>Dial 1091</div>
              </div>
              <div style={{fontSize:16,color:'#e81850'}}>→</div>
            </a>

            <a href="tel:112" style={{
              display:'flex',alignItems:'center',gap:12,padding:'16px 18px',
              background:'#0d0d14',border:'1px solid #ff950033',borderRadius:16,
              textDecoration:'none',cursor:'pointer',transition:'border-color 0.2s',
            }}>
              <div style={{width:44,height:44,borderRadius:14,background:'#ff950012',border:'1px solid #ff950033',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>🆘</div>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:700,color:'#fff'}}>Emergency Services</div>
                <div style={{fontSize:11,color:'#ffffff33',marginTop:1}}>Dial 112</div>
              </div>
              <div style={{fontSize:16,color:'#ff9500'}}>→</div>
            </a>
          </div>

          <button onClick={onNeedHelp} style={{marginTop:16,padding:'12px 32px',background:'transparent',border:'1px solid #ffffff12',borderRadius:24,color:'#ffffff44',fontSize:12,fontWeight:600,fontFamily:"'Poppins',sans-serif",cursor:'pointer'}}>Close</button>
        </>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TRACK PAGE
// ═══════════════════════════════════════════════════════════════════
function TrackPage({onBack,activeTab,onMap,onComplaint,onTrack}){
  const[inputId,setInputId]=useState('');
  const[activeId,setActiveId]=useState(null); // the ID being tracked
  const[caseData,setCaseData]=useState(null);  // null=not fetched | false=not found | object=found
  const[loading,setLoading]=useState(false);
  const[fetchError,setFetchError]=useState('');
  const[copied,setCopied]=useState(false);
  const[realtimeConnected,setRealtimeConnected]=useState(false);
  const channelRef=useRef(null);

  const STATUS_CONFIG={
    'under review':  {label:'Under Review',  color:'#38bdf8',dot:'#38bdf8',bg:'#38bdf808',border:'#38bdf822'},
    'investigating': {label:'Investigating', color:'#fbbf24',dot:'#fbbf24',bg:'#fbbf2408',border:'#fbbf2422'},
    'resolved':      {label:'Resolved',      color:'#34d399',dot:'#34d399',bg:'#34d39908',border:'#34d39922'},
    'rejected':      {label:'Rejected',      color:'#ff2d55',dot:'#ff2d55',bg:'#ff2d5508',border:'#ff2d5522'},
    'closed':        {label:'Closed',        color:'#ffffff55',dot:'#ffffff44',bg:'#ffffff05',border:'#ffffff12'},
  };
  const getStatus=s=>{const k=(s||'').toLowerCase().trim();return STATUS_CONFIG[k]||{label:s||'Under Review',color:'#38bdf8',dot:'#38bdf8',bg:'#38bdf808',border:'#38bdf822'};};
  const fmtDate=iso=>{if(!iso)return'—';const d=new Date(iso);return d.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})+' · '+d.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'});};

  const fetchReport=async(id)=>{
    setLoading(true);setFetchError('');
    try{
      const{data,error}=await supabase.from('reports').select('case_id,status,created_at').eq('case_id',id).limit(1).single();
      if(error||!data){setCaseData(false);}
      else{setCaseData(data);}
    }catch(e){setFetchError('Network error.');setCaseData(false);}
    setLoading(false);
  };

  // Subscribe to realtime whenever activeId changes
  useEffect(()=>{
    if(!activeId)return;
    fetchReport(activeId);

    // Tear down previous channel
    if(channelRef.current){supabase.removeChannel(channelRef.current);channelRef.current=null;}

    const ch=supabase
      .channel(`report-status-${activeId}`)
      .on('postgres_changes',
        {event:'UPDATE',schema:'public',table:'reports',filter:`case_id=eq.${activeId}`},
        payload=>{
          console.log('[Realtime] report updated',payload.new);
          setCaseData(prev=>prev?{...prev,...payload.new}:payload.new);
        }
      )
      .subscribe(status=>{
        setRealtimeConnected(status==='SUBSCRIBED');
      });

    channelRef.current=ch;
    return()=>{supabase.removeChannel(ch);channelRef.current=null;setRealtimeConnected(false);};
  },[activeId]);

  const handleSearch=()=>{
    const id=inputId.trim();
    if(id.length<4)return;
    setActiveId(id);
  };

  const handleCopy=()=>{
    navigator.clipboard?.writeText(activeId).catch(()=>{});
    setCopied(true);setTimeout(()=>setCopied(false),2000);
  };

  const sc=caseData?getStatus(caseData.status):null;

  return(
    <div style={{height:'100%',display:'flex',flexDirection:'column',background:'#000000',fontFamily:"'Poppins',sans-serif",position:'relative'}}>
      <div style={{padding:'16px 20px 14px',flexShrink:0,borderBottom:'1px solid #ffffff08'}}>
        <div style={{fontSize:17,fontWeight:800,color:'#fff'}}>Track Case</div>
        <div style={{display:'flex',alignItems:'center',gap:6,marginTop:2}}>
          <div style={{fontSize:10,color:'#ffffff28'}}>Enter your Case ID to view live status</div>
          {activeId&&(
            <div style={{display:'flex',alignItems:'center',gap:4,background:realtimeConnected?'#34d39910':'#ffffff08',borderRadius:20,padding:'2px 8px',border:`1px solid ${realtimeConnected?'#34d39933':'#ffffff0c'}`}}>
              <div style={{width:5,height:5,borderRadius:'50%',background:realtimeConnected?'#34d399':'#ffffff33',boxShadow:realtimeConnected?'0 0 4px #34d399':'none'}}/>
              <span style={{fontSize:8,color:realtimeConnected?'#34d399':'#ffffff33',fontWeight:600}}>{realtimeConnected?'LIVE':'CONNECTING'}</span>
            </div>
          )}
        </div>
      </div>

      <div style={{flex:1,overflowY:'auto',padding:'24px 20px 100px',background:'#000000'}}>
        {/* Search */}
        <div style={{background:'#0d0d14',border:'1px solid #ffffff10',borderRadius:18,padding:'16px',marginBottom:16}}>
          <div style={{fontSize:10,fontWeight:700,color:'#ffffff44',letterSpacing:'0.15em',marginBottom:10}}>CASE ID</div>
          <div style={{display:'flex',gap:8}}>
            <input
              type="text"
              value={inputId}
              onChange={e=>setInputId(e.target.value.toUpperCase())}
              onKeyDown={e=>e.key==='Enter'&&handleSearch()}
              placeholder="e.g. ST-AB12CD34"
              style={{flex:1,background:'#000000',border:'1px solid #ffffff12',borderRadius:12,padding:'12px 14px',color:'#fff',fontSize:13,fontFamily:"'DM Mono',monospace",outline:'none',letterSpacing:'0.06em'}}
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={!inputId.trim()||loading}
            style={{marginTop:12,width:'100%',padding:'13px',background:inputId.trim()&&!loading?'#e81850':'#1a0c14',border:'none',borderRadius:14,color:inputId.trim()&&!loading?'#fff':'#ffffff1a',fontSize:13,fontWeight:700,fontFamily:"'Poppins',sans-serif",cursor:inputId.trim()&&!loading?'pointer':'not-allowed',display:'flex',alignItems:'center',justifyContent:'center',gap:8,boxShadow:inputId.trim()&&!loading?'0 0 24px #e8185033':'none',transition:'all 0.2s'}}
          >
            {loading
              ?<><span style={{animation:'spin 1s linear infinite',display:'inline-block'}}>◌</span>Looking up...</>
              :<><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>Track Case</>
            }
          </button>
        </div>

        {/* Loading */}
        {loading&&<div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:10,padding:'28px 0',color:'#ffffff33',fontSize:12}}><span style={{animation:'spin 1s linear infinite',display:'inline-block',fontSize:18}}>◌</span>Fetching case status...</div>}

        {/* Found */}
        {!loading&&caseData&&sc&&(
          <div style={{animation:'fadeUp 0.3s ease'}}>
            <div style={{background:'#0d0d14',border:'1px solid #ffffff08',borderRadius:18,padding:'20px',marginBottom:12}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
                <div>
                  <div style={{fontSize:9,color:'#ffffff33',fontWeight:600,letterSpacing:'0.12em',marginBottom:4}}>CASE ID</div>
                  <div style={{fontSize:18,fontWeight:800,color:'#e81850',fontFamily:"'DM Mono',monospace",letterSpacing:'0.06em'}}>{caseData.case_id}</div>
                </div>
                <button onClick={handleCopy} style={{background:copied?'#34d39915':'#ffffff08',border:`1px solid ${copied?'#34d39944':'#ffffff0c'}`,borderRadius:10,padding:'8px 12px',color:copied?'#34d399':'#ffffff55',fontSize:11,fontWeight:600,fontFamily:"'Poppins',sans-serif",cursor:'pointer',display:'flex',alignItems:'center',gap:5,transition:'all 0.2s'}}>{copied?'✓ Copied':'Copy'}</button>
              </div>
              <div style={{height:1,background:'#ffffff08',marginBottom:16}}/>
              {/* Status badge */}
              <div style={{display:'flex',alignItems:'center',gap:10,padding:'14px',background:sc.bg,border:`1px solid ${sc.border}`,borderRadius:14,marginBottom:12}}>
                <div style={{width:10,height:10,borderRadius:'50%',background:sc.dot,boxShadow:`0 0 8px ${sc.dot}`,flexShrink:0}}/>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:700,color:sc.color}}>{sc.label}</div>
                  <div style={{fontSize:10,color:'#ffffff28',marginTop:2}}>{realtimeConnected?'Live updates enabled — refreshes automatically':'Fetched from SafeTrace database'}</div>
                </div>
                {realtimeConnected&&<div style={{width:6,height:6,borderRadius:'50%',background:'#34d399',boxShadow:'0 0 6px #34d399',animation:'breathe 2s ease-in-out infinite'}}/>}
              </div>
              {/* Date */}
              <div style={{display:'flex',alignItems:'center',gap:8,padding:'10px 12px',background:'#ffffff04',border:'1px solid #ffffff06',borderRadius:12}}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ffffff33" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                <div style={{fontSize:10,color:'#ffffff33'}}>Submitted: <span style={{color:'#ffffff55',fontFamily:"'DM Mono',monospace"}}>{fmtDate(caseData.created_at)}</span></div>
              </div>
            </div>
            <div style={{background:'#0d0d14',border:'1px solid #ffffff06',borderRadius:16,padding:'14px 16px'}}>
              <div style={{fontSize:10,color:'#ffffff22',textAlign:'center',lineHeight:1.6}}>Status updates automatically when your case is reviewed — no need to refresh.</div>
            </div>
          </div>
        )}

        {/* Not found */}
        {!loading&&activeId&&caseData===false&&(
          <div style={{animation:'fadeUp 0.3s ease',background:'#0d0d14',border:'1px solid #ff2d5522',borderRadius:18,padding:'24px 20px',textAlign:'center'}}>
            <div style={{fontSize:28,marginBottom:10}}>🔍</div>
            <div style={{fontSize:13,fontWeight:700,color:'#ff2d55',marginBottom:6}}>{fetchError?'Connection Error':'Case Not Found'}</div>
            <div style={{fontSize:11,color:'#ffffff28',lineHeight:1.6}}>{fetchError||"No record found. Double-check the Case ID — it's case-sensitive."}</div>
          </div>
        )}

        {/* Empty state */}
        {!activeId&&(
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',padding:'32px 0',gap:12,opacity:0.5}}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ffffff22" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <div style={{fontSize:12,color:'#ffffff22',textAlign:'center',lineHeight:1.6}}>Enter your Case ID above{"\n"}to check your report status</div>
          </div>
        )}
      </div>

      <BottomNav activeTab={activeTab} onMap={onMap} onComplaint={onComplaint} onTrack={onTrack}/>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
function MapPage({onSOS,onComplaint,onMap,onTrack,activeTab,showSOS,sosAnim}){
  const[pin,setPin]=useState(null);const[nearby,setNearby]=useState([]);const[dest,setDest]=useState(null);const[routeData,setRouteData]=useState(null);const[loading,setLoading]=useState(false);const[navigating,setNavigating]=useState(false);const[stepIndex,setStepIndex]=useState(0);const[showUnsafe,setShowUnsafe]=useState(true);const[safePlaces,setSafePlaces]=useState(STATIC_SAFE_PLACES);const[unsafeZones,setUnsafeZones]=useState(STATIC_UNSAFE_ZONES);const[newsLoading,setNewsLoading]=useState(false);const[placesLoading,setPlacesLoading]=useState(false);const[dataStatus,setDataStatus]=useState({places:'static',news:'static'});const[mapReady,setMapReady]=useState(false);const newsFetched=useRef(false);
  const[showArrival,setShowArrival]=useState(false);const[arrivedDest,setArrivedDest]=useState('');

  useEffect(()=>{if(!document.getElementById('leaflet-css')){const l=document.createElement('link');l.id='leaflet-css';l.rel='stylesheet';l.href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';document.head.appendChild(l);}if(!window.L){const s=document.createElement('script');s.src='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';s.onload=()=>setMapReady(true);document.head.appendChild(s);}else setMapReady(true);},[]);
  useEffect(()=>{if(newsFetched.current)return;if(!NEWSAPI_KEY||NEWSAPI_KEY==='YOUR_NEWSAPI_KEY_HERE')return;newsFetched.current=true;setNewsLoading(true);fetchNewsHazards(NEWSAPI_KEY).then(nz=>{if(nz.length>0){setUnsafeZones(p=>[...p,...nz]);setDataStatus(p=>({...p,news:'live'}));}}).catch(()=>{}).finally(()=>setNewsLoading(false));},[]);

  const fetchPlacesForPin=useCallback(async(lat,lng)=>{if(!GOOGLE_API_KEY||GOOGLE_API_KEY==='YOUR_GOOGLE_API_KEY_HERE')return STATIC_SAFE_PLACES;setPlacesLoading(true);try{const dp=await fetchNearbyPlaces(lat,lng,GOOGLE_API_KEY);if(dp.length>0){const m=[...dp];for(const s of STATIC_SAFE_PLACES)if(!dp.some(d=>haversine({lat:s.lat,lng:s.lng},{lat:d.lat,lng:d.lng})<100))m.push(s);setSafePlaces(m);setDataStatus(p=>({...p,places:'live'}));return m;}}catch(e){}finally{setPlacesLoading(false);}return STATIC_SAFE_PLACES;},[]);

  const handlePinDrop=useCallback(async(latlng)=>{if(navigating)return;const{lat,lng}=latlng;setPin({lat,lng});const places=await fetchPlacesForPin(lat,lng);setNearby([...places].map(p=>({...p,_dist:haversine({lat,lng},p)})).sort((a,b)=>a._dist-b._dist).slice(0,8));},[navigating,fetchPlacesForPin]);
  async function handleSelectDest(p){setDest(p);setRouteData(null);setLoading(true);setRouteData(await fetchRoute(pin,p));setLoading(false);}
  function handleStartNav(){setNavigating(true);setStepIndex(0);}
  function handleArrived(){setArrivedDest(dest?.name||'destination');setNavigating(false);setShowArrival(true);}
  function handleReset(){setPin(null);setNearby([]);setDest(null);setRouteData(null);setNavigating(false);setStepIndex(0);setLoading(false);setShowArrival(false);}
  function handleChangeDest(){setDest(null);setRouteData(null);setNavigating(false);setStepIndex(0);}

  const safeCount=pin?safePlaces.filter(p=>(p.tags[0]==='police'||p.tags[0]==='hospital')&&haversine(pin,p)<=15000).length:safePlaces.filter(p=>p.tags[0]==='police'||p.tags[0]==='hospital').length;
  const riskHigh=pin?unsafeZones.filter(z=>z.risk>=0.75&&haversine(pin,{lat:z.lat,lng:z.lng})<=15000).length:unsafeZones.filter(z=>z.risk>=0.75).length;
  const riskTotal=pin?unsafeZones.filter(z=>haversine(pin,{lat:z.lat,lng:z.lng})<=15000).length:unsafeZones.length;

  return(
    <div style={{height:'100%',width:'100%',position:'relative',background:'#000000'}}>
      {/* Header */}
      {!navigating&&<div style={{position:'absolute',top:0,left:0,right:0,zIndex:800,padding:'14px 20px 10px',paddingRight:'72px',background:'linear-gradient(180deg,rgba(0,0,0,0.96) 0%,rgba(0,0,0,0.7) 60%,transparent 100%)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{fontFamily:"'Poppins',sans-serif"}}>
          <span style={{fontSize:18,fontWeight:800,color:'#fff',letterSpacing:'-0.01em'}}>Safe</span><span style={{fontSize:18,fontWeight:800,color:'#e81850',letterSpacing:'-0.01em'}}>Trace</span>
        </div>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          {(dataStatus.places==='live'||dataStatus.news==='live')&&!newsLoading&&!placesLoading&&<div style={{display:'flex',gap:4,alignItems:'center',background:'#ffffff08',borderRadius:20,padding:'4px 10px'}}>
            <div style={{width:5,height:5,borderRadius:'50%',background:'#34d399',boxShadow:'0 0 6px #34d399'}}/>
            <span style={{fontSize:9,color:'#34d399',fontFamily:"'Poppins',sans-serif",fontWeight:600}}>LIVE</span>
          </div>}
        </div>
      </div>}

      {/* SOS button — always visible top-right, above NavOverlay */}
      <button onClick={onSOS} style={{position:'absolute',top:14,right:20,zIndex:1200,width:44,height:44,borderRadius:'50%',background:'#e81850',border:'none',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 0 20px #e8185055',animation:sosAnim?'sosNavBounce 0.6s ease':'none',cursor:'pointer'}}>
        <span style={{color:'#fff',fontSize:12,fontWeight:900,fontFamily:"'Poppins',sans-serif",letterSpacing:'0.02em'}}>SOS</span>
      </button>
      {/* Map */}
      {mapReady&&<LeafletMap pin={pin} onMapClick={handlePinDrop} nearby={nearby} safePlaces={safePlaces} dest={dest} routeData={routeData} navigating={navigating} stepIndex={stepIndex} showUnsafe={showUnsafe} unsafeZones={unsafeZones}/>}
      {!mapReady&&<div style={{height:'100%',display:'flex',alignItems:'center',justifyContent:'center',color:'#ffffff28',fontFamily:"'Poppins',sans-serif",fontSize:13}}><span style={{animation:'spin 1s linear infinite',display:'inline-block',marginRight:10}}>◌</span>Loading map...</div>}


      {/* ── Quick-stat cards (AFTER pin drop, before selecting dest) ── */}
      {pin&&!dest&&!navigating&&mapReady&&(
        <div style={{position:'absolute',top:72,left:0,right:0,zIndex:799,padding:'0 12px',paddingRight:'72px',pointerEvents:'none',animation:'fadeUp 0.4s ease both'}}>
          <div style={{display:'flex',gap:8}}>
            {[
              {icon:'🛡️',value:`${safeCount}`,sub:'Safe spots in 15km',color:'#34d399'},
              {icon:'⚠️',value:`${riskTotal}`,sub:`${riskHigh} high risk in 15km`,color:'#ff2d55'},
              {icon:'📡',value:'Live',sub:'Monitoring active',color:'#38bdf8'},
            ].map((card,i)=>(
              <div key={i} style={{
                flex:1,background:'rgba(7,7,14,0.92)',backdropFilter:'blur(16px)',
                border:'1px solid #ffffff08',borderRadius:14,padding:'10px 10px',
                pointerEvents:'all',
                animation:`fadeUp 0.35s ease both`,animationDelay:`${i*0.08}s`,
              }}>
                <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:4}}>
                  <span style={{fontSize:14}}>{card.icon}</span>
                  <span style={{fontSize:16,fontWeight:700,color:card.color,fontFamily:"'Poppins',sans-serif",lineHeight:1}}>{card.value}</span>
                </div>
                <div style={{fontSize:8,color:'#ffffff38',fontFamily:"'Poppins',sans-serif",fontWeight:500}}>{card.sub}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loading route */}
      {loading&&<div style={{position:'absolute',bottom:90,left:'50%',transform:'translateX(-50%)',zIndex:800,background:'rgba(7,7,14,0.92)',border:'1px solid #e8185033',color:'#e81850',padding:'10px 24px',borderRadius:24,fontSize:12,backdropFilter:'blur(12px)',display:'flex',alignItems:'center',gap:8,fontFamily:"'Poppins',sans-serif",fontWeight:500}}><span style={{animation:'spin 1s linear infinite',display:'inline-block'}}>◌</span>Calculating route...</div>}

      {/* Data loading */}
      {(newsLoading||placesLoading)&&<div style={{position:'absolute',top:52,left:'50%',transform:'translateX(-50%)',zIndex:800,background:'rgba(7,7,14,0.92)',border:'1px solid #38bdf822',color:'#38bdf8',padding:'6px 18px',borderRadius:20,fontSize:10,backdropFilter:'blur(12px)',display:'flex',alignItems:'center',gap:6,fontFamily:"'Poppins',sans-serif",fontWeight:500}}><span style={{animation:'spin 1s linear infinite',display:'inline-block'}}>◌</span>{newsLoading&&placesLoading?'Loading live data...':newsLoading?'Fetching news...':'Fetching places...'}</div>}

      {/* Risk legend */}
      {showUnsafe&&!navigating&&pin&&<div style={{position:'absolute',bottom:84,right:10,zIndex:800,background:'rgba(7,7,14,0.88)',border:'1px solid #ffffff08',borderRadius:14,padding:'8px 12px',backdropFilter:'blur(12px)',fontFamily:"'DM Mono',monospace",fontSize:8,letterSpacing:'0.08em'}}>{[{l:'HIGH',c:'#ff2d55'},{l:'MED',c:'#ff9500'},{l:'LOW',c:'#ffcc00'}].map(r=><div key={r.l} style={{display:'flex',alignItems:'center',gap:5,marginBottom:2}}><div style={{width:6,height:6,borderRadius:'50%',background:r.c,boxShadow:`0 0 4px ${r.c}`}}/><span style={{color:r.c,fontSize:8}}>{r.l}</span></div>)}</div>}

      {/* Place drawer */}
      {!navigating&&<PlaceDrawer pin={pin} nearby={nearby} dest={dest} routeData={routeData} loading={loading} showUnsafe={showUnsafe} onToggleUnsafe={()=>setShowUnsafe(v=>!v)} onSelectDest={handleSelectDest} onStartNav={handleStartNav} onReset={handleReset} onChangeDest={handleChangeDest} placesLoading={placesLoading}/>}

      {/* Nav overlay */}
      {navigating&&routeData&&<NavOverlay steps={routeData.steps} stepIndex={stepIndex} setStepIndex={setStepIndex} totalDist={routeData.totalDist} totalTime={routeData.totalTime} destName={dest?.name} onEnd={handleArrived}/>}

      {/* Arrival check-in */}
      {showArrival&&<ArrivalCheckIn destName={arrivedDest} onSafe={handleReset} onNeedHelp={handleReset}/>}

      {/* Bottom nav */}
      <BottomNav activeTab={activeTab} onMap={onMap} onComplaint={onComplaint} onTrack={onTrack}/>
      {showSOS&&<SOSOverlay onClose={onSOS}/>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
export default function App(){
  const[page,setPage]=useState('landing');const[showSOS,setShowSOS]=useState(false);const[sosAnim,setSosAnim]=useState(false);
  const triggerSOS=()=>{
    setSosAnim(true);setTimeout(()=>setSosAnim(false),700);
    window.location.href='tel:100';
    setShowSOS(v=>!v);
  };
  return(<PhoneFrame><Styles/>
    {page==='landing'&&<LandingPage onEnter={()=>setPage('home')}/>}
    {page==='home'&&<MapPage activeTab="map" onSOS={triggerSOS} onComplaint={()=>setPage('complaint')} onMap={()=>{}} onTrack={()=>setPage('track')} showSOS={showSOS} sosAnim={sosAnim}/>}
    {page==='complaint'&&<div style={{height:'100%',position:'relative'}}><ComplaintPage onBack={()=>setPage('home')}/><BottomNav activeTab="complaint" onMap={()=>setPage('home')} onComplaint={()=>{}} onTrack={()=>setPage('track')}/>{showSOS&&<SOSOverlay onClose={triggerSOS}/>}</div>}
    {page==='track'&&<TrackPage activeTab="track" onMap={()=>setPage('home')} onComplaint={()=>setPage('complaint')} onTrack={()=>{}}/>}
  </PhoneFrame>);
}
