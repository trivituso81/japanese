# Kanji Forge — Phase Plan

## Phase 0: Data only (done)

Initial N4 kanji + words datasets and `check.js`. Later extended with N5 data.

## Phase 0b: Decomposition data (this session)

Data only — no game logic. Supports a **discovery** mechanic (combine components to discover kanji, like Little Alchemy).

Keep unified `kanji.json` (N5 + N4, each entry has `"level"`) and `words.json` as they are. Add:

1. **components.json** — ~40–50 primitive building blocks (`id`, `glyph`, `display`, `name`, `hint`).
2. **recipes.json** — one entry per kanji: `parts` (0–3), `mnemonic`, `mnemonic_type`, `starter_word`; starters have `parts: []` and `starter: true`.

Validate with **reach.js**: every kanji reachable from starters, no unknown parts, no cycles; print per-level reachability and longest chain.

## Phase 1: Discovery core loop (REPLACES prior quiz Phase 1)

> The previous quiz-style core loop (orders / tiles / hand) is **replaced**.  
> The core game is now: **combine components to discover kanji** (Little Alchemy–style).  
> Full Phase 1 UI/spec will be provided next session. Do not implement game logic in 0b.

The existing `kanji-forge.html` quiz remains in the repo until Phase 1 lands; it is not the target design.

## Later phases

*(Awaiting Phase 1 discovery spec.)*
