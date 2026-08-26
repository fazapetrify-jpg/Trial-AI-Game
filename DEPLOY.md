# Interactive Hearing Game by Musti Musik — Panduan Pindah/Deploy

Aplikasi ini **1 file HTML statis murni** (`index.html`) — HTML + CSS + JavaScript vanilla, tanpa framework, tanpa build tool, tanpa `npm install`, tanpa environment variable, dan tanpa backend/database. Semua state (skor, streak) disimpan di `localStorage` browser masing-masing pengunjung. Karena itu, memindahkannya ke device lain / GitHub / server sendiri sangat simpel: **tinggal copy filenya**.

## 1. File yang Perlu Dipindah

Dari folder project, cukup bawa 3 file ini:

```
index.html              <- aplikasi utama (yang dipakai di localhost:5173 selama ini)
elementor-widget.html   <- versi embed buat widget Elementor (WordPress)
wordpress-snippet.php   <- versi buat ditempel sebagai PHP snippet WordPress
```

`index.html` adalah versi standalone yang paling lengkap dan up to date (semua fitur: 4 mode kuis + Bedah Lagu). Dua file lainnya adalah varian lama buat integrasi WordPress — kalau kamu cuma butuh 1 web berdiri sendiri, fokus ke `index.html` saja.

## 2. Jalanin di Device Lain (Lokal)

Butuh Node.js terpasang (cek dengan `node -v` di terminal). Kalau sudah ada:

```bash
cd folder-tempat-index.html
npx serve -l 5173
```

Lalu buka `http://localhost:5173` di browser. Itu saja — tidak ada langkah install/build lain.

Kalau nggak mau pakai Node sama sekali, bisa juga pakai Python (biasanya sudah ada di macOS/Linux):

```bash
python3 -m http.server 5173
```

## 3. Push ke GitHub

```bash
cd folder-tempat-index.html
git init
git add index.html elementor-widget.html wordpress-snippet.php
git commit -m "Interactive Hearing Game by Musti Musik"
git branch -M main
git remote add origin https://github.com/USERNAME/NAMA-REPO.git
git push -u origin main
```

Ganti `USERNAME/NAMA-REPO` dengan repo GitHub kamu (buat dulu repo kosong di github.com kalau belum ada).

### Opsi A — Hosting Gratis via GitHub Pages

1. Di repo GitHub, buka **Settings → Pages**
2. Source: pilih branch `main`, folder `/ (root)`
3. Save — GitHub akan kasih URL publik (biasanya `https://USERNAME.github.io/NAMA-REPO/`)
4. Tunggu 1-2 menit, lalu buka URL-nya — `index.html` otomatis jadi halaman utama

Ini opsi paling gampang kalau kamu belum punya server sendiri.

## 4. Upload ke Server Sendiri

Karena ini static file, tinggal upload ke web server apa pun (cPanel, VPS, Nginx, Apache, dll) — tidak perlu Node/PHP/database jalan di server kecuali kamu memang mau pakai `wordpress-snippet.php`.

**Lewat FTP/cPanel File Manager:**
1. Upload `index.html` ke folder public (`public_html/`, `www/`, atau subfolder misal `public_html/tebaknada/`)
2. Buka domain kamu (mis. `mustimusik.id/tebaknada/`) — langsung jalan, nggak ada setup lain

**Lewat VPS (Nginx contoh):**
```nginx
server {
  listen 80;
  server_name tebaknada.mustimusik.id;
  root /var/www/tebaknada;
  index index.html;
}
```
Taruh `index.html` di `/var/www/tebaknada/`, restart Nginx (`sudo systemctl reload nginx`), selesai.

**Kalau mau ditempel di WordPress** (bukan static hosting terpisah): pakai `elementor-widget.html` (embed HTML widget di Elementor) atau `wordpress-snippet.php` (functions.php / plugin snippet, ada shortcode di dalamnya — cek bagian atas file itu buat cara pakainya).

## 5. Yang Perlu Diperhatikan Setelah Pindah

- **Tidak ada data yang perlu dimigrasikan** — semua skor/streak pemain tersimpan di browser masing-masing (localStorage), bukan di server. Pindah server = mulai fresh buat semua pemain (progress lama mereka tetap ada kalau mereka buka dari browser & domain yang sama seperti sebelumnya).
- **Video YouTube tetap perlu koneksi internet** — mode Bedah Lagu pakai embed YouTube (`iframe`), jadi device yang menjalankan harus bisa akses YouTube.
- **HTTPS direkomendasikan** kalau nanti dipasang custom domain — YouTube embed & beberapa fitur browser modern jalan lebih mulus di HTTPS. GitHub Pages otomatis HTTPS.
- **Nggak ada env var/API key** yang perlu diisi ulang — semua konfigurasi (link masterclass lama sudah dihapus, data lagu, dst) ada langsung di dalam `index.html`.
