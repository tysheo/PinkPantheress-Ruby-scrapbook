// Config
const LOVE_NOTE_TEXT = "I love you Ruby. Happy 6 months. You make everything softer + brighter. — Ty";
const TYPE_SPEED = 24;
const MANIFEST_URL = 'assets/collage-manifest.json';

// Utilities
const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
const clamp = (v,min,max) => Math.max(min, Math.min(max, v));
function formatTime(sec){ if (!isFinite(sec)) return '00:00'; const m=Math.floor(sec/60); const s=Math.floor(sec%60).toString().padStart(2,'0'); return `${m}:${s}`; }

// Headline jitter
function initCutout(){ $$('.cutout span').forEach((s,i)=>{ s.style.setProperty('--r', (Math.random()*8-4).toFixed(1)); }); }

// Audio player
function togglePlay(){
  const audio = $('#audio');
  const btn = $('#playBtn');
  const eq = document.querySelector('.cassette .eq');
  const time = $('#time');
  if (!audio) return;
  if (audio.paused) { audio.play().catch(()=>{}); btn && (btn.textContent = '⏸'); eq && eq.classList.add('playing'); }
  else { audio.pause(); btn && (btn.textContent = '▶'); eq && eq.classList.remove('playing'); }
}
function initAudio(){
  const audio = $('#audio'); const time = $('#time'); const btn = $('#playBtn'); const eq = document.querySelector('.cassette .eq');
  if (!audio) return;
  audio.addEventListener('timeupdate', ()=>{ time && (time.textContent = formatTime(audio.currentTime)); });
  audio.addEventListener('ended', ()=>{ btn && (btn.textContent='▶'); eq && eq.classList.remove('playing'); });
  // unlock autoplay after first user interaction
  const unlock = ()=>{ audio.play().then(()=>{ btn && (btn.textContent='⏸'); eq && eq.classList.add('playing'); window.removeEventListener('pointerdown', unlock); }).catch(()=>{}); };
  window.addEventListener('pointerdown', unlock, { once:true });
}

// Note typing
let typingInterval;
function typewriter(text, el, speed=TYPE_SPEED){ let i=0; el.textContent=''; clearInterval(typingInterval); typingInterval=setInterval(()=>{ el.textContent=text.slice(0, ++i); if(i>=text.length) clearInterval(typingInterval); }, speed); }
function initNote(){ const el=$('#noteText'); if (el){ el.textContent = LOVE_NOTE_TEXT; } }
async function saveNote(){ const card=$('#noteCard'); if (!card || !window.html2canvas) return; const canvas=await window.html2canvas(card,{backgroundColor:null, scale:2}); const a=document.createElement('a'); a.download='ruby-note.png'; a.href=canvas.toDataURL('image/png'); a.click(); }

// Collage Stage
const state = { pieces: [], z: 1, blendModes:['','screen','multiply','overlay'], blendIndex:0, filterIndex:0 };

function addPieceFromImage(src){
  const stage = $('#stage'); if (!stage) return null;
  const img = new Image(); img.src = src; img.alt = '';
  const el = document.createElement('div'); el.className = 'piece filter-0';
  el.appendChild(img);
  const w = stage.clientWidth, h = stage.clientHeight;
  const x = Math.random() * (w-160) + 40;
  const y = Math.random() * (h-160) + 40;
  const s = 0.45 + Math.random()*0.25;
  const r = Math.random()*30-15;
  el.style.left = x + 'px'; el.style.top = y + 'px';
  el.dataset.x = x; el.dataset.y = y; el.dataset.scale = s; el.dataset.rot = r; el.style.transform = `translate(0,0) rotate(${r}deg) scale(${s})`;
  el.style.zIndex = (++state.z).toString();
  enableInteractions(el);
  stage.appendChild(el);
  state.pieces.push(el);
  return el;
}

function buildTools(el){
  const tools = document.createElement('div'); tools.className='tools';
  tools.innerHTML = `
    <button title="Duplicate">⎘</button>
    <button title="Delete">✕</button>
    <button title="Flip">⇋</button>
    <button title="Stickerize">✸</button>
  `;
  const [dup, del, flip, sticker] = tools.querySelectorAll('button');
  dup.addEventListener('click', ()=>{ const img = el.querySelector('img'); if (img) addPieceFromImage(img.src); });
  del.addEventListener('click', ()=>{ el.remove(); state.pieces = state.pieces.filter(p=>p!==el); });
  flip.addEventListener('click', ()=>{ const cur = parseFloat(el.dataset.flip||'1'); el.dataset.flip = cur*-1; applyTransform(el); });
  sticker.addEventListener('click', ()=>{ el.classList.toggle('cutout'); });
  return tools;
}

let selected = null; let gridSize = 10;
function selectPiece(el){ if (selected) { selected.classList.remove('selected','show-tools'); } selected = el; if (el){ el.classList.add('selected','show-tools'); el.style.zIndex=(++state.z).toString(); } }

function enableInteractions(el){
  let startX=0, startY=0, originX=0, originY=0; let dragging=false;
  el.addEventListener('pointerdown', e=>{
    dragging=true; el.setPointerCapture(e.pointerId);
    originX = parseFloat(el.dataset.x||'0'); originY = parseFloat(el.dataset.y||'0');
    startX = e.clientX; startY = e.clientY; selectPiece(el);
  });
  el.addEventListener('pointermove', e=>{
    if(!dragging) return; const dx=e.clientX-startX, dy=e.clientY-startY; let nx=originX+dx, ny=originY+dy; if (e.ctrlKey){ nx = Math.round(nx/gridSize)*gridSize; ny = Math.round(ny/gridSize)*gridSize; } el.dataset.x=nx; el.dataset.y=ny; applyTransform(el);
  });
  el.addEventListener('pointerup', e=>{ dragging=false; el.releasePointerCapture(e.pointerId); });
  el.addEventListener('dblclick', ()=>{ el.style.zIndex=(++state.z).toString(); selectPiece(el); });
  el.addEventListener('wheel', e=>{
    if (!(e.shiftKey || e.altKey)) return; e.preventDefault(); selectPiece(el);
    const rot=parseFloat(el.dataset.rot||'0'); const scale=parseFloat(el.dataset.scale||'1');
    if (e.shiftKey){ el.dataset.rot = (rot + (e.deltaY>0? 4 : -4)).toString(); }
    if (e.altKey){ el.dataset.scale = clamp(scale + (e.deltaY>0? -0.06 : 0.06), 0.3, 2).toString(); }
    applyTransform(el);
  }, {passive:false});
  // show tools on hover
  el.addEventListener('mouseenter', ()=> el.classList.add('show-tools'));
  el.addEventListener('mouseleave', ()=> el.classList.remove('show-tools'));
}

function applyTransform(el){
  const x=parseFloat(el.dataset.x||'0'), y=parseFloat(el.dataset.y||'0'), r=parseFloat(el.dataset.rot||'0'), s=parseFloat(el.dataset.scale||'1'), f=parseFloat(el.dataset.flip||'1');
  el.style.left=x+'px'; el.style.top=y+'px'; el.style.transform=`translate(0,0) rotate(${r}deg) scale(${s * f}, ${s})`;
}

// Keyboard nudge and rotate/scale shortcuts
window.addEventListener('keydown', (e)=>{
  if (!selected) return; const step = e.shiftKey? 10 : 2;
  if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)) { e.preventDefault(); const x=parseFloat(selected.dataset.x||'0'), y=parseFloat(selected.dataset.y||'0'); if (e.key==='ArrowLeft') selected.dataset.x = (x-step).toString(); if (e.key==='ArrowRight') selected.dataset.x = (x+step).toString(); if (e.key==='ArrowUp') selected.dataset.y = (y-step).toString(); if (e.key==='ArrowDown') selected.dataset.y = (y+step).toString(); applyTransform(selected); }
  if (e.key.toLowerCase()==='r') { const r=parseFloat(selected.dataset.rot||'0'); selected.dataset.rot=(r+ (e.shiftKey? -5:5)).toString(); applyTransform(selected); }
  if (e.key.toLowerCase()==='='|| e.key==='+') { const s=parseFloat(selected.dataset.scale||'1'); selected.dataset.scale = clamp(s+0.05,0.3,2).toString(); applyTransform(selected); }
  if (e.key==='-' || e.key==='_') { const s=parseFloat(selected.dataset.scale||'1'); selected.dataset.scale = clamp(s-0.05,0.3,2).toString(); applyTransform(selected); }
  if (e.key.toLowerCase()==='d' && (e.ctrlKey||e.metaKey)) { e.preventDefault(); const img=selected.querySelector('img'); if (img) addPieceFromImage(img.src); }
  if (e.key==='Delete' || e.key==='Backspace') { selected.remove(); state.pieces = state.pieces.filter(p=>p!==selected); selected=null; }
});

// augment addPieceFromImage to include toolbar
const _addPieceFromImage = addPieceFromImage;
addPieceFromImage = function(src){ const el = _addPieceFromImage(src); if (el){ const tools = buildTools(el); el.appendChild(tools); } return el; }

// Expose for inline handlers
window.togglePlay = togglePlay;
window.shufflePieces = shufflePieces;
window.toggleGrid = toggleGrid;
window.cycleBlend = cycleBlend;
window.cycleFilter = cycleFilter;
window.saveStage = saveStage;
window.saveNote = saveNote;
window.addRandomPieces = addRandomPieces;
window.toggleHalftone = toggleHalftone;
window.toggleTorn = toggleTorn;

// Startup
window.addEventListener('DOMContentLoaded', ()=>{
  initCutout();
  initAudio();
  initNote();
  initCollage();
  buildIntro();
  // lock scroll until start
  document.documentElement.classList.add('no-scroll');
  document.body.classList.add('no-scroll');
});

// Collage helpers missing earlier
function initCollage(){
  const stage = $('#stage');
  if (!stage) return;
  // make existing scrapbook items draggable into stage
  $$('.scrapbook img').forEach(img=>{
    img.setAttribute('draggable','true');
    img.addEventListener('dragstart', e=>{ e.dataTransfer.effectAllowed='copy'; e.dataTransfer.setData('text/uri-list', img.src); e.dataTransfer.setData('text/plain', img.src); });
    img.addEventListener('click', ()=>{ addPieceFromImage(img.src); });
  });
  stage.addEventListener('dragover', e=>{ e.preventDefault(); e.dataTransfer.dropEffect='copy'; });
  stage.addEventListener('drop', e=>{ e.preventDefault(); const src = e.dataTransfer.getData('text/uri-list') || e.dataTransfer.getData('text/plain'); if (src) addPieceFromImage(src); });
  // sticker tray
  fetch(MANIFEST_URL).then(r=>r.ok?r.json():null).then(manifest=>{
    const tray = $('#stickerTray'); if (!tray) return;
    const items = manifest?.collage || [];
    items.forEach(path=>{
      const wrap = document.createElement('div'); wrap.className='sticker';
      const img = document.createElement('img'); img.src = `assets/${path}`.replace('assets/assets','assets'); img.alt=''; img.draggable=true;
      img.addEventListener('dragstart', e=>{ e.dataTransfer.setData('text/uri-list', img.src); });
      img.addEventListener('click', ()=>{ addPieceFromImage(img.src); });
      wrap.appendChild(img); tray.appendChild(wrap);
    });
  }).catch(()=>{});
}

function shufflePieces(){ const stage=$('#stage'); if (!stage) return; state.pieces.forEach(el=>{ const w=stage.clientWidth, h=stage.clientHeight; const x=Math.random()*(w-160)+40; const y=Math.random()*(h-160)+40; el.dataset.x=x; el.dataset.y=y; el.dataset.rot=(Math.random()*40-20).toString(); applyTransform(el); }); }
function toggleGrid(){ const stage=$('#stage'); if (!stage) return; stage.classList.toggle('grid'); }
function cycleBlend(){ state.blendIndex=(state.blendIndex+1)%state.blendModes.length; state.pieces.forEach(el=>{ state.blendModes.forEach(m=> m && el.classList.remove(m)); const cls=state.blendModes[state.blendIndex]; if (cls) el.classList.add(cls); }); }
function cycleFilter(){ state.filterIndex=(state.filterIndex+1)%4; state.pieces.forEach(el=>{ for(let i=0;i<4;i++) el.classList.remove(`filter-${i}`); el.classList.add(`filter-${state.filterIndex}`); }); }
function toggleHalftone(){ const stage=$('#stage'); if (!stage) return; stage.classList.toggle('halftone'); }
function toggleTorn(){ const stage=$('#stage'); if (!stage) return; stage.classList.toggle('torn'); }
function addRandomPieces(n=3){
  // Prefer photos in assets/photos
  const candidates = $$('.scrapbook img').map(i=>i.getAttribute('src')).filter(Boolean);
  for (let i=0;i<n;i++){ const src = candidates[(Math.random()*candidates.length)|0]; if (src) addPieceFromImage(src); }
}
async function saveStage(){
  const stage = $('#stage'); if (!stage || !window.html2canvas) return;
  const clone = stage.cloneNode(true);
  // hide tools
  clone.querySelectorAll('.tools').forEach(t=> t.remove());
  clone.classList.remove('grid');
  document.body.appendChild(clone); clone.style.position='fixed'; clone.style.left='-9999px';
  const canvas = await window.html2canvas(clone, {backgroundColor:null, scale:2});
  clone.remove();
  const a=document.createElement('a'); a.download='ruby-collage.png'; a.href=canvas.toDataURL('image/png'); a.click();
}

// Intro floating collage and start overlay
function buildIntro(){
  const intro = $('#intro'); const stage = $('#introStage'); const overlay=$('#startOverlay'); const btn=$('#startBtn');
  if (!intro || !stage || !overlay || !btn) return;
  // seed with stickers and photos
  const photos = $$('.scrapbook img').map(i=>i.src);
  const stickers = [ 'assets/label-hey.svg', 'assets/star.svg', 'assets/heart.svg' ];
  const pool = [...photos, ...stickers];
  for (let i=0;i<48;i++){
    const img = document.createElement('img'); img.src = pool[(Math.random()*pool.length)|0]; img.alt=''; img.style.position='absolute'; img.style.willChange='transform';
    const x = Math.random()*100, y=Math.random()*100, s=0.1 + Math.random()*0.12, r=(Math.random()*40-20);
    img.style.left = x+'%'; img.style.top=y+'%'; img.style.transform=`translate(-50%,-50%) rotate(${r}deg) scale(${s})`;
    img.style.filter='drop-shadow(0 14px 24px rgba(0,0,0,.35))';
    stage.appendChild(img);
    // drift animation
    const dx=(Math.random()*40-20), dy=(Math.random()*30-15), dur=6000+Math.random()*4000;
    const loop=()=>{ img.animate([{ transform: `translate(-50%,-50%) rotate(${r}deg) scale(${s})` }, { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) rotate(${r+6}deg) scale(${s*1.02})` }], { duration: dur, direction:'alternate', iterations: Infinity, easing:'ease-in-out' }); };
    loop();
  }
  // intro parallax on scroll (within intro section height)
  window.addEventListener('scroll', ()=>{
    const rect = intro.getBoundingClientRect(); const viewH = window.innerHeight;
    const progress = clamp(1 - (rect.bottom - viewH)/ (rect.height + viewH), 0, 1);
    stage.style.transform = `translateY(${progress*-120}px)`;
    stage.style.opacity = String(1 - progress*0.2);
  }, { passive:true });
  const start = ()=>{
    overlay.classList.add('slide');
    setTimeout(()=> overlay.remove(), 650);
    document.documentElement.classList.remove('no-scroll');
    document.body.classList.remove('no-scroll');
    const audio=$('#audio'); const eq=document.querySelector('.cassette .eq'); const playBtn=$('#playBtn');
    if (audio) { audio.play().then(()=>{ eq && eq.classList.add('playing'); playBtn && (playBtn.textContent='⏸'); }).catch(()=>{}); }
  };
  btn.addEventListener('click', start);
  window.startExperience = start;
}
