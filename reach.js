#!/usr/bin/env node
/**
 * Reachability / integrity check for recipes.json + components.json.
 *
 * - Builds the dependency graph from recipes
 * - Confirms every kanji is reachable from starters by chaining combinations
 * - Lists unknown part references
 * - Lists cycles
 * - Prints per-level reachable counts and longest chain
 */
const fs = require("fs");

const COMPONENTS = JSON.parse(fs.readFileSync("components.json", "utf8"));
const recipes = JSON.parse(fs.readFileSync("recipes.json", "utf8"));
const kanji = JSON.parse(fs.readFileSync("kanji.json", "utf8"));

const recipeByChar = Object.fromEntries(recipes.map((r) => [r.char, r]));
const kanjiSet = new Set(kanji.map((k) => k.char));

const componentKeys = new Set();
for (const c of COMPONENTS) {
  componentKeys.add(c.id);
  componentKeys.add(c.glyph);
  if (c.display) componentKeys.add(c.display);
}

const starters = recipes.filter((r) => r.starter || (r.parts && r.parts.length === 0));
const starterChars = new Set(starters.map((r) => r.char));

let ok = true;
const problems = [];

// Coverage
for (const k of kanji) {
  if (!recipeByChar[k.char]) {
    ok = false;
    problems.push(`Missing recipe for ${k.char}`);
  }
}
if (recipes.length !== kanji.length) {
  problems.push(`recipes.json has ${recipes.length} entries; kanji.json has ${kanji.length}`);
}

// Unknown parts
const unknown = [];
for (const r of recipes) {
  for (const p of r.parts || []) {
    const known =
      componentKeys.has(p) ||
      kanjiSet.has(p) ||
      // allow component id spelled as part
      COMPONENTS.some((c) => c.id === p);
    if (!known) unknown.push({ char: r.char, part: p });
  }
}
if (unknown.length) {
  ok = false;
  console.log("\n=== UNKNOWN PARTS ===");
  for (const u of unknown) console.log(`  ${u.char} references "${u.part}"`);
} else {
  console.log("\n=== UNKNOWN PARTS ===\n  (none)");
}

// Resolve whether a part token is currently available
function partAvailable(p, unlocked) {
  if (componentKeys.has(p)) return true;
  if (unlocked.has(p)) return true;
  // If part is a kanji char that's unlocked
  return false;
}

// Cycle detection via DFS on kanji→kanji edges only
function findCycles() {
  const graph = new Map();
  for (const r of recipes) {
    const deps = (r.parts || []).filter((p) => kanjiSet.has(p) && p !== r.char);
    graph.set(r.char, deps);
  }
  const cycles = [];
  const WHITE = 0,
    GRAY = 1,
    BLACK = 2;
  const color = new Map([...kanjiSet].map((c) => [c, WHITE]));
  const stack = [];

  function dfs(u) {
    color.set(u, GRAY);
    stack.push(u);
    for (const v of graph.get(u) || []) {
      if (!kanjiSet.has(v)) continue;
      if (color.get(v) === GRAY) {
        const i = stack.indexOf(v);
        cycles.push([...stack.slice(i), v]);
      } else if (color.get(v) === WHITE) {
        dfs(v);
      }
    }
    stack.pop();
    color.set(u, BLACK);
  }
  for (const c of kanjiSet) if (color.get(c) === WHITE) dfs(c);
  return cycles;
}

const cycles = findCycles();
if (cycles.length) {
  ok = false;
  console.log("\n=== CYCLES ===");
  for (const c of cycles) console.log("  " + c.join(" → "));
} else {
  console.log("\n=== CYCLES ===\n  (none)");
}

// Reachability: start with all component keys + starter kanji
const unlocked = new Set(starterChars);
const depth = new Map([...starterChars].map((c) => [c, 0]));

let changed = true;
let guard = 0;
while (changed && guard++ < 1000) {
  changed = false;
  for (const r of recipes) {
    if (unlocked.has(r.char)) continue;
    const parts = r.parts || [];
    if (parts.length === 0) {
      // should already be starter
      unlocked.add(r.char);
      depth.set(r.char, 0);
      changed = true;
      continue;
    }
    if (parts.every((p) => partAvailable(p, unlocked))) {
      unlocked.add(r.char);
      const d =
        1 +
        Math.max(
          0,
          ...parts.map((p) => (kanjiSet.has(p) ? depth.get(p) || 0 : 0))
        );
      depth.set(r.char, d);
      changed = true;
    }
  }
}

const unreachable = recipes.filter((r) => !unlocked.has(r.char));
if (unreachable.length) {
  ok = false;
  console.log("\n=== UNREACHABLE ===");
  for (const r of unreachable) {
    const missing = (r.parts || []).filter((p) => !partAvailable(p, unlocked));
    console.log(`  ${r.char} parts=[${(r.parts || []).join(",")}] missing=[${missing.join(",")}]`);
  }
} else {
  console.log("\n=== UNREACHABLE ===\n  (none)");
}

// Per-level report
console.log("\n=== PER LEVEL ===");
for (const level of ["N5", "N4"]) {
  const all = recipes.filter((r) => r.level === level);
  const reached = all.filter((r) => unlocked.has(r.char));
  const depths = reached.map((r) => depth.get(r.char) || 0);
  const longest = depths.length ? Math.max(...depths) : 0;
  const longestChars = reached
    .filter((r) => (depth.get(r.char) || 0) === longest)
    .map((r) => r.char)
    .slice(0, 12);
  console.log(
    `  ${level}: ${reached.length}/${all.length} reachable, longest chain ${longest}` +
      (longestChars.length ? ` (e.g. ${longestChars.join("")})` : "")
  );
}

console.log("\n=== SUMMARY ===");
console.log(`  components: ${COMPONENTS.length}`);
console.log(`  recipes: ${recipes.length}`);
console.log(`  starters: ${starterChars.size}`);
console.log(`  reachable: ${unlocked.size}/${recipes.length}`);
console.log(`  unknown parts: ${unknown.length}`);
console.log(`  cycles: ${cycles.length}`);
console.log(`  status: ${ok && unreachable.length === 0 && unknown.length === 0 && cycles.length === 0 ? "PASS" : "FAIL"}`);

if (!(ok && unreachable.length === 0 && unknown.length === 0 && cycles.length === 0)) {
  process.exit(1);
}
