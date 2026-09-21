"""Video or caption input -> editable plain-text transcript.

YouTube captions are preferred. Audio transcription is used only when captions
are unavailable. No API credentials are written to the output directory.
"""

from __future__ import annotations

import os
import re
import shutil
import subprocess
import tempfile
from html import unescape
from pathlib import Path
from urllib.request import Request, urlopen


TIME_LINE = re.compile(r"^(?:\d{1,2}:)?\d{1,2}:\d{2}[.,]\d{1,3}\s*(?:-->|,)\s*(?:\d{1,2}:)?\d{1,2}:\d{2}[.,]\d{1,3}")
TAG = re.compile(r"<[^>]+>")


def clean_captions(raw: str) -> str:
    """Read .vtt, .srt, or .sbv and remove timing, markup, and overlap."""
    lines = []
    last = ""
    for source_line in raw.replace("\ufeff", "").splitlines():
        line = unescape(TAG.sub("", source_line.strip()))
        if not line or line in {"WEBVTT", "Kind: captions", "Language: id"}:
            continue
        if TIME_LINE.match(line) or line.startswith("NOTE ") or line.isdigit():
            continue
        line = re.sub(r"\s+", " ", line).strip()
        if not line or line == last:
            continue
        # Auto-captions often repeat the previous line before adding new words.
        original = line
        if last and line.startswith(last + " "):
            line = line[len(last):].strip()
        if line:
            lines.append(line)
            last = original
    return "\n".join(lines)


def _youtube_caption(url: str) -> str | None:
    try:
        from yt_dlp import YoutubeDL
    except ImportError as exc:
        raise RuntimeError("Install generator/requirements.txt for YouTube input") from exc
    with YoutubeDL({"quiet": True, "no_warnings": True, "skip_download": True}) as ydl:
        info = ydl.extract_info(url, download=False)
    for collection in ("subtitles", "automatic_captions"):
        available = info.get(collection) or {}
        for language in ("id", "id-ID", "en", "en-US"):
            options = available.get(language) or []
            caption = next((x for x in options if x.get("ext") == "vtt"), None)
            if caption and caption.get("url"):
                request = Request(caption["url"], headers={"User-Agent": "Mozilla/5.0"})
                with urlopen(request, timeout=45) as response:
                    text = clean_captions(response.read().decode("utf-8", "replace"))
                if text:
                    return text
    return None


def _download_audio(url: str, directory: Path) -> Path:
    from yt_dlp import YoutubeDL
    options = {
        "format": "bestaudio/best",
        "outtmpl": str(directory / "source.%(ext)s"),
        "quiet": True,
        "no_warnings": True,
        "noplaylist": True,
    }
    with YoutubeDL(options) as ydl:
        info = ydl.extract_info(url, download=True)
        path = Path(ydl.prepare_filename(info))
    if not path.is_file():
        raise RuntimeError("Video audio could not be downloaded")
    return path


def _audio_chunks(source: Path, directory: Path) -> list[Path]:
    ffmpeg = shutil.which("ffmpeg")
    if not ffmpeg:
        raise RuntimeError("ffmpeg is required for audio transcription")
    pattern = directory / "chunk_%03d.mp3"
    command = [
        ffmpeg, "-hide_banner", "-loglevel", "error", "-y", "-i", str(source),
        "-vn", "-ac", "1", "-ar", "16000", "-b:a", "32k",
        "-f", "segment", "-segment_time", "600", "-reset_timestamps", "1",
        str(pattern),
    ]
    subprocess.run(command, check=True)
    chunks = sorted(directory.glob("chunk_*.mp3"))
    if not chunks:
        raise RuntimeError("ffmpeg produced no audio chunks")
    return chunks


def _transcribe_audio(source: Path, model: str) -> str:
    if not os.environ.get("OPENAI_API_KEY"):
        raise RuntimeError("OPENAI_API_KEY is needed when the video has no usable captions")
    try:
        from openai import OpenAI
    except ImportError as exc:
        raise RuntimeError("Install generator/requirements.txt for transcription") from exc
    client = OpenAI()
    with tempfile.TemporaryDirectory(prefix="ebook_audio_") as temporary:
        texts = []
        for chunk in _audio_chunks(source, Path(temporary)):
            if chunk.stat().st_size > 24_000_000:
                raise RuntimeError(f"Audio chunk is too large: {chunk.name}")
            with chunk.open("rb") as audio:
                result = client.audio.transcriptions.create(model=model, file=audio)
            texts.append(result.text)
    return "\n".join(texts)


def transcript_from(source: str, *, transcription_model: str = "gpt-4o-mini-transcribe") -> str:
    path = Path(source)
    if path.is_file():
        if path.suffix.lower() in {".txt", ".sbv", ".srt", ".vtt"}:
            raw = path.read_text(encoding="utf-8-sig")
            return clean_captions(raw) if path.suffix.lower() != ".txt" else raw.strip()
        return _transcribe_audio(path, transcription_model)
    if source.startswith(("https://", "http://")):
        caption = _youtube_caption(source)
        if caption:
            return caption
        with tempfile.TemporaryDirectory(prefix="ebook_video_") as temporary:
            audio = _download_audio(source, Path(temporary))
            return _transcribe_audio(audio, transcription_model)
    raise FileNotFoundError(f"Input is not a local file or URL: {source}")
