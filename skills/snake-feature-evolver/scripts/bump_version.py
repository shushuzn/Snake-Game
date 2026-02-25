#!/usr/bin/env python3
"""Bump Snake version in index.html.
Usage: python3 scripts/bump_version.py <new_version>
"""
from pathlib import Path
import re
import sys

if len(sys.argv) != 2:
    raise SystemExit("Usage: bump_version.py <new_version>")

new_version = sys.argv[1]
if not re.fullmatch(r"\d+\.\d+\.\d+", new_version):
    raise SystemExit("Version must be semver-like: major.minor.patch")

path = Path("index.html")
text = path.read_text(encoding="utf-8")

text = re.sub(r"(<small id=\"versionTag\">)v\d+\.\d+\.\d+(</small>)", rf"\1v{new_version}\2", text)
text = re.sub(r"(const GAME_VERSION = ')\d+\.\d+\.\d+(';)", rf"\1{new_version}\2", text)

path.write_text(text, encoding="utf-8")
print(f"Updated version to {new_version}")
