import os, json
from PIL import Image

SRC = "img"
OUT = "img_crop"
os.makedirs(OUT, exist_ok=True)

# id -> source png basename (without .png)
PAGES = {
    "f_chord": "jazz-14",
    "f_diaud": "jazz-17",
    "f_skips": "jazz-20",
    "f_blues_maj": "jazz-45",
    "f_blues_min": "jazz-46",
    "f_tips_updown": "jazz-47",
    "f_lick_the": "jazz-51",
    "f_lick_6th": "jazz-52",
    "f_lick_tri": "jazz-53",
    "f_basic": "jazz-60",
    "f_guide_prac": "jazz-63",
    "f_kurva": "jazz-67",
    "f_md_rep": "jazz-71",
    "f_md_seq": "jazz-72",
    "f_md_oct": "jazz-73",
    "f_md_exp": "jazz-74",
    "f_md_con": "jazz-75",
    "f_md_ext": "jazz-76",
    "f_md_tru": "jazz-77",
    "f_md_aug": "jazz-78",
    "f_md_dim": "jazz-79",
    "f_md_hmir": "jazz-81",
    "f_mm": "jazz-88",
    "f_wt": "jazz-96",
    "f_dimsc": "jazz-97",
    "f_alt": "jazz-95",
    "f_guide": "jazz-61",
}

# crop fractions: left, top, right, bottom (of the removed border)
L, T, R, B = 0.015, 0.010, 0.015, 0.060

manifest = {}
for key, base in PAGES.items():
    p = os.path.join(SRC, base + ".png")
    im = Image.open(p).convert("RGB")
    w, h = im.size
    box = (int(w * L), int(h * T), int(w * (1 - R)), int(h * (1 - B)))
    im2 = im.crop(box)
    outp = os.path.join(OUT, key + ".png")
    im2.save(outp, optimize=True)
    manifest[key] = {"path": outp.replace("\\", "/"), "w": im2.size[0], "h": im2.size[1]}

with open("img_manifest.json", "w", encoding="utf-8") as f:
    json.dump(manifest, f, indent=1)
print("cropped", len(manifest), "images")
total = sum(os.path.getsize(v["path"]) for v in manifest.values())
print("total bytes", total)
