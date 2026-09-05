/* Tom & Nat's Google Street View Golf. */
const $ = q => document.querySelector(q);
const screens = { welcome: $('#welcome'), game: $('#game'), score: $('#score') };
const CLUBS = { driver:220, iron:110, wedge:45 };
const state = {
  panorama:null, sv:null, course:null, holeIndex:0, strokes:0, results:[],
  startPano:null, startPosition:null, pinPosition:null, startDistance:1,
  currentPosition:null, selectedClub:'driver', shotBusy:false, holeFinishing:false,
  miniMap:null, miniBall:null, miniPin:null, miniPinLine:null, miniAimLine:null,
  shotMap:null, shotBall:null, shotPin:null, shotPlanLine:null, shotActualLine:null
};

function worldHole(name,lat,lng,distance=650,heading=45,par=5){
  const location=holeLocation(name);
  return {name,town:location.town,country:location.country,tee:{lat,lng},pin:destinationPoint({lat,lng},heading,distance),par};
}

const LOCATION_COUNTRIES = {"Edinburgh":"Scotland","Glasgow":"Scotland","Manchester":"England","Liverpool":"England","Birmingham":"England","Bristol":"England","Cardiff":"Wales","Belfast":"Northern Ireland","Dublin":"Ireland","Galway":"Ireland","London":"England","Brighton":"England","Paris":"France","Lyon":"France","Marseille":"France","Nice":"France","Amsterdam":"Netherlands","Rotterdam":"Netherlands","Brussels":"Belgium","Antwerp":"Belgium","Luxembourg":"Luxembourg","Berlin":"Germany","Hamburg":"Germany","Munich":"Germany","Frankfurt":"Germany","Cologne":"Germany","Copenhagen":"Denmark","Stockholm":"Sweden","Oslo":"Norway","Helsinki":"Finland","Reykjavik":"Iceland","Madrid":"Spain","Barcelona":"Spain","Valencia":"Spain","Seville":"Spain","Lisbon":"Portugal","Porto":"Portugal","Rome":"Italy","Milan":"Italy","Florence":"Italy","Naples":"Italy","Venice":"Italy","Vienna":"Austria","Salzburg":"Austria","Prague":"Czechia","Warsaw":"Poland","Krakow":"Poland","Budapest":"Hungary","Ljubljana":"Slovenia","Zagreb":"Croatia","Athens":"Greece","Thessaloniki":"Greece","Tallinn":"Estonia","Riga":"Latvia","Vilnius":"Lithuania","New York":"USA","Boston":"USA","Philadelphia":"USA","Washington":"USA","Chicago":"USA","Detroit":"USA","Nashville":"USA","New Orleans":"USA","Miami":"USA","Orlando":"USA","Atlanta":"USA","Austin":"USA","Dallas":"USA","Denver":"USA","Las Vegas":"USA","Phoenix":"USA","Los Angeles":"USA","San Diego":"USA","San Francisco":"USA","Portland":"USA","Seattle":"USA","Vancouver":"Canada","Victoria":"Canada","Calgary":"Canada","Toronto":"Canada","Montreal":"Canada","Quebec City":"Canada","Mexico City":"Mexico","Guadalajara":"Mexico","San Juan":"Puerto Rico","Guatemala City":"Guatemala","Panama City":"Panama","Bogota":"Colombia","Medellin":"Colombia","Quito":"Ecuador","Lima":"Peru","Santiago":"Chile","Buenos Aires":"Argentina","Montevideo":"Uruguay","Sao Paulo":"Brazil","Rio":"Brazil","Curitiba":"Brazil","Porto Alegre":"Brazil","Tokyo":"Japan","Osaka":"Japan","Kyoto":"Japan","Sapporo":"Japan","Fukuoka":"Japan","Taipei":"Taiwan","Kaohsiung":"Taiwan","Hong Kong":"Hong Kong","Singapore":"Singapore","Kuala Lumpur":"Malaysia","Bangkok":"Thailand","Chiang Mai":"Thailand","Jakarta":"Indonesia","Bali Denpasar":"Indonesia","Manila":"Philippines","Cebu":"Philippines","Bengaluru":"India","Mumbai":"India","Delhi":"India","Sydney":"Australia","Melbourne":"Australia","Brisbane":"Australia","Gold Coast":"Australia","Adelaide":"Australia","Perth":"Australia","Hobart":"Australia","Auckland":"New Zealand","Wellington":"New Zealand","Christchurch":"New Zealand","Queenstown":"New Zealand","Cape Town":"South Africa","Johannesburg":"South Africa","Pretoria":"South Africa","Durban":"South Africa","Gaborone":"Botswana","Maseru":"Lesotho","Mbabane":"Eswatini"};

function holeLocation(name){
  const towns=Object.keys(LOCATION_COUNTRIES).sort((a,b)=>b.length-a.length);
  const town=towns.find(t=>name===t||name.startsWith(t+' '))||'Unknown';
  return {town,country:LOCATION_COUNTRIES[town]||'Unknown'};
}


// World Tour pool: deliberately broad rather than a dozen repeated landmarks.
// Coordinates are only anchors; loadHole() resolves both ends to nearby official
// outdoor Google Street View panoramas before play begins.
const HOLES = [
  // UK + Ireland
  worldHole('Edinburgh Old Town Escape',55.9533,-3.1883,720,105,5),
  worldHole('Glasgow Grid Grinder',55.8642,-4.2518,690,35,5),
  worldHole('Manchester Rain Fade',53.4808,-2.2426,760,120,5),
  worldHole('Liverpool Dock Draw',53.4084,-2.9916,680,300,5),
  worldHole('Birmingham Bullring Bounce',52.4862,-1.8904,640,55,5),
  worldHole('Bristol Harbour Hook',51.4545,-2.5879,730,210,5),
  worldHole('Cardiff Castle Carry',51.4816,-3.1791,650,145,5),
  worldHole('Belfast City Slice',54.5973,-5.9301,700,80,5),
  worldHole('Dublin Liffey Line',53.3498,-6.2603,760,110,5),
  worldHole('Galway Atlantic Approach',53.2707,-9.0568,620,25,4),
  worldHole('London Westminster Wedge',51.5007,-0.1246,780,65,5),
  worldHole('Brighton Seafront Shank',50.8225,-0.1372,680,275,5),

  // Western + Northern Europe
  worldHole('Paris Boulevard Blast',48.8566,2.3522,780,30,5),
  worldHole('Lyon Rhône Roll',45.7640,4.8357,690,150,5),
  worldHole('Marseille Port Punch',43.2965,5.3698,720,95,5),
  worldHole('Nice Promenade Pitch',43.7102,7.2620,620,250,4),
  worldHole('Amsterdam Canal Chaos',52.3676,4.9041,700,115,5),
  worldHole('Rotterdam Harbour Hybrid',51.9244,4.4777,760,225,5),
  worldHole('Brussels Waffle Wedge',50.8503,4.3517,650,40,5),
  worldHole('Antwerp Diamond Dogleg',51.2194,4.4025,720,310,5),
  worldHole('Luxembourg Hill Hacker',49.6116,6.1319,640,130,4),
  worldHole('Berlin Wallop',52.5200,13.4050,780,75,5),
  worldHole('Hamburg Harbour Hook',53.5511,9.9937,730,185,5),
  worldHole('Munich Biergarten Bounce',48.1351,11.5820,690,250,5),
  worldHole('Frankfurt Skyline Slice',50.1109,8.6821,700,35,5),
  worldHole('Cologne Cathedral Carry',50.9375,6.9603,670,120,5),
  worldHole('Copenhagen Cycle Slice',55.6761,12.5683,720,290,5),
  worldHole('Stockholm Island Iron',59.3293,18.0686,760,160,5),
  worldHole('Oslo Fjord Fade',59.9139,10.7522,700,80,5),
  worldHole('Helsinki Harbour Hack',60.1699,24.9384,680,210,5),
  worldHole('Reykjavik Lava Line',64.1466,-21.9426,640,330,4),

  // Southern + Central + Eastern Europe
  worldHole('Madrid Gran Via Drive',40.4168,-3.7038,760,95,5),
  worldHole('Barcelona Grid Gamble',41.3874,2.1686,720,15,5),
  worldHole('Valencia Orange Slice',39.4699,-0.3763,680,140,5),
  worldHole('Seville Sunburn Shank',37.3891,-5.9845,720,260,5),
  worldHole('Lisbon Tramline Trouble',38.7223,-9.1393,700,40,5),
  worldHole('Porto River Roll',41.1579,-8.6291,650,185,5),
  worldHole('Rome Ruins Recovery',41.9028,12.4964,760,300,5),
  worldHole('Milan Fashion Fade',45.4642,9.1900,690,110,5),
  worldHole('Florence Renaissance Rough',43.7696,11.2558,620,220,4),
  worldHole('Naples Pizza Punch',40.8518,14.2681,700,70,5),
  worldHole('Venice Mainland Mulligan',45.4384,12.3271,640,145,4),
  worldHole('Vienna Waltz Wedge',48.2082,16.3738,700,35,5),
  worldHole('Salzburg Sound of Shank',47.8095,13.0550,620,250,4),
  worldHole('Prague Cobbled Carry',50.0755,14.4378,690,115,5),
  worldHole('Warsaw Vistula Volley',52.2297,21.0122,760,200,5),
  worldHole('Krakow Old Town Out',50.0647,19.9450,650,325,5),
  worldHole('Budapest Danube Drive',47.4979,19.0402,740,70,5),
  worldHole('Ljubljana Dragon Draw',46.0569,14.5058,620,150,4),
  worldHole('Zagreb Tram Track',45.8150,15.9819,680,255,5),
  worldHole('Athens Acropolis Approach',37.9838,23.7275,730,20,5),
  worldHole('Thessaloniki Sea Slice',40.6401,22.9444,690,100,5),
  worldHole('Tallinn Tower Tee',59.4370,24.7536,650,180,5),
  worldHole('Riga Baltic Bounce',56.9496,24.1052,680,300,5),
  worldHole('Vilnius Old Town Line',54.6872,25.2797,660,60,5),

  // North America
  worldHole('New York Concrete Canyon',40.7580,-73.9855,800,80,5),
  worldHole('Boston Back Bay Blast',42.3503,-71.0810,700,250,5),
  worldHole('Philadelphia Philly Fade',39.9526,-75.1652,720,120,5),
  worldHole('Washington Monument Mulligan',38.8951,-77.0364,760,35,5),
  worldHole('Chicago Windy Wedge',41.8781,-87.6298,790,300,5),
  worldHole('Detroit Motor City Mash',42.3314,-83.0458,720,95,5),
  worldHole('Nashville Honky Tonk Hook',36.1627,-86.7816,680,205,5),
  worldHole('New Orleans Bourbon Bounce',29.9511,-90.0715,700,55,5),
  worldHole('Miami Vice Slice',25.7617,-80.1918,760,125,5),
  worldHole('Orlando Theme Park Trouble',28.5383,-81.3792,700,235,5),
  worldHole('Atlanta Peach Punch',33.7490,-84.3880,730,20,5),
  worldHole('Austin Keep It Weird Wedge',30.2672,-97.7431,690,150,5),
  worldHole('Dallas Big D Drive',32.7767,-96.7970,780,280,5),
  worldHole('Denver Mile High Mash',39.7392,-104.9903,740,70,5),
  worldHole('Las Vegas Strip Shank',36.1699,-115.1398,820,190,6),
  worldHole('Phoenix Desert Draw',33.4484,-112.0740,760,330,5),
  worldHole('Los Angeles Traffic Trap',34.0522,-118.2437,800,100,5),
  worldHole('San Diego Sunshine Slice',32.7157,-117.1611,720,245,5),
  worldHole('San Francisco Hill Hacker',37.7749,-122.4194,720,35,5),
  worldHole('Portland Hipster Hook',45.5152,-122.6784,690,150,5),
  worldHole('Seattle Needle Nine',47.6062,-122.3321,740,260,5),
  worldHole('Vancouver Rainy Roll',49.2827,-123.1207,720,70,5),
  worldHole('Victoria Island Iron',48.4284,-123.3656,650,200,5),
  worldHole('Calgary Stampede Slice',51.0447,-114.0719,720,315,5),
  worldHole('Toronto Tower Trouble',43.6532,-79.3832,780,115,5),
  worldHole('Montreal Poutine Punch',45.5017,-73.5673,700,20,5),
  worldHole('Quebec City Cobble Carry',46.8139,-71.2080,640,245,4),
  worldHole('Mexico City Mega Drive',19.4326,-99.1332,820,75,6),
  worldHole('Guadalajara Mariachi Mash',20.6597,-103.3496,740,170,5),

  // Central + South America
  worldHole('San Juan Caribbean Carry',18.4655,-66.1057,660,95,5),
  worldHole('Guatemala City Volcano Volley',14.6349,-90.5069,700,210,5),
  worldHole('Panama City Canal Carry',8.9824,-79.5199,760,35,5),
  worldHole('Bogota Altitude Approach',4.7110,-74.0721,750,120,5),
  worldHole('Medellin Valley Volley',6.2442,-75.5812,690,280,5),
  worldHole('Quito Equator Escape',-0.1807,-78.4678,700,60,5),
  worldHole('Lima Pacific Punch',-12.0464,-77.0428,760,155,5),
  worldHole('Santiago Andes Aim',-33.4489,-70.6693,750,25,5),
  worldHole('Buenos Aires Boulevard Blast',-34.6037,-58.3816,800,110,5),
  worldHole('Montevideo Rambla Roll',-34.9011,-56.1645,700,250,5),
  worldHole('Sao Paulo Concrete Carry',-23.5505,-46.6333,820,75,6),
  worldHole('Rio Copacabana Curve',-22.9068,-43.1729,760,180,5),
  worldHole('Curitiba Clean Drive',-25.4284,-49.2733,700,330,5),
  worldHole('Porto Alegre Southern Slice',-30.0346,-51.2177,720,45,5),

  // Asia
  worldHole('Tokyo Shibuya Shank',35.6762,139.6503,800,90,5),
  worldHole('Osaka Neon Knock',34.6937,135.5023,760,205,5),
  worldHole('Kyoto Temple Tee',35.0116,135.7681,650,35,5),
  worldHole('Sapporo Snow Slice',43.0618,141.3545,720,140,5),
  worldHole('Fukuoka Food Stall Fade',33.5904,130.4017,690,255,5),
  worldHole('Taipei Scooter Slice',25.0330,121.5654,750,75,5),
  worldHole('Kaohsiung Harbour Hack',22.6273,120.3014,700,220,5),
  worldHole('Hong Kong Kowloon Carry',22.3193,114.1694,720,30,5),
  worldHole('Singapore Marina Mash',1.3521,103.8198,760,135,5),
  worldHole('Kuala Lumpur Tower Trouble',3.1390,101.6869,740,280,5),
  worldHole('Bangkok Tuk Tuk Tee',13.7563,100.5018,780,60,5),
  worldHole('Chiang Mai Temple Trouble',18.7883,98.9853,650,170,5),
  worldHole('Jakarta Traffic Trap',-6.2088,106.8456,780,315,5),
  worldHole('Bali Denpasar Draw',-8.6705,115.2126,680,105,5),
  worldHole('Manila Jeepney Jolt',14.5995,120.9842,760,200,5),
  worldHole('Cebu Island Iron',10.3157,123.8854,690,45,5),
  worldHole('Bengaluru Tech Park Tee',12.9716,77.5946,740,130,5),
  worldHole('Mumbai Monsoon Mash',19.0760,72.8777,760,260,5),
  worldHole('Delhi Dusty Drive',28.6139,77.2090,780,80,5),

  // Oceania
  worldHole('Sydney Harbour Hacker',-33.8688,151.2093,780,40,5),
  worldHole('Melbourne Laneway Line',-37.8136,144.9631,740,150,5),
  worldHole('Brisbane River Roll',-27.4698,153.0251,720,280,5),
  worldHole('Gold Coast High-Rise Hook',-28.0167,153.4000,700,95,5),
  worldHole('Adelaide Grid Grinder',-34.9285,138.6007,700,210,5),
  worldHole('Perth Sunset Slice',-31.9505,115.8605,760,35,5),
  worldHole('Hobart Harbour Hybrid',-42.8821,147.3272,640,140,4),
  worldHole('Auckland Volcano Volley',-36.8509,174.7645,740,250,5),
  worldHole('Wellington Wind Wedge',-41.2866,174.7756,660,75,5),
  worldHole('Christchurch Garden Gamble',-43.5321,172.6362,700,190,5),
  worldHole('Queenstown Mountain Mulligan',-45.0312,168.6626,620,320,4),

  // Africa
  worldHole('Cape Town Table Trouble',-33.9249,18.4241,760,110,5),
  worldHole('Johannesburg Joburg Jolt',-26.2041,28.0473,760,230,5),
  worldHole('Pretoria Purple Pitch',-25.7479,28.2293,700,55,5),
  worldHole('Durban Beach Draw',-29.8587,31.0218,700,145,5),
  worldHole('Gaborone Game Drive',-24.6282,25.9231,680,285,5),
  worldHole('Maseru Mountain Mash',-29.3158,27.4869,650,80,5),
  worldHole('Mbabane Hill Hacker',-26.3054,31.1367,620,200,4)
];

function hashSeed(str){let h=2166136261>>>0;for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function rng(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function codeFromDate(d=new Date()){const s=`${d.getUTCFullYear()}-${d.getUTCMonth()+1}-${d.getUTCDate()}`;return 'DAILY'+(hashSeed(s)%9999).toString().padStart(4,'0')}
function randomCode(){const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let out='';crypto.getRandomValues(new Uint8Array(8)).forEach(n=>out+=chars[n%chars.length]);return out}
function makeCourse(code){const r=rng(hashSeed(code.toUpperCase()));const pool=[...HOLES];const holes=[];while(holes.length<9&&pool.length)holes.push(pool.splice(Math.floor(r()*pool.length),1)[0]);return {code:code.toUpperCase(),holes}}
function show(name){Object.values(screens).forEach(s=>s.classList.remove('active'));screens[name].classList.add('active')}
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.remove('show'),1800)}
function escapeHtml(v){return String(v).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]))}

function configuredChallenges(){const list=window.SVGOLF_CONFIG?.configuredChallenges;if(!Array.isArray(list))return[];return list.filter(c=>c&&typeof c.code==='string'&&/^[A-Z0-9]{4,12}$/i.test(c.code)).map(c=>({code:c.code.toUpperCase(),name:String(c.name||c.code),description:String(c.description||'')}))}
function challengeUrl(code){const url=new URL(location.href);url.search='';url.searchParams.set('c',code);return url.toString()}
function renderConfiguredChallenges(){const host=$('#challengeList');const list=configuredChallenges();if(!list.length){host.innerHTML='<div class="challenge-empty">No club challenges are configured yet.</div>';return}host.innerHTML=list.map(c=>`<article class="challenge-card"><div class="challenge-code">${escapeHtml(c.code)}</div><h3>${escapeHtml(c.name)}</h3><p>${escapeHtml(c.description)}</p><button class="primary configured-play" data-code="${escapeHtml(c.code)}">Play challenge</button></article>`).join('');host.querySelectorAll('.configured-play').forEach(btn=>btn.addEventListener('click',()=>startCourse(btn.dataset.code)))}
function configuredApiKey(){const configured=window.SVGOLF_CONFIG?.googleMapsApiKey?.trim();return configured&&!configured.includes('PASTE_YOUR_')?configured:''}
function ensureApi(next){const key=configuredApiKey();if(!key){toast('Site configuration error: Google Maps API key is missing');return}loadMaps(key,next)}
function loadMaps(key,next){if(window.google?.maps){next();return}const s=document.createElement('script');s.src=`https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&v=weekly`;s.async=true;s.onload=next;s.onerror=()=>toast('Could not load Google Street View');document.head.appendChild(s)}

function setupStreetView(){
  if(state.panorama)return;
  state.sv=new google.maps.StreetViewService();
  state.panorama=new google.maps.StreetViewPanorama($('#pano'),{
    addressControl:false, linksControl:false, panControl:true, enableCloseButton:false,
    fullscreenControl:true, zoomControl:true, motionTracking:false, showRoadLabels:true,
    clickToGo:false, scrollwheel:true, keyboardShortcuts:false
  });
  state.panorama.addListener('pov_changed',()=>updateAimReadout());
  setupSatelliteMaps();
}

function setupSatelliteMaps(){
  if(state.miniMap)return;
  const common={
    mapTypeId:'satellite', disableDefaultUI:true, gestureHandling:'none',
    clickableIcons:false, keyboardShortcuts:false, backgroundColor:'#07130c'
  };
  state.miniMap=new google.maps.Map($('#miniMap'),{...common,zoom:17,center:{lat:0,lng:0}});
  state.shotMap=new google.maps.Map($('#shotMap'),{...common,zoom:18,center:{lat:0,lng:0}});

  const ballIcon={path:google.maps.SymbolPath.CIRCLE,scale:6,fillColor:'#ffffff',fillOpacity:1,strokeColor:'#111111',strokeWeight:2};
  const pinIcon={path:google.maps.SymbolPath.CIRCLE,scale:7,fillColor:'#8dff66',fillOpacity:1,strokeColor:'#07130c',strokeWeight:3};
  state.miniBall=new google.maps.Marker({map:state.miniMap,icon:ballIcon,zIndex:5,title:'Ball'});
  state.miniPin=new google.maps.Marker({map:state.miniMap,icon:pinIcon,zIndex:4,title:'Pin'});
  state.miniPinLine=new google.maps.Polyline({map:state.miniMap,strokeColor:'#8dff66',strokeOpacity:.72,strokeWeight:2});
  state.miniAimLine=new google.maps.Polyline({map:state.miniMap,strokeColor:'#ffffff',strokeOpacity:.9,strokeWeight:2});

  state.shotBall=new google.maps.Marker({map:state.shotMap,icon:{...ballIcon,scale:8},zIndex:7,title:'Ball'});
  state.shotPin=new google.maps.Marker({map:state.shotMap,icon:{...pinIcon,scale:8},zIndex:5,title:'Pin'});
  state.shotPlanLine=new google.maps.Polyline({map:state.shotMap,strokeColor:'#ffffff',strokeOpacity:.88,strokeWeight:3});
  state.shotActualLine=new google.maps.Polyline({map:state.shotMap,strokeColor:'#8dff66',strokeOpacity:.95,strokeWeight:4});
}

function setRotatedMapHeading(rotator,heading){
  if(!rotator)return;
  rotator.style.transform=`rotate(${-norm360(heading)}deg)`;
}

function fitMapToPoints(map,points,padding=30,maxZoom=18){
  if(!map||!points.length)return;
  const bounds=new google.maps.LatLngBounds();
  points.forEach(p=>bounds.extend(p));
  map.fitBounds(bounds,padding);
  google.maps.event.addListenerOnce(map,'idle',()=>{
    const z=map.getZoom();
    if(z>maxZoom)map.setZoom(maxZoom);
  });
}

function updateMiniMap(refit=false){
  if(!state.miniMap||!state.currentPosition||!state.pinPosition||!state.panorama)return;
  const heading=state.panorama.getPov().heading||0;
  const planned=destinationPoint(state.currentPosition,heading,shotMetres());

  state.miniBall.setPosition(state.currentPosition);
  state.miniPin.setPosition(state.pinPosition);
  state.miniPinLine.setPath([state.currentPosition,state.pinPosition]);
  state.miniAimLine.setPath([state.currentPosition,planned]);

  if(refit){
    fitMapToPoints(state.miniMap,[state.currentPosition,state.pinPosition,planned]);
  }

  setRotatedMapHeading($('#miniMapRotator'),heading);
}

function showShotCinematic(origin,heading,intendedTarget){
  const panel=$('#shotCinematic');
  panel.classList.add('active');
  google.maps.event.trigger(state.shotMap,'resize');
  state.shotBall.setPosition(origin);
  state.shotPin.setPosition(state.pinPosition);
  state.shotPlanLine.setPath([origin,intendedTarget]);
  state.shotActualLine.setPath([]);
  $('#shotCamReadout').textContent=`${shotMetres()} m · ${Math.round(heading)}°`;
  fitMapToPoints(state.shotMap,[origin,intendedTarget],95,19);
  setRotatedMapHeading($('#shotMapRotator'),heading);
}

function hideShotCinematic(){
  $('#shotCinematic').classList.remove('active');
}

function animateSatelliteBall(origin,landing,distance){
  return new Promise(resolve=>{
    const duration=Math.max(1100,Math.min(2200,800+distance*5));
    const start=performance.now();
    state.shotActualLine.setPath([origin,landing]);
    const frame=now=>{
      const t=Math.min(1,(now-start)/duration);
      const eased=1-Math.pow(1-t,3);
      const pos=interpolateLatLng(origin,landing,eased);
      state.shotBall.setPosition(pos);
      const pulse=1+Math.sin(Math.PI*t)*2.2;
      state.shotBall.setIcon({path:google.maps.SymbolPath.CIRCLE,scale:7+pulse,fillColor:'#ffffff',fillOpacity:1,strokeColor:'#111111',strokeWeight:2});
      if(t<1)requestAnimationFrame(frame);else{
        state.shotBall.setIcon({path:google.maps.SymbolPath.CIRCLE,scale:10,fillColor:'#ffffff',fillOpacity:1,strokeColor:'#8dff66',strokeWeight:4});
        setTimeout(resolve,420);
      }
    };
    requestAnimationFrame(frame);
  });
}

function interpolateLatLng(a,b,t){
  let dl=b.lng-a.lng;
  if(Math.abs(dl)>180)dl-=Math.sign(dl)*360;
  return {lat:a.lat+(b.lat-a.lat)*t,lng:((a.lng+dl*t+540)%360)-180};
}

async function requestOutdoor(location,radius=60){
  return state.sv.getPanorama({
    location, radius, preference:google.maps.StreetViewPreference.NEAREST,
    sources:[google.maps.StreetViewSource.GOOGLE,google.maps.StreetViewSource.OUTDOOR]
  });
}

async function findOutdoorPano(pos, radii=[35,70,140,250]){
  const offsets=[[0,0],[.00015,0],[-.00015,0],[0,.0002],[0,-.0002],[.00015,.0002],[.00015,-.0002],[-.00015,.0002],[-.00015,-.0002]];
  for(const radius of radii){
    for(const [a,b] of offsets){
      try{
        const {data}=await requestOutdoor({lat:pos.lat+a,lng:pos.lng+b},radius);
        if(data?.location?.pano&&data?.location?.latLng)return data;
      }catch(_e){}
    }
  }
  throw new Error('NO_OUTDOOR_PANO');
}

function startCourse(code){state.course=makeCourse(code);state.holeIndex=0;state.results=[];ensureApi(()=>{show('game');setupStreetView();loadHole()})}

async function loadHole(){
  const hole=state.course.holes[state.holeIndex];
  state.holeFinishing=false;state.shotBusy=true;state.strokes=0;
  $('#holeNo').textContent=state.holeIndex+1;
  $('#par').textContent=hole.par;
  const loc=(hole.country&&hole.town)?{country:hole.country,town:hole.town}:holeLocation(hole.name);
  $('#holeLocation').textContent=`${loc.country} · ${loc.town}`;
  $('#strokes').textContent='0';
  $('#statusText').textContent='Finding an outdoor tee…';$('#progressBar').style.width='0%';setShotEnabled(false);
  try{
    const [tee,pin]=await Promise.all([findOutdoorPano(hole.tee),findOutdoorPano(hole.pin)]);
    state.startPano=tee.location.pano;state.startPosition=tee.location.latLng.toJSON();
    state.currentPosition={...state.startPosition};state.pinPosition=pin.location.latLng.toJSON();
    state.startDistance=Math.max(1,distanceM(state.currentPosition,state.pinPosition));
    state.panorama.setPano(state.startPano);
    state.panorama.setPov({heading:bearing(state.currentPosition,state.pinPosition),pitch:0});
    state.panorama.setVisible(true);
    updateHud();state.shotBusy=false;setShotEnabled(true);$('#statusText').textContent='Drag to aim. Swing when ready.';
  }catch(e){console.error(e);$('#statusText').textContent='No outdoor Google Street View found for this hole.';setTimeout(()=>finishHole(hole.par+3),900)}
}

function updateAimReadout(){if(!state.panorama||!state.currentPosition)return;const pov=state.panorama.getPov();const pinBear=bearing(state.currentPosition,state.pinPosition);const delta=angleDiff(pinBear,pov.heading);$('#compass').style.transform=`rotate(${delta}deg)`;cancelAnimationFrame(updateAimReadout.raf);updateAimReadout.raf=requestAnimationFrame(updateMiniMap)}
function updateHud(){if(!state.currentPosition||!state.pinPosition)return;const d=distanceM(state.currentPosition,state.pinPosition);const b=bearing(state.currentPosition,state.pinPosition);$('#distance').textContent=Math.round(d);$('#bearing').textContent=`${Math.round(b)}°`;const progress=Math.max(0,Math.min(100,(1-d/state.startDistance)*100));$('#progressBar').style.width=`${progress}%`;updateAimReadout();updateMiniMap();if(d<=35&&!state.holeFinishing){state.holeFinishing=true;$('#statusText').textContent='⛳ HOLED!';setShotEnabled(false);setTimeout(()=>showHoleComplete(state.strokes),550)}}

function setShotEnabled(enabled){$('#swingBtn').disabled=!enabled;document.querySelectorAll('.club').forEach(b=>b.disabled=!enabled);$('#powerRange').disabled=!enabled}
function shotMetres(){return Math.round(CLUBS[state.selectedClub]*(Number($('#powerRange').value)/100))}
function updateShotUI(){const p=$('#powerRange').value;$('#powerValue').textContent=`${p}%`;$('#shotDistance').textContent=`${shotMetres()} m`;if(state.currentPosition)updateMiniMap()}

async function swing(){
  if(state.shotBusy||state.holeFinishing||!state.currentPosition)return;
  state.shotBusy=true;setShotEnabled(false);
  const heading=norm360(state.panorama.getPov().heading);
  const intended=shotMetres();
  const origin={...state.currentPosition};
  const intendedTarget=destinationPoint(origin,heading,intended);
  state.strokes++;$('#strokes').textContent=state.strokes;
  $('#statusText').textContent=`Shot ${state.strokes} — ${intended} m at ${Math.round(heading)}°`;
  playThwack();
  showShotCinematic(origin,heading,intendedTarget);

  let landing=null;
  try{landing=await findLanding(origin,heading,intended)}catch(e){console.error(e)}
  if(!landing){
    await animateSatelliteBall(origin,intendedTarget,intended);
    hideShotCinematic();
    $('#statusText').textContent='That went somewhere Street View cannot follow. Ball stays here.';
    toast('Lost in the rough');
    state.shotBusy=false;setShotEnabled(true);return;
  }

  const landedAt=landing.location.latLng.toJSON();
  fitMapToPoints(state.shotMap,[origin,landedAt],100,19);
  await animateSatelliteBall(origin,landedAt,distanceM(origin,landedAt));

  state.currentPosition=landedAt;
  state.panorama.setPano(landing.location.pano);
  state.panorama.setPov({heading,pitch:0});
  updateHud();
  await new Promise(r=>setTimeout(r,180));
  hideShotCinematic();
  showImpact();
  if(!state.holeFinishing){$('#statusText').textContent='Landed. Drag to aim your next shot.';state.shotBusy=false;setShotEnabled(true)}
}

async function findLanding(origin,heading,distance){
  // Try the intended landing point first; if Street View cannot represent it,
  // progressively shorten the shot rather than ever following an indoor link.
  for(const factor of [1,.9,.8,.7,.6,.5,.4,.3]){
    const projected=destinationPoint(origin,heading,distance*factor);
    try{
      const {data}=await requestOutdoor(projected,Math.min(90,Math.max(35,distance*.18)));
      if(data?.location?.pano&&data?.location?.latLng){
        const p=data.location.latLng.toJSON();
        if(distanceM(origin,p)>4||factor<=.4)return data;
      }
    }catch(_e){}
  }
  return null;
}

function animateBall(distance){
  const ball=$('#flightBall');
  ball.getAnimations().forEach(a=>a.cancel());
  ball.style.opacity='1';
  const duration=Math.max(650,Math.min(1300,520+distance*3));
  const drift=Math.sin((state.panorama.getPov().heading||0)*Math.PI/180)*8;
  const anim=ball.animate([
    {transform:'translate(-50%,-50%) translate(0,250px) scale(1.25)',opacity:1,offset:0},
    {transform:`translate(-50%,-50%) translate(${drift*.4}px,70px) scale(.62)`,opacity:1,offset:.42},
    {transform:`translate(-50%,-50%) translate(${drift}px,-18px) scale(.16)`,opacity:.95,offset:.82},
    {transform:`translate(-50%,-50%) translate(${drift}px,12px) scale(.06)`,opacity:0,offset:1}
  ],{duration,easing:'cubic-bezier(.16,.7,.25,1)',fill:'forwards'});
  return anim.finished.catch(()=>{});
}
function showImpact(){const puff=$('#impactPuff');puff.getAnimations().forEach(a=>a.cancel());puff.animate([{transform:'translate(-50%,-50%) scale(.2)',opacity:0},{transform:'translate(-50%,-50%) scale(1.5)',opacity:.9},{transform:'translate(-50%,-50%) scale(2.2)',opacity:0}],{duration:420,easing:'ease-out'})}
function playThwack(){try{const AC=window.AudioContext||window.webkitAudioContext;const ctx=new AC();const osc=ctx.createOscillator();const gain=ctx.createGain();osc.type='triangle';osc.frequency.setValueAtTime(150,ctx.currentTime);osc.frequency.exponentialRampToValueAtTime(55,ctx.currentTime+.09);gain.gain.setValueAtTime(.18,ctx.currentTime);gain.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.11);osc.connect(gain).connect(ctx.destination);osc.start();osc.stop(ctx.currentTime+.12)}catch(_e){}}

function mulligan(){if(state.shotBusy||state.holeFinishing||!state.startPano)return;hideShotCinematic();state.strokes+=2;$('#strokes').textContent=state.strokes;state.currentPosition={...state.startPosition};state.panorama.setPano(state.startPano);state.panorama.setPov({heading:bearing(state.currentPosition,state.pinPosition),pitch:0});updateHud();toast('Back to the tee · +2')}
function scoreLabel(score,par){const d=score-par;if(d<=-3)return'ALBATROSS';if(d===-2)return'EAGLE';if(d===-1)return'BIRDIE';if(d===0)return'PAR';return`+${d}`}
function showHoleComplete(score){
  if(!state.course)return;
  const hole=state.course.holes[state.holeIndex];
  const finalHole=state.holeIndex===state.course.holes.length-1;
  $('#holeCompleteTitle').textContent=hole.name;
  $('#holeCompleteResult').textContent=scoreLabel(score,hole.par);
  $('#holeCompleteStrokes').textContent=score;
  $('#holeCompletePar').textContent=hole.par;
  $('#holeCompleteCopy').textContent=finalHole?'That is the round. No mystery teleport this time.':'Pin found. Take the applause before we throw you somewhere else.';
  $('#nextHoleBtn').textContent=finalHole?'VIEW SCORECARD →':'NEXT HOLE →';
  $('#nextHoleBtn').dataset.score=String(score);
  $('#holeComplete').classList.add('active');
  $('#holeComplete').setAttribute('aria-hidden','false');
}
function hideHoleComplete(){
  $('#holeComplete').classList.remove('active');
  $('#holeComplete').setAttribute('aria-hidden','true');
}
function finishHole(score){if(!state.course)return;hideHoleComplete();const hole=state.course.holes[state.holeIndex];state.results.push({name:hole.name,par:hole.par,score});state.holeIndex++;if(state.holeIndex>=state.course.holes.length){showScore();return}loadHole()}
function showScore(){show('score');const par=state.results.reduce((a,r)=>a+r.par,0);const score=state.results.reduce((a,r)=>a+r.score,0);const diff=score-par;$('#finalScore').textContent=diff===0?'E':diff>0?`+${diff}`:`${diff}`;$('#finalCode').textContent=state.course.code;$('#scoreRows').innerHTML=state.results.map((r,i)=>`<div class="score-row"><span>${i+1}. ${escapeHtml(r.name)}</span><span>Par ${r.par}</span><span>${r.score}</span></div>`).join('')}

function distanceM(a,b){const R=6371000,toRad=x=>x*Math.PI/180;const p1=toRad(a.lat),p2=toRad(b.lat),dp=toRad(b.lat-a.lat),dl=toRad(b.lng-a.lng);const h=Math.sin(dp/2)**2+Math.cos(p1)*Math.cos(p2)*Math.sin(dl/2)**2;return 2*R*Math.asin(Math.sqrt(h))}
function bearing(a,b){const r=Math.PI/180,d=180/Math.PI,p1=a.lat*r,p2=b.lat*r,dl=(b.lng-a.lng)*r;return norm360(Math.atan2(Math.sin(dl)*Math.cos(p2),Math.cos(p1)*Math.sin(p2)-Math.sin(p1)*Math.cos(p2)*Math.cos(dl))*d)}
function destinationPoint(a,brng,metres){const R=6371000,r=Math.PI/180,d=180/Math.PI,δ=metres/R,θ=brng*r,φ1=a.lat*r,λ1=a.lng*r;const sinφ2=Math.sin(φ1)*Math.cos(δ)+Math.cos(φ1)*Math.sin(δ)*Math.cos(θ);const φ2=Math.asin(sinφ2);const y=Math.sin(θ)*Math.sin(δ)*Math.cos(φ1),x=Math.cos(δ)-Math.sin(φ1)*Math.sin(φ2);const λ2=λ1+Math.atan2(y,x);return{lat:φ2*d,lng:((λ2*d+540)%360)-180}}
function norm360(x){return((x%360)+360)%360}
function angleDiff(target,current){return((target-current+540)%360)-180}

$('#playBtn').addEventListener('click',()=>startCourse(randomCode()));
$('#dailyBtn').addEventListener('click',()=>startCourse(codeFromDate()));
$('#joinBtn').addEventListener('click',()=>{const c=$('#joinCode').value.trim().toUpperCase();if(/^[A-Z0-9]{4,12}$/.test(c))startCourse(c);else toast('Use 4–12 letters/numbers')});
$('#swingBtn').addEventListener('click',swing);
$('#powerRange').addEventListener('input',updateShotUI);
document.querySelectorAll('.club').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('.club').forEach(b=>b.classList.remove('active'));btn.classList.add('active');state.selectedClub=btn.dataset.club;updateShotUI()}));
document.addEventListener('keydown',e=>{if(e.code==='Space'&&screens.game.classList.contains('active')&&!['INPUT','BUTTON'].includes(document.activeElement?.tagName)){e.preventDefault();swing()}});
$('#mulliganBtn').addEventListener('click',mulligan);
$('#giveUpBtn').addEventListener('click',()=>{if(!state.shotBusy){state.holeFinishing=true;setShotEnabled(false);showHoleComplete(state.course.holes[state.holeIndex].par+3)}});
$('#nextHoleBtn').addEventListener('click',()=>finishHole(Number($('#nextHoleBtn').dataset.score)));
$('#replayBtn').addEventListener('click',()=>startCourse(state.course.code));
$('#shareBtn').addEventListener('click',async()=>{if(!state.course){toast('Start a course first');return}const txt=`⛳ StreetView Golf challenge ${state.course.code}\n${challengeUrl(state.course.code,state.course.version)}`;try{await navigator.clipboard.writeText(txt);toast('Challenge link copied')}catch{toast(state.course.code)}});
$('#copyResultBtn').addEventListener('click',async()=>{const total=state.results.reduce((a,r)=>a+r.score,0),par=state.results.reduce((a,r)=>a+r.par,0),d=total-par;const txt=`⛳ StreetView Golf ${state.course.code}: ${d===0?'E':d>0?'+'+d:d} (${total}/${par})`;try{await navigator.clipboard.writeText(txt);toast('Score copied')}catch{}});

renderConfiguredChallenges();updateShotUI();
const incoming=new URL(location.href).searchParams.get('c');if(incoming&&/^[A-Z0-9]{4,12}$/i.test(incoming))setTimeout(()=>startCourse(incoming.toUpperCase()),80);
