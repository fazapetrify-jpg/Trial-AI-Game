# Handoff Knowledge — Interactive Hearing Game (Bedah Lagu Data)

Dokumen ini isinya semua pengetahuan/konvensi yang udah disepakati selama proses input data lagu ke `SONG_GUIDES` di `index.html`. Kasih file ini ke Claude di komputer lain sebagai konteks kalau mau lanjut ngedit/nambah data lagu, biar nggak perlu jelasin ulang dari nol.

## Lokasi Data
- Semua data lagu ada di variabel `SONG_GUIDES` (JS object) di `index.html`.
- Tiap lagu di-key pakai YouTube videoId, isinya `key` (nada dasar), `structureParts` (urutan nama bagian), `allParts` (progresi tiap bagian), `patternNote`, `correctPatternIds`, `wrongPatternIds`.
- Daftar lagu & videoId ada di `SONGS_BANK` (terpisah dari SONG_GUIDES, buat menu pilih lagu).
- Bank pattern iringan (RH/LH visual) ada di `PATTERN_BANK`.

## Struktur 1 Bagian Lagu (`allParts.NamaBagian`)
```js
'NamaBagian': {
  roman: [...],      // urutan chord dalam angka romawi (WAJIB, ini yang dinilai di soal progresi)
  chords: [...],     // terjemahan chord huruf, urutan & panjang HARUS sama dengan roman
  time: '0:00 – 0:15',      // buat tampilan aja
  startSeconds: 0, endSeconds: 15,  // buat clip video (opsional)
  bars: [ [...] ]    // opsional: notasi titik-ketukan buat visual "•" di halaman tebak progresi
}
```
- `bars` itu ARRAY OF ARRAYS (tiap sub-array = 1 baris tampilan). Isinya string chord (harus match posisi ke-N di `roman`, urut) diselang-seling `null` (artinya titik/ketukan lanjutan, bukan chord baru).
- Kalau `bars` nggak diisi, sistem otomatis bikin default 4 slot per chord (1 chord + 3 null) via kode auto-generator di bawah `SONG_GUIDES`.

## Konvensi Titik/Ketukan yang Udah Ketemu
Guide asli (dari dokumen si pembuat konten) TIDAK konsisten formatnya — beda lagu beda gaya nulis titik. Yang udah dikonfirmasi:

1. **Lagu Worship** (Goodness of God, Holy Forever, Shout to the Lord bagian Intro, Praise) — pakai **3 titik per chord = 4 ketukan/segmen** (`chord + 3 null`). Kalau ada dot standalone tanpa chord di depannya ("….") itu = 1 birama penuh kosong (4 null).

2. **Sebagian lagu Pop** (A Thousand Years, Until I Found You) — pakai **5 titik per chord = 6 ketukan/segmen** (`chord + 5 null`). Ini BEDA dari lagu Worship — jangan disamain ke 4.

3. **Chord pendek dalam 1 baris yang sama** — kadang dalam SATU baris ada chord yang jauh lebih pendek dari yang lain (misal di "Until I Found You" Verse: I & IIIm/VII = 6 ketukan panjang, tapi IV & IVm cuma **3 ketukan/2 titik**). Ini dikonfirmasi langsung oleh user, jangan diseragamkan.

4. **Pola "X..Y.."** (2 chord dipisah cuma 2 titik) = 2 chord itu **berbagi 1 birama pendek (4 ketukan)**, bukan masing-masing punya birama sendiri. Contoh: `I/V..IV` → `['I/V', null, 'IV', null]`. Ini konvensi yang dikonfirmasi user berlaku umum di semua lagu.

5. **Pola "…X.."** (titik SEBELUM nama chord) = chord itu masuk di TENGAH birama, bukan di ketuk pertama. Contoh Goodness of God: `I.V/VII.` → chord V/VII masuk di posisi ke-3 dari 4 (`[null, null, 'V/VII', null]` kalau segmen 4-ketukan).

6. **Slash chord** (misal `IV/V`) itu FUNGSINYA mirip sama chord di angka atas (menurut user: "IV/V itu sama kaya chord V sebenernya"). Jadi kadang guide nulis singkat cuma `V..` padahal maksudnya `IV/V..` — perlu hati-hati baca konteks.

7. **"(diulang 2x)"** di guide = progresi/bagian itu harus DIULANG 2x penuh dalam `roman`, `chords`, dan `bars` — jangan cuma ditulis 1x. Contoh: Shout to the Lord Verse, Praise Verse & Chorus.

8. **Voicing tambahan dalam kurung** (misal `IV(Maj7)`, `IIm(7)`) — itu INFO doang, bukan bagian yang di-blank/dinilai. Sistem udah otomatis misahin via fungsi `splitVoicing()` di kode — nggak perlu diapa-apain khusus di data, tulis aja apa adanya di `roman`.

## Cara Cek Ulang Kalau Ragu
Kalau dapet foto/screenshot guide yang blur/susah dihitung titiknya SATU-SATU secara visual, **JANGAN** langsung nebak dari gambar — mending:
1. Cek dulu apakah ada file `.md`/`.pdf` sumber yang bisa dibaca teksnya langsung (lebih akurat daripada baca gambar)
2. Kalau tetap ragu, tanya user buat kasih angka ketukan langsung (bukan minta gambar lagi)

## Status Data per Lagu (per kondisi terakhir diupdate)

| Lagu | Nada Dasar | Notasi Titik | Pattern Benar | Pattern Salah |
|---|---|---|---|---|
| Goodness of God | Ab | ✅ lengkap | Lambat 1, Lambat 4 | Cepat 4, 5, 6 |
| Shout to the Lord | A | ✅ lengkap (Intro+Verse+Chorus) | Cepat 2, Cepat 3 | Funk, 12/8 P2, 12/8 P1, Lambat 4 |
| I Sing Praises | G | ✅ lengkap | Cepat 2, Cepat 3 | Lambat 10, 11, 12 |
| Holy Forever | F | ✅ lengkap | Cepat 1, Cepat 3 | 6/8, Cepat 4, Lambat 14 |
| Praise | A | ✅ lengkap (Verse diulang 2x) | Cepat 1, Cepat 2 | Lambat 11, 13, Cepat 4 |
| Beauty and the Beast | E→Db (modulasi turun 3 semitone di tengah Verse) | ✅ lengkap kecuali bagian modulasi (pendekatan, bukan titik-perfect) | Lambat 1, Lambat 4 | Cepat 4, 5, 6 |
| Endless Love | Bb | ✅ lengkap (Intro ada jeda) | Cepat 2, Lambat 4 | Lambat 10, 11, 12 |
| A Thousand Years | Bb | ✅ lengkap, 6 ketukan/segmen, ada pairing "X..Y" | 12/8 Pattern 1, 12/8 Pattern 2 | Lambat 6, Cepat 2, Lambat 4 |
| Marry Your Daughter | B | ⚠️ **BELUM ada notasi titik manual** — masih fallback 4-ketukan rata (progresi guide asli pakai tanda hubung "-" yang nggak jelas durasinya) | 12/8 Pattern 1, 12/8 Pattern 2 | Lambat 6, Cepat 2, Lambat 4 |
| Until I Found You | Bb | ✅ lengkap, 6 ketukan/segmen tapi IV & IVm cuma 3 ketukan | 12/8 Pattern 1, 6/8 Pattern | Lambat 6, Cepat 2, Lambat 4 |

## Pekerjaan yang Masih Bisa Dilanjut
- **Marry Your Daughter**: belum ada `bars` manual. Progresinya (dari guide) pakai notasi tanda hubung kayak "iim-IIIm-IV .. V-VIm-V/VII-IIm" yang artinya beberapa chord ganti cepat tanpa jeda jelas — kalau user kasih angka ketukan pasti, baru bisa dibikin `bars`-nya.
- Kalau user kasih guide lagu BARU (bukan revisi lagu yang udah ada), ikutin format di atas: cari nada dasar, struktur bagian, progresi angka romawi + titik, terjemahan chord, dan pattern benar/salah dari bank pattern yang udah ada (`PATTERN_BANK` di kode — isinya ~26 pattern nama Lambat 1-14, Cepat 1-6, Funk, 9/8, 12/8×3, 6/8, 3/4).

---
*Catatan: dokumen ini nggak berisi lirik lagu apa pun — cuma notasi teori musik (angka romawi, chord huruf, titik ketukan) dan catatan proses kerja.*
