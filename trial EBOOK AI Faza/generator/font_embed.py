"""Embed SIL OFL Montserrat faces as OOXML obfuscated font parts.

The bundled static TTFs were generated from Google Fonts' Montserrat variable
font at weights 400 and 700. OFL.txt is included beside the font files.
"""

from __future__ import annotations

import os
import uuid
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET

W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
R = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
REL = "http://schemas.openxmlformats.org/package/2006/relationships"
CT = "http://schemas.openxmlformats.org/package/2006/content-types"
FONT_REL = R + "/font"
CONTENT_TYPE = "application/vnd.openxmlformats-officedocument.obfuscatedFont"
FONTS = Path(__file__).parent / "fonts"


def obfuscate(ttf: bytes, guid: uuid.UUID) -> bytes:
    if len(ttf) < 32:
        raise ValueError("Font file is too short")
    key = guid.bytes[::-1]
    data = bytearray(ttf)
    for i in range(32):
        data[i] ^= key[i % 16]
    return bytes(data)


def embed_montserrat(docx_path: Path) -> None:
    regular = (FONTS / "Montserrat-Regular.ttf").read_bytes()
    bold = (FONTS / "Montserrat-Bold.ttf").read_bytes()
    if not (FONTS / "OFL.txt").is_file():
        raise FileNotFoundError("Montserrat OFL licence is missing")
    path = Path(docx_path)
    with zipfile.ZipFile(path) as package:
        content = {name: package.read(name) for name in package.namelist()}

    font_table = ET.fromstring(content["word/fontTable.xml"])
    font = next((x for x in font_table.findall(f"{{{W}}}font") if x.get(f"{{{W}}}name") == "Montserrat"), None)
    if font is None:
        font = ET.SubElement(font_table, f"{{{W}}}font", {f"{{{W}}}name": "Montserrat"})
    for tag in ("embedRegular", "embedBold"):
        for old in font.findall(f"{{{W}}}{tag}"):
            font.remove(old)

    rel_path = "word/_rels/fontTable.xml.rels"
    rels = ET.fromstring(content[rel_path]) if rel_path in content else ET.Element(f"{{{REL}}}Relationships")
    used = {x.get("Id") for x in rels}
    for face, ttf, element_name in (
        ("Regular", regular, "embedRegular"),
        ("Bold", bold, "embedBold"),
    ):
        n = 1
        while f"rId{n}" in used:
            n += 1
        rid = f"rId{n}"
        used.add(rid)
        guid = uuid.uuid4()
        filename = f"Montserrat-{face}-{guid.hex}.odttf"
        content[f"word/fonts/{filename}"] = obfuscate(ttf, guid)
        ET.SubElement(rels, f"{{{REL}}}Relationship", {
            "Id": rid,
            "Type": FONT_REL,
            "Target": f"fonts/{filename}",
        })
        ET.SubElement(font, f"{{{W}}}{element_name}", {
            f"{{{R}}}id": rid,
            f"{{{W}}}fontKey": "{" + str(guid).upper() + "}",
            f"{{{W}}}subsetted": "0",
        })

    content["word/fontTable.xml"] = ET.tostring(font_table, encoding="utf-8", xml_declaration=True)
    content[rel_path] = ET.tostring(rels, encoding="utf-8", xml_declaration=True)
    settings = ET.fromstring(content["word/settings.xml"])
    if settings.find(f"{{{W}}}embedTrueTypeFonts") is None:
        ET.SubElement(settings, f"{{{W}}}embedTrueTypeFonts")
    content["word/settings.xml"] = ET.tostring(settings, encoding="utf-8", xml_declaration=True)
    types = ET.fromstring(content["[Content_Types].xml"])
    if not any(x.get("Extension") == "odttf" for x in types.findall(f"{{{CT}}}Default")):
        ET.SubElement(types, f"{{{CT}}}Default", {"Extension": "odttf", "ContentType": CONTENT_TYPE})
    content["[Content_Types].xml"] = ET.tostring(types, encoding="utf-8", xml_declaration=True)

    temporary = path.with_name(path.name + ".fonttmp")
    try:
        with zipfile.ZipFile(temporary, "w", compression=zipfile.ZIP_DEFLATED) as output:
            for name, data in content.items():
                output.writestr(name, data)
        os.replace(temporary, path)
    finally:
        if temporary.exists():
            temporary.unlink()
