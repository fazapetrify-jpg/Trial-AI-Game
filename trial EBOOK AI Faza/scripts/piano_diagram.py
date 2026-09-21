"""
Generator diagram keyboard piano bergaya slide Musti Musik:
- tombol putih/hitam standar
- tombol yang jadi "guide" (misal 1 oktaf chord) di-highlight merah
- titik hijau = not yang dimainkan, dengan label degree di bawah keyboard

Pakai: python3 piano_diagram.py
Semua diagram buku "Fill In & Variasi" didefinisikan di bagian bawah file ini.
"""

import os

WHITE_W = 60
WHITE_H = 220
BLACK_W = 36
BLACK_H = 135

# posisi tombol putih dalam satu oktaf (index 0-6 = C D E F G A B)
WHITE_NOTE_NAMES = ["C", "D", "E", "F", "G", "A", "B"]
# tombol hitam ada di antara index putih tertentu (setelah putih ke berapa), None kalau ga ada
BLACK_AFTER = {0: "C#", 1: "D#", 3: "F#", 4: "G#", 5: "A#"}

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "assets", "fill-in")


def build_keys(n_octaves=1, start_octave=0):
    """Return list of dict: {name, kind(white/black), x, w, h}"""
    keys = []
    white_x = 0
    white_positions = {}  # (octave, note) -> x
    for oct_i in range(n_octaves):
        for i, note in enumerate(WHITE_NOTE_NAMES):
            white_positions[(oct_i, note)] = white_x
            keys.append({
                "name": f"{note}{oct_i}",
                "kind": "white",
                "x": white_x,
                "w": WHITE_W,
                "h": WHITE_H,
            })
            white_x += WHITE_W
    # tombol terakhir (C oktaf berikutnya) biar keyboard nutup rapi
    keys.append({"name": f"C{n_octaves}", "kind": "white", "x": white_x, "w": WHITE_W, "h": WHITE_H})

    for oct_i in range(n_octaves):
        for i, black_name in BLACK_AFTER.items():
            wx = white_positions[(oct_i, WHITE_NOTE_NAMES[i])]
            bx = wx + WHITE_W - BLACK_W / 2
            keys.append({
                "name": f"{black_name}{oct_i}",
                "kind": "black",
                "x": bx,
                "w": BLACK_W,
                "h": BLACK_H,
            })
    total_w = white_x + WHITE_W
    return keys, total_w


def render_diagram(filename, title, highlight_names, dot_notes, n_octaves=1, subtitle=""):
    """
    highlight_names: list nama tombol (mis. ["D0","C0"]) yang di-fill merah (guide range)
    dot_notes: list of (nama_tombol, label) yang dikasih titik hijau + label degree di bawah
    """
    keys, total_w = build_keys(n_octaves=n_octaves)
    pad = 30
    top_pad = 70 if title else 20
    bottom_pad = 60
    W = total_w + pad * 2
    H = WHITE_H + top_pad + bottom_pad

    svg = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" font-family="Arial, sans-serif">']
    svg.append(f'<rect x="0" y="0" width="{W}" height="{H}" fill="#ffffff"/>')

    if title:
        svg.append(f'<text x="{pad}" y="34" font-size="26" font-weight="700" fill="#111111">{title}</text>')
    if subtitle:
        svg.append(f'<text x="{pad}" y="58" font-size="16" fill="#444444">{subtitle}</text>')

    # gambar tombol putih dulu
    for k in keys:
        if k["kind"] != "white":
            continue
        x = k["x"] + pad
        y = top_pad
        fill = "#e6483c" if k["name"] in highlight_names else "#ffffff"
        svg.append(
            f'<rect x="{x}" y="{y}" width="{k["w"]}" height="{k["h"]}" '
            f'fill="{fill}" stroke="#222222" stroke-width="2"/>'
        )

    # tombol hitam di atasnya
    for k in keys:
        if k["kind"] != "black":
            continue
        x = k["x"] + pad
        y = top_pad
        fill = "#e6483c" if k["name"] in highlight_names else "#1a1a1a"
        svg.append(
            f'<rect x="{x}" y="{y}" width="{k["w"]}" height="{k["h"]}" '
            f'fill="{fill}" stroke="#000000" stroke-width="1.5"/>'
        )

    # titik hijau + label
    key_lookup = {k["name"]: k for k in keys}
    for note_name, label in dot_notes:
        k = key_lookup[note_name]
        cx = k["x"] + pad + k["w"] / 2
        if k["kind"] == "white":
            cy = top_pad + k["h"] - 34
        else:
            cy = top_pad + k["h"] - 24
        svg.append(f'<circle cx="{cx}" cy="{cy}" r="11" fill="#2e9e4f" stroke="#ffffff" stroke-width="2"/>')
        svg.append(
            f'<text x="{cx}" y="{top_pad + WHITE_H + 30}" font-size="18" font-weight="700" '
            f'text-anchor="middle" fill="#111111">{label}</text>'
        )

    svg.append("</svg>")
    os.makedirs(OUT_DIR, exist_ok=True)
    path = os.path.join(OUT_DIR, filename)
    with open(path, "w") as f:
        f.write("\n".join(svg))
    print("wrote", path)


if __name__ == "__main__":
    # === BAB II: Inner Voice — 4 contoh chord (generik, di kunci C, bukan dari lagu tertentu) ===
    render_diagram(
        "inner-voice-IIm.svg",
        "Chord IIm (Dm)",
        highlight_names=["D0"],
        dot_notes=[("D0", "1"), ("C1", "7"), ("A#0", "7b")],
        n_octaves=1,
        subtitle="1 - 7 - 7b",
    )
    render_diagram(
        "inner-voice-I.svg",
        "Chord I (C)",
        highlight_names=["C0"],
        dot_notes=[("G0", "5"), ("F0", "6b"), ("F#0", "6")],
        n_octaves=1,
        subtitle="5 - 6b - 6",
    )
    render_diagram(
        "inner-voice-VIm.svg",
        "Chord VIm (Am)",
        highlight_names=["A0"],
        dot_notes=[("A0", "1"), ("G#0", "7"), ("G0", "7b")],
        n_octaves=1,
        subtitle="1 - 7 - 7b",
    )
    render_diagram(
        "inner-voice-IV.svg",
        "Chord IV (F)",
        highlight_names=["F0"],
        dot_notes=[("C1", "5"), ("A#0", "6b"), ("B0", "6")],
        n_octaves=1,
        subtitle="5 - 6b - 6",
    )

    # === BAB IV: RPG/Arpeggio Extend — ilustrasi arpeggio C mayor naik ===
    render_diagram(
        "arpeggio-extend-c.svg",
        "Arpeggio Extend — Chord C",
        highlight_names=["C0"],
        dot_notes=[("C0", "1"), ("E0", "3"), ("G0", "5"), ("C1", "1'"), ("D1", "2'")],
        n_octaves=2,
        subtitle="1 - 3 - 5 - 1' - 2' (naik terus ke atas)",
    )

    # === BAB V: Passing Tone — chromatic vs diatonic, contoh C ke Am ===
    render_diagram(
        "passing-tone-chromatic.svg",
        "Chromatic Passing Tone",
        highlight_names=[],
        dot_notes=[("C0", "C"), ("B0", "not kromatik"), ("A0", "Am")],
        n_octaves=1,
        subtitle="C -> B (setengah nada di bawah) -> Am",
    )
