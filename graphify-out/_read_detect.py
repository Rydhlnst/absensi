import json
from pathlib import Path

raw = Path("graphify-out/.graphify_detect.json").read_bytes()
# Try utf-8-sig (BOM), then fall back to utf-16
try:
    text = raw.decode("utf-8-sig")
except UnicodeDecodeError:
    try:
        text = raw.decode("utf-16")
    except UnicodeDecodeError:
        text = raw.decode("latin-1")

d = json.loads(text)
print(f"total_files: {d['total_files']}")
print(f"total_words: {d['total_words']}")
for cat in ("code", "document", "paper", "image", "video"):
    n = len(d.get("files", {}).get(cat, []))
    if n:
        print(f"  {cat}: {n} files")
ss = d.get("skipped_sensitive", [])
if ss:
    print(f"skipped_sensitive: {len(ss)}")
    for s in ss[:10]:
        print(f"  - {s}")
