"""Scans media/ and writes data.json for the website.
Usage:  python build.py     then     python -m http.server   (preview at localhost:8000)
Name files so they sort in time order, e.g. 2024-06-first-day.jpg
"""
import json, pathlib

ROOT = pathlib.Path(__file__).parent
PHOTO_EXT = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"}
VIDEO_EXT = {".mp4", ".webm", ".mov", ".m4v"}

def files(folder, exts):
    d = ROOT / "media" / folder
    return sorted(p.relative_to(ROOT).as_posix() for p in d.glob("*") if p.suffix.lower() in exts)

config = json.loads((ROOT / "config.json").read_text(encoding="utf-8"))
data = dict(config)
data["photos"] = files("photos", PHOTO_EXT)
data["videos"] = files("videos", VIDEO_EXT)

big = [v for v in data["videos"] if (ROOT / v).stat().st_size > 95 * 1024 * 1024]
for v in big:
    print(f"WARNING: {v} is over ~95 MB. GitHub blocks files over 100 MB. Upload it to YouTube (unlisted) and add the link under 'youtube' in config.json.")

(ROOT / "data.json").write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
print(f"Done: {len(data['photos'])} photos, {len(data['videos'])} videos, {len(data['youtube'])} YouTube links.")
