# Generator e-book Musti Musik

Generator ini membuat `.docx` yang **teksnya dapat diedit** dari naskah JSON,
transkrip, video lokal, atau tautan YouTube. Script lama `build/build_ebook*.js`
tetap tersedia untuk buku-buku spesifik yang sudah ada. Sebelumnya tidak ada
alur umum video → transkrip → naskah → DOCX di folder ini.

## Format buku

Profil [`style_gaya_ngiring.json`](style_gaya_ngiring.json) diukur dari
`EBOOK Gaya Ngiring 3.docx`: A5, margin 1 inci, Montserrat 11 pt untuk isi,
heading 14 pt, subheading 12 pt, spasi 1,5, paragraf pertama menjorok 17 pt,
dan pembuka BAB 25/18 pt. Semua heading hitam. Font Montserrat Regular dan
Bold ikut **tertanam di DOCX** dengan lisensi SIL OFL di `fonts/OFL.txt`, agar
Word tidak diam-diam menggantinya ketika font belum terpasang di komputer.

## Persiapan

Python 3.10+, `ffmpeg` untuk video tanpa caption, dan LibreOffice untuk
memastikan jumlah **halaman hasil render**. Instal dependensi:

```bash
python -m pip install -r generator/requirements.txt
```

Set `OPENAI_API_KEY` di environment bila ingin menulis buku otomatis dari
transkrip/video. Kunci tidak disimpan ke berkas hasil.

## Pakai

Jalankan dari folder `trial EBOOK AI Faza`:

```bash
python generator/generate.py --manuscript generator/example_manuscript.json --out hasil.docx
python generator/generate.py --transcript video.sbv --title "Judul Buku" --out hasil.docx
python generator/generate.py --video "https://youtu.be/VIDEO_ID" --title "Judul Buku" --out hasil.docx
python generator/generate.py --video rekaman.mp4 --title "Judul Buku" --out hasil.docx
```

`--video` mencoba caption YouTube lebih dulu. Jika tidak ada, audio dipecah
menjadi segmen sepuluh menit dan ditranskripsikan. Sumber lokal `.txt`, `.sbv`,
`.srt`, dan `.vtt` juga bisa dipakai. Hasil antara `.transcript.txt` dan
`.manuscript.json` disimpan di sebelah DOCX sehingga materi dapat ditinjau dan
diedit sebelum diterbitkan.

Untuk halaman yang menggabungkan penjelasan dan notasi/gambar, isi bagian
`blocks` dalam sebuah `section` sesuai urutan baca. Jenis blok yang tersedia:
`paragraph`, `subheading`, `bullet`, `tip`, dan `figure`. Blok gambar memakai
`path` relatif terhadap naskah JSON serta `caption` opsional. Ini membuat
notasi yang sudah disiapkan dapat diletakkan di tengah penjelasan, seperti
contoh buku, bukan sekadar ditambahkan di akhir bab. Contoh:

```json
{"heading": "Membaca irama", "blocks": [
  {"type": "paragraph", "text": "Kenali ketukan sebelum memainkan contoh."},
  {"type": "figure", "path": "gambar/notasi-1.png", "caption": "Contoh notasi"},
  {"type": "tip", "text": "Tepuk ketukan sambil membaca."}
]}
```

Untuk batas halaman, tambahkan `--max-pages 50`. Ini menghitung **halaman PDF
yang benar-benar dirender**. Jika LibreOffice belum tersedia, pemeriksaan akan
gagal dengan pesan yang jelas; generator tidak lagi menyamakan 49 page break
dengan 50 halaman.

```bash
python -m unittest discover -s generator/tests -v
```

Tinjau akurasi musik, materi, hak cipta contoh lagu, dan seluruh halaman hasil
render sebelum publikasi. AI tidak dapat menjamin setiap penjelasan dari video
benar tanpa pemeriksaan manusia.
