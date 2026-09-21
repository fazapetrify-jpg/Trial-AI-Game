# Konteks Proyek: Seri Buku Piano, Musti Musik / Dave Henokh Liong

Repo ini menampung semua pengetahuan dari chat claude.ai **"kurikulum pembelajaran lagu pop"** supaya kerja lanjutan bisa dilakukan di Claude Code tanpa kehilangan konteks.

**Baca `RANGKUMAN_PROYEK_BUKU.md` lebih dulu.** Itu sumber kebenaran soal status tiap buku, keputusan yang sudah diambil, dan hal yang masih pending.

## Penulis
Dave Henokh Liong, DipLCM, ALCM (Musti Musik).

## Gaya & format baku (berlaku di SEMUA buku, WAJIB diikuti)

- **Struktur baku**: Kata Penulis → Cara Buku Ini Bisa Membantumu → BAB-BAB isi → Penutup.
- **Gaya bahasa**: santai, "aku-kamu", nulis dengan suara ngobrol asli Dave (bukan poin-poin ringkasan slide) kalau ada sumber transkrip/video yang bisa dijadiin acuan cara ngomongnya. Banyak pertanyaan retoris ditulis _italic_. Hindari perbandingan negatif ke genre/buku lain di pembuka.
- **JANGAN PERNAH pakai em dash (` — `) di mana pun, di judul maupun isi.** Ini ciri khas tulisan AI dan harus dihindari total. Ganti dengan koma, titik, titik dua, atau restrukturisasi kalimat.
- **Tiap BAB wajib buka dengan link video YouTube pendamping + rentang timestamp-nya** (contoh: dari menit berapa sampai menit berapa di video sumber yang relevan sama isi BAB itu), ditaruh tepat setelah judul BAB (sebelum konten mulai), bukan di akhir. Format ngikutin contoh ebook tim yang udah rilis (`EBOOK FILL IN IMPROVISASI.pdf`): baris italic *"Klik link berikut untuk belajar dalam format video:"* diikuti link bold-italic di tengah, ditambah keterangan rentang timestamp-nya.
- **Elemen konsisten tiap BAB**: heading `**Tips Aplikasi**` di beberapa poin; placeholder gambar ditulis `![placeholder: ...]` (atau gambar asli dari sumber PPT/PDF kalau tersedia dan aman hak cipta); ada ajakan scan QR atau link video pendamping.
- **Copyright**: jangan reproduksi lirik lagu berhak cipta. Kalau transkrip sumber pakai contoh lagu tertentu, ganti jadi progresi chord generik atau lagu public domain / karya asli penulis.

## Sistem notasi pattern iringan

- Baris ketukan: `1  n  2  n  3  n  4  n`. Angka = ketukan utama, `n` = upbeat/offbeat.
- Tangan kanan (RH): `V` = full/block chord.
- Tangan kiri (LH): angka `1`-`7` = urutan nada dari root chord yang sedang dimainkan (chord C: 1=C, 3=E, 5=G). Oktaf atas pakai tanda `'` (mis. `1'` = C oktaf atas).
- LH kadang pakai `V` juga, tapi artinya power chord/oktaf (bukan full chord). Full chord di register rendah kedengeran "kotor".

## Isi repo

| File | Keterangan |
|---|---|
| `RANGKUMAN_PROYEK_BUKU.md` | Status & konteks semua buku, **baca dulu** |
| `Buku Belajar Denger Lagu 1x *.md`, `Buku Belajar Pop.md` | Draft "Strategi Denger Lagu 1x Langsung Bisa Main" (beberapa versi) |
| `buku-denger-lagu-dari-0.md` | Draft "Cara Buat Lagu dari 0" |
| `Buku_Worship_Starter_7_Hari.md` | Draft "Worship Starter, 7 Hari" |
| `catatan game lagu.md` | Catatan pendukung |
| `captions*.sbv` | Transkrip masterclass sumber materi (lihat RANGKUMAN bagian "File Sumber") |
| `Buku Worship*.pdf`, `Buku Hearing Lagu*.pdf`, `E BOOK CHORD MANIS.pdf`, dll | Referensi & versi PDF buku |
| `Cheat Sheet*.pdf` | Cheat sheet progresi & pencarian chord |
| `*.png`, `COVER *.pdf`, `Sneak Peak *.pdf` | Aset cover / preview |
| `EBOOK FILL IN IMPROVISASI.pdf` | Contoh format resmi tim (rujukan gaya video-citation per BAB) |
