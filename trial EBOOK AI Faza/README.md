# ebook-claude-llm

Pengetahuan & draft **Seri Buku Piano Musti Musik** (Dave Henokh Liong), dipindahkan dari chat claude.ai "kurikulum pembelajaran lagu pop" supaya kerja lanjutan bisa dilakukan di Claude Code.

## Mulai dari sini

1. Baca [`RANGKUMAN_PROYEK_BUKU.md`](RANGKUMAN_PROYEK_BUKU.md) — status tiap buku + hal yang masih pending.
2. Baca [`CLAUDE.md`](CLAUDE.md) — gaya penulisan, format baku, dan sistem notasi pattern yang wajib diikuti semua buku.

## 5 buku dalam seri

1. **Strategi Denger Lagu 1x Langsung Bisa Main** — draft, ajarkan Relative Pitch. (pending: BAB VI Template, penempatan pattern Jazz/Latin, 10 lagu latihan)
2. **Worship Starter — Belajar Worship dalam 7 Hari** — draft. (pending: pattern Hari 2 & 3, nomor WhatsApp)
3. **Cara Buat dan Aransemen Lagu** — selesai (9 step aransemen).
4. **Cara Buat Lagu dari 0** — selesai (6 BAB songwriting).
5. **6 Cara Pindah Kunci dengan Manis** — selesai (catatan: transkrip sumber mismatch, cross-check kalau video asli ketemu).

Detail lengkap tiap buku ada di `RANGKUMAN_PROYEK_BUKU.md`.

## Ebook jadi (folder `ebooks/`)

Ebook format .docx, siap dibuka di Word. A5, Montserrat (body 11 / heading 14 bold / sub-heading 12 bold), spasi 1,5, paragraf menjorok, tanpa strip panjang. Struktur baku: Kata Penulis, Kata Mereka, Cara Buku Ini Membantumu, Daftar Isi, BAB (judul 1 halaman sendiri), Langkah Praktis. QR di awal tiap bab. Semua 3 ebook di bawah ini pakai format yang sama persis.

| File | Isi |
|---|---|
| `ebooks/EBOOK Fill In dan Improvisasi.docx` | Fill in umum (pop/jazz/worship) sampai improvisasi. 4 BAB. ~59 hlm. 27 screenshot dari `sumber-fill-in/Modul Improvisasi Jazz.pdf`. Ada halaman timestamp video di akhir. |
| `ebooks/Buku_Fill_In_dan_Improvisasi.md` | Draft markdown ebook Fill In (versi awal, sebelum jadi .docx) |
| `ebooks/EBOOK Strategi Pakai AI ala Musti Musik.docx` | Cara pakai AI (Claude Code) untuk bikin deck presentasi dan game edukasi. 2 BAB. ~48 hlm. 6 diagram dibuat sendiri. |
| `ebooks/EBOOK Gaya Ngiring.docx` | Pattern ngiring (lambat/cepat/funk/birama lain), pattern genre jazz (swing/ballad/bossa/choro/blues/rag), Pendahuluan solo vs ngiring, dan BAB IV cara ngiring penyanyi vs band (register piano). 4 BAB + Pendahuluan. ~59 hlm. 30 screenshot tabel pattern dari `sumber-gaya-ngiring/Buku Hearing Lagu (3).pdf`. |

Sumber materi: `sumber-fill-in/` (transkrip .sbv + 2 PDF PPT), `sumber-strategi-ai/` (2 workflow .md), `sumber-gaya-ngiring/` (1 PDF pattern ngiring, 43 halaman).

Script generator + gambar hasil crop ada di `build/` (`build_ebook.js` untuk Fill In, `build_ebook2.js` untuk Strategi AI, `diagrams.py` + `crop.py` untuk gambar). Script `build_ebook3.js` + `recrop3.py`/`crop_reg.py` untuk Gaya Ngiring belum sempat disalin ke `build/` — file jadinya (.docx) sudah final di `ebooks/`. Perlu Node `docx` dan Python `Pillow`. Path input di script masih absolut ke mesin lokal, sesuaikan sebelum jalan ulang.

**Perlu diisi manual di tiap .docx:** kotak QR (awal bab), foto testimoni, dan (khusus Fill In) 3 slot penerapan di BAB I + link video Modul Improvisasi Jazz.

## Cara pakai `scripts/build_pdf_weasy.py` (generator PDF terbaru)

Sejak buku-buku terbaru, PDF **enggak lagi dibikin lewat LibreOffice/Word**, karena LibreOffice enggak bisa render font Montserrat dengan benar (jadi serif di beberapa bagian). Sekarang PDF dibikin langsung dari file `.md` lewat script Python ini, yang convert markdown → HTML (pakai style + font Montserrat asli) → PDF (lewat WeasyPrint). Hasilnya PDF final, siap kirim ke user, enggak perlu buka Word sama sekali.

### Setup sekali di awal (per komputer)

```bash
brew install weasyprint pango
pip3 install weasyprint
```

### Cara jalanin

```bash
DYLD_FALLBACK_LIBRARY_PATH="/opt/homebrew/lib:$DYLD_FALLBACK_LIBRARY_PATH" \
python3 scripts/build_pdf_weasy.py NamaBuku.md NamaBuku.pdf
```

- Argumen 1: file markdown sumbernya (di folder yang sama dengan foto/asset yang dipakai di buku itu).
- Argumen 2: nama file PDF hasil, taruh di mana saja (biasanya langsung ke `~/Downloads`).
- `DYLD_FALLBACK_LIBRARY_PATH` **wajib** di-set setiap kali jalanin, karena WeasyPrint butuh `pango` yang diinstall Homebrew, dan enggak otomatis kebaca tanpa env var ini.

### Konvensi format markdown yang dikenali script ini

Ikuti pola yang sudah dipakai di semua buku existing (misal `Buku_Belajar_Lagu_Pop_untuk_Pemula.md`):

- `# Judul Buku`, `## Kata Penulis`, `# BAB I: ...` → jadi heading/cover halaman sendiri.
- `### Sub-judul` → sub-heading di dalam BAB.
- `![caption](assets/folder/gambar.png)` → gambar, otomatis di-resize sesuai lebar konten. Taruh file gambarnya di `assets/`.
- `![author-photo](...)` → trigger khusus, dipakai buat foto penulis di halaman "Kata Penulis".
- `- [ ] teks checklist` → jadi checklist bergaya kotak centang (dipakai di akhir tiap BAB).
- `**https://...**` (URL yang di-bold) → otomatis jadi link video yang bisa diklik.
- Font yang dipakai: `assets/fonts/montserrat_final_*.ttf` (Regular/Bold/Italic/BoldItalic), jangan dihapus/dipindah karena path-nya di-hardcode relatif ke lokasi script.

### Setelah PDF isi jadi, gabungkan sama halaman belakang baku

Semua buku selalu ditutup dengan halaman belakang yang sama persis (`EBOOK BELAKANG.docx.pdf`, disimpan di `~/Downloads`, **jangan pernah di-generate ulang / diedit**). Cara gabungnya pakai `pypdf`:

```bash
python3 -c "
from pypdf import PdfReader, PdfWriter
w = PdfWriter()
for p in PdfReader('NamaBuku_isi.pdf').pages: w.add_page(p)
for p in PdfReader('/Users/.../EBOOK BELAKANG.docx.pdf').pages: w.add_page(p)
with open('NamaBuku_FINAL.pdf', 'wb') as f: w.write(f)
"
```

### Aturan penting sebelum generate PDF final (bukan preview)

- **Jangan generate PDF final sebelum link video YouTube asli (hasil upload ulang ke channel sendiri) sudah ada.** Sebelum itu, isi markdown-nya masih pakai placeholder `https://youtu.be/PASTE_LINK_<NamaBuku>?t=<detik>`.
- Docx **enggak perlu digenerate lagi** untuk buku baru, PDF dari script ini sudah final. `build/`, `build_docx_guideline.js`, dll cuma disimpan untuk referensi buku-buku lama.
- Kalau mau preview isi/visual duluan sebelum link video ada (misal user mau cek layout), boleh generate PDF pakai placeholder link, tapi kasih nama jelas `_PREVIEW.pdf` supaya enggak ketuker sama versi final.
