# Prompt: Step-by-Step Bikin Music Ear-Training & Song-Accompaniment Game

Ikuti langkah-langkah ini secara berurutan buat bikin web app edukasi musik. Bebas tentukan tampilan/desain sendiri — fokus prompt ini cuma di **struktur fitur dan logika**, bukan visual.

## Step 1 — Setup Dasar
- Bikin 1 aplikasi web (boleh single file atau multi-file, bebas stack) yang bisa jalan tanpa server/database — semua state disimpan di local storage browser.
- Siapkan mesin audio pakai Web Audio API (osilator) buat nge-generate nada/chord sendiri, jangan pakai file sample.

## Step 2 — Bikin 3 Tipe Soal Dasar (Ear Training)
1. **Interval**: mainkan 2 nada berurutan, generate soal pilihan ganda tebak nama intervalnya (siapkan daftar nama interval dari yang paling rapat sampai 1 oktaf).
2. **Chord**: mainkan 1 chord (nada dimainkan bersamaan), soal pilihan ganda tebak kualitas chord-nya (major/minor/diminished/augmented/dominan/dst).
3. **Progresi**: mainkan 4 chord berurutan, soal pilihan ganda tebak nama progresinya (siapkan beberapa progresi umum sebagai bank soal).

Tiap sesi = beberapa soal berurutan, kasih feedback benar/salah + penjelasan singkat tiap soal, tampilkan skor akhir di akhir sesi.

## Step 3 — Bikin Halaman Pilih Mode
- Halaman awal nampilkan pilihan: main tipe soal #1 aja, #2 aja, #3 aja, atau campuran ketiganya.

## Step 4 — Tambahkan Sistem Harian (opsional tapi disarankan)
- Buat soal yang sama buat semua orang di hari yang sama (pakai random seed dari tanggal).
- Batasi 1x main per mode per hari, simpan skor & streak (hari main berturut-turut) di local storage.
- Sediakan juga "mode latihan" tanpa batas buat main ulang kapan aja.

## Step 5 — Rancang Struktur Data buat Trainer Lagu
Bikin format data generik per-lagu yang isinya:
- Nada dasar
- Daftar nama bagian lagu berurutan (misal: bagian 1, bagian 2, bagian 3, dst — namanya bebas)
- Progresi chord tiap bagian, ditulis pakai notasi angka romawi (boleh ada slash-chord dan catatan variasi/ekstensi chord)
- Terjemahan progresi tadi ke nama chord asli sesuai nada dasar
- Beberapa pilihan pola iringan yang cocok, dan beberapa yang tidak cocok
- (opsional) rentang waktu tiap bagian kalau mau nampilkan referensi audio/video

Data ini harus terpisah dari kode aplikasi (misal disimpan sebagai konfigurasi/JSON), jadi bisa diisi ulang buat lagu lain tanpa ubah logika program.

## Step 6 — Bikin Alur Trainer Lagu (per lagu yang dipilih)
1. User pilih 1 lagu dari daftar.
2. Kasih kesempatan dengerin referensi lagunya, lalu minta user tebak nada dasarnya. Kalau salah, jangan lanjut — kasih petunjuk bertahap sampai user jawab benar.
3. Kasih tau bahwa fokus latihan ini di cara mengiringi (chord & pola iringan), bukan melodi atau kata-kata lagu.
4. Untuk tiap bagian lagu (urut dari yang pertama), tampilkan progresi chord-nya dengan sebagian angka romawi disembunyikan (misal acak ~70% disembunyikan), minta user isi yang kosong. Kasih feedback benar/salah per isian, plus status "hampir benar" khusus buat slash-chord yang cuma sebagian jawabannya tepat.
5. Setelah semua bagian selesai ditebak progresinya, tampilkan SEMUA progresi dari semua bagian sekaligus dalam satu halaman, sediakan tabel referensi chord sesuai nada dasar, lalu minta user menerjemahkan semua progresi itu ke nama chord asli.
6. Minta user memilih pola iringan yang menurutnya paling cocok dari beberapa opsi (campuran yang benar dan salah).
7. Tampilkan skor akhir gabungan dari semua tahap (nada dasar, progresi, terjemahan chord, pemilihan pola), plus rekap semua jawaban yang benar sebagai referensi belajar. Tambahkan opsi eksperimen: user bisa ganti nada dasar secara manual dan lihat semua chord otomatis dihitung ulang sesuai nada dasar baru (transpose otomatis, bukan data hardcode per nada dasar).

## Step 7 — Validasi & Kualitas Hidup
- Validasi format input secara langsung (misal kasih tanda kalau user salah masukkin jenis jawaban — angka romawi vs nama chord huruf — sebelum jawaban dicek).
- Pastikan urutan pengisian per bagian bisa dilanjut pakai tombol Enter/Tab, tidak harus klik manual satu-satu.
- Simpan kemajuan tiap mode/lagu secara terpisah biar tidak saling menimpa progress.

## Catatan Penting
- Semua konten lagu (nada dasar, progresi, chord, timestamp, pola iringan) adalah data yang harus diisi terpisah oleh pembuat aplikasi — mesin/aplikasinya sendiri harus generik dan bisa dipakai untuk lagu apa saja selama datanya disediakan dalam format Step 5.
- Jangan reproduksi lirik lagu apa pun di dalam aplikasi — cukup gunakan notasi musik (angka romawi, nama chord, pola ketukan).
