import os, json
from PIL import Image, ImageDraw, ImageFont

OUT = "img2"
os.makedirs(OUT, exist_ok=True)

REG = r"C:\Windows\Fonts\arial.ttf"
BLD = r"C:\Windows\Fonts\arialbd.ttf"
def f(sz, bold=False):
    return ImageFont.truetype(BLD if bold else REG, sz)

INK = (26, 26, 26)
YEL = (245, 185, 66)
RED = (196, 30, 30)
BORD = (120, 120, 120)
BG = (255, 255, 255)
GREY = (240, 240, 240)

def new(w, h):
    im = Image.new("RGB", (w, h), BG)
    return im, ImageDraw.Draw(im)

def wrap(draw, text, font, maxw):
    words = text.split()
    lines, cur = [], ""
    for w in words:
        t = (cur + " " + w).strip()
        if draw.textlength(t, font=font) <= maxw:
            cur = t
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines

def box(draw, x, y, w, h, title, body=None, accent=INK, fill=BG):
    draw.rounded_rectangle([x, y, x + w, y + h], radius=16, fill=fill, outline=BORD, width=3)
    draw.rounded_rectangle([x, y, x + w, y + 54], radius=16, fill=accent)
    draw.rectangle([x, y + 30, x + w, y + 54], fill=accent)
    tf = f(24, True)
    for i, ln in enumerate(wrap(draw, title, tf, w - 28)):
        draw.text((x + 14, y + 12 + i * 28), ln, font=tf, fill=BG if accent != YEL else INK)
    if body:
        bf = f(21)
        yy = y + 68
        for para in body:
            for ln in wrap(draw, para, bf, w - 28):
                draw.text((x + 14, yy), ln, font=bf, fill=INK)
                yy += 27
            yy += 6

def arrow(draw, x1, y1, x2, y2, col=RED, wd=6):
    draw.line([x1, y1, x2, y2], fill=col, width=wd)
    import math
    ang = math.atan2(y2 - y1, x2 - x1)
    L = 20
    for da in (2.6, -2.6):
        draw.line([x2, y2, x2 - L * math.cos(ang + da), y2 - L * math.sin(ang + da)], fill=col, width=wd)

man = {}
def save(im, key):
    p = os.path.join(OUT, key + ".png")
    im.save(p, optimize=True)
    man[key] = {"path": p.replace("\\", "/"), "w": im.size[0], "h": im.size[1]}

# ---------- D1 : 6 langkah bikin deck ----------
im, d = new(1400, 560)
steps = [
    ("1. Brief", ["Rundown acara, materi mentah", "(boleh berantakan), audiens."]),
    ("2. Style Guide", ["Sekali di depan: warna, font,", "pola layout, aturan logo."]),
    ("3. Bullet Outline", ["1 bullet = 1 slide.", "Dikoreksi bolak balik."]),
    ("4. Naskah Lengkap", ["Tiap slide ditulis kata per", "kata di Word atau MD."]),
    ("5. Generate", ["Claude tulis 1 script Node", "(pptxgenjs) yang output .pptx."]),
    ("6. Review & Regenerate", ["Koreksi di naskah, build", "ulang, ulangi."]),
]
bw, bh, gx, gy = 420, 210, 40, 40
for i, (t, b) in enumerate(steps):
    r, c = divmod(i, 3)
    x = 30 + c * (bw + gx)
    y = 30 + r * (bh + gy + 24)
    box(d, x, y, bw, bh, t, b, accent=(YEL if i % 2 == 0 else INK))
    if c < 2:
        arrow(d, x + bw + 4, y + bh // 2, x + bw + gx - 4, y + bh // 2)
    elif r == 0:
        # L connector: down from box 3, left across, into box 4
        y2 = y + bh + gy + 24
        d.line([x + bw // 2, y + bh + 4, x + bw // 2, y + bh + 34], fill=RED, width=6)
        d.line([x + bw // 2, y + bh + 34, 30 + bw // 2, y + bh + 34], fill=RED, width=6)
        arrow(d, 30 + bw // 2, y + bh + 34, 30 + bw // 2, y2 - 4)
save(im, "d_pipeline")

# ---------- D2 : konten vs desain ----------
im, d = new(1400, 570)
box(d, 40, 40, 560, 120, "KONTEN (hidup di dokumen)", ["Bullet outline lalu naskah lengkap.", "Ganti konten = edit teks."], accent=YEL)
box(d, 800, 40, 560, 120, "DESAIN (hidup di script)", ["Fungsi tipe slide di build_deck.js.", "Ganti tampilan = edit fungsi."], accent=INK)
box(d, 420, 260, 560, 110, "build_deck.js", ["Node + pptxgenjs. Gabungkan konten", "dan desain jadi satu file .pptx."], accent=(60, 60, 60))
box(d, 420, 450, 560, 100, "File .pptx jadi", ["Dibuka di PowerPoint untuk QA", "visual dan edit akhir."], accent=(60, 60, 60))
arrow(d, 320, 160, 540, 258)
arrow(d, 1080, 160, 860, 258)
arrow(d, 700, 372, 700, 448)
save(im, "d_split")

# ---------- D3 : arsitektur game ----------
im, d = new(1400, 540)
box(d, 40, 30, 620, 230, "MESIN GENERIK (kode)", [
    "Audio engine (Web Audio API, osilator).",
    "Logika soal: interval, chord, progresi.",
    "UI dan state (localStorage, tanpa server).",
    "Alur trainer lagu yang lagu-agnostik.",
], accent=INK)
box(d, 740, 30, 620, 230, "DATA TERPISAH (konfig / JSON)", [
    "Bank soal ear training.",
    "Data per lagu: nada dasar, bagian,",
    "progresi angka romawi, terjemahan chord,",
    "pola iringan cocok dan tidak cocok.",
], accent=YEL)
box(d, 420, 380, 560, 130, "SATU WEB APP", [
    "Ganti lagu = ganti data saja,", "logika tidak disentuh.",
], accent=(60, 60, 60))
arrow(d, 350, 262, 600, 372)
arrow(d, 1050, 262, 800, 372)
save(im, "d_game_arch")

# ---------- D4 : alur trainer lagu ----------
tsteps = [
    "1. User pilih 1 lagu dari daftar.",
    "2. Dengarkan referensi, tebak nada dasar. Salah tidak lanjut, ada petunjuk bertahap.",
    "3. Fokus di cara mengiringi, bukan melodi atau lirik.",
    "4. Per bagian: isi progresi angka romawi yang disembunyikan (acak 70 persen).",
    "5. Tampilkan semua progresi sekaligus, minta terjemahkan ke nama chord asli.",
    "6. Pilih pola iringan yang paling cocok dari beberapa opsi (benar dan salah).",
    "7. Skor gabungan semua tahap plus rekap jawaban benar. Bisa ganti nada dasar, chord otomatis dihitung ulang.",
]
bw = 1120
bf = f(23)
_tmp = Image.new("RGB", (10, 10)); _td = ImageDraw.Draw(_tmp)
heights = []
for t in tsteps:
    heights.append(24 + len(wrap(_td, t, bf, bw - 30)) * 30)
CANH = 30 + sum(heights) + 34 * (len(tsteps) - 1) + 30
im, d = new(1200, CANH)
y = 30
for i, t in enumerate(tsteps):
    lines = wrap(d, t, bf, bw - 30)
    bh = heights[i]
    d.rounded_rectangle([40, y, 40 + bw, y + bh], radius=14, fill=(GREY if i % 2 else BG), outline=BORD, width=3)
    for j, ln in enumerate(lines):
        d.text((58, y + 14 + j * 30), ln, font=bf, fill=INK)
    if i < len(tsteps) - 1:
        arrow(d, 40 + bw // 2, y + bh + 4, 40 + bw // 2, y + bh + 32, wd=6)
    y += bh + 34
save(im, "d_trainer_flow")

# ---------- D5 : anatomi prompt yang baik ----------
parts = [
    ("1. Konteks", "Rundown, materi mentah, audiens, contoh gaya yang sudah ada."),
    ("2. Aturan & logika", "Style guide untuk deck. Spesifikasi fitur dan aturan main untuk game."),
    ("3. Batasan", "Apa yang tidak boleh: jangan reproduksi lirik, jangan ubah logika, dst."),
    ("4. Instruksi tahan diri", "\"Pelajari dulu, jangan generate apa apa.\""),
    ("5. Iterasi", "Koreksi ditulis di dokumen sumber, bukan minta bikin ulang."),
]
bw = 1120
bf = f(23); tf2 = f(25, True)
_t = Image.new("RGB", (10, 10)); _d = ImageDraw.Draw(_t)
hs = [22 + 34 + len(wrap(_d, p[1], bf, bw - 40)) * 30 for p in parts]
CH = 30 + sum(hs) + 30 * (len(parts) - 1) + 30
im, d = new(1200, CH)
y = 30
for i, (t, b) in enumerate(parts):
    bh = hs[i]
    acc = YEL if i % 2 == 0 else INK
    d.rounded_rectangle([40, y, 40 + bw, y + bh], radius=14, fill=BG, outline=BORD, width=3)
    d.rounded_rectangle([40, y, 46, y + bh], radius=0, fill=acc)
    d.text((64, y + 12), t, font=tf2, fill=INK)
    for j, ln in enumerate(wrap(d, b, bf, bw - 44)):
        d.text((64, y + 12 + 34 + j * 30), ln, font=bf, fill=(60, 60, 60))
    if i < len(parts) - 1:
        arrow(d, 40 + bw // 2, y + bh + 3, 40 + bw // 2, y + bh + 26, wd=5)
    y += bh + 30
save(im, "d_prompt")

# ---------- D6 : anatomi satu slide di naskah ----------
im, d = new(1360, 620)
rows = [
    ("Slide 12 . content", "nomor slide + tipe slide", (150, 150, 150)),
    ("Judul biasa  [kata disorot]", "judul; kata dalam kurung siku masuk kotak kuning", INK),
    ("> Kalimat pertama, frasa penting merah.", "kalimat 1, dibuat bold, frasa penting merah", RED),
    ("Paragraf berikutnya, normal.", "paragraf isi, teks normal", (90, 90, 90)),
    ("( catatan foto / diagram / aset )", "instruksi aset, jadi placeholder kalau belum ada", (120, 120, 120)),
]
y = 40
lf = f(24, True); sf = f(20)
for txt, note, col in rows:
    d.rounded_rectangle([40, y, 780, y + 92], radius=12, fill=GREY, outline=BORD, width=3)
    d.text((58, y + 30), txt, font=lf, fill=col)
    d.line([788, y + 46, 808, y + 46], fill=(150, 150, 150), width=3)
    for j, ln in enumerate(wrap(d, note, sf, 520)):
        d.text((818, y + 24 + j * 26), ln, font=sf, fill=(70, 70, 70))
    y += 110
save(im, "d_naskah")

with open("img2_manifest.json", "w", encoding="utf-8") as fh:
    json.dump(man, fh, indent=1)
print("diagrams:", list(man.keys()))
