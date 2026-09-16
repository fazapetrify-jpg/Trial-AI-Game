from pathlib import Path

APP_FILES = [Path('index.html'), Path('wordpress-snippet.php')]

for path in APP_FILES:
    s = path.read_text(encoding='utf-8')

    old = "visual:{ beats:12, triplet:true, rh:['V',null,null,'V',null,null,'V',null,null,'V',null,null], lh:['1','5',\"1'\",\"1'\",'5','1','5',\"1'\",\"1'\",'5',null,null] }"
    new = "visual:{ beats:12, triplet:true, rh:['V',null,null,'V',null,null,'V',null,null,'V',null,null], lh:['1','5',\"1'\",null,\"1'\",'5','1','5',\"1'\",null,\"1'\",'5'] }"
    if old not in s:
        raise RuntimeError(f'12/8 Pattern 1 source not found in {path}')
    s = s.replace(old, new, 1)

    old = "{ id:'p68', group:'6/8', name:'Pattern 6/8', tag:'Cocok lagu pop mengayun & emosional.',\n    visual:{ beats:12, triplet:true, rh:['V','V','V','V','V','V','V','V','V','V','V','V'], lh:['1',null,null,null,null,null,'1',null,null,null,null,null] } }"
    new = "{ id:'p128_full', group:'12/8', name:'12/8 Pattern Full', tag:'RH mengisi semua subdivisi 12/8; LH masuk di ketukan 1 dan 3.',\n    visual:{ beats:12, triplet:true, rh:['V','V','V','V','V','V','V','V','V','V','V','V'], lh:['1',null,null,null,null,null,'1',null,null,null,null,null] } }"
    if old not in s:
        raise RuntimeError(f'Until second pattern source not found in {path}')
    s = s.replace(old, new, 1)
    if "correctPatternIds:['p128_1','p68']," not in s:
        raise RuntimeError(f'Until pattern IDs not found in {path}')
    s = s.replace("correctPatternIds:['p128_1','p68'],", "correctPatternIds:['p128_1','p128_full'],", 1)

    old = "modulationNote:'Verse modulasi ke do=Eb di pertengahan lagu.',\n    structureParts: ['Intro','Verse','Chorus'],"
    new = "modulationNote:'Verse dimulai di do=E, lalu modulasi ke do=Eb mulai Baris 3. Chorus tetap di do=Eb.',\n    keyTimeline: {\n      'Intro': [{ start:0, key:'E' }],\n      'Verse': [{ start:0, key:'E' }, { start:8, key:'Eb', modulation:true }],\n      'Chorus': [{ start:0, key:'Eb' }]\n    },\n    structureParts: ['Intro','Verse','Chorus'],"
    if old not in s:
        raise RuntimeError(f'Beauty modulation source not found in {path}')
    s = s.replace(old, new, 1)

    marker = """function transposeChordSymbol(chord, fromKey, toKey){
  if(!chord || fromKey === toKey) return chord;
  const fromSemi = NOTE_SEMITONE[fromKey], toSemi = NOTE_SEMITONE[toKey];
  if(fromSemi === undefined || toSemi === undefined) return chord;
  const shift = (toSemi - fromSemi + 12) % 12;
  const [top, bass] = chord.split('/');
  const m = top.match(/^([A-G](?:#|b)?)(.*)$/);
  if(!m) return chord;
  const transposedTop = transposeNoteName(m[1], shift, toKey) + m[2];
  if(!bass) return transposedTop;
  const bm = bass.match(/^([A-G](?:#|b)?)(.*)$/);
  if(!bm) return transposedTop + '/' + bass;
  return transposedTop + '/' + transposeNoteName(bm[1], shift, toKey) + bm[2];
}
"""
    helpers = marker + """
// Key aktif per bagian/chord. Dipakai untuk lagu yang modulasi seperti Beauty and the Beast.
function guideKeySegments(guide, partName){
  const timeline = guide.keyTimeline && guide.keyTimeline[partName];
  return (timeline && timeline.length) ? timeline : [{ start:0, key:guide.key }];
}
function guideKeyAt(guide, partName, chordIndex){
  const segments = guideKeySegments(guide, partName);
  let active = segments[0].key;
  for(const seg of segments){
    if(chordIndex >= seg.start) active = seg.key;
    else break;
  }
  return active;
}
function transposeGuideKey(sourceKey, baseFromKey, baseToKey){
  if(baseFromKey === baseToKey) return sourceKey;
  const fromSemi = NOTE_SEMITONE[baseFromKey], toSemi = NOTE_SEMITONE[baseToKey];
  if(fromSemi === undefined || toSemi === undefined) return sourceKey;
  const shift = (toSemi - fromSemi + 12) % 12;
  return transposeNoteName(sourceKey, shift, baseToKey);
}
"""
    if marker not in s:
        raise RuntimeError(f'transpose helper insertion point not found in {path}')
    s = s.replace(marker, helpers, 1)

    old = """  if(part.bars){
    let ri = 0;
    linesHtml = part.bars.map((line, li)=>{
      const tokens = line.map(slot=>{
        if(slot === null) return `<div class=\"gb-dot\">•</div>`;
        return renderRomanSlot(slot, ri++);
      }).join('');
      return `<div class=\"gb-line\"><div class=\"gb-line-label\">Baris ${li+1}</div><div class=\"gb-tokens\">${tokens}</div></div>`;
    }).join('');
  } else {
"""
    new = """  if(part.bars){
    let ri = 0;
    let prevLineKey = null;
    linesHtml = part.bars.map((line, li)=>{
      const lineStartRi = ri;
      const activeKey = guideKeyAt(gb.guide, partName, lineStartRi);
      const isModulationLine = !!gb.guide.keyTimeline && prevLineKey !== null && activeKey !== prevLineKey;
      const tokens = line.map(slot=>{
        if(slot === null) return `<div class=\"gb-dot\">•</div>`;
        return renderRomanSlot(slot, ri++);
      }).join('');
      const keyLabel = gb.guide.keyTimeline
        ? ` <span style=\"color:${isModulationLine ? 'var(--accent)' : 'var(--accent2)'};font-weight:700;\">• ${isModulationLine ? 'MODULASI → ' : ''}do = ${activeKey}</span>`
        : '';
      prevLineKey = activeKey;
      return `<div class=\"gb-line\"><div class=\"gb-line-label\">Baris ${li+1}${keyLabel}</div><div class=\"gb-tokens\">${tokens}</div></div>`;
    }).join('');
  } else {
"""
    if old not in s:
        raise RuntimeError(f'progression renderer source not found in {path}')
    s = s.replace(old, new, 1)

    start = s.index('function renderGbChordTranslate(checked){')
    end = s.index('\nfunction renderGbPattern(checked){', start)
    chord_translate = r'''function renderGbChordTranslate(checked){
  const key = gb.keyGuess || gb.guide.key;
  gb.guide.structureParts.forEach(partName=>{
    if(!gb.chordAnswers[partName]) gb.chordAnswers[partName] = gb.guide.allParts[partName].chords.map(()=>'');
  });
  const range = fullPartsRange(gb.guide);
  const hasModulation = !!gb.guide.keyTimeline;
  const referenceKeys = hasModulation
    ? [...new Set(gb.guide.structureParts.flatMap(partName=>guideKeySegments(gb.guide, partName).map(seg=>seg.key)))]
    : [key];

  const sectionsHtml = gb.guide.structureParts.map(partName=>{
    const part = gb.guide.allParts[partName];
    const segments = guideKeySegments(gb.guide, partName);
    return segments.map((seg, si)=>{
      const nextStart = segments[si+1] ? segments[si+1].start : part.roman.length;
      const romanSlice = part.roman.slice(seg.start, nextStart);
      const chordHtml = part.chords.slice(seg.start, nextStart).map((c, localCi)=>{
        const ci = seg.start + localCi;
        const val = gb.chordAnswers[partName][ci];
        if(checked){
          const grade = gradeToken(val, c);
          const cls = grade === 'correct' ? 'correct' : grade === 'near' ? 'near' : 'wrong';
          return `<div><input class="gb-blank ${cls}" value="${val}" disabled>${tokenFeedback(grade, c)}</div>`;
        }
        return `<input class="gb-blank" data-part="${partName}" data-ci="${ci}" maxlength="6" value="${val}">`;
      }).join('');
      const isModulationSegment = !!seg.modulation || (si > 0 && seg.key !== segments[si-1].key);
      const keyLabel = hasModulation
        ? `${isModulationSegment ? ' • MODULASI →' : ' •'} do = ${seg.key}`
        : '';
      return `<div class="gb-line">
        <div class="gb-line-label">[${partName}]${keyLabel} <span style="color:var(--accent2);font-weight:700;">${romanSlice.join(' - ')}</span></div>
        <div class="gb-tokens">${chordHtml}</div>
      </div>`;
    }).join('');
  }).join('');

  const keyIntro = hasModulation
    ? `Nada dasar awal lagu ini <strong>do = ${gb.guide.key}</strong>. Ikuti penanda modulasi: saat masuk bagian bertanda <strong>MODULASI</strong>, gunakan family chord nada dasar yang baru.`
    : `Nada dasar lagu ini <strong>do = ${key}</strong>. Berdasarkan progresi yang udah kebahas, chordnya jadi apa? (pakai tabel family chord di bawah kalau perlu)`;

  mainCard.innerHTML = `
    ${gbHeader('Halaman 4')}
    <div class="qtitle">🎼 Translate ke Chord</div>
    <div class="yt-embed-wrap compact" style="margin-bottom:16px;">
      <iframe src="${embedUrl(gb.song.videoId, range.start, range.end)}"
        title="${gb.song.title}" frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen></iframe>
    </div>
    <div class="step-label">${keyIntro}</div>
    ${gb.guide.modulationNote ? `<div class="gb-feedback no" style="text-align:left;">🔁 ${gb.guide.modulationNote}</div>` : ''}
    ${referenceKeys.map(k=>`<div class="step-label" style="margin-top:10px;"><strong>Family chord do = ${k}</strong></div>${renderChordTable(k)}`).join('')}
    ${sectionsHtml}
    <div class="gb-nav">
      <button class="btn-secondary" id="gbPrevBtn">← Sebelumnya</button>
      <button class="play-btn" id="gbNextBtn" style="margin-bottom:0;">${checked ? 'Lanjut →' : 'Cek Jawaban ✓'}</button>
    </div>
  `;
  document.getElementById('backBtn').onclick = ()=> renderSongPractice(gb.song);
  if(!checked){
    attachEnterNav();
    document.querySelectorAll('.gb-blank').forEach(inp=>{
      inp.oninput = ()=>{
        const partName = inp.getAttribute('data-part'), ci = +inp.getAttribute('data-ci');
        gb.chordAnswers[partName][ci] = inp.value.trim();
        inp.classList.toggle('format-bad', inp.value.trim() !== '' && !isChordFormat(inp.value));
      };
    });
  }
  document.getElementById('gbPrevBtn').onclick = ()=> renderGbPartProgression(gb.guide.structureParts.length-1, true);
  document.getElementById('gbNextBtn').onclick = ()=> checked ? renderGbPattern() : renderGbChordTranslate(true);
}
'''
    s = s[:start] + chord_translate + s[end:]

    summary_start = s.index('  function renderSummaryChords(){')
    summary_end = s.index('\n  renderSummaryChords();', summary_start)
    summary = r'''  function renderSummaryChords(){
    const key = gb.summaryKey;
    document.getElementById('summaryChords').innerHTML = gb.guide.structureParts.map(partName=>{
      const part = gb.guide.allParts[partName];
      const baseLabel = `[${partName}] ${part.roman.join(' - ')}`;
      if(part.bars){
        let chordIndex = 0;
        let prevLineSourceKey = null;
        const linesHtml = part.bars.map((line, li)=>{
          const lineStartChordIndex = chordIndex;
          const sourceActiveKey = guideKeyAt(gb.guide, partName, lineStartChordIndex);
          const shownActiveKey = transposeGuideKey(sourceActiveKey, gb.guide.key, key);
          const isModulationLine = !!gb.guide.keyTimeline && prevLineSourceKey !== null && sourceActiveKey !== prevLineSourceKey;
          const tokens = line.map(slot=>{
            if(slot === null) return `<div class="gb-dot">•</div>`;
            const { voicing } = splitVoicing(slot);
            const voicingHtml = voicing ? `<span class="gb-voicing">${voicing}</span>` : '';
            const sourceChord = part.chords[chordIndex++] || slot;
            const shownChord = transposeChordSymbol(sourceChord, gb.guide.key, key);
            return `<div class="gb-token">${shownChord}${voicingHtml}</div>`;
          }).join('');
          const keyTag = gb.guide.keyTimeline
            ? ` <span style="color:${isModulationLine ? 'var(--accent)' : 'var(--accent2)'};font-weight:700;">• ${isModulationLine ? 'MODULASI → ' : ''}do = ${shownActiveKey}</span>`
            : '';
          prevLineSourceKey = sourceActiveKey;
          return `<div class="gb-line"><div class="gb-line-label">${li===0?baseLabel:`Baris ${li+1}`}${keyTag}</div><div class="gb-tokens">${tokens}</div></div>`;
        }).join('');
        return linesHtml;
      }
      const sourceActiveKey = guideKeyAt(gb.guide, partName, 0);
      const shownActiveKey = transposeGuideKey(sourceActiveKey, gb.guide.key, key);
      const keyTag = gb.guide.keyTimeline ? ` • do = ${shownActiveKey}` : '';
      return `<div class="gb-line"><div class="gb-line-label">${baseLabel}${keyTag}</div><div class="gb-tokens">${part.chords.map(c=>`<div class="gb-token">${transposeChordSymbol(c, gb.guide.key, key)}</div>`).join('')}</div></div>`;
    }).join('');
  }
'''
    s = s[:summary_start] + summary + s[summary_end:]

    old = '<div class="step-label" style="text-align:left;">Coba ganti nada dasar buat latihan — chord di bawah otomatis nyesuain.</div>'
    new = '<div class="step-label" style="text-align:left;">Coba ganti nada dasar buat latihan — chord di bawah otomatis nyesuain.${gb.guide.keyTimeline ? \' Modulasi ikut bergeser dengan interval yang sama.\' : \'\'}</div>'
    if old not in s:
        raise RuntimeError(f'summary helper source not found in {path}')
    s = s.replace(old, new, 1)

    # Remove misleading generic note for the three songs being fixed.
    for vid in ['axySrE0Kg6k','jP6eEKrghGI','Jr9K5hLvULk']:
        pos = s.index(f"'{vid}': {{")
        next_pos = s.find("\n  '", pos + 10)
        if next_pos < 0:
            next_pos = s.index('\n\n};', pos)
        block = s[pos:next_pos].replace("patternNote:'Pattern bisa pakai semua lagu cepat dan lambat.',", "patternNote:'',")
        s = s[:pos] + block + s[next_pos:]

    path.write_text(s, encoding='utf-8')

# Documentation sync.
guide = Path('GUIDE_LAGU.md')
s = guide.read_text(encoding='utf-8')
s = s.replace('**Pattern benar:** 12/8 Pattern 1, 6/8 Pattern\n**Pattern salah:** Lambat 6, Cepat 2, Lambat 4',
              '**Pattern benar:** 12/8 Pattern 1, 12/8 Pattern Full (RH di semua 12 subdivisi; LH di ketukan 1 dan 3)\n**Pattern salah:** Lambat 6, Cepat 2, Lambat 4')
s = s.replace('**Pattern benar:** 12/8 Pattern 1, 12/8 Pattern 2\n**Pattern salah:** Lambat 6, Cepat 2, Lambat 4\n\n---\n\n### 10. Until I Found You',
              "**Pattern benar:** 12/8 Pattern 1 (LH: 1–5–1’ | rest–1’–5 | 1–5–1’ | rest–1’–5), 12/8 Pattern 2\n**Pattern salah:** Lambat 6, Cepat 2, Lambat 4\n\n---\n\n### 10. Until I Found You")
guide.write_text(s, encoding='utf-8')

fix = Path('FIXES_CURRENT_GUIDE.md')
s = fix.read_text(encoding='utf-8')
s += "\n\n## v5 follow-up fixes\n- **12/8 Pattern 1:** corrected the two intended LH rests (start of beat 2 and start of beat 4). This fixes the pattern shown for Marry Your Daughter and Until I Found You, and keeps A Thousand Years consistent because it uses the same guide pattern.\n- **Until I Found You:** the second correct pattern is now shown/classified as 12/8 Full (RH on all 12 subdivisions, LH on beats 1 and 3), not 6/8.\n- **Beauty and the Beast:** added an explicit do=E → do=Eb key timeline. The progression page marks the modulation at Verse Baris 3, the chord-writing page shows both E and Eb family-chord tables and separates the Eb chord entries, and the summary keeps the modulation visible when transposed.\n"
fix.write_text(s, encoding='utf-8')

for name in ['HANDOFF_KNOWLEDGE.md','HANDOFF_BEDAH_LAGU.md']:
    p = Path(name)
    text = p.read_text(encoding='utf-8')
    text += "\n\n## v5 follow-up\n- 12/8 Pattern 1 mengikuti spacing guide: LH `1 5 1’ | rest 1’ 5 | 1 5 1’ | rest 1’ 5`.\n- Until I Found You memakai Pattern 12/8 Full sebagai pilihan benar kedua, bukan label 6/8.\n- Beauty and the Beast memiliki key timeline eksplisit: Intro/awal Verse do=E, Verse Baris 3 mulai modulasi ke do=Eb, Chorus tetap do=Eb. Halaman Translate Chord menampilkan family chord E dan Eb serta memisahkan isian sebelum/sesudah modulasi.\n"
    p.write_text(text, encoding='utf-8')

print('v5 patch applied')
