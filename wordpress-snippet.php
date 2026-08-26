<?php
/**
 * Snippet: Tebak Nada App
 *
 * Serves the Tebak Nada app at mustimusik.id/tebaknada, completely
 * bypassing the theme/Elementor so styling and <script> tags survive
 * untouched by WordPress content filtering.
 *
 * Setup:
 * 1. Pages -> Add Page. Title: "Tebak Nada". Leave content empty.
 *    Click "Edit" next to the permalink under the title and set the
 *    slug to exactly: tebaknada
 *    Click Publish.
 * 2. Code Snippets -> Add New. Paste this entire file's contents.
 *    Set "Run snippet" to "Only run on site front-end" if that option
 *    is available. Save Changes, then Activate.
 * 3. Visit mustimusik.id/tebaknada to confirm it loads.
 *
 * IMPORTANT: this snippet must run "Everywhere" / "Run Everywhere",
 * NOT "Only on site front-end" — the play counter below needs the
 * wp_ajax_* hooks (fired via admin-ajax.php) and the dashboard widget
 * needs the wp-admin context, both of which a front-end-only setting
 * would block.
 */

// ---------- Play counter ----------
add_action('wp_ajax_tebaknada_count', 'tebaknada_increment_count');
add_action('wp_ajax_nopriv_tebaknada_count', 'tebaknada_increment_count');
function tebaknada_increment_count(){
    $count = (int) get_option('tebaknada_play_count', 0);
    $count++;
    update_option('tebaknada_play_count', $count);
    wp_send_json_success(['count' => $count]);
}

add_action('wp_ajax_tebaknada_cta_click', 'tebaknada_increment_cta_click');
add_action('wp_ajax_nopriv_tebaknada_cta_click', 'tebaknada_increment_cta_click');
function tebaknada_increment_cta_click(){
    $count = (int) get_option('tebaknada_cta_click_count', 0);
    $count++;
    update_option('tebaknada_cta_click_count', $count);
    wp_send_json_success(['count' => $count]);
}

add_action('wp_dashboard_setup', function(){
    wp_add_dashboard_widget('tebaknada_stats', 'Tebak Nada — Statistik', function(){
        $completed = (int) get_option('tebaknada_play_count', 0);
        $clicks = (int) get_option('tebaknada_cta_click_count', 0);
        $rate = $completed > 0 ? round(($clicks / $completed) * 100, 1) : 0;
        echo '<p style="font-size:32px;font-weight:700;margin:0;">' . esc_html($completed) . '</p><p style="margin:4px 0 16px;color:#666;">Total kuis harian diselesaikan</p>';
        echo '<p style="font-size:32px;font-weight:700;margin:0;">' . esc_html($clicks) . '</p><p style="margin:4px 0 4px;color:#666;">Klik ke Masterclass</p>';
        echo '<p style="margin:0;color:#999;">Conversion rate: ' . esc_html($rate) . '%</p>';
    });
});

add_action('template_redirect', function () {
    if (is_page('tebaknada')) {
        header('Content-Type: text/html; charset=utf-8');
        echo <<<'TEBAKNADA_HTML'
<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Tebak Nada — Kuis Telinga Musik Harian</title>
<meta name="description" content="Uji telingamu tiap hari. 6 soal interval, chord, dan progresi. Bagikan skormu dan tantang temanmu.">
<meta property="og:title" content="Tebak Nada — Kuis Telinga Musik Harian">
<meta property="og:description" content="Uji telingamu tiap hari. 6 soal interval, chord, dan progresi. Bagikan skormu dan tantang temanmu.">
<meta property="og:type" content="website">
<meta property="og:url" content="https://mustimusik.id/tebaknada">
<meta name="twitter:card" content="summary">
<meta name="theme-color" content="#0f0f14">
<style>
  :root{
    --bg:#0f0f14;
    --panel:#191922;
    --panel2:#20202b;
    --accent:#f2c14e;
    --accent2:#7c5cff;
    --green:#3ecf8e;
    --red:#ff5c5c;
    --text:#f2f2f5;
    --muted:#8a8a99;
  }
  *{box-sizing:border-box;}
  body{
    margin:0;
    font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
    background:radial-gradient(circle at 50% -10%, #26263a 0%, var(--bg) 60%);
    color:var(--text);
    min-height:100vh;
    display:flex;
    justify-content:center;
    align-items:center;
    padding:24px 16px 60px;
  }
  .app{
    width:100%;
    max-width:480px;
  }
  @media (min-width:900px){
    .app{ max-width:640px; }
    header h1{ font-size:38px; }
    header .sub{ font-size:16px; }
    .card{ padding:40px; border-radius:26px; }
    .qtitle{ font-size:24px; }
    .play-btn{ padding:22px; font-size:18px; }
    .opt{ padding:20px 14px; font-size:17px; }
    .score-big{ font-size:76px; }
    .score-label{ font-size:16px; }
    .start-screen p{ font-size:16.5px; }
  }
  header{
    text-align:center;
    margin-bottom:20px;
  }
  header h1{
    font-size:28px;
    margin:0 0 4px;
    letter-spacing:-0.5px;
  }
  header .sub{
    color:var(--muted);
    font-size:14px;
  }
  .badge{
    display:inline-block;
    background:var(--accent2);
    color:white;
    font-size:11px;
    font-weight:700;
    padding:3px 10px;
    border-radius:20px;
    margin-bottom:10px;
    letter-spacing:0.5px;
  }
  .badge.practice{background:var(--panel2);color:var(--muted);}
  .streak{
    display:inline-flex;
    align-items:center;
    gap:5px;
    background:var(--panel2);
    color:var(--accent);
    font-size:12px;
    font-weight:700;
    padding:4px 12px;
    border-radius:20px;
    margin-left:6px;
  }
  .card{
    background:var(--panel);
    border-radius:20px;
    padding:24px;
    box-shadow:0 10px 30px rgba(0,0,0,0.3);
    margin-bottom:16px;
  }
  .progress-row{
    display:flex;
    gap:6px;
    margin-bottom:20px;
  }
  .dot{
    flex:1;
    height:6px;
    border-radius:4px;
    background:#33333f;
    transition:background 0.3s;
  }
  .dot.correct{background:var(--green);}
  .dot.wrong{background:var(--red);}
  .dot.current{background:var(--accent);}
  .qnum{
    color:var(--muted);
    font-size:13px;
    margin-bottom:6px;
  }
  .qtitle{
    font-size:19px;
    font-weight:600;
    margin-bottom:20px;
  }
  .play-btn{
    width:100%;
    background:var(--accent2);
    color:white;
    border:none;
    border-radius:14px;
    padding:18px;
    font-size:16px;
    font-weight:700;
    cursor:pointer;
    display:flex;
    align-items:center;
    justify-content:center;
    gap:10px;
    margin-bottom:22px;
    transition:transform 0.1s;
  }
  .play-btn:active{transform:scale(0.97);}
  .play-btn svg{width:18px;height:18px;}
  .options{
    display:grid;
    grid-template-columns:1fr 1fr;
    gap:10px;
  }
  .opt{
    background:var(--panel2);
    border:2px solid transparent;
    color:var(--text);
    border-radius:12px;
    padding:14px 10px;
    font-size:14.5px;
    font-weight:600;
    cursor:pointer;
    transition:all 0.15s;
    text-align:center;
  }
  .opt:hover{background:#282836;}
  .opt.selected-correct{
    background:rgba(62,207,142,0.15);
    border-color:var(--green);
    color:var(--green);
  }
  .opt.selected-wrong{
    background:rgba(255,92,92,0.15);
    border-color:var(--red);
    color:var(--red);
  }
  .opt.reveal-correct{
    border-color:var(--green);
    color:var(--green);
  }
  .opt:disabled{cursor:default;}
  .next-btn{
    width:100%;
    margin-top:18px;
    background:var(--accent);
    color:#1a1a1a;
    border:none;
    border-radius:14px;
    padding:14px;
    font-size:15px;
    font-weight:700;
    cursor:pointer;
    display:none;
  }
  .next-btn.show{display:block;}
  .explain-box{
    display:none;
    background:var(--panel2);
    border-radius:14px;
    padding:14px 16px;
    font-size:13.5px;
    line-height:1.55;
    color:var(--text);
    margin-top:16px;
    text-align:left;
  }
  .explain-box.show{display:block;}
  .explain-box strong{color:var(--accent);}

  /* Results screen */
  .results{
    text-align:center;
  }
  .score-big{
    font-size:56px;
    font-weight:800;
    margin:6px 0 2px;
  }
  .score-label{
    color:var(--muted);
    font-size:14px;
    margin-bottom:20px;
  }
  .grid-preview{
    font-size:26px;
    letter-spacing:6px;
    margin:18px 0;
  }
  .share-btn{
    width:100%;
    background:var(--green);
    color:#0a1a12;
    border:none;
    border-radius:14px;
    padding:16px;
    font-size:15px;
    font-weight:700;
    cursor:pointer;
    margin-bottom:10px;
  }
  .cta-btn{
    width:100%;
    display:block;
    text-decoration:none;
    box-sizing:border-box;
    background:linear-gradient(135deg, var(--accent2), #9b7dff);
    color:white;
    border:none;
    border-radius:14px;
    padding:16px;
    font-size:15px;
    font-weight:700;
    cursor:pointer;
    margin-bottom:10px;
  }
  .cta-sub{
    font-size:12px;
    color:var(--muted);
    margin:-4px 0 14px;
  }
  .countdown-box{
    background:var(--panel2);
    color:var(--accent);
    font-size:13px;
    font-weight:600;
    padding:10px;
    border-radius:12px;
    margin-bottom:16px;
  }
  .retry-btn{
    width:100%;
    background:transparent;
    color:var(--muted);
    border:1px solid #33333f;
    border-radius:14px;
    padding:14px;
    font-size:14px;
    font-weight:600;
    cursor:pointer;
  }
  .copied-toast{
    font-size:13px;
    color:var(--green);
    margin-top:8px;
    height:16px;
  }
  .start-screen{
    text-align:center;
  }
  .start-screen p{
    color:var(--muted);
    font-size:14.5px;
    line-height:1.6;
    margin-bottom:22px;
  }
  .difficulty-note{
    display:flex;
    justify-content:center;
    gap:14px;
    margin:18px 0 6px;
    font-size:12px;
    color:var(--muted);
  }
  .difficulty-note span{
    display:flex;
    align-items:center;
    gap:5px;
  }
  .diff-dot{
    width:8px;height:8px;border-radius:50%;
  }
  footer{
    text-align:center;
    color:var(--muted);
    font-size:12px;
    margin-top:20px;
    line-height:1.6;
  }
  footer a{
    color:var(--accent);
    text-decoration:none;
    font-weight:600;
  }
</style>
</head>
<body>
<div class="app">
  <header>
    <div id="badgeRow">
      <div class="badge">TANTANGAN HARIAN</div>
    </div>
    <h1>🎧 Tebak Nada</h1>
    <div class="sub" id="dateLabel"></div>
  </header>

  <div class="card" id="mainCard">
    <!-- content injected by JS -->
  </div>

  <footer id="footerNote"></footer>
</div>

<script>
// ---------- Config ----------
const SITE_URL = "mustimusik.id/tebaknada";
const STORAGE_KEY = "tebaknada_progress_v1";

// ---------- Audio Engine ----------
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let actx = null;
function getCtx(){
  if(!actx) actx = new AudioCtx();
  return actx;
}
function midiToFreq(m){ return 440 * Math.pow(2,(m-69)/12); }

function playNote(midi, startTime, duration, gainVal=0.22){
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.value = midiToFreq(midi);
  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.exponentialRampToValueAtTime(gainVal, startTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.05);
}

function playSequence(notes){
  const ctx = getCtx();
  if(ctx.state === 'suspended') ctx.resume();
  const now = ctx.currentTime + 0.05;
  notes.forEach(n=>{
    playNote(n.midi, now + n.offset, n.dur || 1.1, n.gain || 0.22);
  });
}

function playChord(midis, dur=1.6){
  playSequence(midis.map(m=>({midi:m, offset:0, dur})));
}

function playMelodicInterval(root, interval, dur=0.8){
  playSequence([
    {midi:root, offset:0, dur},
    {midi:root+interval, offset:dur*0.85, dur}
  ]);
}

function playProgression(chords, chordDur=1.0, gap=0.05){
  const notes = [];
  chords.forEach((chord, i)=>{
    const offset = i * (chordDur+gap);
    chord.forEach(m=> notes.push({midi:m, offset, dur:chordDur}));
  });
  playSequence(notes);
}

// ---------- Question bank ----------
const INTERVALS = {
  'Minor 2nd': 1, 'Major 2nd': 2, 'Minor 3rd': 3, 'Major 3rd': 4,
  'Perfect 4th': 5, 'Tritone': 6, 'Perfect 5th': 7, 'Minor 6th': 8,
  'Major 6th': 9, 'Minor 7th': 10, 'Major 7th': 11, 'Octave': 12
};
const CHORDS = {
  'Major': [0,4,7], 'Minor': [0,3,7], 'Diminished': [0,3,6],
  'Augmented': [0,4,8], 'Major 7th': [0,4,7,11], 'Minor 7th': [0,3,7,10],
  'Dominant 7th': [0,4,7,10]
};
const PROGRESSIONS = {
  'I - IV - V - I': [0,5,7,0],
  'I - V - vi - IV': [0,7,9,5],
  'ii - V - I': [2,7,0],
  'I - vi - IV - V': [0,9,5,7],
  'vi - IV - I - V': [9,5,0,7]
};

const EXPLANATIONS = {
  interval: {
    'Minor 2nd': "😱 Minor 2nd — interval paling rapat & tegang, cuma beda 1 nada di piano. Ini yang bikin efek 'seram' di theme Jaws — dua nada nempel gitu doang.",
    'Major 2nd': "🎂 Major 2nd — jarak 1 nada penuh di piano. Coba denger dua nada pertama lagu 'Happy Birthday' ('Hap-py') — itu major 2nd.",
    'Minor 3rd': "🎸 Minor 3rd — kesannya sendu/melow. Riff pembuka 'Smoke on the Water' Deep Purple dimulai dengan lompatan minor 3rd.",
    'Major 3rd': "☀️ Major 3rd — kesannya cerah/riang. Ini yang bikin chord major kedengaran 'senang', beda tipis sama minor 3rd yang lebih sendu.",
    'Perfect 4th': "👰 Perfect 4th — coba inget lagu pengantin 'Here Comes the Bride', lompatan awalnya persis perfect 4th. Kokoh tapi belum se-'selesai' perfect 5th.",
    'Tritone': "😈 Tritone — interval paling 'tegang' dari semua, sering dijuluki 'devil's interval'. Coba inget nada pembuka theme song The Simpsons.",
    'Perfect 5th': "🎯 Perfect 5th — bunyinya kokoh & terbuka, kayak dua nada pertama lagu 'Bintang Kecil' (do...sol). Interval paling 'netral', dasar dari power chord gitar.",
    'Minor 6th': "💔 Minor 6th — interval lebar dengan nuansa melankolis/dramatis, sering dipakai buat momen 'emosional' di soundtrack film.",
    'Major 6th': "🌊 Major 6th — lompatan lebar tapi tetap kedengaran cerah. Coba inget awal lagu 'My Bonnie Lies Over the Ocean' — itu major 6th naik.",
    'Minor 7th': "🎺 Minor 7th — kesannya 'menggantung', belum selesai, khas suara jazz/blues. Interval ini yang bikin dominant 7th chord pengen 'resolve'.",
    'Major 7th': "✨ Major 7th — hampir oktaf tapi 'nyerempet', jadi kesannya tegang & megah sekaligus. Lompatan reff lagu 'Take On Me' (a-ha) terkenal karena pakai interval ini.",
    'Octave': "🌈 Octave — nada yang sama, cuma beda tinggi-rendahnya. Lompatan pembuka 'Somewhere Over the Rainbow' itu octave persis."
  },
  chord: {
    'Major': "☀️ Major — formula root + major 3rd + perfect 5th. Susunan ini yang bikin telinga otomatis dengar 'stabil/senang'.",
    'Minor': "🌧️ Minor — beda cuma di nada tengah (minor 3rd, bukan major 3rd), tapi efeknya bikin kesan sendu.",
    'Diminished': "⚠️ Diminished — dua interval kecil ditumpuk (minor 3rd + minor 3rd), hasilnya tegang & 'pengen diselesaikan'. Sering dipakai buat efek horor di film.",
    'Augmented': "🌀 Augmented — dua major 3rd ditumpuk, hasilnya kedengaran 'melayang'/nggak jelas arahnya. Sering dipakai buat efek misterius atau transisi 'mimpi'.",
    'Major 7th': "✨ Major 7th chord — nambahin nada 'megah tapi lembut' di atas chord major biasa. Khas suara jazz ballad atau lagu romantis yang 'mewah'.",
    'Minor 7th': "🎷 Minor 7th chord — versi minor yang lebih 'halus', nggak sesendu minor biasa. Banyak dipakai di jazz, R&B, neo-soul.",
    'Dominant 7th': "🎸 Dominant 7th — chord ini 'pengen banget' resolve ke chord lain, itu yang bikin dia jadi fondasi musik blues. Ada rasa tegang khas."
  },
  progression: {
    'I - IV - V - I': "🏠 Progresi paling ikonik, kedengaran 'pulang ke rumah' di akhir. Pola dasar ribuan lagu, dari himne sampai rock klasik.",
    'I - V - vi - IV': "🎤 Ini progresi 'sejuta lagu pop' yang paling sering dipakai musisi modern. Chord ke-3 (vi) kasih sentuhan melankolis sebelum balik ceria.",
    'ii - V - I': "🎷 Progresi paling ikonik di jazz — hampir semua standar jazz 'landing' pakai pola ini.",
    'I - vi - IV - V': "🕺 Progresi klasik era 50-60an, sering disebut '50s progression' atau 'doo-wop changes'. Banyak lagu oldies pakai pola ini.",
    'vi - IV - I - V': "😢 Chord-nya sama kayak 'progresi sejuta lagu pop', tapi karena mulai dari vi (minor), kesan awalnya lebih sendu sebelum lega ke major."
  }
};

function seededRandom(seed){
  let s = seed;
  return function(){
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}
function shuffle(arr, rng){
  const a = arr.slice();
  for(let i=a.length-1;i>0;i--){
    const j = Math.floor(rng()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}

function dateSeed(){
  const d = new Date();
  return d.getFullYear()*10000 + (d.getMonth()+1)*100 + d.getDate();
}
function todayKey(){
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
}
function todayString(){
  const d = new Date();
  return d.toLocaleDateString('id-ID', {weekday:'long', month:'long', day:'numeric'});
}
function msUntilMidnight(){
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate()+1, 0,0,0,0);
  return next - now;
}
function formatCountdown(ms){
  const totalSec = Math.max(0, Math.floor(ms/1000));
  const h = String(Math.floor(totalSec/3600)).padStart(2,'0');
  const m = String(Math.floor((totalSec%3600)/60)).padStart(2,'0');
  const s = String(totalSec%60).padStart(2,'0');
  return `${h}:${m}:${s}`;
}

// Build 6 questions: 2 interval, 2 chord quality, 2 progression
function buildQuestions(seed){
  const rng = seededRandom(seed);
  const root = 60; // C4

  const easyIntervals = ['Perfect 5th','Octave','Perfect 4th','Major 3rd'];
  const medIntervals = ['Minor 3rd','Major 2nd','Minor 6th','Major 6th'];

  const qs = [];

  // 2 interval questions (easy, easy/med)
  const intPool = shuffle([...easyIntervals, ...medIntervals], rng);
  for(let i=0;i<2;i++){
    const name = intPool[i];
    const semis = INTERVALS[name];
    const distractors = shuffle(Object.keys(INTERVALS).filter(n=>n!==name), rng).slice(0,3);
    const options = shuffle([name, ...distractors], rng);
    qs.push({
      type:'interval',
      title:'Interval apa ini?',
      play: ()=> playMelodicInterval(root + Math.floor(rng()*4), semis),
      options, answer:name
    });
  }

  // 2 chord quality questions
  const chordNames = shuffle(Object.keys(CHORDS), rng);
  for(let i=0;i<2;i++){
    const name = chordNames[i];
    const shape = CHORDS[name];
    const distractors = shuffle(Object.keys(CHORDS).filter(n=>n!==name), rng).slice(0,3);
    const options = shuffle([name, ...distractors], rng);
    qs.push({
      type:'chord',
      title:'Ini kualitas chord apa?',
      play: ()=>{
        const r = root + Math.floor(rng()*4) - 2;
        playChord(shape.map(s=>r+s));
      },
      options, answer:name
    });
  }

  // 2 progression questions (hardest)
  const progNames = shuffle(Object.keys(PROGRESSIONS), rng);
  for(let i=0;i<2;i++){
    const name = progNames[i];
    const degrees = PROGRESSIONS[name];
    const distractors = shuffle(Object.keys(PROGRESSIONS).filter(n=>n!==name), rng).slice(0,3);
    const options = shuffle([name, ...distractors], rng);
    qs.push({
      type:'progression',
      title:'Tebak progresi ini',
      play: ()=>{
        const r = root - 12;
        const chords = degrees.map(deg=> [r+deg, r+deg+4, r+deg+7]);
        playProgression(chords, 0.85, 0.03);
      },
      options, answer:name
    });
  }

  return shuffle(qs, rng).slice(0,6).map((q,i)=>({...q, index:i}));
}

// ---------- Progress / streak persistence ----------
function loadProgress(){
  try{
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  }catch(e){ return {}; }
}
function saveProgress(p){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
}
function recordDailyResult(score, total, grid){
  const p = loadProgress();
  const key = todayKey();
  let streak = p.streak || 0;
  if(p.lastPlayedKey){
    const prevDate = new Date(p.lastPlayedKey.replace(/-/g,'/'));
    const todayDate = new Date(key.replace(/-/g,'/'));
    const diffDays = Math.round((todayDate - prevDate) / 86400000);
    if(diffDays === 1) streak += 1;
    else if(diffDays > 1) streak = 1;
    // diffDays === 0 shouldn't happen since we lock replays
  } else {
    streak = 1;
  }
  const updated = { lastPlayedKey:key, streak, score, total, grid };
  saveProgress(updated);
  return updated;
}

// ---------- App State ----------
let questions = [];
let current = 0;
let results = [];
let answered = false;
let isPractice = false;
let countdownTimer = null;

const mainCard = document.getElementById('mainCard');
const dateLabel = document.getElementById('dateLabel');
const footerNote = document.getElementById('footerNote');
const badgeRow = document.getElementById('badgeRow');
dateLabel.textContent = todayString();
footerNote.innerHTML = `Dibuat untuk melatih telingamu jadi musisi sungguhan.`;

function setBadge(mode, streak){
  if(mode === 'practice'){
    badgeRow.innerHTML = `<div class="badge practice">MODE LATIHAN</div>`;
  } else {
    const streakHtml = streak > 1 ? `<span class="streak">🔥 ${streak} hari</span>` : '';
    badgeRow.innerHTML = `<div class="badge">TANTANGAN HARIAN</div>${streakHtml}`;
  }
}

function renderStart(){
  const p = loadProgress();
  if(p.lastPlayedKey === todayKey()){
    setBadge('daily', p.streak);
    renderAlreadyPlayed(p);
    return;
  }
  setBadge('daily', p.streak || 0);
  mainCard.innerHTML = `
    <div class="start-screen">
      <div class="qtitle">Uji telinga musikmu 🎹</div>
      <p>6 soal cepat — interval, chord, progresi. Semua level bisa main!</p>
      <div class="difficulty-note">
        <span><span class="diff-dot" style="background:var(--green)"></span>Interval</span>
        <span><span class="diff-dot" style="background:var(--accent)"></span>Chord</span>
        <span><span class="diff-dot" style="background:var(--accent2)"></span>Progresi</span>
      </div>
      <button class="play-btn" id="startBtn" style="margin-top:14px;">Mulai Tebak Nada Hari Ini</button>
    </div>
  `;
  document.getElementById('startBtn').onclick = ()=>{
    isPractice = false;
    questions = buildQuestions(dateSeed());
    current = 0;
    results = [];
    renderQuestion();
  };
}

function renderAlreadyPlayed(p){
  mainCard.innerHTML = `
    <div class="results">
      <div class="qtitle" style="margin-bottom:0;">Kamu sudah main hari ini</div>
      <div class="score-big">${p.score}/${p.total}</div>
      <div class="score-label">🔥 Streak ${p.streak} hari</div>
      <div class="grid-preview">${p.grid}</div>
      <div class="countdown-box">⏱ Soal baru dalam <span id="countdown">00:00:00</span></div>
      <button class="share-btn" id="shareBtn">📋 Salin Hasil untuk Dibagikan</button>
      <button class="retry-btn" id="practiceBtn">Main Lagi (Mode Latihan)</button>
      <div class="copied-toast" id="toast"></div>
    </div>
  `;
  document.getElementById('shareBtn').onclick = ()=> copyShareText(p.score, p.total, p.grid);
  document.getElementById('practiceBtn').onclick = ()=> startPractice();
  const countdownEl = document.getElementById('countdown');
  if(countdownTimer) clearInterval(countdownTimer);
  countdownEl.textContent = formatCountdown(msUntilMidnight());
  countdownTimer = setInterval(()=>{
    countdownEl.textContent = formatCountdown(msUntilMidnight());
  }, 1000);
}

function startPractice(){
  if(countdownTimer) clearInterval(countdownTimer);
  isPractice = true;
  setBadge('practice');
  questions = buildQuestions(Date.now());
  current = 0;
  results = [];
  renderQuestion();
}

function renderProgressDots(){
  let html = '<div class="progress-row">';
  for(let i=0;i<questions.length;i++){
    let cls = 'dot';
    if(i < results.length) cls += results[i] ? ' correct' : ' wrong';
    else if(i === current) cls += ' current';
    html += `<div class="${cls}"></div>`;
  }
  html += '</div>';
  return html;
}

function renderQuestion(){
  answered = false;
  const q = questions[current];
  mainCard.innerHTML = `
    ${renderProgressDots()}
    <div class="qnum">Soal ${current+1} dari ${questions.length}</div>
    <div class="qtitle">${q.title}</div>
    <button class="play-btn" id="playBtn">
      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
      Putar Suara
    </button>
    <div class="options" id="optionsWrap">
      ${q.options.map(opt=>`<button class="opt" data-opt="${opt}">${opt}</button>`).join('')}
    </div>
    <div class="explain-box" id="explainBox"></div>
    <button class="next-btn" id="nextBtn">${current === questions.length-1 ? 'Lihat Hasil' : 'Soal Berikutnya →'}</button>
  `;
  document.getElementById('playBtn').onclick = ()=> q.play();
  setTimeout(()=> q.play(), 300);

  document.querySelectorAll('.opt').forEach(btn=>{
    btn.onclick = ()=>{
      if(answered) return;
      answered = true;
      const chosen = btn.getAttribute('data-opt');
      const correct = chosen === q.answer;
      results.push(correct);
      document.querySelectorAll('.opt').forEach(b=>{
        b.disabled = true;
        const val = b.getAttribute('data-opt');
        if(val === q.answer) b.classList.add(correct ? 'selected-correct':'reveal-correct');
        if(val === chosen && !correct) b.classList.add('selected-wrong');
      });
      const explanation = (EXPLANATIONS[q.type] || {})[q.answer] || '';
      const explainBox = document.getElementById('explainBox');
      explainBox.innerHTML = correct
        ? `<strong>✅ Tepat!</strong> ${explanation}`
        : `<strong>Bukan ${chosen}</strong> — jawabannya <strong>${q.answer}</strong>. ${explanation}`;
      explainBox.classList.add('show');
      document.getElementById('nextBtn').classList.add('show');
    };
  });

  document.getElementById('nextBtn').onclick = ()=>{
    if(current === questions.length-1){
      renderResults();
    } else {
      current++;
      renderQuestion();
    }
  };
}

function scoreEmoji(correct){ return correct ? '🟩' : '🟥'; }

function copyShareText(score, total, grid){
  const text = `Tebak Nada — ${todayString()}\n${score}/${total} ${grid}\n\nBerani coba? Kalahin skorku! 🎧\n${SITE_URL}`;
  navigator.clipboard.writeText(text).then(()=>{
    document.getElementById('toast').textContent = 'Disalin! Tempel di mana saja.';
    setTimeout(()=> document.getElementById('toast').textContent = '', 2500);
  }).catch(()=>{
    document.getElementById('toast').textContent = text;
  });
}

function renderResults(){
  const score = results.filter(Boolean).length;
  const total = results.length;
  const grid = results.map(scoreEmoji).join('');
  let verdict;
  if(score === total) verdict = "Telinga emas. 🎯";
  else if(score >= total*0.75) verdict = "Telingamu tajam banget.";
  else if(score >= total*0.5) verdict = "Lumayan! Masih bisa diasah.";
  else verdict = "Semua orang mulai dari nol 🌱";

  let streakLine = '';
  let resetNote = '';
  if(!isPractice){
    const updated = recordDailyResult(score, total, grid);
    setBadge('daily', updated.streak);
    if(updated.streak > 1) streakLine = `<div class="score-label">🔥 Streak ${updated.streak} hari berturut-turut!</div>`;
    resetNote = `<div class="countdown-box">🔄 Soal baru tiap hari jam 00:00 — balik lagi besok!</div>`;
    fetch('/wp-admin/admin-ajax.php?action=tebaknada_count', {method:'POST'}).catch(()=>{});
  }

  mainCard.innerHTML = `
    <div class="results">
      <div class="qtitle" style="margin-bottom:0;">${isPractice ? 'Hasil Latihan' : 'Hasil Hari Ini'}</div>
      <div class="score-big">${score}/${total}</div>
      <div class="score-label">${verdict}</div>
      ${streakLine}
      <div class="grid-preview">${grid}</div>
      ${resetNote}
      <button class="share-btn" id="shareBtn">📋 Salin Hasil untuk Dibagikan</button>
      <button class="retry-btn" id="retryBtn">Main Lagi (Mode Latihan)</button>
      <div class="copied-toast" id="toast"></div>
    </div>
  `;
  document.getElementById('shareBtn').onclick = ()=> copyShareText(score, total, grid);
  document.getElementById('retryBtn').onclick = ()=> startPractice();
}

renderStart();
</script>
</body>
</html>
TEBAKNADA_HTML;
        exit;
    }
});
