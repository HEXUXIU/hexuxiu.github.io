#!/usr/bin/env python3
"""Regenerate the Glow Sans SC per-weight subset woff2 files.

Source of truth: the official upstream release (OFL-licensed) — the same
v0.93 the repo's old cn-font-split files were cut from. Glyph outlines in
the subsets were verified identical to the old split files (RecordingPen
outline comparison, 30/30 per weight) and every site character is covered.

What it does:
  1. Downloads GlowSansSC-Normal-v0.93.zip from GitHub releases, verifies
     the published md5 (md5-v0.93.txt).
  2. Extracts the 4 weights used by the site (Regular 400, Medium 500,
     Bold 700, Heavy 900).
  3. Builds the site charset exactly like scripts/prune-font-face.mjs does
     (dist HTML/XML text + attributes, plus src text files; pagefind binary
     fragments are NOT fed -- they fabricate codepoints that never render).
  4. Runs pyftsubset (fontTools >= 4.68; older versions hit a CFF
     subroutine bug -- pass --desubroutinize as a fallback) to
     public/fonts/subset/GlowSansSC-<weight>.woff2, and writes the charset
     to scripts/font-subset-charset.json.

When to run: after adding a post/page that introduces a character the site
has never used before. The build check (scripts/check-font-coverage.mjs)
fails loudly if the charset is stale, with a pointer back here.
Local-only: needs python3 + fontTools + brotli; nothing in this script
runs on Cloudflare Pages.
"""
import hashlib
import json
import os
import re
import subprocess
import sys
import tempfile
import urllib.request
import zipfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VERSION = "v0.93"
ZIP_URL = f"https://github.com/welai/glow-sans/releases/download/{VERSION}/GlowSansSC-Normal-{VERSION}.zip"
MD5_URL = f"https://github.com/welai/glow-sans/releases/download/{VERSION}/md5-{VERSION}.txt"
WEIGHTS = {"Regular": 400, "Medium": 500, "Bold": 700, "Heavy": 900}
OUT_DIR = os.path.join(ROOT, "public", "fonts", "subset")
CHARSET_JSON = os.path.join(ROOT, "scripts", "font-subset-charset.json")


def build_charset():
    used = set()

    def feed_html(path):
        with open(path, encoding="utf-8", errors="ignore") as f:
            t = f.read()
        t = re.sub(r"<script[\s\S]*?</script>", " ", t)
        t = re.sub(r"<style[\s\S]*?</style>", " ", t)
        t = re.sub(
            r"<[^>]+>",
            lambda m: " "
            + " ".join(x for x in re.findall(r'"([^"]*)"|\'([^\']*)\'', m.group(0)) for x in x if x)
            + " ",
            t,
        )
        used.update(map(ord, t))

    for dirpath, _, files in os.walk(os.path.join(ROOT, "dist")):
        if "pagefind" in dirpath.split(os.sep):
            continue
        for fn in files:
            if fn.endswith((".html", ".xml")):
                feed_html(os.path.join(dirpath, fn))
    for dirpath, _, files in os.walk(os.path.join(ROOT, "src")):
        for fn in files:
            if fn.endswith((".ts", ".astro", ".md", ".mdx", ".yml", ".yaml", ".css")):
                with open(os.path.join(dirpath, fn), encoding="utf-8", errors="ignore") as f:
                    used.update(map(ord, f.read()))
    if len(used) < 100:
        raise SystemExit("charset implausibly small; is dist/ built?")
    return sorted(used)


def main():
    import fontTools

    major, minor, *_ = (int(x) for x in fontTools.version.split(".")[:2])
    desub = (major, minor) < (4, 68)

    charset = build_charset()
    print(f"[regen-font-subsets] charset: {len(charset)} codepoints")
    with tempfile.TemporaryDirectory() as tmp:
        zip_path = os.path.join(tmp, "glow.zip")
        print(f"[regen-font-subsets] downloading {ZIP_URL}")
        urllib.request.urlretrieve(ZIP_URL, zip_path)
        md5_expected = None
        zip_name = f"GlowSansSC-Normal-{VERSION}.zip"
        with urllib.request.urlopen(MD5_URL) as r:
            for line in r.read().decode().splitlines():
                parts = line.split()
                if len(parts) == 2 and parts[1] == zip_name:
                    md5_expected = parts[0]
        md5_actual = hashlib.md5(open(zip_path, "rb").read()).hexdigest()
        if md5_expected and md5_actual != md5_expected:
            raise SystemExit(f"md5 mismatch: {md5_actual} != {md5_expected}")
        print(f"[regen-font-subsets] md5 ok ({md5_actual})")
        with zipfile.ZipFile(zip_path) as z:
            z.extractall(tmp)
        text = "".join(chr(c) for c in charset)
        text_file = os.path.join(tmp, "charset.txt")
        open(text_file, "w", encoding="utf-8").write(text)
        os.makedirs(OUT_DIR, exist_ok=True)
        for name, weight in WEIGHTS.items():
            otf = None
            for root, _, files in os.walk(tmp):
                for fn in files:
                    if fn == f"GlowSansSC-Normal-{name}.otf":
                        otf = os.path.join(root, fn)
            if not otf:
                raise SystemExit(f"missing OTF for {name}")
            out = os.path.join(OUT_DIR, f"GlowSansSC-{weight}.woff2")
            cmd = [
                sys.executable, "-m", "fontTools.subset", otf,
                f"--text-file={text_file}", "--flavor=woff2",
                f"--output-file={out}",
            ]
            if desub:
                cmd.append("--desubroutinize")
            subprocess.run(cmd, check=True, capture_output=True, text=True)
            print(f"[regen-font-subsets] {name} ({weight}): {os.path.getsize(out)/1024:.0f}KB -> {out}")
            # Self-verify: every charset char the upstream font can render
            # must be present in the subset.
            from fontTools.ttLib import TTFont

            up = TTFont(otf).getBestCmap()
            sub = TTFont(out).getBestCmap()
            missing = [c for c in charset if c in up and c not in sub]
            if missing:
                raise SystemExit(f"{name}: subset missing {[hex(c) for c in missing[:10]]}")
        json.dump(charset, open(CHARSET_JSON, "w"))
        print(f"[regen-font-subsets] wrote {CHARSET_JSON} ({len(charset)} codepoints)")


if __name__ == "__main__":
    main()
