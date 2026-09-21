# Trial EBOOK AI Faza

Duplikat konten dari [mustimusik/ebook-claude-llm](https://github.com/mustimusik/ebook-claude-llm) — pengetahuan & ebook jadi seri buku piano Musti Musik (Dave Henokh Liong), dikerjakan lewat Claude Code.

Folder ini berdiri sendiri dari sisa proyek di repo ini (Trial-AI-Game) — isinya khusus materi ebook.

## Mulai dari sini

1. Baca [`RANGKUMAN_PROYEK_BUKU.md`](RANGKUMAN_PROYEK_BUKU.md) — status tiap buku + hal yang masih pending.
2. Baca [`CLAUDE.md`](CLAUDE.md) — gaya penulisan, format baku, dan sistem notasi pattern.
3. Ebook jadi (.docx siap Word) ada di [`ebooks/`](ebooks/).

## Ebook jadi (3, format sama persis)

Semua .docx di `ebooks/` pakai format sama: A5, Montserrat (body 11 / heading 14 bold / sub-heading 12 bold), spasi 1,5, paragraf menjorok, tanpa strip panjang.

- `EBOOK Fill In dan Improvisasi.docx`
- `EBOOK Strategi Pakai AI ala Musti Musik.docx`
- `EBOOK Gaya Ngiring.docx` — pattern ngiring (lambat/cepat/funk/birama lain) + pattern genre jazz + Pendahuluan (solo vs ngiring) + BAB IV cara ngiring penyanyi vs band. Sumbernya di `sumber-gaya-ngiring/`.

Lihat [`README.md`](README.md) asli di repo sumber untuk detail lengkap tiap file.

## Generator baru dari video atau transkrip

Folder [`generator/`](generator/) menyediakan alur umum video/YouTube →
transkrip → naskah JSON yang dapat ditinjau → `.docx` editable. Profil
tipografinya mengikuti contoh `EBOOK Gaya Ngiring 3.docx`, termasuk font
Montserrat yang ditanam di file. Lihat [panduan generator](generator/README.md)
untuk cara menjalankan dan memverifikasi jumlah halaman hasil render.
