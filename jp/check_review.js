/* Runs the study app's own code against a stub DOM so the review logic can be
   exercised without a browser. Throwaway harness. */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.dirname(__dirname);
const html = fs.readFileSync(path.join(ROOT, "japanese-study.html"), "utf8");
const data = fs.readFileSync(path.join(ROOT, "japanese-data.js"), "utf8");
const app = html.split("<script>")[1].split("</script>")[0];

function el() {
  return {
    _h: "", set innerHTML(v) { this._h = v; }, get innerHTML() { return this._h; },
    addEventListener() {}, querySelectorAll() { return []; }, focus() {},
    setSelectionRange() {}, setAttribute() {}, getAttribute() { return null; },
    textContent: "", value: "", dataset: {},
    classList: { contains: () => false, toggle: () => false, add() {}, remove() {} }
  };
}
const store = new Map();
const ctx = {
  console,
  localStorage: {
    getItem: k => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v))
  },
  location: { hash: "#/" },
  document: {
    getElementById: () => el(), querySelectorAll: () => [], addEventListener() {},
    createElement: () => el(), body: el()
  },
  window: { addEventListener() {}, scrollTo() {} },
  Blob: class {}, URL: { createObjectURL: () => "", revokeObjectURL() {} },
  FileReader: class {}, alert() {}
};
ctx.globalThis = ctx;

const tests = `
/* ---- harness ---- */
const fail = [];
const ok = (cond, msg) => { if (!cond) fail.push(msg); };

/* scopes */
ok(scopeOf("1-25").length === 25, "Book I scope should be 25 lessons");
ok(scopeOf("26-50").length === 25, "Book II scope should be 25 lessons");
ok(scopeOf("all").length === 50, "all scope should be 50 lessons");
ok(scopeOf("36").join() === "36", "single lesson scope");
ok(isRange("1-25") && isRange("all") && !isRange("36"), "range detection");

/* decks span the scope */
const b1 = deck(scopeOf("1-25"), false);
const b1p = deck(scopeOf("1-25"), true);
ok(b1.length > 900, "Book I deck should hold every word, got " + b1.length);
ok(b1p.length > b1.length, "proper nouns should extend the deck");
ok(new Set(b1.map(c => c.id)).size === b1.length, "card ids must stay unique across lessons");
ok(b1.every(c => c.n >= 1 && c.n <= 25), "every card knows its lesson");

/* drill banks span the scope */
const bank1 = drillBank(scopeOf("1-25"));
const bankAll = drillBank(scopeOf("all"));
ok(bank1.length > 600, "Book I bank, got " + bank1.length);
ok(bankAll.length === bank1.length + drillBank(scopeOf("26-50")).length, "banks partition cleanly");
ok(bankAll.every(q => q.en && q.jp && q.n), "every question carries prompt, answer and lesson");

/* a sweep asks one question per lesson, covering all of them */
const sweep = sweepQuestions(scopeOf("1-25"), drillBank(scopeOf("1-25")));
ok(sweep.length === 25, "sweep should ask 25 questions, got " + sweep.length);
ok(new Set(sweep.map(q => q.n)).size === 25, "sweep must hit each lesson exactly once");
ok(sweep.map(q => q.n).join() === scopeOf("1-25").join(), "sweep runs in lesson order");

/* mixed drills prefer weak and untested lessons */
S.drills = {};
for (let n = 1; n <= 25; n++) S.drills[n] = { history: Array(10).fill(1), byPoint: {}, runs: 1 };
S.drills[7].history = Array(10).fill(0);          // 0%
S.drills[14].history = Array(10).fill(0);
delete S.drills[21];                               // never tested
const mixed = mixedQuestions(scopeOf("1-25"), drillBank(scopeOf("1-25")), 10);
ok(mixed.length === 10, "mixed drill returns ten, got " + mixed.length);
ok(new Set(mixed.map(q => q.n)).size === 10, "mixed drill should not repeat a lesson at this size");
const hit = new Set(mixed.map(q => q.n));
ok(hit.has(7) && hit.has(14) && hit.has(21), "weak and untested lessons must be drawn first");

/* weighting is only a bias, not a filter: over many runs strong lessons appear too */
let sawStrong = false;
for (let i = 0; i < 30 && !sawStrong; i++)
  sawStrong = mixedQuestions(scopeOf("1-25"), drillBank(scopeOf("1-25")), 10).some(q => ![7,14,21].includes(q.n));
ok(sawStrong, "strong lessons should still come up");

/* a single-lesson drill spreads across that lesson's patterns */
const solo = lessonQuestions(drillBank([36]), 10);
ok(solo.length === 10, "single lesson drill size");
ok(new Set(solo.map(q => q.pi)).size >= Math.min(4, points(36).length), "should spread across patterns");

/* scoring: answers written back land on the right lesson */
S.drills = {};
recordAnswer(3, true, 0); recordAnswer(3, false, 1); recordAnswer(9, true, 0);
ok(grammarScore(3).pct === 50, "lesson 3 should read 50%");
ok(grammarScore(9).pct === 100, "lesson 9 should read 100%");
ok(grammarScore(12) === null, "untouched lesson stays unscored");

/* the rolling window keeps recent work honest and history is capped */
S.drills = {};
for (let i = 0; i < 80; i++) recordAnswer(5, i >= 60, 0);   // 60 wrong, then 20 right
ok(S.drills[5].history.length === HISTORY_CAP, "history is capped");
ok(grammarScore(5).pct === 100, "window reflects the last " + WINDOW + " answers, got " + grammarScore(5).pct);

/* old saved data migrates to the new shape */
localStorage.setItem(KEY, JSON.stringify({ drills: { 4: { attempts: [{ ts: 1, total: 10, correct: 6 }], byPoint: {} } } }));
const migrated = load();
ok(!migrated.drills[4].attempts, "attempts should be gone after migration");
ok(migrated.drills[4].history.length === 10, "attempt expands into ten answers");
ok(migrated.drills[4].history.filter(Boolean).length === 6, "and keeps the six correct");

/* the panel and sweep map render without blowing up */
S = blank();
const panel = reviewPanel();
ok(panel.includes("Diagnostic sweep"), "panel offers the sweep");
ok(!/undefined|NaN/.test(panel), "panel renders cleanly");
const map = sweepMap([{ q: { n: 1 }, ok: true }, { q: { n: 2 }, ok: false }]);
ok(map.includes("Start with lesson 2"), "map names the lesson to revisit");
ok(!/undefined|NaN/.test(map), "map renders cleanly");

/* routes parse */
const routes = ["#/", "#/lesson/36", "#/cards/1-25", "#/drill/1-25", "#/sweep/all", "#/cards/36"];
routes.forEach(h => { location.hash = h; route(); });
ok(true, "routing survived");

if (fail.length) { console.log("FAIL"); fail.forEach(f => console.log("  - " + f)); }
else console.log("all checks passed");
`;

vm.createContext(ctx);
vm.runInContext(data, ctx, { filename: "japanese-data.js" });
vm.runInContext(app + tests, ctx, { filename: "japanese-study.html" });
