#!/usr/bin/env node
const fs = require("fs");

function check(label, kanjiPath, wordsPath) {
  const kanji = JSON.parse(fs.readFileSync(kanjiPath, "utf8"));
  const words = JSON.parse(fs.readFileSync(wordsPath, "utf8"));
  const set = new Set(kanji.map((k) => k.char));

  // For N4 words, N5 kanji are also allowed (loaded from kanji-n5 when present)
  let allowedExtra = new Set();
  if (label === "N4" && fs.existsSync("kanji-n5.json")) {
    allowedExtra = new Set(JSON.parse(fs.readFileSync("kanji-n5.json", "utf8")).map((k) => k.char));
  }

  const counts = Object.fromEntries([...set].map((c) => [c, 0]));
  const unknown = new Map();
  const wordSeen = new Map();
  const meaningSeen = new Map();

  for (const w of words) {
    wordSeen.set(w.word, (wordSeen.get(w.word) || 0) + 1);
    meaningSeen.set(w.meaning, (meaningSeen.get(w.meaning) || 0) + 1);
    for (const c of w.kanji || []) {
      if (set.has(c)) counts[c]++;
      else if (!allowedExtra.has(c) && /\p{Script=Han}/u.test(c)) {
        if (!unknown.has(c)) unknown.set(c, []);
        unknown.get(c).push(w.word);
      }
    }
  }

  const under = Object.entries(counts).filter(([, n]) => n < 2);
  const dupWords = [...wordSeen.entries()].filter(([, n]) => n > 1);
  const dupMeanings = [...meaningSeen.entries()].filter(([, n]) => n > 1);

  console.log(`\n=== ${label} coverage ===`);
  console.log(`kanji: ${kanji.length}  words: ${words.length}`);
  console.log(`Coverage min/max: ${Math.min(...Object.values(counts))} / ${Math.max(...Object.values(counts))}`);
  console.log(`Kanji with <2 words: ${under.length}`);
  if (under.length) console.log(under.map(([c, n]) => `${c}(${n})`).join(" "));
  console.log(`Unknown kanji in words: ${unknown.size}`);
  if (unknown.size) {
    for (const [c, ws] of unknown) console.log(`  ${c}: ${ws.slice(0, 5).join(", ")}`);
  }
  console.log(`Duplicate words: ${dupWords.length}`);
  console.log(`Duplicate meanings: ${dupMeanings.length}`);
  if (dupMeanings.length) console.log(dupMeanings.slice(0, 10).map(([m, n]) => `"${m}"×${n}`).join(", "));

  const ok = under.length === 0 && unknown.size === 0 && dupWords.length === 0 && dupMeanings.length === 0;
  console.log(ok ? "PASS" : "FAIL");
  return ok;
}

const okN5 = check("N5", "kanji-n5.json", "words-n5.json");
const okN4 = check("N4", "kanji.json", "words.json");
console.log(okN5 && okN4 ? "\nALL PASS" : "\nSOME FAILED");
process.exit(okN5 && okN4 ? 0 : 1);
