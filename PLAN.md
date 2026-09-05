# Kanji Forge — Phase Plan

## Phase 0: Data only (done)

Initial N4 kanji + words datasets and `check.js`. Later extended with N5 data.

## Phase 0b: Decomposition data (done)

`components.json`, `recipes.json`, `reach.js`. Unified `kanji.json` / `words.json` with `"level"`.

## Phase 1: Discovery core loop (done)

Little Alchemy–style discovery in `kanji-forge.html` (self-contained, vanilla JS, mobile-first).

- Screens: level picker (N5 / N4) → Workbench → Book
- Persistence: `localStorage` key `kanjiforge`

## Phase 1.5: Learning ladder (done)

After each discovery, practice that kanji with scaffolding before free play continues. Discovery is capped in small batches.

- **Session:** max 5 new discoveries; counter “New kanji today: n / 5”; workbench locks until review
- **Rung 2 (recognize):** right after reveal — meaning, lookalike, listen (3 tasks, no persistent score)
- **Rung 3 (read):** one short sentence with furigana (except the new kanji), TTS, English on tap
- **Session review:** tasks 2a + 2b for the session’s 5 kanji (shuffled), then summary with re-review of misses
- **Data:** `sentence` + `sentence_reading` on every `words.json` entry used as a `starter_word`
- Not in that phase: customers, timers, coins, spaced repetition across days

## Phase 2: Sound families (in progress)

Phonetic-component families: guess the reading from the sound part at reveal, browse families in Book, review on'yomi at session end.

- **Data (Part A):** `sound_part` + `family_reading` (+ optional `reading_drift`) on phonetic recipes; `families.js` groups by `sound_part`, demotes singleton families, writes `families.json`
- **Reveal (Part B):** for phonetic kanji whose sound part is already discovered — guess reading from 3 katakana options before the normal card
- **Book → Families tab:** parent glyph + reading, member tiles (discovered / outline), Complete when all found; tap member to hear `starter_word` via existing `speakJa`
- **Session review:** third task type — on'yomi pick for each phonetic kanji learned that session
- **Counter:** “Families complete: n / total” next to Discovered
- **Audio:** every new sound uses the same `speakJa` function the reveal card already uses (no new audio stack)
- Not in this phase: Origins (pictograph morphs), customers, timers

## Later phases

Rung 4; Origins; customers / orders / timers / coins / hint fading.

