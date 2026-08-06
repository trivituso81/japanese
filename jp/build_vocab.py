"""Turn the transcribed vocabulary files into the VOCAB literal inside japanese.html.

The textbook prints the Conversation section's words as kanji with tiny furigana
rather than in the usual kana/kanji columns, so those entries arrive with the
kanji sitting in the reading column. Move them across and restore the reading.
"""
import glob
import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KANJI = re.compile(r'[\u4e00-\u9fff]')

# Readings for the Conversation-section entries, whose furigana is too small to
# transcribe reliably from the scan.
READINGS = {
    "これから お世話に なります。": "これから おせわに なります。",
    "［～を］見せて ください。": "［～を］みせて ください。",
    "お願いします。": "おねがいします。",
    "お問い合わせの 番号": "おといあわせの ばんごう",
    "～番線": "～ばんせん",
    "いい［お］天気ですね。": "いい［お］てんきですね。",
    "お出かけですか。": "おでかけですか。",
    "行って いらっしゃい。": "いって いらっしゃい。",
    "行って まいります。": "いって まいります。",
    "お帰りなさい。": "おかえりなさい。",
    "疲れました。": "つかれました。",
    "ご注文は？": "ごちゅうもんは？",
    "定食": "ていしょく",
    "牛どん": "ぎゅうどん",
    "［少々］ お待ちください。": "［しょうしょう］ おまちください。",
    "別々に": "べつべつに",
    "信号を 右へ 曲がって ください。": "しんごうを みぎへ まがって ください。",
    "これで お願いします。": "これで おねがいします。",
    "お釣り": "おつり",
    "特に": "とくに",
    "思い出します Ⅰ": "おもいだします Ⅰ",
    "ご家族": "ごかぞく",
    "高校": "こうこう",
    "～でも 飲みませんか。": "～でも のみませんか。",
    "見ないと……。": "みないと……。",
    "家賃": "やちん",
    "和室": "わしつ",
    "押し入れ": "おしいれ",
    "布団": "ふとん",
    "建物": "たてもの",
    "外国人登録証": "がいこくじんとうろくしょう",
    "ワゴン車": "ワゴンしゃ",
    "[お]弁当": "[お]べんとう",
    "転勤": "てんきん",
    "一杯 飲みましょう。": "いっぱい のみましょう。",
    "［いろいろ］お世話に なりました。": "［いろいろ］おせわに なりました。",
    "頑張ります I": "がんばります Ⅰ",
    "どうぞ お元気で。": "どうぞ おげんきで。",
}


def normalise(reading, kanji, english):
    if KANJI.search(reading) and not kanji.strip():
        kanji = reading
        reading = READINGS.get(reading.strip(), "")
    return [reading.strip(), kanji.strip(), english.strip()]


def load():
    out = {}
    for path in sorted(glob.glob(os.path.join(ROOT, "jp", "vocab", "L*.txt"))):
        lesson = int(re.search(r"L(\d+)\.txt$", path).group(1))
        section, main, proper = "v", [], []
        for line in open(path, encoding="utf-8"):
            line = line.rstrip("\n")
            if not line.strip():
                continue
            if line == "VOCAB":
                section = "v"
                continue
            if line == "PROPER":
                section = "p"
                continue
            entry = normalise(*line.split("|"))
            (main if section == "v" else proper).append(entry)
        out[lesson] = {"v": main, "p": proper}
    return out


def main():
    data = load()
    lines = ["const VOCAB = {"]
    for lesson in sorted(data):
        block = data[lesson]
        lines.append(f"{lesson}: {{")
        for key in ("v", "p"):
            if not block[key]:
                continue
            lines.append(f"  {key}: [")
            for entry in block[key]:
                lines.append("    " + json.dumps(entry, ensure_ascii=False) + ",")
            lines.append("  ],")
        lines.append("},")
    lines.append("};")
    literal = "\n".join(lines)

    page = os.path.join(ROOT, "japanese-data.js")
    html = open(page, encoding="utf-8").read()
    start, end = "/* VOCAB_DATA_START */", "/* VOCAB_DATA_END */"
    before = html[: html.index(start) + len(start)]
    after = html[html.index(end):]
    open(page, "w", encoding="utf-8").write(before + "\n" + literal + "\n" + after)

    total = sum(len(b["v"]) + len(b["p"]) for b in data.values())
    missing = sum(1 for b in data.values() for e in b["v"] if not e[0] and not e[1])
    print(f"lessons {len(data)}  entries {total}  blank {missing}")
    print("with kanji + reading:",
          sum(1 for b in data.values() for e in b["v"] if e[0] and e[1]))


if __name__ == "__main__":
    main()
