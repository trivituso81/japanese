#!/usr/bin/env node
const fs = require("fs");
const kanji = JSON.parse(fs.readFileSync("kanji.json", "utf8"));
const words = JSON.parse(fs.readFileSync("words.json", "utf8"));

const n4 = new Set(kanji.map((k) => k.char));
const n5map = (() => {
  try { return require("/tmp/n5-map.json"); } catch { return {}; }
})();
const n5Only = new Set(Object.keys(n5map).filter((c) => !n4.has(c)));

const counts = Object.fromEntries([...n4].map((c) => [c, 0]));
const unknown = new Map(); // char -> words
const wordSeen = new Map();
const meaningSeen = new Map();

for (const w of words) {
  wordSeen.set(w.word, (wordSeen.get(w.word) || 0) + 1);
  meaningSeen.set(w.meaning, (meaningSeen.get(w.meaning) || 0) + 1);
  for (const c of w.kanji || []) {
    if (n4.has(c)) counts[c]++;
    else if (!n5Only.has(c) && /\p{Script=Han}/u.test(c)) {
      if (!unknown.has(c)) unknown.set(c, []);
      unknown.get(c).push(w.word);
    }
  }
}

const under = Object.entries(counts).filter(([, n]) => n < 2);
const dupWords = [...wordSeen.entries()].filter(([, n]) => n > 1);
const dupMeanings = [...meaningSeen.entries()].filter(([, n]) => n > 1);

console.log("=== Kanji Forge coverage report ===");
console.log(`kanji.json entries: ${kanji.length}`);
console.log(`words.json entries: ${words.length}`);
console.log(`Coverage min/max: ${Math.min(...Object.values(counts))} / ${Math.max(...Object.values(counts))}`);
console.log(`Kanji with <2 words: ${under.length}`);
if (under.length) {
  console.log(under.map(([c, n]) => `${c}(${n})`).join(" "));
}
console.log(`Kanji in words not in kanji.json (and not known N5): ${unknown.size}`);
if (unknown.size) {
  for (const [c, ws] of unknown) console.log(`  ${c}: ${ws.slice(0, 5).join(", ")}`);
}
console.log(`Duplicate words: ${dupWords.length}`);
if (dupWords.length) console.log(dupWords.map(([w, n]) => `${w}×${n}`).join(", "));
console.log(`Duplicate meanings: ${dupMeanings.length}`);
if (dupMeanings.length) console.log(dupMeanings.map(([m, n]) => `"${m}"×${n}`).join(", "));

const ok = under.length === 0 && unknown.size === 0 && dupWords.length === 0 && dupMeanings.length === 0;
console.log(ok ? "\nPASS" : "\nFAIL");
process.exit(ok ? 0 : 1);
