"""Audit DOCX typography and count *rendered* pages, never page breaks."""

from __future__ import annotations

import shutil
import subprocess
import uuid
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET

from docx import Document


def audit_style(path: Path) -> list[str]:
    doc = Document(path)
    problems = []
    section = doc.sections[0]
    if abs(section.page_width.inches - 5.827) > 0.02 or abs(section.page_height.inches - 8.268) > 0.02:
        problems.append("Page is not A5")
    for name in ("Normal", "Book Section", "Book Subheading", "Chapter Number", "Chapter Title", "Heading 1", "Heading 2"):
        style = doc.styles[name]
        if style.font.name != "Montserrat":
            problems.append(f"{name} is not Montserrat")
        if name != "Normal" and str(style.font.color.rgb) != "000000":
            problems.append(f"{name} is not black")
    if doc.styles["Normal"].font.size.pt != 11:
        problems.append("Body text is not 11 pt")
    if doc.styles["Normal"].paragraph_format.line_spacing != 1.5:
        problems.append("Body line spacing is not 1.5")
    with zipfile.ZipFile(path) as package:
        embedded = [name for name in package.namelist() if name.startswith("word/fonts/") and name.endswith(".odttf")]
        if len(embedded) < 2:
            problems.append("Montserrat Regular and Bold are not embedded")
        settings = ET.fromstring(package.read("word/settings.xml"))
        w = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
        if settings.find(f"{{{w}}}embedTrueTypeFonts") is None:
            problems.append("Embedded font setting is missing")
    return problems


def rendered_page_count(path: Path, render_dir: Path) -> tuple[int, Path]:
    soffice = shutil.which("soffice") or shutil.which("libreoffice")
    if not soffice:
        raise RuntimeError(
            "Cannot verify physical page count: LibreOffice (soffice) is not on PATH. "
            "Install it, then rerun with --max-pages. Page-break counting is not a substitute."
        )
    try:
        from pypdf import PdfReader
    except ImportError as exc:
        raise RuntimeError("Install generator/requirements.txt to count rendered PDF pages") from exc
    render_dir = render_dir / uuid.uuid4().hex
    render_dir.mkdir(parents=True, exist_ok=True)
    profile_uri = (render_dir / "profile").resolve().as_uri()
    subprocess.run(
        [soffice, f"-env:UserInstallation={profile_uri}", "--headless", "--convert-to",
         "pdf", "--outdir", str(render_dir), str(path)],
        check=True, capture_output=True, text=True, timeout=180,
    )
    pdf = render_dir / (path.stem + ".pdf")
    if not pdf.is_file():
        raise RuntimeError("LibreOffice did not produce a PDF")
    return len(PdfReader(str(pdf)).pages), pdf
