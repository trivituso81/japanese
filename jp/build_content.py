"""Merge jp/content/L*.json into the CONTENT block of japanese-data.js.

Each lesson file holds one object:

  { "points": [ { "pattern", "short", "explain", "formation",
                  "examples": [[japanese, english], ...],
                  "drills":   [[english, japanese, note], ...] } ] }

Furigana is written as 漢字{かんじ} and expanded to <ruby> by the page.
Run after editing or adding any lesson file.
"""
import glob
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONTENT_DIR = os.path.join(ROOT, "jp", "content")
TARGET = os.path.join(ROOT, "japanese-data.js")
START, END = "/* CONTENT_DATA_START */", "/* CONTENT_DATA_END */"

FURI = re.compile(r"\{([^}]*)\}")
KANA = re.compile(r"^[\u3040-\u309f\u30a0-\u30ff・ー]+$")
REQUIRED = ("pattern", "explain", "examples", "drills")


def check(lesson, data):
    """Catch the mistakes that silently break the page or the drills."""
    problems = []
    for i, p in enumerate(data.get("points", []), 1):
        where = f"L{lesson} point {i}"
        for k in REQUIRED:
            if not p.get(k):
                problems.append(f"{where}: missing {k}")
        for text in [p.get("pattern", ""), p.get("formation", "")] \
                + [e[0] for e in p.get("examples", [])] \
                + [d[1] for d in p.get("drills", [])]:
            if text.count("{") != text.count("}"):
                problems.append(f"{where}: unbalanced furigana braces in {text!r}")
            for reading in FURI.findall(text):
                if not KANA.match(reading):
                    problems.append(f"{where}: furigana {reading!r} is not kana")
        for j, d in enumerate(p.get("drills", []), 1):
            if len(d) < 2 or not d[0].strip() or not d[1].strip():
                problems.append(f"{where} drill {j}: needs both English and Japanese")
    return problems


def main():
    lessons, problems = {}, []
    for path in sorted(glob.glob(os.path.join(CONTENT_DIR, "L*.json"))):
        n = int(os.path.basename(path)[1:3])
        data = json.load(open(path, encoding="utf-8"))
        problems += check(n, data)
        lessons[n] = data

    if problems:
        print("\n".join(problems))
        sys.exit("\n%d problem(s); nothing written." % len(problems))

    if "--check" in sys.argv:
        pts = sum(len(l["points"]) for l in lessons.values())
        print(f"all clean: lessons {len(lessons)}  points {pts}")
        return

    out = ["const CONTENT = {", ""]
    for n in sorted(lessons):
        out.append(f"{n}: {{ points: [")
        for p in lessons[n]["points"]:
            out.append("  {")
            for k in ("pattern", "short", "explain", "formation"):
                if p.get(k):
                    out.append(f"    {k}: {json.dumps(p[k], ensure_ascii=False)},")
            out.append("    examples: [")
            for e in p.get("examples", []):
                out.append("      " + json.dumps(e, ensure_ascii=False) + ",")
            out.append("    ],")
            out.append("    drills: [")
            for d in p.get("drills", []):
                out.append("      " + json.dumps(d, ensure_ascii=False) + ",")
            out.append("    ]")
            out.append("  },")
        out.append("]},")
        out.append("")
    out.append("};")

    html = open(TARGET, encoding="utf-8").read()
    before = html[: html.index(START) + len(START)]
    after = html[html.index(END):]
    open(TARGET, "w", encoding="utf-8").write(before + "\n" + "\n".join(out) + "\n" + after)

    pts = sum(len(l["points"]) for l in lessons.values())
    drills = sum(len(p["drills"]) for l in lessons.values() for p in l["points"])
    print(f"lessons {len(lessons)}  points {pts}  drills {drills}")


if __name__ == "__main__":
    main()
