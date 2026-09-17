# Workflow Bikin Deck Workshop Musti Musik (pakai Claude Code)

Dokumen ini ngejelasin alur kerja dari **brief kosong → file `.pptx` jadi**, plus alat & aturan yang dipakai. Bisa langsung dishare ke tim.

---

## TL;DR — 6 langkah

1. **Brief** — kasih rundown + materi mentah + audiens.
2. **Style guide** — sekali di awal: warna, font, pola layout, aturan logo.
3. **Bullet outline** — 1 bullet = 1 slide. Dikoreksi bolak-balik sampai fix.
4. **Naskah lengkap** (opsional tapi dipakai di sini) — tiap slide ditulis kata-per-kata di Word/MD.
5. **Generate** — Claude nulis 1 script Node (`pptxgenjs`) yang meng-output `.pptx`.
6. **Review & regenerate** — koreksi di naskah/script → build ulang → ulangi.

Kunci: **konten dan desain dipisah**. Konten hidup di dokumen (bullet/naskah). Desain hidup di script (fungsi tipe slide). Ganti konten = edit teks; ganti tampilan = edit fungsi.

---

## Langkah detail

### 1. Brief
Yang dikasih ke Claude di awal:
- **Rundown acara** (durasi tiap sesi).
- **Materi mentah** — boleh berantakan: catatan, transkrip, playbook, poin-poin.
- **Audiens** — "workshop ini buat guru musik / pengajar", biar konteksnya diarahkan ke sana.
- Instruksi: *"pelajari dulu, jangan generate apa-apa"* — biar Claude paham konteks penuh sebelum bikin.

### 2. Style guide (sekali, di depan)
Ditulis eksplisit, contoh yang dipakai di sini:
- **Background**: nggak diisi warna (biar gampang diedit manual nanti).
- **Aksen**: kuning/amber `#F5B942` (kotak highlight di judul + isi ikon), merah `#C41E1E` (urgency + penekanan kuat).
- **Font**: heading `Montserrat Black` **25pt**; isi `Montserrat` 18pt — kalimat pertama **bold**, sisanya normal.
- **Pola judul**: 2 bagian, bagian akhir di kotak highlight kuning — "Judul biasa `bagian disorot`".
- **Logo**: wordmark `MUSTI / MUSIK.` (2 baris) — default kanan-bawah; kiri-atas hanya di slide divider & hook.
- **Teks**: rata kiri, vertical-align tengah (bukan nempel atas).
- **Divider**: ikon flat di kiri + kotak "Bagian X:" berwarna (hitam / maroon / merah, muter) + judul besar.
- **Foto**: cutout Dave transparan, rasio asli (jangan di-stretch), rata bawah.

> Referensi gaya diambil dari deck Musti Musik yang sudah jadi (Modul Belajar AI). Claude "belajar" dari situ: cara naruh teks, naruh gambar, warna, tipografi.

### 3. Bullet outline (iterasi utama)
- **Aturan: 1 bullet = 1 slide.**
- Dibagi per bagian (A, B, C, …) dengan **slide divider** tiap ganti bagian.
- Slide "storytelling" (cerita "aku") pakai heading yang sama dengan judul topik, muncul tiap ganti topik besar.
- Slide "hook"/transisi = satu kalimat di tengah dengan kata kunci di kotak kuning.
- Koreksi bebas: tambah/hapus/reorder/ganti kalimat. Claude update outline, bukan bikin ulang dari nol.

### 4. Naskah lengkap kata-per-kata
Untuk deck ini kita naik satu level: tiap slide ditulis penuh di Word/MD dengan format:
```
Slide N · <tipe slide>
Judul (kata di kotak highlight ditandai)
► kalimat pertama (bold) — frasa penting bisa merah
• paragraf berikutnya (normal)
⟦ catatan foto / aset / diagram ⟧
```
Naskah ini yang jadi **sumber kebenaran**. Nomor slide boleh berantakan / dobel — yang penting **urut atas ke bawah**; Claude yang rapihin.

### 5. Generate script
Claude nulis **satu file** `build_deck.js`:
- Pakai `pptxgenjs` (npm).
- **Canvas 10 × 5.625 inci** (16:9 lama) — WAJIB samain sama template, kalau nggak ukuran font 25pt kelihatan kekecilan. Trik: semua koordinat ditulis di grid 13.333 lalu diskalakan ×0.75 otomatis.
- Deretan **fungsi tipe slide**: `titleSlide`, `divider`, `hook`, `content`, `story`, `comparison`, `statSlide`, `timeline`, `pillar`, `threecol`, `flow` (chip + panah), `funnel` (corong bertumpuk), `quoteAmber/Red/Full`, `iconRow3`, `agenda3`, `audience2`, `bannerTitle`, `objection`.
- Bagian bawah script = **daftar panggilan fungsi**, 1 baris ≈ 1 slide, argumen = teksnya. Ini yang di-edit tiap revisi.
- Ikon = shape vektor bawaan PowerPoint (`gear9`, `lightningBolt`, `heart`, dll) — bukan gambar, jadi tetap tajam & bisa di-recolor.
- Foto = `addImage` dengan fit rasio asli (dihitung dari `dims.json`), rata bawah + tengah.
- Placeholder buat aset yang belum ada (screenshot app, ijazah) = kotak abu bergaris putus-putus berlabel.

Perintah build:
```bash
node build_deck.js                       # -> Workshop-Guru-MustiMusik.pptx
python .../pptx/scripts/office/validate.py Workshop-Guru-MustiMusik.pptx   # cek file valid
python -m markitdown Workshop-Guru-MustiMusik.pptx   # dump teks buat cek konten
```

### 6. Review & regenerate
- Baca ulang → catat koreksi di **naskah** (atau langsung sebut ke Claude).
- Claude edit baris fungsi yang relevan → `node build_deck.js` lagi.
- **Round-trip dokumen**: script bisa "di-dump" balik jadi naskah Word/MD supaya naskah & PPT selalu sinkron.
- QA visual (buka di PowerPoint): cek text overflow, chip kekecilan, proporsi funnel, posisi foto.

---

## Alur data (diagram)

```
Brief + materi mentah + style guide
        │
        ▼
  Bullet outline  ◄──── koreksi (tambah/hapus/reorder)
        │
        ▼
  Naskah lengkap (Word / MD)  ◄──── koreksi kata-per-kata
        │
        ▼            ┌─────────────────────────────┐
  build_deck.js ─────► node build_deck.js ─► .pptx │
   (fungsi tipe        └─────────────────────────────┘
    slide + daftar              │
    panggilan)                  ▼
        ▲              validate.py + markitdown (cek)
        │                       │
        └──── dump balik ◄──────┘  (naskah ⇄ script tetap sinkron)
```

---

## Aturan main biar lancar

| Do | Don't |
|---|---|
| Kasih style guide lengkap **sekali di depan** | Ubah gaya di tiap slide satu-satu |
| 1 bullet = 1 slide, konsisten | Campur 3 ide dalam 1 bullet |
| Koreksi di **naskah**, bukan minta "bikin ulang" | Regenerate dari nol tiap revisi |
| Nomor slide boleh berantakan, yang penting urut | Maksa nomor cocok |
| Aset belum ada → biarin jadi placeholder berlabel | Nunggu semua aset lengkap baru mulai |
| Pisahin: konten di dokumen, desain di fungsi | Hardcode teks di dalam layout |

---

## Yang perlu disiapin (tools)

- **Node.js** + `pptxgenjs` (`npm i pptxgenjs`)
- **Python** + `markitdown`, `python-pptx`/`Pillow`/`lxml`/`defusedxml` (buat cek konten & validasi)
- **PowerPoint** (buat QA visual + edit akhir)
- Font **Montserrat** (family lengkap, termasuk Black) terinstall di komputer yang buka file
- Folder aset: cutout PNG transparan + screenshot, dikasih path-nya

---

## Contoh 1 "slide call" di script

```js
content({
  plain: "Kuncinya: naikin",          // judul bagian biasa
  hi: "bertahap",                      // ← masuk kotak highlight kuning
  lead: "Nggak perlu ngajarin ketiga pilar dalam satu pertemuan.",  // kalimat 1, bold
  leadRed: "dalam satu pertemuan",     // frasa merah di kalimat 1
  paras: ["Fokus di titik level murid sekarang — penjelasan tetap singkat."],  // paragraf normal
  img: "DIAGRAM: 3 panah → 1 target"   // placeholder aset (kalau ada foto: pic: D("dave-10"))
});
```

Ganti workshop lain = ganti isi argumen. Layout, warna, font otomatis ngikut.
