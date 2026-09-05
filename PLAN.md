# Kanji Forge — Phase Plan

## Phase 0: Data only (done)

Initial N4 kanji + words datasets and `check.js`. Later extended with N5 data.

## Phase 0b: Decomposition data (done)

`components.json`, `recipes.json`, `reach.js`. Unified `kanji.json` / `words.json` with `"level"`.

## Phase 1: Discovery core loop (this session)

Replaces the old quiz loop entirely. Core game: **combine components to discover kanji** (Little Alchemy–style).

- Entry: `kanji-forge.html` (self-contained, vanilla JS, mobile-first)
- Screens: level picker (N5 / N4) → Workbench (anvil + inventory) → Book
- Persistence: `localStorage` key `kanjiforge`
- Not in this phase: customers, orders, timers, coins, hint fading

## Later phases

Customers / orders / timers / coins / hint fading — after discovery feels good.
