#!/usr/bin/env node
/**
 * Sound families report + cleanup for Kanji Forge Phase 2.
 *
 * - Groups recipes with mnemonic_type "phonetic" by sound_part
 * - Demotes singleton families (mnemonic_type → invented or etymological)
 * - Writes families.json for the game
 * - Prints a human-readable report
 *
 * Usage: node families.js
 */
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const recipesPath = path.join(ROOT, "recipes.json");
const familiesPath = path.join(ROOT, "families.json");

function demoteType(recipe) {
  const m = String(recipe.mnemonic || "").toLowerCase();
  const soundCue = /sound|reads|reading|phonetic|pronounce|say /.test(m);
  return soundCue ? "invented" : "etymological";
}

function primaryOn(recipe, kanjiByChar) {
  const k = kanjiByChar[recipe.char];
  if (k && k.onyomi && k.onyomi.length) return k.onyomi[0];
  return recipe.family_reading || "?";
}

function main() {
  const recipes = JSON.parse(fs.readFileSync(recipesPath, "utf8"));
  let kanjiByChar = {};
  try {
    const kanji = JSON.parse(fs.readFileSync(path.join(ROOT, "kanji.json"), "utf8"));
    kanji.forEach((k) => { kanjiByChar[k.char] = k; });
  } catch (_) {}

  const phonetic = recipes.filter((r) => r.mnemonic_type === "phonetic");
  const missing = phonetic.filter((r) => !r.sound_part || !r.family_reading);
  if (missing.length) {
    console.error("Phonetic recipes missing sound_part/family_reading:");
    missing.forEach((r) => console.error(" ", r.char));
    process.exit(1);
  }

  const groups = new Map();
  phonetic.forEach((r) => {
    const key = r.sound_part;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(r);
  });

  const kept = [];
  const demoted = [];

  groups.forEach((members, soundPart) => {
    if (members.length >= 2) {
      kept.push({
        sound_part: soundPart,
        family_reading: members[0].family_reading,
        members: members.map((m) => m.char).sort(),
      });
      return;
    }
    // singleton → demote
    members.forEach((m) => {
      const before = m.mnemonic_type;
      const after = demoteType(m);
      m.mnemonic_type = after;
      // keep sound_part / family_reading for debugging? User said lose phonetic label.
      // Strip family fields so game only treats multi-member families as phonetic.
      delete m.sound_part;
      delete m.family_reading;
      delete m.reading_drift;
      demoted.push({ char: m.char, from: before, to: after, alone_with: soundPart });
    });
  });

  kept.sort((a, b) => a.sound_part.localeCompare(b.sound_part, "ja"));

  // Enrich kept families with per-member readings for the report / game
  const families = kept.map((f) => {
    const members = f.members.map((ch) => {
      const r = recipes.find((x) => x.char === ch);
      return {
        char: ch,
        onyomi: primaryOn(r, kanjiByChar),
        reading_drift: !!r.reading_drift,
        family_reading: r.family_reading,
        level: r.level,
        starter_word: r.starter_word,
      };
    });
    return {
      sound_part: f.sound_part,
      family_reading: f.family_reading,
      members,
    };
  });

  fs.writeFileSync(recipesPath, JSON.stringify(recipes, null, 2) + "\n");
  fs.writeFileSync(
    familiesPath,
    JSON.stringify(
      {
        generated: new Date().toISOString().slice(0, 10),
        family_count: families.length,
        families,
      },
      null,
      2
    ) + "\n"
  );

  // —— Report ——
  console.log("=== Sound families report ===\n");
  console.log("Phonetic recipes before grouping:", phonetic.length);
  console.log("Families kept (≥2 members):", families.length);
  console.log("Singletons demoted:", demoted.length);
  console.log("");

  if (families.length) {
    console.log("— Families —");
    families.forEach((f) => {
      console.log(
        `\n  ${f.sound_part}  family_reading ${f.family_reading}  (${f.members.length} members)`
      );
      f.members.forEach((m) => {
        const drift = m.reading_drift ? "  [reading_drift]" : "";
        console.log(`    ${m.char}  ${m.onyomi}${drift}  (${m.level})`);
      });
    });
    console.log("");
  }

  if (demoted.length) {
    console.log("— Demoted singletons (no longer phonetic) —");
    demoted.forEach((d) => {
      console.log(`  ${d.char}  ${d.from} → ${d.to}  (alone under sound_part ${d.alone_with})`);
    });
    console.log("");
  }

  console.log(`Wrote ${path.relative(ROOT, familiesPath)}`);
  console.log(`Updated ${path.relative(ROOT, recipesPath)}`);
  console.log(`\nUI counter will read: Families complete: 0 / ${families.length}`);
}

main();
