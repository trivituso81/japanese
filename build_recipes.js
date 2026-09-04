#!/usr/bin/env node
/**
 * Build recipes.json from recipes_src.txt + components.json + kanji.json + words.json
 */
const fs = require("fs");

const kanji = JSON.parse(fs.readFileSync("kanji.json", "utf8"));
const words = JSON.parse(fs.readFileSync("words.json", "utf8"));
const COMPONENTS = JSON.parse(fs.readFileSync("components.json", "utf8"));
const src = fs.readFileSync("recipes_src.txt", "utf8");

const kanjiByChar = Object.fromEntries(kanji.map((k) => [k.char, k]));
const kanjiSet = new Set(kanji.map((k) => k.char));

const compByKey = new Map();
for (const c of COMPONENTS) {
  for (const k of [c.id, c.glyph, c.display]) if (k) compByKey.set(k, c);
}

function partName(p) {
  const c = compByKey.get(p);
  if (c) return c.name;
  if (kanjiByChar[p]) return kanjiByChar[p].meaning.split(/[,;/]/)[0].trim();
  return p;
}

function wordCount(s) {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

function autoMnemonic(parts, meaning) {
  const names = parts.map(partName);
  const gloss = meaning.split(/[,;/]/)[0].trim();
  if (!parts.length) {
    const s = `${gloss.charAt(0).toUpperCase()}${gloss.slice(1)} stands alone.`;
    return wordCount(s) <= 15 ? s : `${gloss} alone.`;
  }
  if (parts.length === 2) {
    let s = `${names[0].charAt(0).toUpperCase()}${names[0].slice(1)} and ${names[1]}: ${gloss}.`;
    if (wordCount(s) > 15) s = `${names[0]} + ${names[1]} make ${gloss}.`;
    return s;
  }
  let s = `${names[0]}, ${names[1]}, and ${names[2]}: ${gloss}.`;
  if (wordCount(s) > 15) s = `${names.join(" + ")}: ${gloss}.`;
  return s;
}

function starterWord(ch) {
  const level = kanjiByChar[ch]?.level || "N5";
  const candidates = words.filter((w) => (w.kanji || []).includes(ch));
  if (!candidates.length) return ch;
  const score = (w) => {
    let s = 10 - Math.min(10, (w.word || "").length);
    for (const c of w.kanji) {
      if (c === ch) continue;
      const lv = kanjiByChar[c]?.level;
      if (lv === "N5") s += 2;
      else if (lv === level) s += 1;
      else if (!lv) s -= 1;
      else s -= 2;
    }
    if (w.kanji.length === 1) s += 3;
    return s;
  };
  candidates.sort((a, b) => score(b) - score(a));
  return candidates[0].word;
}

const map = new Map();

// Starters: component glyphs that are taught kanji
for (const c of COMPONENTS) {
  if (kanjiSet.has(c.glyph)) {
    map.set(c.glyph, {
      parts: [],
      mnemonic_type: "etymological",
      mnemonic: null,
      starter: true,
    });
  }
}

for (const line of src.split(/\n/)) {
  const t = line.trim();
  if (!t || t.startsWith("#")) continue;
  const [ch, pstr, type, ...rest] = t.split("|");
  if (!kanjiSet.has(ch)) {
    console.warn("skip unknown kanji in src:", ch);
    continue;
  }
  if (map.get(ch)?.starter) continue; // never overwrite starters
  const parts = pstr ? pstr.split("+") : [];
  const mnemonic = rest.join("|") || null;
  map.set(ch, {
    parts,
    mnemonic_type: type,
    mnemonic,
    starter: false,
  });
}

const missing = kanji.filter((k) => !map.has(k.char));
if (missing.length) {
  console.error("Missing recipes:", missing.map((k) => k.char).join(""));
  process.exit(1);
}

const recipes = kanji.map((k) => {
  const r = map.get(k.char);
  let mnemonic = r.mnemonic;
  if (!mnemonic || mnemonic.includes("PLACEHOLDER")) {
    mnemonic = autoMnemonic(r.parts, k.meaning);
  }
  if (wordCount(mnemonic) > 15) {
    mnemonic = autoMnemonic(r.parts, k.meaning);
  }
  const entry = {
    char: k.char,
    level: k.level,
    parts: r.parts,
    mnemonic,
    mnemonic_type: r.mnemonic_type,
    starter_word: starterWord(k.char),
  };
  if (r.starter) entry.starter = true;
  return entry;
});

fs.writeFileSync("recipes.json", JSON.stringify(recipes, null, 2) + "\n");
console.log(
  `Wrote recipes.json: ${recipes.length} entries, ${recipes.filter((r) => r.starter).length} starters`
);
