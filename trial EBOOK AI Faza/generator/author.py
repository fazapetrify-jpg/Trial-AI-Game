"""Grounded transcript -> structured Indonesian handbook manuscript."""

from __future__ import annotations

import json
import os

from book import validate_manuscript


def _chunks(text: str, limit: int = 14000) -> list[str]:
    paragraphs = [p.strip() for p in text.splitlines() if p.strip()]
    result, current = [], ""
    for paragraph in paragraphs:
        if len(current) + len(paragraph) + 1 > limit and current:
            result.append(current)
            current = ""
        if len(paragraph) > limit:
            for start in range(0, len(paragraph), limit):
                part = paragraph[start:start + limit]
                if current:
                    result.append(current)
                    current = ""
                result.append(part)
        else:
            current += ("\n" if current else "") + paragraph
    if current:
        result.append(current)
    return result


def _json(client, model: str, instruction: str, material: str) -> dict:
    response = client.responses.create(
        model=model,
        store=False,
        input=[
            {"role": "system", "content": instruction},
            {"role": "user", "content": material},
        ],
        text={"format": {"type": "json_object"}},
    )
    if not response.output_text:
        raise RuntimeError("AI returned an empty response")
    return json.loads(response.output_text)


def generate_manuscript(transcript: str, *, title: str, model: str = "gpt-4.1-mini",
                        max_chapters: int = 7, client=None) -> dict:
    if len(transcript.strip()) < 200:
        raise ValueError("Transcript is too short to make a grounded book")
    if client is None:
        if not os.environ.get("OPENAI_API_KEY"):
            raise RuntimeError("OPENAI_API_KEY is required to turn a transcript into a manuscript")
        try:
            from openai import OpenAI
        except ImportError as exc:
            raise RuntimeError("Install generator/requirements.txt for AI authoring") from exc
        client = OpenAI()

    note_sets = []
    for number, chunk in enumerate(_chunks(transcript), 1):
        notes = _json(client, model,
            "Extract factual teaching points from this Indonesian music lesson. "
            "Return JSON with a 'notes' array of concise statements. Preserve technical "
            "terms, examples, sequence, and corrections. Do not add unsupported facts. "
            "Do not reproduce song lyrics. Each note must be grounded in the transcript.",
            f"Transcript part {number}:\n{chunk}")
        for note in notes.get("notes", []):
            if isinstance(note, str): note_sets.append({"part": number, "note": note})

    if not note_sets:
        raise RuntimeError("No grounded notes were extracted")
    outline = _json(client, model,
        "Create an Indonesian beginner handbook outline from the supplied notes only. "
        "Return JSON with title, author_note (array of paragraphs), how_this_helps "
        "(array), introduction (array), chapters (array of objects containing title and "
        "focus), closing (array). Write in a friendly aku-kamu voice. No invented claims, "
        "testimonials, lyrics, or unverified author credentials.",
        f"Desired title: {title}. Maximum chapters: {max_chapters}.\n"
        + json.dumps(note_sets, ensure_ascii=False))
    chapter_specs = outline.get("chapters") or []
    if not isinstance(chapter_specs, list) or not chapter_specs:
        raise RuntimeError("AI did not return a usable outline")
    chapter_specs = chapter_specs[:max_chapters]

    chapters = []
    all_notes = json.dumps(note_sets, ensure_ascii=False)
    for number, chapter in enumerate(chapter_specs, 1):
        text = _json(client, model,
            "Write one Indonesian music handbook chapter grounded only in the notes. "
            "Return JSON with title and sections. Each section must have heading, "
            "paragraphs (array of connected explanatory prose), bullets (array), "
            "and tip (short practical advice). Use 2–4 sections, specific examples "
            "from the lesson, and an approachable aku-kamu voice. Do not copy lyrics "
            "or invent musical facts. Do not insert image placeholders as facts.",
            f"Chapter {number}: {json.dumps(chapter, ensure_ascii=False)}\n"
            f"Source notes: {all_notes}")
        sections=[]
        for section in text.get("sections", []):
            if isinstance(section, dict) and section.get("heading") and isinstance(section.get("paragraphs"), list):
                sections.append({
                    "heading": str(section["heading"]),
                    "paragraphs": [str(x) for x in section["paragraphs"] if str(x).strip()],
                    "bullets": [str(x) for x in section.get("bullets", []) if str(x).strip()],
                    "tip": str(section.get("tip", "")),
                })
        if not sections:
            raise RuntimeError(f"AI returned no usable sections for chapter {number}")
        chapters.append({"title": str(chapter.get("title") or text.get("title") or f"Bab {number}"), "sections": sections})

    manuscript = {
        "title": title,
        "author": "Musti Musik",
        "author_note": [str(x) for x in outline.get("author_note", [])],
        "how_this_helps": [str(x) for x in outline.get("how_this_helps", [])],
        "introduction": [str(x) for x in outline.get("introduction", [])],
        "chapters": chapters,
        "closing": [str(x) for x in outline.get("closing", [])],
        "sources": ["Materi dikembangkan dari transkrip video sumber. Periksa kembali semua contoh musikal sebelum diterbitkan."],
    }
    validate_manuscript(manuscript)
    return manuscript
