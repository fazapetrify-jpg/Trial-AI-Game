#!/usr/bin/env python3
"""Markdown -> styled HTML -> PDF (via WeasyPrint), with real embedded Montserrat.
Mirrors the layout conventions of build_guideline.js (the docx generator) so both
outputs look consistent: A5 page, justified body with first-line indent, BAB cover
pages, section-title pages, Tips Aplikasi lines, real hyperlinks, content-width images.
"""
import sys, os, re, html as htmlmod

MD_PATH = sys.argv[1]
OUT_PATH = sys.argv[2]
BASE_DIR = os.path.dirname(os.path.abspath(MD_PATH))

FONT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "assets", "fonts")

with open(MD_PATH, encoding="utf-8") as f:
    lines = f.read().split("\n")

def esc(s):
    return htmlmod.escape(s, quote=False)

INLINE_LINK = re.compile(r"\*\*(https?://\S+)\*\*")
BOLD = re.compile(r"\*\*(.+?)\*\*")
ITAL = re.compile(r"(?<!\*)\*([^*]+)\*(?!\*)")

def parse_inline(text):
    text = esc(text)
    # links first (bare bold url)
    text = INLINE_LINK.sub(lambda m: f'<a href="{m.group(1)}">{m.group(1)}</a>', text)
    text = BOLD.sub(lambda m: f"<strong>{m.group(1)}</strong>", text)
    text = ITAL.sub(lambda m: f"<em>{m.group(1)}</em>", text)
    text = text.replace("`", "")
    return text

out = []
out.append("""<!DOCTYPE html><html><head><meta charset="utf-8"/><style>
@font-face { font-family: 'Montserrat'; src: url('file://__FONTDIR__/montserrat_final_Regular.ttf'); font-weight: 400; font-style: normal; }
@font-face { font-family: 'Montserrat'; src: url('file://__FONTDIR__/montserrat_final_Bold.ttf'); font-weight: 700; font-style: normal; }
@font-face { font-family: 'Montserrat'; src: url('file://__FONTDIR__/montserrat_final_Italic.ttf'); font-weight: 400; font-style: italic; }
@font-face { font-family: 'Montserrat'; src: url('file://__FONTDIR__/montserrat_final_BoldItalic.ttf'); font-weight: 700; font-style: italic; }
@page { size: 5.83in 8.27in; margin: 0.75in; }
* { font-family: 'Montserrat', sans-serif; box-sizing: border-box; }
body { font-size: 11pt; line-height: 1.5; color: #111; }
p { margin: 0 0 8pt 0; text-align: justify; text-indent: 0.24in; }
p.noindent { text-indent: 0; }
h1 { font-size: 14pt; margin: 18pt 0 6pt 0; page-break-inside: avoid; }
h2 { font-size: 12pt; margin: 12pt 0 3pt 0; page-break-inside: avoid; }
.cover { page-break-before: always; display: flex; flex-direction: column; justify-content: center; align-items: center; min-height: 6.7in; text-align: center; }
.cover .no { font-size: 25pt; font-weight: 700; margin-bottom: 6pt; }
.cover .title { font-size: 18pt; }
.cover .subtitle { font-size: 10pt; font-style: italic; margin-top: 10pt; }
.section-title { page-break-before: always; text-align: center; font-size: 14pt; font-weight: 700; margin: 40pt 0; }
.tip { margin: 8pt 0; text-align: justify; }
.tip strong.label { }
ul, ol { margin: 0 0 8pt 0.3in; padding: 0; }
li { margin-bottom: 4pt; text-align: justify; }
a { color: #1155CC; text-decoration: underline; }
table { border-collapse: collapse; width: 100%; margin: 10pt 0; font-size: 9pt; }
td, th { border: 1px solid #999; padding: 4pt 6pt; text-align: left; vertical-align: top; }
img { max-width: 100%; display: block; margin: 10pt auto; }
img.author-photo { max-width: 38%; margin: 10pt 0; }
.caption { text-align: center; font-size: 9pt; font-style: italic; margin-top: -4pt; margin-bottom: 10pt; }
.checklist { margin: 0 0 8pt 0.1in; }
.checklist li { list-style: none; margin-bottom: 4pt; }
</style></head><body>""".replace("__FONTDIR__", FONT_DIR))

i = 0
n = len(lines)
title_seen = False
in_list = None  # 'ul' or 'ol'

def close_list():
    global in_list
    if in_list:
        tag = "ul" if in_list in ("ul", "ul-check") else in_list
        out.append(f"</{tag}>")
        in_list = None

while i < n:
    line = lines[i]

    m = re.match(r"^#\s+(.*)$", line)
    if m and not title_seen:
        title_seen = True
        title = m.group(1)
        j = i + 1
        while j < n and lines[j].strip() == "":
            j += 1
        subtitle = None
        if j < n:
            sm = re.match(r"^\*([^*].*[^*]|[^*])\*$", lines[j].strip())
            if sm:
                subtitle = sm.group(1)
                j += 1
        close_list()
        out.append(f'<div class="cover"><div class="title">{esc(title)}</div>')
        if subtitle:
            out.append(f'<div class="subtitle">{parse_inline(subtitle)}</div>')
        out.append("</div>")
        while j < n and not re.match(r"^#{1,4}\s", lines[j]):
            j += 1
        i = j
        continue

    m = re.match(r"^##\s+(BAB\s+[IVXLC]+)\s*:\s*(.*)$", line)
    if m:
        close_list()
        out.append(f'<div class="cover"><div class="no">{esc(m.group(1))}</div><div class="title">{esc(m.group(2))}</div></div>')
        out.append(f"<h1>{esc(m.group(2))}</h1>")
        i += 1
        continue

    m = re.match(r"^#\s+(.*)$", line)
    if m:
        close_list()
        out.append(f'<div class="section-title">{esc(m.group(1).upper())}</div>')
        i += 1
        continue

    m = re.match(r"^##\s+(.*)$", line)
    if m:
        close_list()
        out.append(f'<div class="section-title">{esc(m.group(1).upper())}</div>')
        i += 1
        continue

    m = re.match(r"^###\s+(.*)$", line)
    if m:
        close_list()
        out.append(f"<h1>{parse_inline(m.group(1))}</h1>")
        i += 1
        continue

    m = re.match(r"^####\s+(.*)$", line)
    if m:
        close_list()
        out.append(f"<h2>{parse_inline(m.group(1))}</h2>")
        i += 1
        continue

    m = re.match(r"^!\[([^\]]*)\]\(([^)]+)\)\s*$", line)
    if m:
        close_list()
        alt, relpath = m.group(1), m.group(2)
        abspath = os.path.join(BASE_DIR, relpath)
        src = "file://" + abspath
        if alt.strip().lower() == "author-photo":
            out.append(f'<img class="author-photo" src="{src}"/>')
        else:
            out.append(f'<img src="{src}"/>')
            if alt:
                out.append(f'<div class="caption">{esc(alt)}</div>')
        i += 1
        continue

    # table
    if line.strip().startswith("|") and i + 1 < n and re.match(r"^\s*\|?\s*-{2,}", lines[i+1]):
        close_list()
        def parse_row(l):
            return [c.strip() for c in l.strip().strip("|").split("|")]
        header = parse_row(line)
        j = i + 2
        rows = []
        while j < n and lines[j].strip().startswith("|"):
            rows.append(parse_row(lines[j])); j += 1
        out.append("<table><thead><tr>" + "".join(f"<th>{parse_inline(c)}</th>" for c in header) + "</tr></thead><tbody>")
        for r in rows:
            out.append("<tr>" + "".join(f"<td>{parse_inline(c)}</td>" for c in r) + "</tr>")
        out.append("</tbody></table>")
        i = j
        continue

    if line.strip() == "---":
        i += 1
        continue

    # checklist items "- [ ] text"
    m = re.match(r"^-\s+\[ \]\s+(.*)$", line)
    if m:
        if in_list != "ul-check":
            close_list()
            out.append('<ul class="checklist">')
            in_list = "ul-check"
        out.append(f"<li>☐ {parse_inline(m.group(1))}</li>")
        i += 1
        continue

    m = re.match(r"^\d+\.\s+(.*)$", line)
    if m:
        if in_list != "ol":
            close_list()
            out.append("<ol>")
            in_list = "ol"
        out.append(f"<li>{parse_inline(m.group(1))}</li>")
        i += 1
        continue

    m = re.match(r"^[-*]\s+(.*)$", line)
    if m:
        if in_list != "ul":
            close_list()
            out.append("<ul>")
            in_list = "ul"
        out.append(f"<li>{parse_inline(m.group(1))}</li>")
        i += 1
        continue

    if line.strip() == "":
        i += 1
        continue

    close_list()
    if line.strip().startswith("**Tips Aplikasi**:"):
        rest = line.strip()[len("**Tips Aplikasi**:"):].strip()
        out.append(f'<p class="tip"><strong>Tips Aplikasi:</strong> {parse_inline(rest)}</p>')
        i += 1
        continue

    m = re.match(r"^\*\*(https?://\S+)\*\*$", line.strip())
    if m:
        out.append(f'<p class="noindent"><a href="{m.group(1)}">{esc(m.group(1))}</a></p>')
        i += 1
        continue

    out.append(f"<p>{parse_inline(line)}</p>")
    i += 1

close_list()
out.append("</body></html>")

html_content = "\n".join(out)
with open(OUT_PATH.replace(".pdf", ".html"), "w", encoding="utf-8") as f:
    f.write(html_content)

from weasyprint import HTML
HTML(string=html_content, base_url=BASE_DIR).write_pdf(OUT_PATH)
print("written", OUT_PATH)
