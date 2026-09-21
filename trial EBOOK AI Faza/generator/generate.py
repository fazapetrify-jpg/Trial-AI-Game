"""Command-line entry point for manuscript, transcript, or video -> DOCX."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from author import generate_manuscript
from book import build_docx
from qa import audit_style, rendered_page_count
from video import transcript_from


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Generate a Musti Musik A5 DOCX ebook")
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--manuscript", type=Path, help="Editable book content as JSON")
    group.add_argument("--transcript", type=Path, help=".txt, .sbv, .srt, or .vtt transcript")
    group.add_argument("--video", help="YouTube URL or local video/audio file")
    parser.add_argument("--title", help="Required for video or transcript input")
    parser.add_argument("--out", type=Path, required=True, help="Output .docx path")
    parser.add_argument("--model", default="gpt-4.1-mini", help="Text model for manuscript authoring")
    parser.add_argument("--transcription-model", default="gpt-4o-mini-transcribe")
    parser.add_argument("--max-chapters", type=int, default=7)
    parser.add_argument("--max-pages", type=int, help="Check rendered page count; requires LibreOffice")
    parser.add_argument("--transcript-only", action="store_true", help="Save transcript without writing a book")
    args = parser.parse_args(argv)

    if args.out.suffix.lower() != ".docx":
        parser.error("--out must end with .docx")
    if args.max_chapters < 1:
        parser.error("--max-chapters must be positive")
    if args.max_pages is not None and args.max_pages < 1:
        parser.error("--max-pages must be positive")

    if args.manuscript:
        if args.transcript_only:
            parser.error("--transcript-only requires --video or --transcript")
        manuscript = json.loads(args.manuscript.read_text(encoding="utf-8"))
        base = args.manuscript.parent
    else:
        if not args.title:
            parser.error("--title is required for transcript or video input")
        source = str(args.transcript or args.video)
        transcript = transcript_from(source, transcription_model=args.transcription_model)
        if len(transcript) < 200:
            raise RuntimeError("Transcript is empty or too short")
        args.out.parent.mkdir(parents=True, exist_ok=True)
        transcript_path = args.out.with_suffix(".transcript.txt")
        transcript_path.write_text(transcript, encoding="utf-8")
        print(f"Transcript: {transcript_path}")
        if args.transcript_only:
            return 0
        manuscript = generate_manuscript(
            transcript, title=args.title, model=args.model, max_chapters=args.max_chapters
        )
        manuscript["sources"] = [source, *manuscript.get("sources", [])]
        manuscript_path = args.out.with_suffix(".manuscript.json")
        manuscript_path.write_text(json.dumps(manuscript, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"Editable manuscript: {manuscript_path}")
        base = args.out.parent

    output = build_docx(manuscript, args.out, base=base)
    problems = audit_style(output)
    if problems:
        raise RuntimeError("Style audit failed: " + "; ".join(problems))
    if args.max_pages is not None:
        count, pdf = rendered_page_count(output, output.parent / (output.stem + "_qa"))
        print(f"Rendered pages: {count}; QA PDF: {pdf}")
        if count > args.max_pages:
            raise RuntimeError(
                f"Rendered book has {count} pages, exceeding the {args.max_pages}-page limit. "
                "Edit the saved manuscript and rebuild; the generator never treats 49 page breaks as 50 pages."
            )
    print(f"DOCX: {output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
