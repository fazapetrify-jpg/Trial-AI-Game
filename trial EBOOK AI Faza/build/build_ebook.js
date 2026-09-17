const {
  Document, Packer, Paragraph, TextRun, ImageRun, PageBreak, AlignmentType,
  Table, TableRow, TableCell, WidthType, BorderStyle, VerticalAlign, LevelFormat,
} = require("docx");
const fs = require("fs");

const MAN = JSON.parse(fs.readFileSync("img_manifest.json", "utf8"));

const FONT = "Montserrat";
const SEMI = "Montserrat SemiBold";
const MED = "Montserrat Medium";

const SZ_BODY = 22;      // 11pt
const SZ_H1 = 28;        // 14pt bold
const SZ_H2 = 24;        // 12pt bold
const SZ_SECT = 28;      // 14pt bold
const SZ_COVER = 50;     // 25pt bold
const SZ_COVER_SUB = 36; // 18pt
const SZ_SMALL = 20;     // 10pt
const LINE = 360;        // 1.5

/* ---------- builders that push into a target array ---------- */
let NUMI = 100; // numbering instance counter, bumped per list so each restarts at 1

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
        spacing: { line: LINE, lineRule: "auto", after: o.after ?? 160, before: o.before || 0 },
        children: segs.map((s) => new TextRun({
          text: s[0], font: FONT, size: SZ_BODY,
          bold: !!(s[1] && s[1].b), italics: !!(s[1] && s[1].i),
        })),
      }));
      return api;
    },
    sectionTitle(text) {
      arr.push(new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { line: LINE, lineRule: "auto", before: 240, after: 240 },
        children: [new TextRun({ text, font: FONT, size: SZ_SECT, bold: true })],
      }));
      return api;
    },
    h1(text) {
      arr.push(new Paragraph({
        alignment: AlignmentType.JUSTIFIED, keepNext: true, keepLines: true,
        spacing: { line: LINE, lineRule: "auto", before: 360, after: 120 },
        children: [new TextRun({ text, font: FONT, size: SZ_H1, bold: true })],
      }));
      return api;
    },
    h2(text) {
      arr.push(new Paragraph({
        alignment: AlignmentType.JUSTIFIED, keepNext: true, keepLines: true,
        spacing: { line: LINE, lineRule: "auto", before: 240, after: 60 },
        children: [new TextRun({ text, font: FONT, size: SZ_H2, bold: true })],
      }));
      return api;
    },
    num(items) {
      const inst = ++NUMI;
      items.forEach((it) => arr.push(new Paragraph({
        numbering: { reference: "n1", level: 0, instance: inst },
        alignment: AlignmentType.JUSTIFIED,
        spacing: { line: LINE, lineRule: "auto", after: 80 },
        children: Array.isArray(it)
          ? it.map((s) => new TextRun({ text: s[0], font: FONT, size: SZ_BODY, bold: !!(s[1] && s[1].b) }))
          : [new TextRun({ text: it, font: FONT, size: SZ_BODY })],
      })));
      return api;
    },
    slot(caption) {
      const bd = { style: BorderStyle.DASHED, size: 6, color: "999999" };
      arr.push(new Table({
        columnWidths: [5600], alignment: AlignmentType.CENTER,
        rows: [new TableRow({
          height: { value: 1500, rule: "atLeast" },
          children: [new TableCell({
            width: { size: 5600, type: WidthType.DXA },
            verticalAlign: VerticalAlign.CENTER,
            borders: { top: bd, bottom: bd, left: bd, right: bd },
            children: [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 300, after: 300 }, children: [new TextRun({ text: caption, font: FONT, size: 15, italics: true, color: "888888" })] })],
          })],
        })],
      }));
      arr.push(new Paragraph({ spacing: { after: 120 }, children: [new TextRun("")] }));
      return api;
    },
    bullet(items) {
      items.forEach((it) => arr.push(new Paragraph({
        bullet: { level: 0 },
        alignment: AlignmentType.JUSTIFIED,
        spacing: { line: LINE, lineRule: "auto", after: 80 },
        children: Array.isArray(it)
          ? it.map((s) => new TextRun({ text: s[0], font: FONT, size: SZ_BODY, bold: !!(s[1] && s[1].b) }))
          : [new TextRun({ text: it, font: FONT, size: SZ_BODY })],
      })));
      return api;
    },
    tip(text) {
      arr.push(new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { line: LINE, lineRule: "auto", before: 120, after: 160 },
        children: [
          new TextRun({ text: "Tips Aplikasi : ", font: FONT, size: SZ_BODY, bold: true }),
          new TextRun({ text, font: FONT, size: SZ_BODY }),
        ],
      }));
      return api;
    },
    lick(name, notes, usage) {
      arr.push(new Paragraph({
        keepNext: true, spacing: { line: LINE, lineRule: "auto", before: 120, after: 0 },
        children: [new TextRun({ text: name + " : " + notes, font: FONT, size: SZ_BODY, bold: true })],
      }));
      arr.push(new Paragraph({
        alignment: AlignmentType.JUSTIFIED, spacing: { line: LINE, lineRule: "auto", after: 60 },
        children: [new TextRun({ text: usage, font: FONT, size: SZ_BODY })],
      }));
      return api;
    },
    figure(key, caption) {
      const m = MAN[key];
      const W = 350;
      const H = Math.round(W * (m.h / m.w));
      arr.push(new Paragraph({
        alignment: AlignmentType.CENTER, keepLines: true,
        spacing: { before: 160, after: 40 },
        children: [new ImageRun({ type: "png", data: fs.readFileSync(m.path), transformation: { width: W, height: H } })],
      }));
      if (caption) arr.push(new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { line: LINE, lineRule: "auto", after: 200 },
        children: [new TextRun({ text: caption, font: FONT, size: SZ_SMALL, italics: true })],
      }));
      return api;
    },
    qr(caption) {
      const bd = { style: BorderStyle.SINGLE, size: 8, color: "000000" };
      arr.push(new Table({
        columnWidths: [2200], alignment: AlignmentType.CENTER,
        rows: [new TableRow({
          height: { value: 2200, rule: "atLeast" },
          children: [new TableCell({
            width: { size: 2200, type: WidthType.DXA },
            verticalAlign: VerticalAlign.CENTER,
            borders: { top: bd, bottom: bd, left: bd, right: bd },
            children: [
              new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 500 }, children: [new TextRun({ text: "KODE QR", font: FONT, size: SZ_SMALL, bold: true })] }),
              new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 500 }, children: [new TextRun({ text: "tempel gambar QR video di sini", font: FONT, size: 15, italics: true, color: "888888" })] }),
            ],
          })],
        })],
      }));
      arr.push(new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { line: LINE, lineRule: "auto", before: 80, after: 200 },
        children: [new TextRun({ text: caption, font: FONT, size: SZ_SMALL, italics: true })],
      }));
      return api;
    },
    spacer() { arr.push(new Paragraph({ children: [new TextRun("")] })); return api; },
    raw(p) { arr.push(p); return api; },
  };
  return api;
}

/* ================= SECTIONS ================= */
const PAGE = {
  size: { width: 8391, height: 11906 },
  margin: { top: 1440, right: 1440, bottom: 1440, left: 1440, header: 720, footer: 720 },
};
const sections = [];
function contentSection() { const c = []; sections.push({ properties: { page: PAGE }, children: c }); return mk(c); }
function coverSection(no, title) {
  const c = [];
  c.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { line: 240 }, children: [new TextRun({ text: no, font: FONT, size: SZ_COVER, bold: true })] }));
  c.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { line: 240, before: 120 }, children: [new TextRun({ text: title, font: FONT, size: SZ_COVER_SUB })] }));
  sections.push({ properties: { page: PAGE, verticalAlign: VerticalAlign.CENTER }, children: c });
}

/* ---------- FRONT MATTER ---------- */
let s = contentSection();
s.sectionTitle("KATA PENULIS");
s.body("Buku ini didedikasikan buat kamu yang permainan pianonya sudah jalan. Chord benar, lagu hafal, tapi masih terasa datar. Kamu tahu ada yang kurang, tapi bingung apa.");
s.body("Dulu aku persis di posisi itu. Aku sudah bisa mengiringi lagu, tapi hasilnya kaku. Sampai aku sadar yang kurang itu satu hal : fill in. Isian kecil di sela lagu yang bikin permainan jadi hidup.");
s.rich([["Pertanyaan yang dulu bikin aku pusing : ", {}], ["gimana caranya bikin permainan jadi manis tanpa nunggu bakat turun dari langit?", { i: true }]]);
s.body("Ternyata jawabannya bukan bakat. Fill in itu skill yang ada logikanya, ada template-nya, dan bisa dilatih siapa saja. Lebih dari itu, fill in adalah pintu masuk ke improvisasi. Kalau kamu bisa mengisi jeda dua ketuk, kamu tinggal memperpanjangnya sedikit demi sedikit sampai jadi improvisasi satu bagian penuh.");
s.body("Buku ini aku tulis supaya kamu nggak perlu bertahun-tahun meraba-raba seperti aku dulu. Isinya rangkuman dari yang aku ajarkan ke murid-murid Musti Musik, dan berlaku buat genre apa pun : pop, jazz, maupun worship.");
s.body("Satu pesanku sebelum kamu mulai : jangan cuma dibaca. Setiap kali ketemu contoh, buka pianomu dan coba pelan-pelan. Fill in dan improvisasi itu skill motorik. Otakmu boleh paham dalam lima menit, tapi jarimu butuh diulang. Baca satu teknik, latih sampai lancar, baru lanjut.");
s.body("Selamat belajar. Yuk kita mulai.");
s.spacer(); s.spacer();
s.raw(new Paragraph({ alignment: AlignmentType.RIGHT, spacing: { line: LINE, lineRule: "auto" }, children: [new TextRun({ text: "Dave Henokh Liong", font: FONT, size: SZ_BODY })] }));

s = contentSection();
s.sectionTitle("KATA MEREKA (5 dari 1000+ murid)");
const testi = [
  ["dr. Kelvin", "(Spesialis Mata & Pemilik Klinik, Senior)", "Belajar piano dengan Dave sangat menyenangkan dan cepat berkembang, karena teorinya mudah dipahami dan langsung bisa dipakai."],
  ["Dr. Elly Moniyong", "(Gembala Gereja & Dosen, 73 th)", "Dave mengajarkan teknik piano flowing dan variasi yang bisa langsung aku pakai saat pelayanan."],
  ["Alf Elijah", "(Pianis & Aktor Musikal, 11 tahun)", "Berkat ko Dave, Alf bisa main lebih manis dengan variasi dan fill in yang miring miring enak didengar."],
  ["Fenny", "(Pengarang Lagu)", "Belajar dengan Dave membuat saya lepas dari sheet musik dan berani berimprovisasi dengan chord serta isian yang manis."],
  ["Aretha Keyanna T.", "(Pelajar, 15 tahun)", "Di awal aku otodidak dan merasa stuck. Berkat Dave dan ilmu dari buku ini, permainanku jadi lebih hidup."],
];
testi.forEach((t) => {
  s.raw(new Table({
    columnWidths: [1400, 4400],
    rows: [new TableRow({ children: [
      new TableCell({
        width: { size: 1400, type: WidthType.DXA },
        borders: { top: { style: BorderStyle.SINGLE, size: 6 }, bottom: { style: BorderStyle.SINGLE, size: 6 }, left: { style: BorderStyle.SINGLE, size: 6 }, right: { style: BorderStyle.SINGLE, size: 6 } },
        verticalAlign: VerticalAlign.CENTER,
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "foto", font: FONT, size: 14, color: "888888" })] })],
      }),
      new TableCell({
        width: { size: 4400, type: WidthType.DXA },
        borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
        children: [
          new Paragraph({ spacing: { after: 0 }, children: [
            new TextRun({ text: t[0] + "  ", font: FONT, size: SZ_BODY, bold: true }),
            new TextRun({ text: t[1], font: MED, size: SZ_SMALL }),
          ] }),
          new Paragraph({ alignment: AlignmentType.JUSTIFIED, spacing: { line: LINE, lineRule: "auto", after: 120 }, children: [new TextRun({ text: '"' + t[2] + '"', font: FONT, size: SZ_SMALL, italics: true })] }),
        ],
      }),
    ] })],
  }));
  s.spacer();
});
s.raw(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 240 }, children: [new TextRun({ text: "Dan Masih Ada Banyak Cerita Lainnya", font: FONT, size: SZ_BODY, bold: true, italics: true })] }));

s = contentSection();
s.sectionTitle("CARA BUKU INI BISA MEMBANTUMU");
s.body("Banyak pianis berhenti berkembang di titik yang sama : permainannya benar tapi datar. Chord tepat, tempo stabil, tapi tidak ada rasa. Biasanya bukan karena malas latihan, tapi karena tidak ada yang mengajarkan bagian bumbunya secara runut.");
s.body("Buku ini lahir untuk mengisi celah itu. Bukan dengan teori rumit, tapi dengan langkah kecil yang bisa langsung kamu praktikkan hari ini juga.");
s.h2("Bagaimana Buku Ini Akan Membantumu?");
s.body("Materi disusun dari yang paling gampang ke yang paling dalam, lewat 4 tahap :");
s.num([
  [["Apa Itu Fill In. ", { b: true }], ["Kamu paham dulu fill in itu apa, tujuannya apa, dan ada berapa jenis pendekatannya.", {}]],
  [["Cara Fill In Simpel. ", { b: true }], ["Teknik yang bisa kamu pakai hari ini juga, tanpa banyak hafalan.", {}]],
  [["Dari Fill In ke Improvisasi. ", { b: true }], ["Jembatannya : bagaimana fill in berkembang jadi improvisasi lewat licks dan motif.", {}]],
  [["Cara Improvisasi Macam-Macam. ", { b: true }], ["Kumpulan cara improvisasi, dari melody improvisation sampai thematic improvisation.", {}]],
]);
s.body("Di beberapa bagian ada kotak Tips Aplikasi. Itu bagian paling praktis, jangan dilewat. Di awal tiap bab ada satu kotak kode QR untuk menonton video pendamping. Daftar timestamp video ada di halaman terakhir buku ini.");

s = contentSection();
s.sectionTitle("DAFTAR ISI");
["KATA PENULIS", "KATA MEREKA", "CARA BUKU INI BISA MEMBANTUMU",
 "BAB I  APA ITU FILL IN", "BAB II  CARA FILL IN SIMPEL",
 "BAB III  DARI FILL IN KE IMPROVISASI", "BAB IV  CARA IMPROVISASI MACAM-MACAM",
 "LANGKAH PRAKTIS", "REFERENSI VIDEO & TIMESTAMP"].forEach((t) =>
  s.raw(new Paragraph({ alignment: AlignmentType.JUSTIFIED, spacing: { line: 480, lineRule: "auto" }, children: [new TextRun({ text: t, font: SEMI, size: SZ_BODY })] })));

/* ---------- BAB I ---------- */
coverSection("BAB I", "Apa Itu Fill In");
s = contentSection();
s.h1("Apa Itu Fill In");
s.body("Fill in adalah nada atau melodi manis yang kita tambahkan di bagian lagu yang sedang kosong. Misalnya pas ada jeda, atau pas penyanyi berhenti menyanyi. Namanya fill in karena kita memang mengisi ruang yang kosong itu.");
s.body("Coba bayangkan penyanyi menyanyikan satu kalimat, lalu diam satu sampai dua ketuk sebelum kalimat berikutnya. Ruang diam itulah lahan subur buat fill in.");
s.qr("Scan QR di atas untuk belajar Bab I dalam format video.");
s.h2("Tujuan Fill In");
s.bullet([
  "Membuat permainan semakin manis dan semakin ramai.",
  "Mengisi ruang supaya lagu tidak terasa bolong.",
  "Menjaga energi dan gerak lagu saat vokal sedang istirahat.",
]);
s.h2("Fill In Berlaku di Semua Genre");
s.body("Fill in bukan milik satu genre. Yang berubah cuma rasa dan porsinya.");
s.rich([["Pop. ", { b: true }], ["Fill in dipakai bebas, biasanya melodik dan mengikuti mood lagu.", {}]]);
s.rich([["Jazz. ", { b: true }], ["Fill in sering berkembang jadi improvisasi penuh. Ini bahkan identitas jazz.", {}]]);
s.rich([["Worship. ", { b: true }], ["Fill in dipakai secukupnya. Tujuan worship adalah mengiringi jemaat, jadi pemain tidak boleh terlalu menonjol. Nada kromatik yang nyeleneh dipakai sedikit saja.", {}]]);
s.h2("Tiga Pendekatan Dasar Fill In");
s.body("Saat mengiring (comping) dan mau menambah fill in, ada 3 cara umum.");
s.num([
  [["Song Improvisation. ", { b: true }], ["Memainkan melodi lagunya sendiri, dari verse atau chorus, untuk mengisi ruang kosong. Caranya sesederhana : ambil beberapa nada terakhir dari kalimat yang barusan dinyanyikan, lalu ulang di ruang kosong setelahnya.", {}]],
  [["Theme Improvisation. ", { b: true }], ["Memainkan tema, intro, atau ciri khas genre dari lagu tersebut. Contoh : lagu yang biasa dibawakan gaya Latin bisa diisi frasa montuno khas Latin. Cara ini lebih susah karena butuh hafalan dan wawasan genre.", {}]],
  [["Free Improvisation. ", { b: true }], ["Memainkan melodi bebas. Tapi bebas di sini bukan asal. Kamu tetap menyandarkannya pada template yang sudah enak dan kamu hafal.", {}]],
]);
s.body("Song improvisation itu paling gampang karena kamu tinggal melihat melodi lagunya. Theme dan free improvisation lebih susah karena butuh hafalan. Untuk pemula, mulailah dari song improvisation.");
s.h2("Contoh Penerapan Tiap Pendekatan");
s.body("Berikut penerapan tiap pendekatan pada satu lagu yang sama, diambil dari materi PPT.");
s.rich([["Song Improvisation", { b: true }]], { after: 40 });
s.slot("Tempel screenshot PPT: slide penerapan Song Improvisation (contoh chord dan melodi verse pada lagu).");
s.rich([["Theme Improvisation", { b: true }]], { after: 40 });
s.slot("Tempel screenshot PPT: slide penerapan Theme Improvisation (contoh frasa tema atau montuno pada lagu).");
s.rich([["Free Improvisation", { b: true }]], { after: 40 });
s.slot("Tempel screenshot PPT: slide penerapan Free Improvisation (contoh melodi bebas pada lagu).");
s.h2("Kapan Fill In Tidak Perlu");
s.body("Fill in itu bumbu, bukan makanan utama. Ada momen di mana kamu justru harus diam.");
s.bullet([
  "Saat penyanyi sedang menyanyikan lirik penting. Biarkan vokal jadi fokus.",
  "Saat lagu masuk bagian yang tenang dan jemaat sedang menghayati.",
  "Saat pemain lain sedang mengisi. Jangan bertabrakan.",
]);
s.body("Aturan sederhananya : kalau ragu apakah harus mengisi atau tidak, tidak dulu. Fill in yang tepat sedikit terasa jauh lebih mahal daripada fill in yang di mana mana.");
s.tip("Sebelum menambah fill in, latih telinga dulu. Dengarkan lagunya dan tandai di mana ada ruang kosong, yaitu saat penyanyi berhenti, akhir kalimat, atau akhir baris. Fill in yang bagus itu menjawab kalimat vokal, bukan menabraknya. Isi setelah vokal selesai, bukan barengan.");

/* ---------- BAB II ---------- */
coverSection("BAB II", "Cara Fill In Simpel");
s = contentSection();
s.h1("Cara Fill In Simpel");
s.body("Ini bab paling praktis. Semua teknik di sini bisa langsung kamu coba tanpa banyak hafalan.");
s.qr("Scan QR di atas untuk belajar Bab II dalam format video.");

s.h2("1. Song Improvisation : Ambil dari Melodi Lagunya");
s.body("Cara paling gampang : jangan mikir. Lihat melodi kalimat yang baru saja dinyanyikan, lalu ulang melodi itu di ruang kosong setelahnya. Kalau melodi aslinya panjang, cukup ambil 3 sampai 4 nada terakhirnya dan ulang. Boleh dinaikkan satu oktaf supaya terdengar seperti sahutan.");
s.body("Kamu tidak perlu pusing harus main nada apa. Ambil saja dari melodi yang barusan lewat.");
s.body("Latihan : ambil satu lagu yang chord-nya sudah kamu hafal. Nyanyikan satu baris, lalu di jedanya mainkan 3 sampai 4 nada terakhir baris itu. Lakukan di setiap akhir baris sampai terasa otomatis.");

s.h2("2. RPG Extend : Broken Chord ke Atas");
s.body("RPG adalah broken chord, yaitu chord yang dimainkan terpisah pisah not-nya, bukan ditekan sekaligus. RPG Extend artinya kita mainkan broken chord itu lalu naik terus ke atas mengikuti isian chord-nya. Chord C ditekan biasa terdengar datar. Chord C di-RPG Extend jadi C, E, G, C oktaf atas, E, G, dan seterusnya naik.");
s.body("Kenapa teknik ini favorit. Pertama, berlaku untuk chord apa pun. Mayor, minor 7, sus, semua bisa, tinggal ikuti isian chord-nya. Kedua, bikin permainan terdengar megah, cocok untuk ending dan untuk fill in saat ada jeda panjang. Ketiga, makin manis kalau chord-nya sudah kamu ubah jadi sus2 lebih dulu (Csus2 isinya 1, 2, 5).");
s.body("Latihan : mainkan RPG Extend di tiga chord (C, F, G) naik dua oktaf lalu turun. Ulang dengan versi sus2.");
s.tip("Pakai RPG Extend pada chord yang durasinya panjang atau saat lagu berhenti sejenak sebelum masuk bagian baru. Untuk ending : RPG Extend di chord I, naik sampai register tinggi, lalu berhenti di nada 1 (tonik).");

s.h2("3. Grace Note : Nada Hiasan atau Kepeleset");
s.body("Grace note adalah nada hiasan yang dimainkan sangat cepat sebelum nada tujuan, seperti jari kepeleset ke nada sasaran. Rumusnya mirip chromatic passing note, tapi untuk tangan kanan : bisa dari setengah nada sebelum atau sesudah nada tujuan, bisa dari satu nada, bisa dari satu setengah nada.");
s.body("Contoh pada melodi Amazing Grace, yang merupakan lagu domain publik. Daripada langsung menekan nada E, sentuh dulu nada D (satu nada di bawah) dengan sangat cepat lalu geser ke E. Nada D tidak dihitung sebagai ketukan penuh, dia cuma lewat.");
s.body("Latihan : mainkan sebuah melodi sederhana, boleh Amazing Grace, lalu ulang dengan menambahkan grace note setengah nada di bawah pada setiap nada panjang. Rasakan bedanya.");
s.tip("Kunci grace note : dimainkan cepat. Kalau dimainkan lambat, efek hiasannya hilang. Kuis kecil : mau grace note menuju nada A? Bisa lewat G# (setengah), G (satu), atau F# (satu setengah). Coba semua, pilih yang paling enak di kupingmu.");

s.h2("4. Fill In Between Melody : Sisipkan Nada di Antara Melodi");
s.body("Ritme dan melodi lagu tetap sama, tapi kamu menyisipkan beberapa nada tambahan di antara nada melodi. Nada tambahannya cukup dari kunci lagu itu sendiri, tidak usah takut ketabrak. Contoh : melodi aslinya C lalu E lalu G. Dengan sisipan jadi C, D, E, lalu E, F, G, di mana D dan F adalah sisipan.");
s.tip("Untuk pemula : sisipannya ambil dari tangga nada kunci yang sedang kamu mainkan. Titik. Jangan penuhi semua ruang, satu sampai dua sisipan per kalimat sudah cukup.");

s.h2("5. Ubah Ritme atau Ubah Melodi");
s.body("Dua trik cepat dari melody improvisation. Change Rhythm : melodi persis sama, tapi penempatan ketukannya diubah, dimajukan, dimundurkan, atau dibuat sinkop. Same Rhythm Change Melody : ritmenya persis sama, tapi nadanya diganti dengan nada lain dari kunci lagu. Keduanya sudah dihitung improvisasi, walau perubahannya kecil.");
s.tip("Rekam dirimu memainkan melodi asli, lalu mainkan lagi dengan ritme berbeda beda. Bandingkan.");

s.h2("6. Menggabungkan Semuanya");
s.body("Fill in yang matang itu campuran dari teknik di atas. Contoh rencana pada satu lagu dengan progresi umum I, V, vi, IV yang diulang :");
s.num([
  "Akhir baris 1 : song improvisation, ulang 3 nada terakhir melodi.",
  "Akhir baris 2 : grace note menuju nada chord.",
  "Jeda menuju reff : RPG Extend di chord V.",
  "Di dalam reff : fill in between melody, satu sampai dua sisipan.",
]);
s.body("Perhatikan : dalam satu bait cukup ada empat titik fill in. Sisa waktu, tangan kanan tetap main chord biasa. Itu porsi yang sehat.");
s.h2("Ringkasan Latihan Bab II");
s.body("Kuasai satu per satu, jangan diborong. Song improvisation di semua akhir baris satu lagu. RPG Extend di C, F, G, polos lalu versi sus2. Grace note setengah nada pada tiap nada panjang sebuah melodi. Fill in between melody, satu sampai dua sisipan per baris. Terakhir, mainkan melodi lagu dengan ritme diubah. Kalau kelimanya sudah otomatis, kamu sudah punya kotak alat fill in yang cukup untuk mengiringi lagu apa pun.");

/* ---------- BAB III ---------- */
coverSection("BAB III", "Dari Fill In ke Improvisasi");
s = contentSection();
s.h1("Dari Fill In ke Improvisasi");
s.body("Semua teknik di Bab II sebenarnya improvisasi berukuran kecil. Kalau ruang kosongnya cuma dua ketuk, kamu isi fill in pendek. Kalau kamu diberi satu bagian penuh untuk main sendiri, misalnya interlude atau solo, fill in itu tinggal diperpanjang, dan namanya berubah jadi improvisasi. Prosesnya identik. Yang membedakan cuma durasi dan seberapa jauh kamu mengembangkannya.");
s.qr("Scan QR di atas untuk belajar Bab III dalam format video.");
s.h2("Rahasia yang Jarang Diomongin : Semua Pakai Template");
s.body("Banyak orang mengira improvisasi sama dengan main asal atau main nada bebas. Salah. Hampir semua pianis yang kamu kagumi, saat memasukkan fill in atau improvisasi, memainkan template yang sudah pernah mereka latih. Mereka jarang benar benar menciptakan sesuatu yang baru di tempat. Itu rahasianya : kumpulkan template, latih, lalu pakai. Template inilah yang disebut licks.");
s.h2("Licks");
s.body("Lick adalah frasa atau potongan melodi khas yang sudah proven to work dan kamu hafal. Ibarat rumus cepat di matematika, jalan pintas supaya kedengaran enak.");
s.body("Cara mendapatkan licks. Pertama, transcribe atau curi dari permainan orang lain. Dengar, tiru, modifikasi. Kedua, ambil dari YouTube atau modul yang memang mengajarkan licks.");
s.h2("Beberapa Licks untuk Pemula (cocok di Worship dan Pop)");
s.body("Ditulis sebagai derajat nada. Semua contoh di kunci C. Tanda petik satu berarti oktaf atas.");
s.lick("Lick 1", "3 4 5 1' 5", "Cocok di chord apa pun (I, ii, iii, IV, V, vi). Bisa dimainkan oktaf, interval 6, atau interval 3.");
s.lick("Lick 2", "1' 6 4 1 lalu 1' 6 4 1", "Cocok di chord ii dan V. Terasa seperti RPG turun.");
s.lick("Lick 3", "7 1' 7 5 2", "Cocok di chord vi minor. Sangat sering muncul di lagu worship.");
s.lick("Lick 4", "tangan kanan 3 4 5, tangan kiri 1 2 3, gerak bareng", "Cocok di chord I dan V. Paling enak di chord V.");
s.lick("Lick 5", "1 7 2 1 3, lalu 1 7", "Untuk transisi chord I menuju IV. Diambil dari vokabulari jazz.");
s.lick("Lick 6", "lick ala Korea", "Untuk chord vi minor menuju ii minor. Sering pakai b9.");
s.lick("Lick 7", "lick pentatonik", "Rasa Cina. Cocok di ii dan V, atau IV, atau V.");
s.body("Awas, lick terikat kunci. Beda dengan progresi chord yang berlaku untuk semua kunci, sebuah lick biasanya ditulis untuk satu kunci saja. Kalau lick ditulis di C dan kamu mau main di F, kamu harus transpose dulu di kepala atau catat. Minimal kuasai di kunci yang sering dipakai : C, F, G, A, D, lalu Bb.");
s.body("Contoh transpose Lick 1 (3 4 5 1' 5). Di C nadanya E, F, G, C, G. Kalau lagunya di F, jadi A, Bb, C, F, C. Latih pola derajatnya, bukan nada matinya. Begitu kamu terbiasa berpikir 3 4 5 1' 5, semua kunci jadi otomatis.");
s.h2("Lick Manipulation");
s.body("Kamu tidak harus memainkan lick persis sama. Boleh diperlambat, dipercepat, ada nada yang dihilangkan, atau timing digeser. Dari satu lick, ditambah teknik manipulasi, ditambah lick lick yang kamu curi, kemungkinannya jadi tak terhingga.");
s.h2("Dari Lick Jadi Fill In : Langkah demi Langkah");
s.num([
  [["Hafal dulu polos di C. ", { b: true }], ["Tempo lambat, sampai lancar tanpa lihat.", {}]],
  [["Pindahkan ke kunci lagumu. ", { b: true }], ["Latih di dua sampai tiga kunci yang sering kamu pakai.", {}]],
  [["Tempel di jeda. ", { b: true }], ["Saat penyanyi berhenti di akhir baris, mainkan lick itu satu kali.", {}]],
  [["Manipulasi. ", { b: true }], ["Kali berikutnya mainkan lebih cepat, atau buang nada terakhirnya, atau mainkan pakai interval 3. Satu lick jadi terasa seperti empat.", {}]],
]);
s.tip("Jangan hafal 20 lick sekaligus. Ambil satu sampai dua lick favorit, latih di semua kunci, rekam, baru tambah yang baru. Saat latihan lick, tandai : ini aku pakai saat chord berapa?");
s.h2("Motif");
s.body("Motif adalah kumpulan nada kecil yang jadi bahan awal sebuah improvisasi. Motif bisa diambil dari melodi lagunya sendiri, dari sebuah scale, atau dari frasa dan lick yang sudah enak. Contoh : ambil motif tiga nada C, E, G. Nanti di Bab IV, motif sekecil ini bisa kamu kembangkan, diulang, dibalik, diperlebar jaraknya, dipanjangkan durasinya, sampai jadi improvisasi satu bagian penuh yang punya cerita. Jadi jangan remehkan motif kecil, dia benih.");

/* ---------- BAB IV ---------- */
coverSection("BAB IV", "Cara Improvisasi Macam-Macam");
s = contentSection();
s.h1("Cara Improvisasi Macam-Macam");
s.body("Improvisasi adalah ruang untuk mengekspresikan kreativitas, imajinasi, dan emosi. Di jazz, improvisasi adalah identitas, itu yang membedakan jazz dari genre lain. Tapi tekniknya kepakai di semua genre.");
s.body("Improvisasi biasanya dilakukan dengan menggabungkan banyak cara : melody improvisation, passing note, scale, modes, dan licks. Bab ini membahasnya satu per satu. Disclaimer : contoh di bab ini banyak memakai kunci C sebagai standar, karena semua nada putih dan itu kunci pertama yang kamu pelajari. Setelah paham di C, pindahkan ke kunci lain.");
s.qr("Scan QR di atas untuk belajar Bab IV dalam format video.");

s.h2("4.1 Melody Improvisation (Paling Mudah)");
s.body("Pakai melodi lagunya sendiri. Ada 3 cara.");
s.num([
  "Change Rhythm : melodi sama, ritme diubah.",
  "Same Rhythm Change Melody : ritme sama, nada diganti dengan nada dari kunci.",
  "Fill In Between Melody : ritme dan melodi sama, tapi disisipi nada tambahan di antaranya.",
]);
s.body("Ketika menambah atau mengganti melodi, kamu boleh memakai konsep improvisasi apa pun dari sub bab berikutnya. Campur campur tidak masalah. Ini titik masuk terbaik untuk yang baru pertama kali improvisasi.");
s.body("Latihan : pilih satu lagu yang melodinya kamu hafal. Mainkan satu bait empat kali. Pertama asli, lalu Change Rhythm, lalu Change Melody, lalu Fill In Between. Rekam keempatnya dan dengarkan bedanya.");

s.h2("4.2 Chord Improvisation");
s.body("Konsepnya : mainkan melodi memakai nada chord 7 dari chord yang sedang berbunyi, sebagai pola utama improvisasi. Rumus chord 7 adalah 1 ditambah 3 ditambah 5 ditambah 7. Ketukan dibuat stabil, melodi berkelanjutan. Karena kamu hanya memakai nada chord yang sedang berbunyi, hasilnya pasti nyambung dengan harmoni. Cocok untuk pemula yang belum pede improvisasi bebas.");
s.figure("f_chord", "Chord Improvisation : nada chord 7 (1+3+5+7) jadi pola improvisasi.");

s.h2("4.3 Improvisasi Diatonis Up dan Down");
s.body("Konsepnya : mainkan melodi memakai tangga nada diatonis, dengan gerak naik turun. Tangga nada diatonis adalah rangkaian nada dengan pola interval 1, 1, setengah, 1, 1, 1, setengah. Improvisasi ini tidak keluar dari nada tangga nada tersebut, jadi aman dan susah salah. Cara paling gampang mulai : pilih progresi, lalu jalan naik dari tonik sampai oktaf, turun lagi, sambil ikut ketukan.");
s.figure("f_diaud", "Improvisasi diatonis : naik turun tanpa keluar dari interval tangga nada.");

s.h2("4.4 Improvisasi Diatonis Skips dan Leaps");
s.body("Masih di tangga nada diatonis, tapi geraknya divariasikan. Steps adalah jarak 1 nada. Skips adalah jarak 2 nada, lewat satu. Leaps adalah jarak lebih dari 2 nada. Ritmenya boleh dikombinasi, misalnya off beat, satu ketuk, dua ketuk. Kombinasi step, skip, leap, ditambah variasi ritme inilah yang membuat improvisasi tidak monoton.");
s.figure("f_skips", "Steps, skips, dan leaps pada tangga nada diatonis.");

s.h2("4.5 Scale Improvisation");
s.body("Blues Scale adalah scale 6 nada yang berasal dari musik blues. Dipakai luas di 12 bar blues, Boogie Woogie, Soul, R&B, Jazz, dan Funk. Ada 2 jenis, ciri khasnya ada di blues note-nya. Major Blues Scale rumusnya 1, 2, b3, 3, 5, 6, dengan blues note 3b. Minor Blues Scale rumusnya 1, b3, 4, b5, 5, b7, dengan blues note 5b.");
s.body("Kunci kesaktiannya : C Blues Scale cocok untuk chord apa pun. Meski chord dalam progresi berganti ganti, kamu bisa tetap memainkan C Blues Scale.");
s.figure("f_blues_maj", "Major Blues Scale di C : C, D, Eb, E, G, A. Blues note 3b.");
s.figure("f_blues_min", "Minor Blues Scale di C : C, Eb, F, Gb, G, Bb. Blues note 5b.");
s.body("Pentatonic juga bisa dipakai hampir di mana saja. Tips improve paling gampang : main naik pakai satu scale, turun pakai scale lain. Contoh : naik pakai scale octatonic, turun pakai pentatonic. Satu tarikan naik turun ini saja sudah jadi satu frasa improvisasi utuh.");
s.figure("f_tips_updown", "Tips improve : naik pakai satu scale, turun pakai scale lain.");
s.body("Latihan : pilih satu progresi, misalnya C, Am, F, G, lalu selama empat bar itu mainkan C Minor Blues Scale saja, naik turun bebas. Rasakan bahwa nadanya tetap masuk walau chord-nya ganti.");

s.h2("4.6 Improvise in Licks");
s.body("Lihat juga Bab III untuk daftar lick worship dan pemula. Lick adalah frasa yang sudah proven to work, potongan susunan melodi khas, dihafal, lalu dipakai untuk memperkaya improvisasi. Lick itu ibarat lem yang menyatukan scale, chord tone, dan skips leaps jadi satu frasa yang koheren. Berikut tiga lick terkenal beserta notasinya.");
s.figure("f_lick_the", "The Lick. Rumus 6 7 1' 2' 7 5 6 6. Dipakai saat chord vi.");
s.figure("f_lick_6th", "Beautiful 6th Interval. Rumus 4' 6 3' 2'. Dipakai saat chord ii.");
s.figure("f_lick_tri", "Minor Triad with Extras. Rumus 7 6 3 1 1. Dipakai saat chord I.");
s.body("Lick lain sebaiknya kamu analisa dan curi sendiri dari permainan pianis favoritmu.");

s.h2("4.7 Thematic Improvisation (Cara Terbaik)");
s.body("Kenyataannya, scale, modes, dan licks itu bukan yang paling penting. Yang lebih kita butuhkan adalah story telling. Improvisasi kita harus punya cerita.");
s.body("Sebuah improvisasi yang bercerita punya bentuk kurva suasana. Awal yang tenang untuk memperkenalkan ide. Klimaks yang jadi puncak, paling ramai dan paling tinggi. Lalu akhir yang diturunkan lagi untuk memberi kesan selesai.");
s.figure("f_kurva", "Kurva suasana improvisasi : awal, klimaks, akhir.");
s.body("Contoh rencana 8 bar. Bar 1 sampai 2 mainkan motif pelan di register tengah. Bar 3 sampai 5 kembangkan motif itu makin ke atas dan makin rapat. Bar 6 puncak. Bar 7 sampai 8 turun lagi, akhiri di nada tonik. Itu satu cerita utuh. Cara membangun awalan yang baik adalah mainkan sebuah motif. Masalahnya kalau cuma main motif itu itu saja jadi bosan. Solusinya adalah motif development.");

s.h2("4.8 Motif Development");
s.body("Cara mengolah satu motif kecil supaya jadi improvisasi panjang yang tidak membosankan. Semua contoh berikut memakai motif tiga nada C, E, G.");
s.body("Kelompok A, Pitch Wise : nada berubah, ritme tetap.");
s.figure("f_md_rep", "Repetition : motif diulang apa adanya.");
s.figure("f_md_seq", "Sequence : motif diulang di derajat nada berbeda (C E G lalu D F A).");
s.figure("f_md_oct", "Octave Displacement : salah satu nada dipindah ke oktaf lain.");
s.figure("f_md_exp", "Expansion : jarak antar nada diperlebar.");
s.figure("f_md_con", "Contraction : jarak antar nada dipersempit.");
s.figure("f_md_ext", "Extension : tambah nada di ujung motif.");
s.figure("f_md_tru", "Truncation : buang nada dari motif.");
s.body("Kelompok B, Rhythmic Wise : ritme berubah, susunan nada tetap.");
s.figure("f_md_aug", "Augmentation : durasi tiap nada diperpanjang.");
s.figure("f_md_dim", "Diminution : durasi tiap nada diperpendek.");
s.body("Selain itu ada Rhythmic Displacement, yaitu menggeser atau menunda figur ritmis motif tanpa mengubah nadanya.");
s.body("Kelompok C, gabungan Pitch dan Rhythmic Wise.");
s.figure("f_md_hmir", "Horizontal Mirror : urutan nada dibalik.");
s.body("Ada juga Vertical Mirror, yaitu arah interval dibalik, tadinya naik jadi turun, serta Vertical ditambah Horizontal Mirror yang menggabungkan keduanya.");
s.tip("Ambil satu motif tiga nada, misalnya C, E, G. Latih memainkannya lewat semua teknik di atas berurutan. Rekam. Kamu akan kaget betapa banyak variasi dari tiga nada.");

s.h2("4.9 Exotic Scale (Bonus)");
s.body("Exotic scale adalah tangga nada asing. Contohnya melodic minor scale, whole tone scale, dan diminished scale. Melodic Minor Scale dibentuk dari natural minor scale dengan menaikkan nada ke 6 dan ke 7 sebesar setengah nada saat naik, dan kembali ke natural minor saat turun.");
s.figure("f_mm", "Melodic Minor : naik memakai nada 6 dan 7 dinaikkan, turun kembali ke natural minor.");
s.body("Dari C Melodic Minor lahir beberapa scale turunan yang berguna untuk chord dominan dan altered : Dorian b2 untuk chord D7, Lydian Augmented untuk Ebmaj7#5, Lydian Dominant untuk F7, Mixolydian b6 untuk G7, Locrian natural 2 untuk A7b5, dan Super Locrian atau Altered untuk B7b5.");
s.figure("f_wt", "Whole Tone Scale : semua interval satu nada.");
s.figure("f_dimsc", "Diminished Scale : interval bergantian, satu nada lalu setengah nada.");
s.figure("f_alt", "Altered Scale : tangga nada mayor yang tiap nadanya diturunkan setengah.");

s.h2("4.10 Latihan Develop Improve");
s.body("Dalam berlatih improvisasi, yang terpenting adalah terus praktek. Ada 3 tingkat latihan.");
s.rich([["Tingkat 1, BASIC, Berkelanjutan. ", { b: true }], ["Cobalah untuk terus berimprovisasi tanpa henti. Bebas main apa pun, scale atau chord. Langkahnya : pilih sebuah progresi chord, misalnya C, Am, Dm, G lalu diulang. Improvisasi memakai cara apa pun. Kalau bingung, lakukan pengulangan, jangan berhenti. Lalu variasikan secara bertahap, coba pakai eight note swing atau triplet.", {}]]);
s.figure("f_basic", "Latihan Basic : improvisasi terus menerus di satu progresi yang diulang.");
s.rich([["Tingkat 2, INTERMEDIATE, Guide Tone. ", { b: true }], ["Mainkan improvisasi yang diakhiri di guide tone, yaitu nada ke 3 atau ke 7 dari chord utama, tepat sebelum pindah ke chord resolusi. Tujuannya supaya improvisasimu mengikuti resolusi progresi chord. Selalu arahkan akhir frasa ke guide tone, dan fokus memperhatikan chord berikutnya.", {}]]);
s.figure("f_guide", "Tabel guide tone : nada ke 3 dan ke 7 tiap chord dalam progresi.");
s.figure("f_guide_prac", "Latihan Guide Tone : improvisasi di progresi ii V I, akhiri tiap frasa di guide tone.");
s.rich([["Tingkat 3, ADVANCE, Thematic. ", { b: true }], ["Pakai motif ditambah motif development untuk membangun story telling : awal, klimaks, akhir.", {}]]);

/* ---------- LANGKAH PRAKTIS ---------- */
coverSection("", "Langkah Praktis");
s = contentSection();
s.raw(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { line: LINE, lineRule: "auto", before: 120, after: 240 }, children: [new TextRun({ text: "Yang Harus Kamu Lakukan Sekarang", font: FONT, size: SZ_SECT, bold: true })] }));
s.body("Buku ini cuma akan berguna kalau kamu benar benar latihan, bukan cuma dibaca. Latihan yang efektif bukan soal berapa lama, tapi soal caranya. Ini yang aku sarankan.");
s.bullet([
  [["Pecah jadi bagian kecil. ", { b: true }], ["Jangan langsung latihan satu lagu penuh. Fokus ke satu teknik fill in dulu, misalnya cuma RPG Extend, kuasai di satu progresi, baru lanjut.", {}]],
  [["Mulai dari tempo lambat. ", { b: true }], ["Latih lick atau motif baru dengan tempo pelan pakai metronome, baru naikkan bertahap. Kalau kamu bisa main rapi pelan, cepat tinggal waktu.", {}]],
  [["Konsisten, bukan lama. ", { b: true }], ["15 menit tiap hari jauh lebih berpengaruh daripada 2 jam sekali seminggu.", {}]],
  [["Rekam dan catat progresmu. ", { b: true }], ["Rekam improvisasimu, dengar lagi keesokan harinya, lalu tulis satu hal untuk diperbaiki. Besok kamu tahu harus mulai dari mana.", {}]],
]);
s.h2("Peta Latihan 2 Minggu Pertama");
s.body("Kalau kamu bingung mulai dari mana, ikuti urutan ini. Cukup 15 menit sehari.");
s.num([
  "Hari 1 sampai 2 : song improvisation, isi tiap akhir baris satu lagu.",
  "Hari 3 sampai 4 : RPG Extend di C, F, G, polos lalu versi sus2.",
  "Hari 5 sampai 6 : grace note setengah nada pada tiap nada panjang.",
  "Hari 7 : gabungkan ketiganya dalam satu lagu utuh.",
  "Hari 8 sampai 9 : hafal 1 lick, mulai dari Lick 1, latih di 2 kunci.",
  "Hari 10 sampai 11 : tempel lick itu di jeda lagu, lalu coba manipulasi.",
  "Hari 12 sampai 13 : improvisasi 4 bar pakai satu scale, Minor Blues, naik turun.",
  "Hari 14 : rekam satu improvisasi 8 bar pakai motif dan development.",
]);
s.h2("Mau Belajar Lebih Dalam?");
s.body("Kalau kamu ingin melangkah lebih jauh dengan bimbingan langsung, aku mengajak kamu gabung di Akademi Online Musti Musik. Di sini kamu bukan cuma nonton materi, permainanmu dibedah langsung. Beberapa hal yang bakal kamu dapetin.");
s.bullet([
  "Bedah permainan piano-mu secara LIVE langsung sama Dave.",
  "100+ modul belajar piano worship dan gospel, ditambah 200+ modul bonus lainnya (pop, jazz, chord manis, fill in dan improvisasi).",
  "Komunitas eksklusif bersama mentor 24 jam.",
  "Garansi kepuasan. 8 kali submit dan hadir Bedah Piano tapi tidak improve, dana kembali penuh.",
]);
s.body("Spesial buat kamu yang daftar dari buku ini, ada hadiah khusus.", { i: true });
s.body("Hubungi +628567884013 karena slot sangat terbatas.");
s.spacer();
s.body("Terima kasih sudah menemani perjalanan belajar fill in dan improvisasi ini. Aku harap buku ini jadi teman terbaikmu saat latihan, mulai dari isian kecil, sampai kamu berani bercerita lewat improvisasimu sendiri.");
s.spacer(); s.spacer();
s.raw(new Paragraph({ spacing: { line: LINE, lineRule: "auto" }, children: [new TextRun({ text: "Dave Henokh Liong, DipLCM, ALCM", font: FONT, size: SZ_BODY })] }));

/* ---------- TIMESTAMP REFERENCE ---------- */
s = contentSection();
s.sectionTitle("REFERENSI VIDEO & TIMESTAMP");
s.body("Tiap bab di buku ini disusun dari video video berikut. Buka videonya di menit yang tertera untuk melihat contoh audio dan visualnya langsung.");

function tsBlock(bab, rows) {
  s.raw(new Paragraph({ keepNext: true, spacing: { line: LINE, lineRule: "auto", before: 240, after: 40 }, children: [new TextRun({ text: bab, font: FONT, size: SZ_H2, bold: true })] }));
  rows.forEach((r) => {
    s.raw(new Paragraph({ keepNext: true, spacing: { line: LINE, lineRule: "auto", after: 0 }, children: [new TextRun({ text: r[0], font: FONT, size: SZ_BODY, bold: true })] }));
    s.raw(new Paragraph({ keepNext: true, spacing: { line: LINE, lineRule: "auto", after: 0 }, children: [new TextRun({ text: "Tautan : ", font: FONT, size: SZ_BODY }), new TextRun({ text: r[1], font: FONT, size: SZ_BODY, underline: {}, color: "1155CC" })] }));
    s.raw(new Paragraph({ alignment: AlignmentType.JUSTIFIED, spacing: { line: LINE, lineRule: "auto", after: 120 }, children: [new TextRun({ text: r[2], font: FONT, size: SZ_BODY })] }));
  });
}
const V = {
  fill: "https://youtu.be/MOumyCf5-DQ",
  melody: "https://youtu.be/ddvrjTdI9sk",
  licks: "https://youtu.be/TfrYq4mIBD4",
  wlicks: "https://youtu.be/8Mbci8utDKo",
  improve: "https://youtu.be/huuWuIfZ_OQ",
  jazz: "[tautan video Modul Improvisasi Jazz menyusul]",
};
tsBlock("BAB I : Apa Itu Fill In", [
  ["Video Cara Fill In. Menit 00:00 sampai 08:56.", V.fill, "Pengertian fill in, tujuannya, dan 3 pendekatan dasar : song improvisation, theme improvisation, free improvisation."],
]);
tsBlock("BAB II : Cara Fill In Simpel", [
  ["Video Cara Fill In. Menit 08:56 sampai 13:02.", V.fill, "RPG Extend atau broken chord ke atas."],
  ["Video Cara Fill In. Menit 13:02 sampai 16:24.", V.fill, "Grace note atau nada hiasan."],
  ["Video Melodi Improve. Menit 00:00 sampai 04:17.", V.melody, "Ubah ritme, ubah melodi dengan ritme sama, dan fill in between melody."],
]);
tsBlock("BAB III : Dari Fill In ke Improvisasi", [
  ["Video Cara Fill In. Menit 16:24 sampai 29:09.", V.fill, "Pengertian licks, cara mencuri lick, beberapa lick yang sering dipakai, dan praktek di lagu."],
  ["Video Improve in Licks. Menit 00:00 sampai 03:19.", V.licks, "Licks sebagai gabungan scale, chord tone, dan skips leaps. Contoh The Lick."],
  ["Video Worship Licks. Menit 00:00 sampai 09:06.", V.wlicks, "Kumpulan lick worship untuk pemula : lick 1, lick untuk ii dan V, lick ala Korea, lick dari Bill Evans, dan lick pentatonik. Di sini kamu bisa lihat notasi tiap lick."],
]);
tsBlock("BAB IV : Cara Improvisasi Macam-Macam", [
  ["Video How to Improve. Menit 00:00 sampai 02:04.", V.improve, "Pengantar improvisasi : tujuan, dan bahwa improvisasi adalah gabungan melodi, passing note, scale, dan lick."],
  ["Video Modul Improvisasi Jazz. Keseluruhan video.", V.jazz, "Chord improvisation, diatonis up dan down, skips dan leaps, scale dan blues scale, improvise in licks, thematic improvisation, motif development, exotic scale, serta latihan develop improve."],
]);

/* ================= BUILD ================= */
const doc = new Document({
  numbering: {
    config: [{
      reference: "n1",
      levels: [{
        level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.START,
        style: { paragraph: { indent: { left: 460, hanging: 320 } } },
      }],
    }],
  },
  sections,
});
Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync("EBOOK_Fill_In_dan_Improvisasi.docx", buf);
  console.log("written", buf.length, "bytes", "sections", sections.length);
});
