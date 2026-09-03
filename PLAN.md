# Kanji Forge — Phase Plan

## Phase 0: Data only

Do not write any game logic yet.

Create three files:

1. **PLAN.md** — this roadmap.

2. **kanji.json** — an array of all 188 N4 kanji (the standard community list, not the pre-2010 official list). Schema per entry:

```json
{
  "char": "駅",
  "meaning": "station",
  "onyomi": ["エキ"],
  "kunyomi": [],
  "lookalikes": ["訳", "駐"]
}
```

Rules:
- `lookalikes`: 1 to 4 visually similar kanji. Prefer other N4 or N5 kanji, since those will be tiles the player has seen. Include non-N4 lookalikes only when no good N4/N5 match exists.
- Readings in katakana for onyomi, hiragana for kunyomi. Omit okurigana from kunyomi.
- Do not include stroke order or stroke counts. This app is reading only.

3. **words.json** — an array of about 300 N4-level vocabulary words built from the kanji in `kanji.json`. Schema per entry:

```json
{
  "word": "来週",
  "reading": "らいしゅう",
  "meaning": "next week",
  "kanji": ["来", "週"],
  "kana_only": false
}
```

Rules:
- Every entry must contain only kanji from `kanji.json`, kana, or N5 kanji. Flag N5 kanji use in a `notes` field so it can be reviewed.
- Every one of the 188 kanji must appear in at least 2 words. Include single-kanji words where they are common standalone (駅, 本, 車, 家).
- Meanings: short, natural English, one primary meaning. Write meanings so they point to one word. "next week" is good; "time" is too vague because it matches several words.
- Mix: roughly 60 percent two-kanji compounds, 25 percent single kanji, 15 percent kanji plus okurigana (食べる, 歩く). For okurigana words the `word` field includes the kana and `kanji` lists only the kanji.
- No duplicate words. No names of people or places.

After generating, write a small Node script `check.js` that:
- confirms every kanji in `kanji.json` appears in at least 2 words
- lists any kanji used in `words.json` that is not in `kanji.json`
- lists any duplicate words or duplicate meanings

Run it and fix the data until it passes clean.

## Phase 0 deliverables (this repo)

| File | Role |
|------|------|
| `kanji.json` | 188 N4 kanji with meanings, readings, lookalikes |
| `words.json` | ~300 N4 vocab items; every kanji appears ≥2 times |
| `check.js` | Coverage / duplicate / unknown-kanji validator |

**Kanji list note:** There is no official post-2010 JLPT kanji list. The 188 here merge the widely used community N4 set (Tanos / OpenJLPT, 166 chars, includes 駅) with 22 additional characters from the expanded N4 set already curated in this project’s study data (合回所進乗働市顔頭門区軽低遠暗寒暑弱薬説洗声産引), so the total is exactly 188.

**Validate:** `node check.js` must print `PASS`.

## Phase 1: Core loop

Create `index.html`, a single self-contained file (inline CSS and JS, no frameworks, no build step). Load `kanji.json` and `words.json` with `fetch`; assume the file is served locally.

Build one screen with this flow:

1. **Order** — Random word; English meaning large at top; blank slots per character (kana prefilled/greyed; kanji empty).
2. **Hand** — 7 tiles: all answer kanji, 2 lookalike decoys, fill with random from `kanji.json`. Shuffle. No duplicates.
3. **Input** — Tap tile → next empty slot; tap filled slot → return to hand. Auto-check when all slots filled.
4. **Feedback** — Correct: green + reading, 1s, next. Wrong: red + correct word/reading, 2s, next. Corner counter: completed / correct.
5. **End of day** — After 12 orders: summary (correct count, missed words), **New Day** button.

Constraints: mobile-first portrait; tiles ≥56px; Gothic kanji font; all state in `state`; script sections: data loading / rendering / game logic. No timers UI, coins, sound, or localStorage yet.

## Later phases

*(Not started.)*