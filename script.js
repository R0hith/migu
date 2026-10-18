const $ = s => document.querySelector(s);

// ---- Daily notes from her, and quotes. Edit freely, make them sound like HER. ----
const NOTES = [
  "Hi, it's me! I'm up here dancing on a cloud and thinking of you.",
  "I saved you the softest sunbeam today. Go sit in it for a minute.",
  "The angels say hello. They also say I'm the funniest one up here.",
  "Don't cry too long, okay? I'm laughing and playing. I'm so happy.",
  "I counted the stars last night and every single one was a little kiss for you.",
  "I'm not far. I'm the warm feeling when you smile at something silly.",
  "Today I flew past your window. Did you feel the little breeze?",
  "There are rainbows everywhere up here. I'm painting one for you.",
  "I'm safe, I'm loved, and I'm at peace. Please be gentle with yourself today.",
  "Remember our favourite things? I'm still doing them, just with wings.",
  "Every time you say my name, a tiny bell rings in heaven.",
  "I'm giving the best hugs to everyone up here. Yours are saved for later.",
  "Look up today. I'm waving!",
  "I'll always be your little angel. Always."
];
const QUOTES = [
  "Some people arrive in our lives like sunshine and leave like stardust. The light never goes out.",
  "She did not go far. She just moved to a place where the sky is always soft.",
  "Heaven gained the sweetest laugh, and our hearts gained an angel who never leaves.",
  "Love does not end. It simply learns to fly.",
  "The smallest wings carry the biggest love.",
  "Every gentle breeze is a hug she sends.",
  "She is the quiet light behind every smile we find again.",
  "A short life, a whole sky of love.",
  "Where there is love, there is always a little angel nearby.",
  "She is at peace, wrapped in light, laughing with the angels."
];

let data = {photos:[],videos:[],youtube:[],story:[],captions:{}};

fetch('data.json').then(r => r.json()).then(d => { data = d; }).catch(() => {}).finally(() => loadDrive().then(init));

async function loadDrive(){
  const ids = data.driveFolders || [];
  data.driveVideos = [];
  if (!ids.length) return;
  if (!data.driveApiKey){ data.driveEmbeds = ids; return; }   // no key: show the folders as embedded albums
  try{
    for (const id of ids){
      let token = '';
      do {
        const q = encodeURIComponent("'" + id + "' in parents and trashed=false");
        const url = 'https://www.googleapis.com/drive/v3/files?q=' + q + '&fields=nextPageToken,files(id,name,mimeType)&orderBy=name&pageSize=1000&key=' + data.driveApiKey + (token ? '&pageToken=' + token : '');
        const r = await fetch(url); if (!r.ok) throw new Error('drive');
        const j = await r.json();
        (j.files || []).forEach(f => {
          if (f.mimeType.startsWith('image/')) data.photos.push('https://drive.google.com/thumbnail?id=' + f.id + '&sz=w1600');
          else if (f.mimeType.startsWith('video/')) data.driveVideos.push(f.id);
        });
        token = j.nextPageToken || '';
      } while (token);
    }
  } catch(e){ data.photos = data.photos.filter(p => !p.startsWith('https://drive.google.com')); data.driveVideos = []; data.driveEmbeds = ids; }
}

function init(){
  const name = data.name || 'Our Angel';
  document.title = name + ' · Forever our angel';
  $('#name').textContent = name;
  $('#tagline').textContent = data.tagline || '';
  $('#dates').textContent = data.dates || '';
  $('#foot').textContent = 'Fly high, ' + name + '. We love you forever.';
  (data.story || []).forEach(t => { const p = document.createElement('p'); p.textContent = t; $('#story').appendChild(p); });

  setupAngelImages();
  setupGreeting(name);
  setupGallery();
  setupVideos();
  setupQuotes();
  setupFeathers();
  setupCursor();
}

function setupAngelImages(){
  [['#hero-img', data.heroPhoto || data.cursorPhoto],['#greet-img', data.heroPhoto || data.cursorPhoto],['#angel-img', data.cursorPhoto || data.heroPhoto]]
  .forEach(([sel, src]) => {
    const img = $(sel);
    img.onerror = () => { img.removeAttribute('src'); img.style.background = 'linear-gradient(135deg,#ffe2ec,#d9e6ff)'; img.alt = ''; };
    if (src) img.src = src; else img.onerror();
  });
}

function dayNumber(){ const d = new Date(); return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5); }

function setupGreeting(name){
  const h = new Date().getHours();
  const part = h < 5 ? 'Sweet dreams' : h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : h < 21 ? 'Good evening' : 'Sweet dreams';
  const notes = data.dailyNotes && data.dailyNotes.length ? data.dailyNotes : NOTES;
  $('#greet-hello').textContent = part + ' 💛';
  $('#greet-note').textContent = notes[dayNumber() % notes.length];
  const close = () => { $('#greeting').classList.add('gone'); sparkleBurst(innerWidth/2, innerHeight/2); };
  $('#enter').addEventListener('click', close);
  addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  $('#enter').focus({preventScroll:true});
}

function setupGallery(){
  const box = $('#photos');
  const embeds = data.driveEmbeds || [];
  embeds.forEach(id => {
    const f = document.createElement('iframe');
    f.className = 'drive-embed'; f.loading = 'lazy'; f.title = 'Her photos and videos';
    f.src = 'https://drive.google.com/embeddedfolderview?id=' + id + '#grid';
    $('#drive-embeds').appendChild(f);
  });
  if (!data.photos.length){ if (!embeds.length) $('#no-photos').hidden = false; return; }
  data.photos.forEach((src, i) => {
    const img = document.createElement('img');
    img.loading = 'lazy'; img.src = src;
    img.alt = (data.captions && data.captions[src.split('/').pop()]) || 'A precious memory';
    img.addEventListener('click', () => openLightbox(i));
    box.appendChild(img);
  });
}

function setupVideos(){
  const box = $('#videos');
  data.videos.forEach(src => {
    const v = document.createElement('video');
    v.controls = true; v.preload = 'metadata'; v.playsInline = true; v.src = src;
    box.appendChild(v);
  });
  (data.driveVideos || []).forEach(id => {
    const f = document.createElement('iframe');
    f.src = 'https://drive.google.com/file/d/' + id + '/preview';
    f.allow = 'autoplay; fullscreen'; f.allowFullscreen = true; f.loading = 'lazy'; f.title = 'A video of her';
    box.appendChild(f);
  });
  (data.youtube || []).forEach(url => {
    const m = String(url).match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/);
    if (!m) return;
    const f = document.createElement('iframe');
    f.src = 'https://www.youtube-nocookie.com/embed/' + m[1];
    f.allow = 'accelerometer; encrypted-media; picture-in-picture'; f.allowFullscreen = true; f.loading = 'lazy';
    f.title = 'A video of her';
    box.appendChild(f);
  });
  if (!box.children.length) $('#videos-block').hidden = true;
}

let lb = 0;
function openLightbox(i){ lb = i; $('#lb-img').src = data.photos[i]; $('#lightbox').hidden = false; }
function step(d){ lb = (lb + d + data.photos.length) % data.photos.length; $('#lb-img').src = data.photos[lb]; }
$('#lb-close').onclick = () => $('#lightbox').hidden = true;
$('#lb-prev').onclick = () => step(-1);
$('#lb-next').onclick = () => step(1);
$('#lightbox').addEventListener('click', e => { if (e.target.id === 'lightbox') e.currentTarget.hidden = true; });
addEventListener('keydown', e => {
  if ($('#lightbox').hidden) return;
  if (e.key === 'Escape') $('#lightbox').hidden = true;
  if (e.key === 'ArrowLeft') step(-1);
  if (e.key === 'ArrowRight') step(1);
});

function setupQuotes(){
  const list = data.quotes && data.quotes.length ? data.quotes : QUOTES;
  let i = dayNumber() % list.length;
  const q = $('#quote');
  const show = () => { q.classList.add('out'); setTimeout(() => { q.textContent = '“' + list[i] + '”'; q.classList.remove('out'); }, 450); };
  q.textContent = '“' + list[i] + '”';
  $('#next-quote').addEventListener('click', () => { i = (i + 1) % list.length; show(); });
}

function setupFeathers(){
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const box = $('#feathers');
  setInterval(() => {
    const f = document.createElement('i');
    f.className = 'feather';
    f.style.left = Math.random() * 100 + 'vw';
    f.style.setProperty('--dx', (Math.random() * 160 - 80) + 'px');
    f.style.setProperty('--rot', (Math.random() * 540 - 270) + 'deg');
    f.style.animationDuration = 9 + Math.random() * 8 + 's';
    box.appendChild(f);
    setTimeout(() => f.remove(), 18000);
  }, 1400);
}

function sparkleBurst(x, y){
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  for (let k = 0; k < 14; k++){
    const s = document.createElement('i'); s.className = 'spark';
    s.style.left = x + Math.cos(k) * (20 + Math.random() * 90) + 'px';
    s.style.top = y + Math.sin(k) * (20 + Math.random() * 90) + 'px';
    document.body.appendChild(s); setTimeout(() => s.remove(), 900);
  }
}

// ---- The flying angel cursor (desktop only) ----
function setupCursor(){
  if (!matchMedia('(pointer: fine)').matches) return;
  const el = $('#angel'), img = $('#angel-img');
  const start = () => { document.body.classList.add('has-angel'); };
  if (img.getAttribute('src')) { img.complete && img.naturalWidth ? start() : img.addEventListener('load', start); }
  let x = innerWidth / 2, y = innerHeight / 2, tx = x, ty = y, last = 0;
  addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; el.classList.add('on'); });
  (function loop(t){
    x += (tx - x) * .14; y += (ty - y) * .14;
    const tilt = Math.max(-18, Math.min(18, (tx - x) * .25));
    el.style.transform = `translate(${x}px,${y}px) rotate(${tilt}deg)`;
    if (t - last > 90 && Math.hypot(tx - x, ty - y) > 6){
      last = t;
      const s = document.createElement('i'); s.className = 'spark';
      s.style.left = x - 4 + 'px'; s.style.top = y + 14 + 'px';
      document.body.appendChild(s); setTimeout(() => s.remove(), 900);
    }
    requestAnimationFrame(loop);
  })(0);
}
