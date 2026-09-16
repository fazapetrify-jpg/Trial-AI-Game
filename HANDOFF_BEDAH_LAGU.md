# Handoff Knowledge — Fitur "Bedah Lagu" (Interactive Hearing Game)

Dokumen ini khusus buat fitur **Bedah Lagu** (trainer cara mengiringi lagu: tebak nada dasar → progresi → chord → pattern). Kasih file ini ke Claude di komputer lain sebagai konteks kalau mau lanjut ngedit/nambah data lagu di fitur ini, biar nggak perlu jelasin ulang dari nol.

## Lokasi Data
Semua data lagu buat fitur Bedah Lagu ada di variabel `SONG_GUIDES` (JS object) di `index.html`. Daftar lagu (nama, artis, videoId, kategori) ada di `SONGS_BANK` — terpisah, dipakai buat menu pilih lagu sebelum masuk ke Bedah Lagu.

## Alur Fitur Bedah Lagu
1. **Pilih kategori → pilih lagu** (random dari kategori, bisa "latihan lagu lainnya" buat ganti)
2. **Dengerin lagu** (embed video), lalu **tebak nada dasar** — harus benar dulu baru bisa lanjut, kalau salah dikasih clue bertahap
3. Pesan transisi: fokus ke cara mengiringi, bukan melodi/lirik
4. **Tebak progresi per bagian**, urut dari bagian pertama sampai terakhir sesuai `structureParts` — progresi angka romawi sebagian di-blank (~70%), sisanya kelihatan sebagai petunjuk + titik ketukan
5. **Halaman gabungan**: semua progresi ditampilkan sekaligus + tabel referensi chord diatonis (family chord) sesuai nada dasar, user translate semua ke chord huruf asli
6. **Pilih pattern iringan** (2 dari 5 opsi visual RH/LH)
7. **Halaman hasil**: skor gabungan + rekap semua jawaban benar + bisa ganti nada dasar buat latihan transpose (chord dihitung ulang otomatis pakai rumus interval)

## Struktur 1 Bagian Lagu (`allParts.NamaBagian`)
```js
'NamaBagian': {
  roman: [...],      // urutan chord angka romawi (WAJIB, ini yang dinilai)
  chords: [...],     // terjemahan chord huruf, urutan & panjang HARUS sama dengan roman
  time: '0:00 – 0:15',
  startSeconds: 0, endSeconds: 15,  // buat clip video (opsional)
  bars: [ [...] ]    // opsional: notasi titik-ketukan visual "•"
}
```
`bars` = array of arrays (tiap sub-array = 1 baris tampilan), isi string chord (harus urut match posisi ke-N di `roman`) diselang `null` (titik/ketukan lanjutan). Kalau `bars` kosong, sistem auto-generate default 4 slot per chord.

Objek utama tiap lagu:
```js
'videoId': {
  key: 'Ab',                          // nada dasar
  modulationNote: '...',              // opsional, kalau lagu modulasi di tengah
  structureParts: ['Intro','Verse','Chorus'],  // urutan bagian
  allParts: { ... },
  patternNote: '...',
  correctPatternIds: ['lambat1','lambat4'],    // id dari PATTERN_BANK
  wrongPatternIds: ['cepat4','cepat5','cepat6'] // opsional, kalau nggak diisi random dari sisa
}
```

## Konvensi Titik/Ketukan yang Udah Ketemu
Guide asli TIDAK konsisten formatnya — beda lagu beda gaya nulis titik. Yang udah dikonfirmasi:

1. **Lagu Worship** (Goodness of God, Holy Forever, Shout to the Lord Intro, Praise) — **3 titik/chord = 4 ketukan/segmen**.
2. **Sebagian lagu Pop** (A Thousand Years, Until I Found You) — **5 titik/chord = 6 ketukan/segmen**. Jangan disamain ke 4.
3. **Chord pendek dalam 1 baris** — kadang ada chord yang jauh lebih pendek dari yang lain di baris yang sama (misal IV & IVm di "Until I Found You" cuma 3 ketukan/2 titik, sementara I & IIIm/VII di baris yang sama 6 ketukan). Konfirmasi ke user kalau ketemu pola ini, jangan diseragamkan sendiri.
4. **Pola "X..Y.."** (2 chord dipisah 2 titik) = berbagi 1 birama pendek (4 ketukan): `I/V..IV` → `['I/V', null, 'IV', null]`.
5. **Pola "…X.."** (titik sebelum chord) = chord masuk di tengah birama: `I.V/VII.` → `[null, null, 'V/VII', null]` (di segmen 4-ketukan).
6. **"(diulang 2x)"** = progresi harus diulang 2x penuh di `roman`, `chords`, dan `bars` — bukan cuma ditulis sekali.
7. **Voicing dalam kurung** (`IV(Maj7)`, `IIm(7)`) = info tambahan doang, bukan yang dinilai — udah otomatis dipisah via `splitVoicing()` di kode, tulis aja apa adanya di `roman`.

**Kalau dapet screenshot yang blur/susah dihitung**: jangan nebak dari gambar. Cek dulu ada file teks (.md/.pdf) sumbernya, atau minta user kasih angka ketukan langsung.

## Status Data per Lagu

| Lagu | Nada Dasar | Notasi Titik | Pattern Benar | Pattern Salah |
|---|---|---|---|---|
| Goodness of God | Ab | ✅ lengkap | Lambat 1, Lambat 4 | Cepat 4, 5, 6 |
| Shout to the Lord | A | ✅ lengkap | Cepat 2, Cepat 3 | Funk, 12/8 P2, 12/8 P1, Lambat 4 |
| I Sing Praises | G | ✅ lengkap | Cepat 2, Cepat 3 | Lambat 10, 11, 12 |
| Holy Forever | F | ✅ lengkap | Cepat 1, Cepat 3 | 6/8, Cepat 4, Lambat 14 |
| Praise | A | ✅ lengkap (Verse diulang 2x) | Cepat 1, Cepat 2 | Lambat 11, 13, Cepat 4 |
| Beauty and the Beast | E→Db (modulasi tengah Verse) | ✅ lengkap, bagian modulasi masih pendekatan | Lambat 1, Lambat 4 | Cepat 4, 5, 6 |
| Endless Love | Bb | ✅ lengkap | Cepat 2, Lambat 4 | Lambat 10, 11, 12 |
| A Thousand Years | Bb | ✅ lengkap, 6 ketukan/segmen | 12/8 Pattern 1, 12/8 Pattern 2 | Lambat 6, Cepat 2, Lambat 4 |
| Marry Your Daughter | B | ⚠️ belum ada `bars` manual (masih fallback 4-ketukan rata) | 12/8 Pattern 1, 12/8 Pattern 2 | Lambat 6, Cepat 2, Lambat 4 |
| Until I Found You | Bb | ✅ lengkap, IV & IVm cuma 3 ketukan | 12/8 Pattern 1, 6/8 Pattern | Lambat 6, Cepat 2, Lambat 4 |

## Bank Pattern (`PATTERN_BANK`)
~26 pattern iringan RH/LH (Lambat 1-14, Cepat 1-6, Funk, 9/8, 12/8×3, 6/8, 3/4), tiap ID dipakai di `correctPatternIds`/`wrongPatternIds` per lagu. Cocokin pattern baru ke ID yang udah ada berdasarkan bentuk visual RH/LH (jumlah & posisi "V" dan angka scale-degree), jangan bikin ID baru kecuali beda bentuknya beda.

## Pekerjaan yang Masih Bisa Dilanjut
- **Marry Your Daughter**: belum ada notasi titik manual — progresinya pakai tanda hubung ("iim-IIIm-IV .. V-VIm-V/VII-IIm") yang durasinya nggak jelas, tunggu user kasih angka ketukan pasti.
- Lagu baru: ikutin format di atas — nada dasar, `structureParts`, progresi angka romawi + titik per bagian, terjemahan chord, pattern benar/salah dari `PATTERN_BANK`.

---
*Dokumen ini nggak berisi lirik lagu apa pun — cuma notasi teori musik (angka romawi, chord huruf, titik ketukan) dan catatan proses kerja.*
