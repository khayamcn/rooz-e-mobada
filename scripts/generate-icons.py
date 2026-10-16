#!/usr/bin/env python3
"""Generate PWA icons (192 / 512) from a flat-color SVG source."""
import subprocess
import sys
from pathlib import Path

# Use rsvg-convert if available; otherwise fall back to cairosvg.
SRC = Path("/home/z/my-project/public/icon.svg")
OUT_DIR = Path("/home/z/my-project/public")
SIZES = [192, 512]

def has_tool(name):
    return subprocess.call(["which", name], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL) == 0

def main():
    if not SRC.exists():
        print(f"[!] Source SVG not found: {SRC}", file=sys.stderr)
        sys.exit(1)

    OUT_DIR.mkdir(parents=True, exist_ok=True)

    if has_tool("rsvg-convert"):
        for sz in SIZES:
            out = OUT_DIR / f"icon-{sz}.png"
            subprocess.run(
                ["rsvg-convert", "-w", str(sz), "-h", str(sz), "-o", str(out), str(SRC)],
                check=True,
            )
            print(f"[ok] rsvg-convert -> {out}")
        return

    # Fallback: try cairosvg
    try:
        import cairosvg  # type: ignore
    except ImportError:
        print("[!] Neither rsvg-convert nor cairosvg is available. Installing cairosvg...")
        subprocess.run([sys.executable, "-m", "pip", "install", "cairosvg"], check=True)
        import cairosvg  # type: ignore

    for sz in SIZES:
        out = OUT_DIR / f"icon-{sz}.png"
        cairosvg.svg2png(url=str(SRC), write_to=str(out), output_width=sz, output_height=sz)
        print(f"[ok] cairosvg -> {out}")

if __name__ == "__main__":
    main()
