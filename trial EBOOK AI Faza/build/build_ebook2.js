const {
  Document, Packer, Paragraph, TextRun, ImageRun, AlignmentType,
  Table, TableRow, TableCell, WidthType, BorderStyle, VerticalAlign, LevelFormat, ShadingType,
} = require("docx");
const fs = require("fs");
const MAN = JSON.parse(fs.readFileSync("img2_manifest.json", "utf8"));

const FONT = "Montserrat";
const SEMI = "Montserrat SemiBold";
const MED = "Montserrat Medium";
const SZ_BODY = 22, SZ_H1 = 28, SZ_H2 = 24, SZ_SECT = 28, SZ_COVER = 50, SZ_COVER_SUB = 36, SZ_SMALL = 20;
const LINE = 360;

let NUMI = 100;
function mk(arr) {
  const api = {
    body(text, o = {}) {
      arr.push(new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        indent: o.noIndent ? undefined : { firstLine: 340 },
        spacing: { line: LINE, lineRule: "auto", after: 160, before: o.before || 0 },
        children: [new TextRun({ text, font: FONT, size: SZ_BODY, bold: !!o.b, italics: !!o.i })],
      }));
      return api;
    },
    rich(segs, o = {}) {
      arr.push(new Paragraph({
        alignment: o.center ? AlignmentType.CENTER : AlignmentType.JUSTIFIED,
        indent: o.indent ? { firstLine: 340 } : undefined,
        spacing: { line: LINE, lineRule: "auto", after: o.after ?? 160, before: o.before || 0 },
        children: segs.map((sg) => new TextRun({ text: sg[0], font: FONT, size: SZ_BODY, bold: !!(sg[1] && sg[1].b), italics: !!(sg[1] && sg[1].i) })),
      }));
      return api;
    },
    sectionTitle(text) {
      arr.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { line: LINE, lineRule: "auto", before: 240, after: 240 }, children: [new TextRun({ text, font: FONT, size: SZ_SECT, bold: true })] }));
      return api;
    },
    h1(text) {
      arr.push(new Paragraph({ alignment: AlignmentType.JUSTIFIED, keepNext: true, keepLines: true, spacing: { line: LINE, lineRule: "auto", before: 360, after: 120 }, children: [new TextRun({ text, font: FONT, size: SZ_H1, bold: true })] }));
      return api;
    },
    h2(text) {
      arr.push(new Paragraph({ alignment: AlignmentType.JUSTIFIED, keepNext: true, keepLines: true, spacing: { line: LINE, lineRule: "auto", before: 240, after: 60 }, children: [new TextRun({ text, font: FONT, size: SZ_H2, bold: true })] }));
      return api;
    },
    num(items) {
      const inst = ++NUMI;
      items.forEach((it) => arr.push(new Paragraph({
        numbering: { reference: "n1", level: 0, instance: inst },
        alignment: AlignmentType.JUSTIFIED, spacing: { line: LINE, lineRule: "auto", after: 80 },
        children: Array.isArray(it) ? it.map((sg) => new TextRun({ text: sg[0], font: FONT, size: SZ_BODY, bold: !!(sg[1] && sg[1].b) })) : [new TextRun({ text: it, font: FONT, size: SZ_BODY })],
      })));
      return api;
    },
    bullet(items) {
      items.forEach((it) => arr.push(new Paragraph({
        bullet: { level: 0 }, alignment: AlignmentType.JUSTIFIED, spacing: { line: LINE, lineRule: "auto", after: 80 },
        children: Array.isArray(it) ? it.map((sg) => new TextRun({ text: sg[0], font: FONT, size: SZ_BODY, bold: !!(sg[1] && sg[1].b) })) : [new TextRun({ text: it, font: FONT, size: SZ_BODY })],
      })));
      return api;
    },
    tip(text) {
      arr.push(new Paragraph({ alignment: AlignmentType.JUSTIFIED, spacing: { line: LINE, lineRule: "auto", before: 120, after: 160 }, children: [new TextRun({ text: "Tips Aplikasi : ", font: FONT, size: SZ_BODY, bold: true }), new TextRun({ text, font: FONT, size: SZ_BODY })] }));
      return api;
    },
    figure(key, caption) {
      const m = MAN[key];
      const W = 350, H = Math.round(W * (m.h / m.w));
      arr.push(new Paragraph({ alignment: AlignmentType.CENTER, keepLines: true, spacing: { before: 160, after: 40 }, children: [new ImageRun({ type: "png", data: fs.readFileSync(m.path), transformation: { width: W, height: H } })] }));
      if (caption) arr.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { line: LINE, lineRule: "auto", after: 200 }, children: [new TextRun({ text: caption, font: FONT, size: SZ_SMALL, italics: true })] }));
      return api;
    },
    codebox(title, lines) {
      const bd = { style: BorderStyle.SINGLE, size: 6, color: "BBBBBB" };
      const rows = [];
      if (title) rows.push(new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: title, font: FONT, size: 15, bold: true, color: "555555" })] }));
      lines.forEach((ln) => rows.push(new Paragraph({ spacing: { line: 240, lineRule: "auto", after: 0 }, children: [new TextRun({ text: ln, font: FONT, size: 15, color: "222222" })] })));
      arr.push(new Table({
        columnWidths: [5600], alignment: AlignmentType.CENTER,
        rows: [new TableRow({ children: [new TableCell({
          width: { size: 5600, type: WidthType.DXA },
          shading: { type: ShadingType.CLEAR, fill: "F4F4F4" },
          borders: { top: bd, bottom: bd, left: bd, right: bd },
          margins: { top: 120, bottom: 120, left: 160, right: 160 },
          children: rows,
        })] })],
      }));
      arr.push(new Paragraph({ spacing: { after: 160 }, children: [new TextRun("")] }));
      return api;
    },
    qr(caption) {
      const bd = { style: BorderStyle.SINGLE, size: 8, color: "000000" };
      arr.push(new Table({
        columnWidths: [2200], alignment: AlignmentType.CENTER,
        rows: [new TableRow({ height: { value: 2200, rule: "atLeast" }, children: [new TableCell({
          width: { size: 2200, type: WidthType.DXA }, verticalAlign: VerticalAlign.CENTER,
          borders: { top: bd, bottom: bd, left: bd, right: bd },
          children: [
            new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 500 }, children: [new TextRun({ text: "KODE QR", font: FONT, size: SZ_SMALL, bold: true })] }),
            new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 500 }, children: [new TextRun({ text: "tempel gambar QR di sini", font: FONT, size: 15, italics: true, color: "888888" })] }),
          ],
        })] })],
      }));
      arr.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { line: LINE, lineRule: "auto", before: 80, after: 200 }, children: [new TextRun({ text: caption, font: FONT, size: SZ_SMALL, italics: true })] }));
      return api;
    },
    spacer() { arr.push(new Paragraph({ children: [new TextRun("")] })); return api; },
    raw(p) { arr.push(p); return api; },
  };
  return api;
}

const PAGE = { size: { width: 8391, height: 11906 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440, header: 720, footer: 720 } };
const sections = [];
function contentSection() { const c = []; sections.push({ properties: { page: PAGE }, children: c }); return mk(c); }
function coverSection(no, title) {
  const c = [];
  if (no) c.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { line: 240 }, children: [new TextRun({ text: no, font: FONT, size: SZ_COVER, bold: true })] }));
  c.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { line: 240, before: 120 }, children: [new TextRun({ text: title, font: FONT, size: SZ_COVER_SUB })] }));
  sections.push({ properties: { page: PAGE, verticalAlign: VerticalAlign.CENTER }, children: c });
}

/* ================= FRONT MATTER ================= */
let s = contentSection();
s.sectionTitle("KATA PENULIS");
s.body("Buku ini untuk kamu yang sering kehabisan waktu di pekerjaan yang seharusnya bisa cepat. Bikin satu deck workshop dulu bisa makan waktu berhari hari. Bikin satu game latihan musik yang sederhana pun butuh developer.");
s.body("Di Musti Musik, dua hal itu sekarang selesai jauh lebih cepat karena kami pakai AI, tepatnya asisten koding seperti Claude Code. Tapi rahasianya bukan sekadar minta AI bikinin. Rahasianya ada di alur kerja yang rapi : cara memberi brief, cara memisahkan konten dari desain, dan cara mengoreksi tanpa mengulang dari nol.");
s.rich([["Pertanyaan yang sering muncul : ", {}], ["kok hasilku kalau minta AI berantakan terus?", { i: true }]], { indent: true });
s.body("Biasanya karena alurnya kebalik. Kita minta hasil jadi sebelum AI paham konteks, lalu mengoreksi dengan cara menyuruh bikin ulang. Buku ini membalik urutan itu. Kamu akan belajar dua alur kerja yang kami pakai sehari hari : satu untuk membuat deck presentasi, satu untuk membuat game edukasi.");
s.body("Targetku sederhana. Setelah membaca, kamu paham logikanya dan langsung bisa mempraktekkannya pada proyek kecilmu sendiri.");
s.body("Selamat belajar. Yuk kita mulai.");
s.spacer(); s.spacer();
s.raw(new Paragraph({ alignment: AlignmentType.RIGHT, spacing: { line: LINE, lineRule: "auto" }, children: [new TextRun({ text: "Dave Henokh Liong", font: FONT, size: SZ_BODY })] }));

s = contentSection();
s.sectionTitle("KATA MEREKA (5 dari 1000+ murid)");
const testi = [
  ["dr. Kelvin", "(Spesialis Mata & Pemilik Klinik, Senior)", "Belajar dengan Dave menyenangkan dan cepat berkembang, karena caranya sistematis dan langsung bisa dipakai."],
  ["Dr. Elly Moniyong", "(Gembala Gereja & Dosen, 73 th)", "Dave selalu memberi kerangka yang jelas, jadi aku tahu harus mulai dari mana dan lanjut ke mana."],
  ["Alf Elijah", "(Pianis & Aktor Musikal, 11 tahun)", "Materinya rapi dan bertahap, jadi gampang diikuti walau aku masih kecil."],
  ["Fenny", "(Pengarang Lagu)", "Cara berpikir Dave soal memisahkan hal besar dan detail membantuku menyelesaikan proyek yang tadinya mandek."],
  ["Aretha Keyanna T.", "(Pelajar, 15 tahun)", "Aku otodidak dan sering bingung urutannya. Dengan panduan Dave, aku jadi punya alur yang jelas."],
];
testi.forEach((t) => {
  s.raw(new Table({
    columnWidths: [1400, 4400],
    rows: [new TableRow({ children: [
      new TableCell({ width: { size: 1400, type: WidthType.DXA }, verticalAlign: VerticalAlign.CENTER, borders: { top: { style: BorderStyle.SINGLE, size: 6 }, bottom: { style: BorderStyle.SINGLE, size: 6 }, left: { style: BorderStyle.SINGLE, size: 6 }, right: { style: BorderStyle.SINGLE, size: 6 } }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "foto", font: FONT, size: 14, color: "888888" })] })] }),
      new TableCell({ width: { size: 4400, type: WidthType.DXA }, borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } }, children: [
        new Paragraph({ spacing: { after: 0 }, children: [new TextRun({ text: t[0] + "  ", font: FONT, size: SZ_BODY, bold: true }), new TextRun({ text: t[1], font: MED, size: SZ_SMALL })] }),
        new Paragraph({ alignment: AlignmentType.JUSTIFIED, spacing: { line: LINE, lineRule: "auto", after: 120 }, children: [new TextRun({ text: '"' + t[2] + '"', font: FONT, size: SZ_SMALL, italics: true })] }),
      ] }),
    ] })],
  }));
  s.spacer();
});
s.raw(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 240 }, children: [new TextRun({ text: "Dan Masih Ada Banyak Cerita Lainnya", font: FONT, size: SZ_BODY, bold: true, italics: true })] }));

s = contentSection();
s.sectionTitle("CARA BUKU INI BISA MEMBANTUMU");
s.body("Isi buku ini ada dua : cara kami memakai AI untuk membuat deck presentasi, dan cara kami memakai AI untuk membuat game edukasi. Keduanya memakai alur kerja yang sama polanya, cuma beda bentuk hasil akhirnya.");
s.body("Materi disusun supaya kamu bisa langsung praktek. Tiap langkah dijelaskan alasannya, diberi contoh, lalu ditutup dengan latihan kecil. Di beberapa bagian ada kotak Tips Aplikasi. Di awal tiap bab ada satu kotak kode QR untuk video pendamping.");
s.h2("Prinsip Dasar Pakai AI ala Musti Musik");
s.body("Lima prinsip ini dipakai di kedua alur kerja. Kalau kamu cuma ingat lima ini, kamu sudah punya modal besar.");
s.num([
  [["Pelajari dulu, jangan generate apa apa. ", { b: true }], ["Beri AI seluruh konteks lebih dulu. Minta dia memahami, bukan langsung memproduksi.", {}]],
  [["Pisahkan konten dari desain atau kode. ", { b: true }], ["Konten hidup di dokumen. Desain dan logika hidup di script. Ganti konten berarti edit teks, ganti tampilan berarti edit fungsi.", {}]],
  [["Iterasi di dokumen sumber, bukan regenerate dari nol. ", { b: true }], ["Koreksi ditulis di naskah atau spec, lalu AI mengubah bagian yang relevan saja.", {}]],
  [["Aset yang belum ada dibiarkan jadi placeholder berlabel. ", { b: true }], ["Jangan menunggu semua aset lengkap baru mulai.", {}]],
  [["Validasi tiap hasil build. ", { b: true }], ["Cek file valid dan cek isinya cocok dengan naskah sebelum lanjut.", {}]],
]);

s = contentSection();
s.sectionTitle("DAFTAR ISI");
["KATA PENULIS", "KATA MEREKA", "CARA BUKU INI BISA MEMBANTUMU",
 "BAB I  BIKIN DECK PRESENTASI DENGAN AI", "BAB II  BIKIN GAME EDUKASI DENGAN AI",
 "LANGKAH PRAKTIS", "RINGKASAN CEPAT"].forEach((t) =>
  s.raw(new Paragraph({ alignment: AlignmentType.JUSTIFIED, spacing: { line: 480, lineRule: "auto" }, children: [new TextRun({ text: t, font: SEMI, size: SZ_BODY })] })));

/* ================= BAB I ================= */
coverSection("BAB I", "Bikin Deck Presentasi dengan AI");
s = contentSection();
s.h1("Bikin Deck Presentasi dengan AI");
s.body("Bikin deck yang rapi itu melelahkan karena dua pekerjaan bercampur : menyusun isi, dan mengatur tampilan tiap slide. Begitu ada revisi isi, tampilan sering ikut berantakan. Begitu ada revisi tampilan, isi harus disalin ulang.");
s.body("Kunci alur kerja ini adalah memisahkan keduanya. Konten hidup di dokumen berupa bullet lalu naskah. Desain hidup di script berupa fungsi tipe slide. Ganti konten berarti edit teks. Ganti tampilan berarti edit fungsi. Keduanya tidak saling merusak.");
s.figure("d_split", "Konten dan desain dipisah. Digabungkan hanya di tahap generate.");
s.qr("Scan QR di atas untuk video pendamping Bab I.");

s.h2("Kenapa Lewat Script, Bukan Langsung di PowerPoint");
s.body("Kalau slide dibuat manual satu per satu di PowerPoint, tiap perubahan gaya harus diulang di semua slide, dan tiap perubahan isi berisiko menggeser tata letak. Dengan script, gaya cuma didefinisikan sekali di dalam fungsi. Ganti satu angka di fungsi, semua slide bertipe sama ikut berubah. Isi pun aman karena dia cuma teks argumen, bukan objek yang bisa kesenggol.");
s.body("Keuntungan lain, semua versi tercatat. Kamu bisa build ulang deck lama kapan saja, atau memakai script yang sama untuk workshop berikutnya cukup dengan mengganti argumennya.");

s.h2("Enam Langkah, dari Brief sampai File .pptx");
s.body("Alur lengkapnya enam langkah. Langkah 3 dan 6 adalah tempat kamu paling banyak bekerja karena di situ terjadi koreksi bolak balik.");
s.figure("d_pipeline", "Enam langkah membuat deck : brief, style guide, bullet outline, naskah, generate, review.");

s.h2("Langkah 1 : Brief");
s.body("Di awal, kamu memberi AI tiga hal. Rundown acara lengkap dengan durasi tiap sesi. Materi mentah, dan ini boleh berantakan : catatan, transkrip, playbook, poin poin lepas. Audiens, misalnya workshop ini untuk guru musik, supaya sudut pandang penjelasan diarahkan ke sana.");
s.body("Yang penting, tutup brief dengan instruksi tegas : pelajari dulu, jangan generate apa apa. Tujuannya supaya AI menyerap seluruh konteks sebelum membuat apa pun. Kalau kamu langsung minta hasil, AI akan menebak nebak bagian yang belum kamu jelaskan.");
s.tip("Materi mentah tidak perlu kamu rapikan dulu. Justru lebih baik mentah, karena AI bisa melihat cara bicaramu yang asli dan menirunya di naskah nanti.");
s.h2("Brief yang Lemah vs Brief yang Kuat");
s.body("Brief yang lemah terdengar seperti ini : buatkan deck 20 slide tentang cara mengajar musik untuk guru. Terlalu umum. AI akan mengisi semua celah dengan tebakan generik.");
s.body("Brief yang kuat memberi bahan nyata : jadwal acara tiga sesi masing masing 90 menit, catatan lengkap tiap sesi walau berantakan, contoh dua tiga cerita pribadi yang mau dipakai, plus kalimat audiens ini guru musik sekolah dasar yang belum terbiasa mengajar teori. Semakin banyak bahan mentah, semakin sedikit AI menebak.");
s.body("Latihan : ambil satu topik yang kamu kuasai. Tulis rundown singkat, tempel semua catatan mentahmu, sebut audiensnya, lalu minta AI merangkum pemahamannya tanpa membuat slide apa pun. Baca rangkumannya, dan perbaiki bagian yang masih meleset sebelum lanjut.");

s.h2("Langkah 2 : Style Guide");
s.body("Style guide ditulis eksplisit, sekali saja, di depan. Ini contoh yang dipakai di Musti Musik.");
s.bullet([
  [["Background : ", { b: true }], ["tidak diisi warna, supaya gampang diedit manual nanti.", {}]],
  [["Aksen : ", { b: true }], ["kuning atau amber untuk kotak highlight di judul dan isi ikon, merah untuk urgensi dan penekanan kuat.", {}]],
  [["Font : ", { b: true }], ["heading Montserrat Black ukuran 25, isi Montserrat ukuran 18. Kalimat pertama isi dibuat bold, sisanya normal.", {}]],
  [["Pola judul : ", { b: true }], ["dua bagian, bagian akhir masuk kotak highlight kuning.", {}]],
  [["Logo : ", { b: true }], ["wordmark dua baris, default di kanan bawah, dan hanya di slide divider serta hook diletakkan di kiri atas.", {}]],
  [["Teks : ", { b: true }], ["rata kiri, vertical align tengah, bukan menempel ke atas.", {}]],
  [["Divider : ", { b: true }], ["ikon flat di kiri, kotak Bagian X berwarna yang warnanya berganti gantian, lalu judul besar.", {}]],
  [["Foto : ", { b: true }], ["cutout tokoh dengan latar transparan, rasio asli tanpa di-stretch, rata bawah.", {}]],
]);
s.body("Referensi gaya diambil dari deck Musti Musik yang sudah jadi. AI mempelajari deck itu : cara menaruh teks, cara menaruh gambar, warna, dan tipografinya, lalu menirunya.");
s.body("Kenapa sekali di depan, bukan diatur di tiap slide? Karena kalau gaya diputuskan per slide, hasilnya tidak konsisten dan revisinya tidak ada habisnya. Satu style guide di awal membuat semua slide otomatis seragam.");
s.body("Latihan : tulis style guide versimu sendiri dalam satu halaman. Tentukan dua warna aksen, dua ukuran font, satu pola judul, dan satu aturan logo.");

s.h2("Langkah 3 : Bullet Outline");
s.body("Aturannya satu : satu bullet sama dengan satu slide. Outline dibagi per bagian, misalnya A, B, C, dan tiap ganti bagian ada slide divider.");
s.body("Ada dua jenis slide khusus. Slide storytelling, yaitu cerita pengalaman pribadi, memakai heading yang sama dengan judul topik dan muncul tiap ganti topik besar. Slide hook atau transisi berisi satu kalimat di tengah dengan kata kunci di kotak kuning.");
s.body("Koreksi di tahap ini bebas : tambah, hapus, ubah urutan, ganti kalimat. AI memperbarui outline yang ada, bukan membuat ulang dari nol.");
s.body("Kenapa satu bullet satu slide? Supaya tiap slide hanya membawa satu ide. Kalau tiga ide dijejalkan dalam satu bullet, slide jadi penuh dan audiens kehilangan fokus.");
s.tip("Kalau sebuah bullet terasa memuat lebih dari satu ide, pecah jadi dua bullet. Lebih baik slide banyak tapi ringan daripada slide sedikit tapi padat.");
s.body("Contoh potongan bullet outline untuk sebuah workshop guru musik :");
s.bullet([
  "Divider Bagian A : Pola Pikir.",
  "Cerita aku : dulu mengajar sambil menghafal, murid ikut menghafal.",
  "Mengajar itu memindahkan cara berpikir, bukan memindahkan hafalan.",
  "Hook : Apa satu hal yang bikin murid berhenti berkembang?",
  "Tiga penyebab murid mandek : tidak paham fungsi, latihan tanpa arah, target terlalu jauh.",
  "Divider Bagian B : Praktik di Kelas.",
  "Mulai dari level murid sekarang, bukan dari silabus.",
  "Satu konsep per pertemuan, diulang tiga cara berbeda.",
]);
s.body("Perhatikan tiap baris hanya satu ide, dan tiap ganti bagian ada divider.");
s.body("Latihan : buat bullet outline untuk topik latihanmu tadi. Target 10 sampai 15 bullet. Sisipkan minimal satu divider dan satu slide hook.");

s.h2("Langkah 4 : Naskah Lengkap Kata per Kata");
s.body("Untuk deck yang serius, tiap slide ditulis penuh di Word atau file teks, dengan format seperti ini : baris pertama menyebut nomor dan tipe slide, lalu judul dengan penanda kata yang masuk kotak highlight, lalu kalimat pertama yang bold dengan frasa penting bisa dibuat merah, lalu paragraf berikutnya yang normal, lalu catatan aset seperti foto atau diagram di dalam tanda kurung khusus.");
s.body("Naskah ini menjadi sumber kebenaran. Nomor slide boleh berantakan atau dobel. Yang penting urut dari atas ke bawah. AI yang merapikan penomoran.");
s.body("Kenapa naik sampai naskah? Supaya kamu memegang kendali penuh atas setiap kata yang muncul di slide. Tidak ada kalimat hasil karangan AI yang lolos tanpa kamu setujui.");
s.figure("d_naskah", "Anatomi satu slide di naskah : nomor dan tipe, judul, kalimat pertama, paragraf, catatan aset.");
s.body("Contoh naskah untuk dua slide, dari bullet outline di atas :");
s.bullet([
  [["Slide 6, content. ", { b: true }], ["Judul : Mengajar itu memindahkan [cara berpikir]. Kalimat pertama : Kalau murid cuma menirukan, dia berhenti begitu lagunya ganti. Paragraf : Yang kita tanam adalah alasan di balik setiap langkah, supaya murid bisa jalan sendiri. Catatan aset : foto cutout Dave sedang mengajar.", {}]],
  [["Slide 7, hook. ", { b: true }], ["Judul : Apa satu hal yang bikin murid [berhenti berkembang]? Tidak ada paragraf. Catatan aset : tidak ada, cukup teks di tengah.", {}]],
]);
s.body("Latihan : ambil tiga bullet dari outline-mu, tulis jadi naskah lengkap dengan format di atas. Tandai kata yang masuk kotak highlight dan frasa yang mau dibuat merah.");

s.h2("Langkah 5 : Generate Script");
s.body("AI menulis satu file script, misalnya build_deck.js, memakai pustaka pptxgenjs di Node. Ukuran kanvas dibuat 10 kali 5,625 inci, yaitu rasio 16 banding 9 versi lama, dan ini wajib disamakan dengan template. Kalau tidak, font ukuran 25 kelihatan kekecilan. Triknya, semua koordinat ditulis di grid 13,333 lalu diskalakan otomatis dengan faktor 0,75.");
s.body("Isi script ada dua bagian. Bagian atas berisi deretan fungsi tipe slide. Bagian bawah berisi daftar pemanggilan fungsi, satu baris kira kira satu slide, dengan argumen berupa teksnya. Bagian bawah inilah yang kamu edit tiap revisi.");
s.body("Beberapa tipe slide yang sering dipakai :");
s.bullet([
  [["Title dan divider : ", { b: true }], ["pembuka deck dan pembatas tiap bagian, dengan ikon besar dan kotak Bagian X.", {}]],
  [["Hook : ", { b: true }], ["satu kalimat di tengah dengan kata kunci di kotak kuning, untuk transisi.", {}]],
  [["Content : ", { b: true }], ["slide isi standar, judul dua bagian, kalimat pertama bold, paragraf normal, opsi gambar.", {}]],
  [["Story : ", { b: true }], ["slide cerita pribadi, headingnya sama dengan judul topik.", {}]],
  [["Comparison : ", { b: true }], ["dua kolom berdampingan, misalnya sebelum dan sesudah.", {}]],
  [["Flow dan funnel : ", { b: true }], ["rangkaian chip berpanah, dan corong bertumpuk untuk tahapan menyempit.", {}]],
]);
s.body("Karena semuanya fungsi, menambah satu tipe slide baru cukup sekali, lalu bisa dipakai berkali kali di deck mana pun.");
s.body("Ikon memakai bentuk vektor bawaan PowerPoint, bukan gambar, jadi tetap tajam dan bisa diganti warnanya. Foto dimasukkan dengan menjaga rasio asli, dihitung dari file berisi dimensi gambar, lalu ditempatkan rata bawah dan tengah. Aset yang belum ada dibiarkan menjadi kotak abu bergaris putus putus berlabel.");
s.codebox("Contoh satu pemanggilan fungsi di script", [
  "content({",
  "  plain: \"Kuncinya: naikin\",              judul bagian biasa",
  "  hi: \"bertahap\",                          masuk kotak highlight kuning",
  "  lead: \"Nggak perlu ngajarin ketiga pilar sekaligus.\",   kalimat 1, bold",
  "  leadRed: \"sekaligus\",                    frasa merah di kalimat 1",
  "  paras: [\"Fokus di level murid sekarang.\"],  paragraf normal",
  "  img: \"DIAGRAM: 3 panah menuju 1 target\"   placeholder aset",
  "});",
]);
s.body("Setelah script jalan, ada dua pemeriksaan. Pertama, cek file valid dengan skrip validasi. Kedua, dump teksnya untuk memastikan isi slide cocok dengan naskah.");
s.body("Latihan : minta AI membuat kerangka script dengan tiga fungsi tipe slide saja, yaitu title, content, dan divider, lalu isi lima pemanggilan dari naskahmu.");

s.h2("Langkah 6 : Review dan Regenerate");
s.body("Baca ulang hasilnya, catat koreksi di naskah, lalu minta AI mengubah baris fungsi yang relevan dan build ulang. Karena konten dan desain terpisah, koreksi kalimat tidak menyentuh layout, dan koreksi layout tidak menyentuh kalimat.");
s.body("Script juga bisa di-dump balik menjadi naskah, sehingga naskah dan file presentasi selalu sinkron. QA visual dilakukan dengan membuka file di PowerPoint : periksa teks yang meluber, chip yang kekecilan, proporsi elemen, dan posisi foto.");
s.body("Latihan : setelah build pertamamu jadi, temukan tiga hal yang mau diperbaiki, tulis di naskah, lalu minta AI build ulang. Perhatikan bahwa hanya bagian yang kamu sebut yang berubah.");

s.h2("Kesalahan yang Sering Terjadi");
s.bullet([
  [["Minta hasil sebelum konteks lengkap. ", { b: true }], ["Slide jadi generik dan tidak terdengar seperti kamu. Selalu brief dulu.", {}]],
  [["Menyalakan revisi dengan kalimat bikin ulang. ", { b: true }], ["Kamu kehilangan semua koreksi sebelumnya. Sebut perubahan yang spesifik saja.", {}]],
  [["Menaruh keputusan gaya di dalam bullet. ", { b: true }], ["Contoh menulis pakai warna merah dan font besar di outline. Gaya itu urusan style guide dan fungsi, bukan konten.", {}]],
  [["Menunggu semua foto siap. ", { b: true }], ["Deck tidak pernah mulai. Pakai placeholder berlabel, isi belakangan.", {}]],
  [["Lupa cek ukuran kanvas. ", { b: true }], ["Kalau rasio tidak sama dengan template, semua ukuran font meleset.", {}]],
]);

s.h2("Aturan Main biar Lancar");
s.bullet([
  [["Lakukan : ", { b: true }], ["beri style guide lengkap sekali di depan.", {}]],
  [["Hindari : ", { b: true }], ["mengubah gaya di tiap slide satu satu.", {}]],
  [["Lakukan : ", { b: true }], ["jaga satu bullet sama dengan satu slide.", {}]],
  [["Hindari : ", { b: true }], ["mencampur tiga ide dalam satu bullet.", {}]],
  [["Lakukan : ", { b: true }], ["koreksi di naskah.", {}]],
  [["Hindari : ", { b: true }], ["minta bikin ulang dari nol tiap revisi.", {}]],
  [["Lakukan : ", { b: true }], ["biarkan aset yang belum ada jadi placeholder berlabel.", {}]],
  [["Hindari : ", { b: true }], ["menunggu semua aset lengkap baru mulai.", {}]],
]);

s.h2("Alat yang Disiapkan");
s.bullet([
  "Node.js beserta pustaka pptxgenjs.",
  "Python beserta markitdown untuk dump teks, serta python-pptx, Pillow, lxml, dan defusedxml untuk cek konten dan validasi.",
  "PowerPoint untuk QA visual dan edit akhir.",
  "Font Montserrat family lengkap, termasuk Montserrat Black, terpasang di komputer yang membuka file.",
  "Folder aset berisi cutout PNG transparan dan screenshot, lengkap dengan path-nya.",
]);

s.h2("Kapan Alur Ini Kurang Cocok");
s.body("Alur ini paling kuat untuk deck yang isinya banyak dan strukturnya berulang, seperti workshop, kelas, atau materi pelatihan. Untuk deck yang sangat bergantung pada tata letak bebas dan sentuhan visual satu per satu, misalnya deck pitch investor atau materi pameran, mengatur langsung di aplikasi desain bisa lebih cepat. Kamu tetap bisa memakai alur ini untuk kerangka dan isinya, lalu memoles tampilan akhir secara manual.");
s.h2("Ringkasan Latihan Bab I");
s.body("Kuasai satu per satu. Tulis satu style guide dalam satu halaman. Buat satu bullet outline 10 sampai 15 slide. Ubah tiga bullet jadi naskah lengkap. Minta AI membuat kerangka script tiga tipe slide, lalu build. Terakhir, lakukan satu putaran review dan regenerate. Kalau kelimanya sudah kamu jalani, kamu sudah menguasai alur ini.");

/* ================= BAB II ================= */
coverSection("BAB II", "Bikin Game Edukasi dengan AI");
s = contentSection();
s.h1("Bikin Game Edukasi dengan AI");
s.body("Game edukasi biasanya butuh developer. Dengan AI dan spesifikasi fitur yang rapi, satu orang bisa membuatnya sendiri. Syaratnya, kamu memberi AI logika dan aturan fitur yang jelas, lalu membiarkan AI menentukan tampilannya.");
s.body("Prinsip intinya : mesin generik, data terpisah. Mesin berisi logika, audio, dan tampilan, dan sifatnya tidak terikat pada satu materi. Data berisi bank soal dan konten per materi, disimpan terpisah sebagai konfigurasi. Ganti materi berarti ganti data saja, logika tidak disentuh.");
s.figure("d_game_arch", "Mesin generik dan data terpisah, digabung jadi satu web app.");
s.qr("Scan QR di atas untuk video pendamping Bab II.");

s.h2("Studi Kasus : Game Ear Training dan Trainer Lagu");
s.body("Contoh yang dipakai di buku ini adalah web app latihan telinga musik dan latihan mengiringi lagu. Semua langkah di bawah bisa kamu tiru untuk materi lain, misalnya kosakata bahasa atau hitungan matematika, dengan mengganti bank soal dan data materinya.");

s.h2("Langkah 1 : Setup Dasar");
s.body("Buat satu aplikasi web yang bisa jalan tanpa server dan tanpa database. Semua state disimpan di local storage browser. Siapkan mesin audio memakai Web Audio API dengan osilator untuk membangkitkan nada dan chord sendiri, bukan memakai file sample.");
s.body("Kenapa tanpa server dan tanpa file audio? Tiga alasan. Aplikasinya jadi ringan dan bisa dihosting gratis di mana saja, bahkan dibuka dari satu file. Tidak ada aset audio yang perlu direkam, dicari lisensinya, atau di-upload. Dan karena nada dibangkitkan dari osilator, kamu bisa membuat nada apa pun di frekuensi apa pun, jadi soal interval dan chord bisa digenerate tanpa batas.");
s.body("Konsekuensinya, suaranya terdengar elektronik dan sederhana. Untuk latihan telinga ini justru bagus, karena murid fokus ke tinggi nada dan jarak antar nada, bukan ke warna suara instrumen.");

s.h2("Langkah 2 : Tiga Tipe Soal Ear Training");
s.num([
  [["Interval. ", { b: true }], ["Mainkan dua nada berurutan. Buat soal pilihan ganda menebak nama intervalnya. Siapkan daftar nama interval dari yang paling rapat sampai satu oktaf.", {}]],
  [["Chord. ", { b: true }], ["Mainkan satu chord dengan nada dibunyikan bersamaan. Soal pilihan ganda menebak kualitas chord, misalnya major, minor, diminished, augmented, atau dominan.", {}]],
  [["Progresi. ", { b: true }], ["Mainkan empat chord berurutan. Soal pilihan ganda menebak nama progresinya. Siapkan beberapa progresi umum sebagai bank soal.", {}]],
]);
s.body("Tiap sesi berisi beberapa soal berurutan. Beri feedback benar atau salah dengan penjelasan singkat tiap soal, lalu tampilkan skor akhir di ujung sesi.");
s.body("Kenapa pilihan ganda, bukan isian bebas? Karena tujuan latihan telinga adalah mengenali, bukan menuliskan. Pilihan ganda membuat pemain fokus membandingkan bunyi, dan sistem gampang menilai benar salahnya. Penjelasan singkat tiap soal penting supaya pemain belajar dari kesalahan, bukan cuma tahu skornya.");

s.h2("Langkah 3 : Halaman Pilih Mode");
s.body("Halaman awal menampilkan pilihan : main tipe soal pertama saja, kedua saja, ketiga saja, atau campuran ketiganya.");

s.h2("Langkah 4 : Sistem Harian");
s.body("Buat soal yang sama untuk semua orang di hari yang sama, memakai random seed dari tanggal. Batasi satu kali main per mode per hari. Simpan skor dan streak, yaitu jumlah hari main berturut turut, di local storage. Sediakan juga mode latihan tanpa batas untuk main ulang kapan saja.");
s.body("Bagian ini opsional, tapi sangat disarankan karena membuat pemain kembali tiap hari dan menciptakan kompetisi yang sehat.");

s.h2("Langkah 5 : Struktur Data Trainer Lagu");
s.body("Buat format data generik per lagu yang isinya sebagai berikut.");
s.bullet([
  "Nada dasar.",
  "Daftar nama bagian lagu berurutan, misalnya bagian 1, bagian 2, bagian 3, dan namanya bebas.",
  "Progresi chord tiap bagian, ditulis memakai notasi angka romawi, boleh ada slash chord dan catatan variasi atau ekstensi chord.",
  "Terjemahan progresi tadi ke nama chord asli sesuai nada dasar.",
  "Beberapa pilihan pola iringan yang cocok, dan beberapa yang tidak cocok.",
  "Opsional, rentang waktu tiap bagian kalau mau menampilkan referensi audio atau video.",
]);
s.body("Data ini harus terpisah dari kode aplikasi, misalnya disimpan sebagai file konfigurasi atau JSON. Dengan begitu bisa diisi ulang untuk lagu lain tanpa mengubah logika program.");
s.body("Contoh isi data untuk satu lagu, ditulis apa adanya :");
s.bullet([
  [["Nada dasar : ", { b: true }], ["C.", {}]],
  [["Bagian : ", { b: true }], ["Verse, Pre-Chorus, Chorus.", {}]],
  [["Progresi Verse : ", { b: true }], ["I, V/vii, vi, IV. Progresi Chorus : IV, I/iii, V, vi.", {}]],
  [["Terjemahan Chorus di C : ", { b: true }], ["F, C/E, G, Am.", {}]],
  [["Pola iringan cocok : ", { b: true }], ["arpeggio lembut, pola broken chord. Tidak cocok : pola march cepat.", {}]],
  [["Rentang waktu Chorus : ", { b: true }], ["01:12 sampai 01:40, opsional.", {}]],
]);
s.body("Kalau kamu punya lagu kedua, cukup salin struktur ini dan ganti isinya. Logika program tidak disentuh sama sekali.");

s.h2("Langkah 6 : Alur Trainer Lagu");
s.body("Untuk tiap lagu yang dipilih, alurnya tujuh tahap.");
s.figure("d_trainer_flow", "Tujuh tahap alur trainer lagu, dari memilih lagu sampai skor akhir.");
s.num([
  "User memilih satu lagu dari daftar.",
  "Beri kesempatan mendengarkan referensi lagu, lalu minta user menebak nada dasarnya. Kalau salah, jangan lanjut. Beri petunjuk bertahap sampai user menjawab benar.",
  "Beri tahu bahwa fokus latihan ini di cara mengiringi, yaitu chord dan pola iringan, bukan melodi atau kata kata lagu.",
  "Untuk tiap bagian lagu secara berurutan, tampilkan progresi chord dengan sebagian angka romawi disembunyikan, misalnya acak sekitar 70 persen, lalu minta user mengisi yang kosong. Beri feedback per isian, plus status hampir benar khusus untuk slash chord yang hanya sebagian jawabannya tepat.",
  "Setelah semua bagian selesai, tampilkan semua progresi dari semua bagian sekaligus dalam satu halaman. Sediakan tabel referensi chord sesuai nada dasar, lalu minta user menerjemahkan semua progresi ke nama chord asli.",
  "Minta user memilih pola iringan yang menurutnya paling cocok dari beberapa opsi, yang isinya campuran benar dan salah.",
  "Tampilkan skor akhir gabungan dari semua tahap, plus rekap semua jawaban benar sebagai referensi belajar. Tambahkan opsi eksperimen : user bisa mengganti nada dasar secara manual dan melihat semua chord otomatis dihitung ulang, jadi transpose otomatis, bukan data yang di-hardcode per nada dasar.",
]);

s.h2("Langkah 7 : Validasi dan Quality of Life");
s.bullet([
  "Validasi format input secara langsung. Misalnya beri tanda kalau user salah memasukkan jenis jawaban, angka romawi versus nama chord huruf, sebelum jawaban dicek.",
  "Pastikan urutan pengisian per bagian bisa dilanjutkan dengan tombol Enter atau Tab, tidak harus klik manual satu satu.",
  "Simpan kemajuan tiap mode dan tiap lagu secara terpisah supaya tidak saling menimpa.",
]);

s.h2("Catatan Penting");
s.body("Semua konten lagu, yaitu nada dasar, progresi, chord, timestamp, dan pola iringan, adalah data yang diisi terpisah oleh pembuat aplikasi. Mesin aplikasinya sendiri harus generik dan bisa dipakai untuk lagu apa saja selama datanya disediakan dalam format Langkah 5.");
s.body("Jangan reproduksi lirik lagu apa pun di dalam aplikasi. Cukup gunakan notasi musik : angka romawi, nama chord, dan pola ketukan.");

s.h2("Menerapkan ke Materi Lain : Contoh Kosakata Bahasa");
s.body("Pola yang sama bisa dipakai di luar musik. Misalnya latihan kosakata bahasa Inggris.");
s.bullet([
  [["Tiga tipe soal : ", { b: true }], ["dengar kata lalu pilih arti, lihat arti lalu pilih kata, dan lengkapi kalimat rumpang.", {}]],
  [["Sistem harian : ", { b: true }], ["10 kata yang sama untuk semua orang tiap hari, seed dari tanggal, streak disimpan.", {}]],
  [["Data per unit : ", { b: true }], ["daftar kata, arti, contoh kalimat, tingkat kesulitan. Disimpan terpisah sebagai JSON.", {}]],
  [["Mesin generik : ", { b: true }], ["logika soal dan skor tidak tahu isi katanya. Ganti unit berarti ganti data.", {}]],
]);
s.body("Kalau kamu bisa memetakan materimu ke pola ini, kamu bisa memakai alur kerja yang sama.");

s.h2("Cara Nge-prompt AI untuk Game Ini");
s.body("Berikan spesifikasi fitur dan logika selengkap langkah langkah di atas, lalu tegaskan bahwa AI bebas menentukan tampilan dan desain sendiri. Tutup dengan instruksi pelajari dulu, jangan generate apa apa. Setelah itu minta AI membangun satu tipe soal saja lebih dulu, uji, baru lanjut ke tipe berikutnya. Data lagu yang belum ada dibiarkan sebagai contoh placeholder.");
s.figure("d_prompt", "Lima bagian prompt yang baik, dipakai di alur deck maupun game.");
s.body("Kerangka prompt yang bisa kamu pakai :");
s.bullet([
  "Konteks : materi, tujuan, siapa penggunanya.",
  "Aturan dan logika : semua langkah fitur, ditulis berurutan dan spesifik.",
  "Batasan : jangan reproduksi lirik, data harus terpisah dari kode, satu tipe soal dulu.",
  "Instruksi tahan diri : pelajari dulu, jangan generate apa apa, rangkum pemahamanmu.",
  "Iterasi : setelah aku setuju, baru bangun. Koreksi akan aku tulis per fitur.",
]);

s.h2("Kesalahan yang Sering Terjadi");
s.bullet([
  [["Data lagu dicampur ke dalam kode. ", { b: true }], ["Begitu mau tambah lagu, kamu harus mengubah logika. Simpan terpisah sejak awal.", {}]],
  [["Minta semua tipe soal sekaligus. ", { b: true }], ["Susah di-debug. Bangun satu tipe, pastikan jalan, baru lanjut.", {}]],
  [["Menaruh melodi atau lirik lagu di dalam data. ", { b: true }], ["Cukup nada dasar, progresi, dan pola iringan.", {}]],
  [["Skor tiap mode saling menimpa. ", { b: true }], ["Simpan progres tiap mode dan tiap lagu dengan kunci yang berbeda di local storage.", {}]],
  [["Lupa mode latihan bebas. ", { b: true }], ["Kalau cuma ada satu kali main per hari, pemain yang mau berlatih lebih tidak punya tempat.", {}]],
]);

s.h2("Kapan Alur Ini Kurang Cocok");
s.body("Alur ini pas untuk aplikasi latihan yang berbasis soal dan data, dijalankan satu pemain di browser. Untuk game yang butuh grafis berat, gerak real time, atau banyak pemain terhubung sekaligus, kamu butuh pendekatan dan alat yang berbeda. Batas amannya : kalau fitur intinya bisa dijelaskan sebagai daftar aturan dan format data, alur ini akan jalan.");

s.h2("Ringkasan Latihan Bab II");
s.body("Kuasai satu per satu. Tulis spesifikasi tiga tipe soal untuk satu materi non-musik, misalnya kosakata bahasa. Rancang format data JSON untuk satu unit materi mengikuti pola Langkah 5. Minta AI membuat versi minimal dengan satu tipe soal saja, lalu jalankan. Setelah itu tambahkan sistem harian. Terakhir, ganti datanya dengan materi kedua tanpa menyentuh logika, dan pastikan aplikasinya tetap jalan.");

/* ================= LANGKAH PRAKTIS ================= */
coverSection("", "Langkah Praktis");
s = contentSection();
s.raw(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { line: LINE, lineRule: "auto", before: 120, after: 240 }, children: [new TextRun({ text: "Yang Harus Kamu Lakukan Sekarang", font: FONT, size: SZ_SECT, bold: true })] }));
s.body("Buku ini cuma berguna kalau kamu mencoba, bukan cuma membaca. Mulai dari yang kecil.");
s.bullet([
  [["Pilih satu proyek kecil yang nyata. ", { b: true }], ["Satu deck 10 slide untuk materi yang benar benar kamu butuhkan, atau satu game dengan satu tipe soal.", {}]],
  [["Tulis brief dan style guide, atau spesifikasi fitur, lebih dulu. ", { b: true }], ["Jangan langsung minta generate. Minta AI memahami konteks penuh dulu.", {}]],
  [["Iterasi di dokumen sumber. ", { b: true }], ["Semua koreksi ditulis di naskah atau spec, lalu AI mengubah bagian yang relevan saja.", {}]],
  [["Simpan template script-nya. ", { b: true }], ["Proyek berikutnya tinggal ganti isi, layout dan logika ikut otomatis.", {}]],
]);
s.h2("Peta 1 Minggu Pertama");
s.num([
  "Hari 1 : baca ulang kedua alur kerja di buku ini, catat lima prinsip dasarnya.",
  "Hari 2 sampai 3 : bikin style guide dan bullet outline untuk satu deck.",
  "Hari 4 : tulis naskah lengkap, lalu minta AI generate script dan build.",
  "Hari 5 : lakukan satu putaran review dan regenerate.",
  "Hari 6 sampai 7 : coba game, tulis spesifikasi satu tipe soal, generate, lalu rapikan.",
]);
s.h2("Mau Belajar Lebih Dalam?");
s.body("Kalau kamu ingin bimbingan langsung, aku mengajak kamu gabung di Akademi Online Musti Musik. Beberapa hal yang bakal kamu dapetin.");
s.bullet([
  "Bedah proyek dan permainanmu secara LIVE langsung sama Dave.",
  "100+ modul belajar piano worship dan gospel, ditambah 200+ modul bonus lainnya.",
  "Komunitas eksklusif bersama mentor 24 jam.",
  "Garansi kepuasan. 8 kali submit dan hadir Bedah tapi tidak improve, dana kembali penuh.",
]);
s.body("Spesial buat kamu yang daftar dari buku ini, ada hadiah khusus.", { i: true });
s.body("Hubungi +628567884013 karena slot sangat terbatas.");
s.spacer();
s.body("Terima kasih sudah menemani perjalanan ini. Aku harap dua alur kerja ini bikin kamu bisa menghasilkan lebih banyak, dengan tenaga lebih sedikit.");
s.spacer(); s.spacer();
s.raw(new Paragraph({ spacing: { line: LINE, lineRule: "auto" }, children: [new TextRun({ text: "Dave Henokh Liong, DipLCM, ALCM", font: FONT, size: SZ_BODY })] }));

/* ================= RINGKASAN CEPAT ================= */
s = contentSection();
s.sectionTitle("RINGKASAN CEPAT");
s.h2("Lima Prinsip Dasar");
s.num([
  "Pelajari dulu, jangan generate apa apa.",
  "Pisahkan konten dari desain atau kode.",
  "Iterasi di dokumen sumber, bukan regenerate dari nol.",
  "Aset belum ada dibiarkan jadi placeholder berlabel.",
  "Validasi tiap hasil build.",
]);
s.h2("Alur Deck : 6 Langkah");
s.num([
  "Brief : rundown, materi mentah, audiens, plus instruksi pelajari dulu.",
  "Style guide : warna, font, pola layout, aturan logo, sekali di depan.",
  "Bullet outline : satu bullet sama dengan satu slide, dibagi per bagian.",
  "Naskah lengkap : tiap slide kata per kata, jadi sumber kebenaran.",
  "Generate : satu script Node pptxgenjs yang output file .pptx.",
  "Review dan regenerate : koreksi di naskah, build ulang, ulangi.",
]);
s.h2("Alur Game : Inti");
s.num([
  "Mesin generik : logika soal, audio Web Audio API, UI, state di local storage.",
  "Data terpisah : bank soal dan data per materi dalam JSON.",
  "Tiga tipe soal : interval, chord, progresi, plus sistem harian dengan streak.",
  "Trainer lagu : tebak nada dasar, isi progresi angka romawi, terjemahkan ke chord asli, pilih pola iringan, skor gabungan dengan transpose otomatis.",
  "Ganti materi berarti ganti data saja, logika tidak disentuh. Jangan reproduksi lirik.",
]);

/* ================= BUILD ================= */
const doc = new Document({
  numbering: { config: [{ reference: "n1", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.START, style: { paragraph: { indent: { left: 460, hanging: 320 } } } }] }] },
  sections,
});
Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync("EBOOK_Strategi_Pakai_AI.docx", buf);
  console.log("written", buf.length, "bytes  sections", sections.length);
});
