#!/usr/bin/env python3
"""
Fetch a YouTube transcript using youtube-transcript-api.

Source video:
  https://www.youtube.com/watch?v=BQYIBKIzY5g
  "Empowering Teams to Make Architectural Decisions" — Andrew Harmel-Law (YOW! 2025)

Install:
  pip install youtube-transcript-api

Usage:
  python fetch_youtube_transcript.py
  python fetch_youtube_transcript.py --video-id BQYIBKIzY5g --output transcript.txt
  python fetch_youtube_transcript.py --format json

Note: YouTube often blocks cloud-provider IPs. Run this script from a local
machine if you see RequestBlocked or IpBlocked errors.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import (
    IpBlocked,
    NoTranscriptFound,
    RequestBlocked,
    TranscriptsDisabled,
    VideoUnavailable,
)


DEFAULT_VIDEO_ID = "BQYIBKIzY5g"


def fetch_transcript(video_id: str, languages: list[str]) -> list[dict]:
    api = YouTubeTranscriptApi()
    fetched = api.fetch(video_id, languages=languages)
    return [
        {"start": snippet.start, "duration": snippet.duration, "text": snippet.text}
        for snippet in fetched
    ]


def to_plain_text(snippets: list[dict]) -> str:
    return "\n".join(f"[{s['start']:.1f}s] {s['text']}" for s in snippets)


def main() -> int:
    parser = argparse.ArgumentParser(description="Fetch a YouTube transcript")
    parser.add_argument("--video-id", default=DEFAULT_VIDEO_ID)
    parser.add_argument(
        "--languages",
        nargs="+",
        default=["en"],
        help="Language codes in priority order (default: en)",
    )
    parser.add_argument(
        "--output",
        type=Path,
        help="Write transcript to this file (stdout if omitted)",
    )
    parser.add_argument(
        "--format",
        choices=["text", "json"],
        default="text",
        help="Output format (default: text)",
    )
    args = parser.parse_args()

    try:
        snippets = fetch_transcript(args.video_id, args.languages)
    except (RequestBlocked, IpBlocked) as exc:
        print(
            "YouTube blocked this IP. Run from a local network or configure a proxy.\n"
            "See: https://github.com/jdepoix/youtube-transcript-api#working-around-ip-bans-requestblocked-or-ipblocked-exception\n",
            file=sys.stderr,
        )
        print(str(exc), file=sys.stderr)
        return 1
    except (VideoUnavailable, TranscriptsDisabled, NoTranscriptFound) as exc:
        print(str(exc), file=sys.stderr)
        return 1

    if args.format == "json":
        payload = json.dumps(snippets, indent=2, ensure_ascii=False)
    else:
        payload = to_plain_text(snippets)

    if args.output:
        args.output.write_text(payload, encoding="utf-8")
        print(f"Wrote {len(snippets)} snippets to {args.output}")
    else:
        print(payload)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
