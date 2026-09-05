# Kanji Forge — Phase Plan

## Phase 0: Data only (done)

Initial N4 kanji + words datasets and `check.js`. Later extended with N5 data.

## Phase 0b: Decomposition data (done)

`components.json`, `recipes.json`, `reach.js`. Unified `kanji.json` / `words.json` with `"level"`.

## Phase 1: Discovery core loop (done)

Little Alchemy–style discovery in `kanji-forge.html` (self-contained, vanilla JS, mobile-first).

- Screens: level picker (N5 / N4) → Workbench → Book
- Persistence: `localStorage` key `kanjiforge`

## Phase 1.5: Learning ladder (this session)

After each discovery, practice that kanji with scaffolding before free play continues. Discovery is capped in small batches.

- **Session:** max 5 new discoveries; counter “New kanji today: n / 5”; workbench locks until review
- **Rung 2 (recognize):** right after reveal — meaning, lookalike, listen (3 tasks, no persistent score)
- **Rung 3 (read):** one short sentence with furigana (except the new kanji), TTS, English on tap
- **Session review:** tasks 2a + 2b for the session’s 5 kanji (shuffled), then summary with re-review of misses
- **Data:** `sentence` + `sentence_reading` on every `words.json` entry used as a `starter_word`
- Not in this phase: customers, timers, coins, spaced repetition across days

## Later phases

Rung 4; customers / orders / timers / coins / hint fading.
