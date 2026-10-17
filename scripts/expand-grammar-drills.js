#!/usr/bin/env node
/* Expand CONTENT drills so every grammar point in lessons 1–39 has ≥30
   distinct phrases using that lesson's vocabulary or earlier lessons'. */
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..");
const DATA = path.join(ROOT, "japanese-data.js");
const MIN = 30;
const MAX_LESSON = 39;

const src = fs.readFileSync(DATA, "utf8");
const ctx = { console };
vm.createContext(ctx);
vm.runInContext(
  src + "\nthis.CONTENT=CONTENT; this.VOCAB=VOCAB; this.LESSONS=LESSONS;",
  ctx
);
const { CONTENT, VOCAB, LESSONS } = ctx;

function disp(v) {
  const [r, k] = v;
  return k ? `${k}{${r}}` : r;
}

function bare(display) {
  return String(display || "").replace(/\{[^}]+\}/g, "");
}

function classify(v) {
  const [r, k, en] = v;
  const w = k || r;
  const e = (en || "").toLowerCase();
  if (/ます$/.test(r) || /ます$/.test(w)) return "verb";
  if (
    /い$/.test(r) &&
    /^(big|small|new|old|hot|cold|tall|short|good|bad|fun|busy|free|expensive|cheap|delicious|interesting|difficult|easy|near|far|fast|slow|bright|dark|young|white|black|red|blue|long|heavy|light|sweet|spicy|quiet|noisy|kind|famous|beautiful|clean|dirty|strong|weak|early|late|happy|sad|scary|warm|cool)\b/.test(
      e
    )
  )
    return "iadj";
  if (
    /な$/.test(e) ||
    /\b(quiet|famous|convenient|healthy|genial|pretty|simple|various|important|necessary|free|busy|liked|dislike|skilled|poor at)\b/.test(
      e
    )
  ) {
    /* many な-adjectives are listed without な in the reading */
  }
  if (
    /人$/.test(w) ||
    /さん$/.test(w) ||
    /\b(person|people|friend|teacher|student|doctor|engineer|employee|child|man|woman|Mr\.|Ms\.|boy|girl|nurse|policeman)\b/i.test(
      en
    )
  )
    return "person";
  if (
    /駅$|店$|屋$|館$|国$|市$|学校|会社|病院|銀行|郵便局|図書館|公園|うち|部屋|教室|空港|海|山|食堂|映画館|スーパー|デパート|レストラン|喫茶店/.test(
      w + r
    ) ||
    /\b(place|station|shop|school|office|hospital|park|country|city|home|room|restaurant|airport|sea|mountain|store|library|bank|post office|classroom|department store)\b/i.test(
      en
    )
  )
    return "place";
  if (
    /時$|分$|曜|週|月|年|今日|明日|昨日|毎朝|毎晩|毎日|毎週|毎月|今|午前|午後|晩|朝|昼/.test(
      w + r
    ) ||
    /\b(o'clock|minute|week|month|year|today|tomorrow|yesterday|morning|evening|night|every|now|time|a\.m\.|p\.m\.)\b/i.test(
      en
    )
  )
    return "time";
  if (/い$/.test(r) && !/人$|語$|物$/.test(w) && e.split(/\s+/).length <= 3)
    return "iadj";
  return "thing";
}

function usableVocab(v) {
  const [r, k, en] = v;
  const w = k || r || "";
  if (!r && !k) return false;
  if (/^～|^〜|^\.\.\./.test(w) || /^～|^〜/.test(r || "")) return false;
  if (/ですか|です。|ましょう|ません|でした/.test(w)) return false;
  if (/^Excuse me|^How do you do|^Pleased to|^May I have|^This is Mr/i.test(en || ""))
    return false;
  if ((en || "").length > 80) return false;
  if (/[（(）)]/.test(w) || /[（(）)]/.test(r || "")) return false;
  if (/［|］|\[|\]/.test(w) || /［|］|\[|\]/.test(r || "")) return false;
  if (/^[?？!！.。、,，]+$/.test(w)) return false;
  return true;
}

function vocabPool(upto) {
  const out = [];
  for (let n = 1; n <= upto; n++) {
    for (const v of VOCAB[n].v || []) {
      if (!usableVocab(v)) continue;
      out.push({
        lesson: n,
        r: v[0],
        k: v[1] || "",
        en: cleanEn(v[2] || ""),
        d: disp(v),
        bare: bare(disp(v)),
        cat: classify(v)
      });
    }
    for (const v of VOCAB[n].p || []) {
      if (!usableVocab(v)) continue;
      out.push({
        lesson: n,
        r: v[0],
        k: v[1] || "",
        en: cleanEn(v[2] || ""),
        d: disp(v),
        bare: bare(disp(v)),
        cat: "proper"
      });
    }
  }
  /* Longer first so 日本 matches before 日 when scanning. */
  out.sort((a, b) => b.d.length - a.d.length || b.bare.length - a.bare.length);
  return out;
}

function cleanEn(en) {
  return String(en || "")
    .replace(/\s*\[.*?\]\s*/g, " ")
    .replace(/\s*\(.*?\)\s*/g, " ")
    .replace(/\s+/g, " ")
    .replace(/^to\s+/i, "")
    .trim();
}

function shortEn(en) {
  const e = cleanEn(en);
  const bit = e.split(/[,;]/)[0].trim();
  return bit || e;
}

function uniqKey(jp) {
  return bare(jp).replace(/\s+/g, "");
}

function pick(arr, i) {
  if (!arr.length) return null;
  return arr[i % arr.length];
}

function poolByCat(pool, cat, lessonPrefer) {
  const all = pool.filter(p => p.cat === cat && p.bare.length > 1);
  const lesson = all.filter(p => p.lesson === lessonPrefer);
  return lesson.length >= 3 ? lesson.concat(all) : all;
}

function isConjugationPrompt(en) {
  return (
    /^give (the|a)\b/i.test(en) ||
    /^conjugate\b/i.test(en) ||
    /-form of\b/i.test(en) ||
    /form of\b/i.test(en)
  );
}

function stemMasu(display) {
  const b = bare(display);
  if (!/ます$/.test(b)) return null;
  return b.slice(0, -2);
}

/* ---------- family templates ---------- */

function templatesFor(point, lesson) {
  const pat = point.pattern || "";
  const short = point.short || "";
  const key = `${pat}||${short}`;
  const T = [];

  const add = (fn) => T.push(fn);

  if (pat === "N1は N2です" || short === "identity") {
    add((P, i) => {
      const person = pick(poolByCat(P, "person", lesson), i);
      const role = pick(poolByCat(P, "person", lesson), i + 3) || pick(poolByCat(P, "thing", lesson), i);
      if (!person || !role) return null;
      const subj = i % 4 === 0 ? "わたし" : `${person.d}`;
      const subjEn = i % 4 === 0 ? "I" : shortEn(person.en);
      return [
        `${subjEn} ${i % 4 === 0 ? "am" : "is"} ${aAn(shortEn(role.en))}.`,
        `${subj}は ${role.d}です。`,
        "は marks the topic",
        person.lesson < lesson || role.lesson < lesson ? "review" : "lesson"
      ];
    });
  }

  if (pat === "～さん" || short === "name suffix") {
    const roster = [
      ["ミラー", "Miller"],
      ["山田{やまだ}", "Yamada"],
      ["佐藤{さとう}", "Sato"],
      ["鈴木{すずき}", "Suzuki"],
      ["田中{たなか}", "Tanaka"],
      ["サントス", "Santos"],
      ["カリナ", "Karina"],
      ["マイク", "Mike"],
      ["ワット", "Watt"],
      ["タワポン", "Tawapon"],
      ["シュミト", "Schmidt"],
      ["姜{かん}", "Kang"],
      ["李{り}", "Li"],
      ["スミス", "Smith"],
      ["まつもと", "Matsumoto"],
      ["はやし", "Hayashi"],
      ["いしい", "Ishii"],
      ["キム", "Kim"],
      ["チェン", "Chen"],
      ["ブラウン", "Brown"],
      ["グリーン", "Green"],
      ["うえだ", "Ueda"],
      ["なかむら", "Nakamura"],
      ["もり", "Mori"]
    ];
    add((P, i) => {
      const [jpName, enName] = roster[i % roster.length];
      const role = pick(poolByCat(P, "person", lesson), i) || pick(poolByCat(P, "thing", lesson), i);
      if (!role) return null;
      if (i % 5 === 0) {
        return [
          `I am ${enName}. (do not use ～さん on yourself)`,
          `わたしは ${jpName}です。`,
          "Never add さん to your own name",
          "lesson"
        ];
      }
      return [
        `${i % 2 ? "Ms." : "Mr."} ${enName} is ${aAn(shortEn(role.en))}.`,
        `${jpName}さんは ${role.d}です。`,
        "～さん on others' names",
        role.lesson < lesson ? "review" : "lesson"
      ];
    });
  }

  if (/じゃ ありません|では ありません/.test(pat)) {
    add((P, i) => {
      const person = pick(poolByCat(P, "person", lesson), i) || { d: "わたし", en: "I", lesson };
      const role = pick(poolByCat(P, "person", lesson), i + 2) || pick(poolByCat(P, "thing", lesson), i);
      if (!role) return null;
      const subj = i % 3 === 0 ? "わたし" : person.d;
      const subjEn = i % 3 === 0 ? "I" : shortEn(person.en);
      return [
        `${subjEn} ${i % 3 === 0 ? "am" : "is"} not ${aAn(shortEn(role.en))}.`,
        `${subj}は ${role.d}じゃ ありません。`,
        "じゃ ありません is the negative of です",
        role.lesson < lesson ? "review" : "lesson"
      ];
    });
  }

  if (pat === "N1は N2ですか" || (/ですか/.test(pat) && !/いくら|どう|どんな|何時|何{なに}を|そう/.test(pat))) {
    add((P, i) => {
      const dem = ["これ", "それ", "あれ", "これ", "それ"][i % 5];
      const demEn = ["this", "that", "that over there", "this", "that"][i % 5];
      const thing =
        pick(poolByCat(P, "thing", lesson), i) ||
        pick(poolByCat(P, "person", lesson), i) ||
        pick(poolByCat(P, "place", lesson), i);
      if (!thing) return null;
      const subj = i % 3 === 0 ? dem : pick(poolByCat(P, "person", lesson), i + 1)?.d || dem;
      const subjEn =
        i % 3 === 0
          ? demEn
          : shortEn(pick(poolByCat(P, "person", lesson), i + 1)?.en || demEn);
      return [
        i % 3 === 0
          ? `Is ${demEn} ${aAn(shortEn(thing.en))}?`
          : `Is ${subjEn} ${aAn(shortEn(thing.en))}?`,
        `${subj}は ${thing.d}ですか。`,
        "か turns the sentence into a question",
        thing.lesson < lesson ? "review" : "lesson"
      ];
    });
  }

  if (pat === "Nの (noun omitted)" || short === "mine, yours") {
    add((P, i) => {
      const owners = [
        ["わたし", "mine", "my"],
        ["あなた", "yours", "your"],
        ["ミラーさん", "Miller's", "Miller's"],
        ["佐藤{さとう}さん", "Ms. Sato's", "Ms. Sato's"],
        ["山田{やまだ}さん", "Mr. Yamada's", "Mr. Yamada's"],
        ["先生{せんせい}", "the teacher's", "the teacher's"],
        ["会社{かいしゃ}", "the company's", "the company's"],
        ["友{とも}だち", "my friend's", "my friend's"]
      ];
      const dem = ["これ", "それ", "あれ"][i % 3];
      const demEn = ["This", "That", "That over there"][i % 3];
      const [own, ownEn] = owners[i % owners.length];
      return [
        `${demEn} is ${ownEn}.`,
        `${dem}は ${own}のです。`,
        "の stands in for a known noun",
        "lesson"
      ];
    });
  }

  if (pat === "お～" || short === "polite prefix") {
    const polite = [
      ["お名前{なまえ}", "name", "What is your name?", "お名前{なまえ}は？"],
      ["お国{くに}", "country", "Where are you from?", "お国{くに}は どちらですか。"],
      ["お仕事{しごと}", "work", "What is your job?", "お仕事{しごと}は 何{なん}ですか。"],
      ["お手{て}洗{あら}い", "restroom", "Where is the restroom?", "お手{て}洗{あら}いは どこですか。"],
      ["お金{かね}", "money", "I do not have money.", "お金{かね}が ありません。"],
      ["お茶{ちゃ}", "tea", "Please have some tea.", "お茶{ちゃ}を どうぞ。"],
      ["お水{みず}", "water", "Please give me water.", "お水{みず}を ください。"],
      ["お酒{さけ}", "alcohol", "Do you drink alcohol?", "お酒{さけ}を 飲{の}みますか。"],
      ["お弁当{べんとう}", "boxed lunch", "This is a boxed lunch.", "これは お弁当{べんとう}です。"],
      ["お土産{みやげ}", "souvenir", "This is a souvenir.", "これは お土産{みやげ}です。"],
      ["お客さん{きゃく}", "customer", "That person is a customer.", "あの 人{ひと}は お客さん{きゃく}です。"],
      ["お誕生日{たんじょうび}", "birthday", "Happy birthday.", "お誕生日{たんじょうび} おめでとう。"],
      ["お願い{ねが}いします", "request", "Please (do this for me).", "お願い{ねが}いします。"],
      ["お元気{げんき}", "well-being", "How are you?", "お元気{げんき}ですか。"],
      ["お休{やす}み", "rest", "Good night.", "お休{やす}みなさい。"],
      ["お先{さき}に", "before you", "Excuse me for leaving first.", "お先{さき}に 失礼{しつれい}します。"],
      ["お待{ま}ちください", "waiting", "Please wait.", "お待{ま}ちください。"],
      ["お座{すわ}りください", "sitting", "Please take a seat.", "お座{すわ}りください。"],
      ["お上{あ}がりください", "coming in", "Please come in.", "お上{あ}がりください。"],
      ["お大事{だいじ}に", "take care", "Please take care.", "お大事{だいじ}に。"],
      ["お電話{でんわ}", "phone", "What is your phone number?", "お電話{でんわ}番号{ばんごう}は？"],
      ["お時間{じかん}", "time", "Do you have time?", "お時間{じかん}が ありますか。"],
      ["お体{からだ}", "body", "Please take care of yourself.", "お体{からだ}を 大切{たいせつ}に。"],
      ["お花{はな}", "flowers", "These are flowers.", "これは お花{はな}です。"],
      ["お米{こめ}", "rice", "This is rice.", "これは お米{こめ}です。"],
      ["お魚{さかな}", "fish", "This is fish.", "これは お魚{さかな}です。"],
      ["お肉{にく}", "meat", "This is meat.", "これは お肉{にく}です。"],
      ["お菓子{かし}", "sweets", "These are sweets.", "これは お菓子{かし}です。"],
      ["お皿{さら}", "plate", "This is a plate.", "これは お皿{さら}です。"],
      ["お箸{はし}", "chopsticks", "These are chopsticks.", "これは お箸{はし}です。"]
    ];
    add((P, i) => {
      const row = polite[i % polite.length];
      return [row[2], row[3], "お～ polite prefix", "lesson"];
    });
  }

  if (pat === "Nも" || short === "too, also") {
    const roster = ["ミラーさん","山田{やまだ}さん","佐藤{さとう}さん","カリナさん","サントスさん","わたし","あなた","先生{せんせい}"];
    add((P, i) => {
      const role = pick(poolByCat(P, "person", lesson), i) || pick(poolByCat(P, "thing", lesson), i);
      if (!role) return null;
      const who = roster[i % roster.length];
      return [
        `${bare(who)} is also ${aAn(shortEn(role.en))}.`,
        `${who}も ${role.d}です。`,
        "も replaces は for 'also'",
        role.lesson < lesson ? "review" : "lesson"
      ];
    });
  }

  if (pat === "～ね" || short === "seeking agreement") {
    add((P, i) => {
      const adj = pick(poolByCat(P, "iadj", lesson), i);
      const thing = pick(poolByCat(P, "thing", lesson), i) || pick(poolByCat(P, "place", lesson), i);
      if (adj && thing) {
        return [
          `${aAn(shortEn(thing.en))} is ${shortEn(adj.en)}, isn't it?`,
          `${thing.d}は ${adj.d}ですよネ。`.replace("よネ", "ね"),
          "ね seeks agreement",
          adj.lesson < lesson || thing.lesson < lesson ? "review" : "lesson"
        ];
      }
      if (thing) {
        return [
          `That's ${aAn(shortEn(thing.en))}, isn't it?`,
          `それは ${thing.d}ですね。`,
          "ね seeks agreement",
          thing.lesson < lesson ? "review" : "lesson"
        ];
      }
      return ["That's right, isn't it?", "そうですね。", "ね seeks agreement", "lesson"];
    });
  }

  if (/よく／だいたい|degree adverbs/.test(pat + short)) {
    const advs = [
      ["よく", "often"],
      ["だいたい", "mostly"],
      ["たくさん", "a lot"],
      ["少{すこ}し", "a little"],
      ["あまり", "not much"],
      ["全然{ぜんぜん}", "not at all"]
    ];
    add((P, i) => {
      const [adv, advEn] = advs[i % advs.length];
      const verb = pick(poolByCat(P, "verb", lesson), i);
      if (!verb) return null;
      const neg = /あまり|全然/.test(adv);
      const jpVerb = neg ? verb.d.replace(/ます$/, "ません") : verb.d;
      return [
        `I ${advEn} ${shortEn(verb.en)}${neg ? "" : ""}.`,
        `${adv} ${jpVerb}。`,
        "degree adverb",
        verb.lesson < lesson ? "review" : "lesson"
      ];
    });
  }

  if (/ご注文|polite ご/.test(pat + short)) {
    const rows = [
      ["ご注文{ちゅうもん}は？", "May I take your order?"],
      ["ご案内{あんない}します。", "I will show you the way."],
      ["ご家族{かぞく}は？", "How about your family?"],
      ["ご主人{しゅじん}は？", "How about your husband?"],
      ["ご住所{じゅうしょ}は？", "What is your address?"],
      ["ご職業{しょくぎょう}は？", "What is your occupation?"],
      ["ご飯{はん}を 食{た}べます。", "I eat a meal (ご before 飯)."],
      ["ご御馳{ち}走{そう}様{さま}でした。", "Thank you for the meal."],
      ["ご心配{しんぱい}なく。", "Don't worry."],
      ["ごゆっくり。", "Please take your time."],
      ["ご安全{あんぜん}に。", "Have a safe trip."],
      ["ご成功{せいこう}を。", "I wish you success."],
      ["ご確認{かくにん}ください。", "Please confirm."],
      ["ご連絡{れんらく}ください。", "Please contact me."],
      ["ご質問{しつもん}は？", "Any questions?"],
      ["ご意見{いけん}を ください。", "Please give me your opinion."],
      ["ご予約{よやく}は？", "Do you have a reservation?"],
      ["ご都合{つごう}は？", "How is your schedule?"],
      ["ご相談{そうだん}したいです。", "I would like to consult you."],
      ["ご紹介{しょうかい}します。", "Let me introduce you."],
      ["ご説明{せつめい}します。", "I will explain."],
      ["ご報告{ほうこく}します。", "I will report."],
      ["ご協力{きょうりょく}ください。", "Please cooperate."],
      ["ご注意{ちゅうい}ください。", "Please be careful."],
      ["ご利用{りよう}ください。", "Please make use of it."],
      ["ご来店{らいてん}ください。", "Please visit our shop."],
      ["ご来社{らいしゃ}ください。", "Please visit our company."],
      ["ご来場{らいじょう}ください。", "Please come to the venue."],
      ["ご来賓{らいひん}の 方{かた}。", "Distinguished guests."],
      ["ご本人{ほんにん}ですか。", "Are you the person themself?"]
    ];
    add((P, i) => {
      const [jp, en] = rows[i % rows.length];
      return [en, jp, "ご～ polite prefix", "lesson"];
    });
  }

  if (/N1は N2が adj|double subject/.test(pat + short)) {
    add((P, i) => {
      const person = pick(poolByCat(P, "person", lesson), i);
      const thing = pick(poolByCat(P, "thing", lesson), i);
      const adj = pick(poolByCat(P, "iadj", lesson), i);
      if (!person || !thing || !adj) return null;
      return [
        `As for ${shortEn(person.en)}, ${shortEn(thing.en)} is ${shortEn(adj.en)}.`,
        `${person.d}は ${thing.d}が ${adj.d}です。`,
        "は marks the topic, が the subject of the adjective",
        person.lesson < lesson || thing.lesson < lesson || adj.lesson < lesson ? "review" : "lesson"
      ];
    });
  }

  if (/まだ V\(affirmative\)|still going on/.test(pat + short)) {
    add((P, i) => {
      const verb = pick(poolByCat(P, "verb", lesson), i);
      if (!verb || !stemMasu(verb.d)) return null;
      return [
        `I am still ${shortEn(verb.en)}ing.`,
        `まだ ${verb.d.replace(/ます$/, "ています")}。`,
        "まだ with an affirmative",
        verb.lesson < lesson ? "review" : "lesson"
      ];
    });
  }

  if (/まだ Vて-form いません|not yet/.test(pat + short)) {
    add((P, i) => {
      const verb = pick(poolByCat(P, "verb", lesson), i);
      if (!verb) return null;
      const te = conjugateFromMasu(verb.d, "te");
      if (!te) return null;
      return [
        `I have not ${shortEn(verb.en)} yet.`,
        `まだ ${te} いません。`,
        "まだ + て いません",
        verb.lesson < lesson ? "review" : "lesson"
      ];
    });
  }

  if (/Quantifierで|within an amount/.test(pat + short)) {
    const qs = ["10分{ぷん}", "1時間{じかん}", "3,000円{えん}", "5人{にん}", "2つ", "100メートル"];
    add((P, i) => {
      const verb = pick(poolByCat(P, "verb", lesson), i);
      const q = qs[i % qs.length];
      if (!verb) return null;
      return [
        `I can ${shortEn(verb.en)} in/with ${bare(q)}.`,
        `${q}で ${verb.d}。`,
        "quantifier + で",
        verb.lesson < lesson ? "review" : "lesson"
      ];
    });
  }

  if (/N1の N2/.test(pat)) {
    add((P, i) => {
      const a = pick(poolByCat(P, "proper", lesson).concat(poolByCat(P, "place", lesson)), i);
      const b = pick(poolByCat(P, "thing", lesson).concat(poolByCat(P, "person", lesson)), i + 2);
      if (!a || !b) return null;
      return [
        `${aAn(shortEn(b.en))} of ${shortEn(a.en)} / ${shortEn(a.en)}'s ${shortEn(b.en)}.`,
        `${a.d}の ${b.d}です。`,
        "の links two nouns",
        a.lesson < lesson || b.lesson < lesson ? "review" : "lesson"
      ];
    });
  }

  if (/これ|それ|あれ/.test(pat) && /です/.test(pat + (point.examples?.[0]?.[0] || ""))) {
    add((P, i) => {
      const dem = ["これ", "それ", "あれ"][i % 3];
      const demEn = ["This", "That (near you)", "That (over there)"][i % 3];
      const thing = pick(poolByCat(P, "thing", lesson), i);
      if (!thing) return null;
      return [
        `${demEn} is ${aAn(shortEn(thing.en))}.`,
        `${dem}は ${thing.d}です。`,
        `${dem} is a standalone demonstrative`,
        thing.lesson < lesson ? "review" : "lesson"
      ];
    });
  }

  if (/この／その／あの/.test(pat)) {
    add((P, i) => {
      const dem = ["この", "その", "あの"][i % 3];
      const demEn = ["this", "that", "that"][i % 3];
      const thing = pick(poolByCat(P, "thing", lesson), i);
      if (!thing) return null;
      return [
        `${demEn[0].toUpperCase()}${demEn.slice(1)} ${shortEn(thing.en)} is good.`,
        `${dem} ${thing.d}は いいです。`,
        `${dem} attaches to a noun`,
        thing.lesson < lesson ? "review" : "lesson"
      ];
    });
  }

  if (/ここ|そこ|あそこ/.test(pat) && !/こちら/.test(pat)) {
    add((P, i) => {
      const dem = ["ここ", "そこ", "あそこ"][i % 3];
      const demEn = ["Here", "There", "Over there"][i % 3];
      const place = pick(poolByCat(P, "place", lesson), i) || pick(poolByCat(P, "thing", lesson), i);
      if (!place) return null;
      return [
        `${demEn} is ${aAn(shortEn(place.en))}.`,
        `${dem}は ${place.d}です。`,
        "",
        place.lesson < lesson ? "review" : "lesson"
      ];
    });
  }

  if (/へ 行|へ 来|へ 帰|place\)へ/.test(pat)) {
    add((P, i) => {
      const place = pick(poolByCat(P, "place", lesson), i);
      const verb = [
        ["行{い}きます", "am going to"],
        ["来{き}ます", "will come to"],
        ["帰{かえ}ります", "will return to"]
      ][i % 3];
      if (!place) return null;
      return [
        `I ${verb[1]} ${shortEn(place.en)}.`,
        `${place.d}へ ${verb[0]}。`,
        "へ marks the destination (pronounced e)",
        place.lesson < lesson ? "review" : "lesson"
      ];
    });
  }

  if (/vehicle\)で|で 行{い}きます/.test(pat) || /By train/.test(point.explain || "")) {
    add((P, i) => {
      const vehicles = P.filter(
        p =>
          /電車|バス|タクシー|自転車|歩|車|地下鉄|新幹線/.test(p.d + p.r) ||
          /\b(train|bus|taxi|bicycle|car|subway|on foot)\b/i.test(p.en)
      );
      const v = pick(vehicles.length ? vehicles : poolByCat(P, "thing", lesson), i);
      const place = pick(poolByCat(P, "place", lesson), i + 1);
      if (!v || !place) return null;
      return [
        `I go to ${shortEn(place.en)} by ${shortEn(v.en)}.`,
        `${place.d}へ ${v.d}で 行{い}きます。`,
        "で marks the means",
        v.lesson < lesson || place.lesson < lesson ? "review" : "lesson"
      ];
    });
  }

  if (/を V/.test(pat) || /を します/.test(pat) || short.includes("direct object")) {
    add((P, i) => {
      const obj = pick(poolByCat(P, "thing", lesson), i);
      const verbs = poolByCat(P, "verb", lesson).filter(v =>
        /食べ|飲み|見|読|書|買|聞|使|作|習|勉強|します/.test(v.d + v.r)
      );
      const verb = pick(verbs.length ? verbs : poolByCat(P, "verb", lesson), i);
      if (!obj || !verb) return null;
      return [
        `I ${shortEn(verb.en)} ${shortEn(obj.en)}.`,
        `${obj.d}を ${verb.d}。`,
        "を marks the direct object",
        obj.lesson < lesson || verb.lesson < lesson ? "review" : "lesson"
      ];
    });
  }

  if (/place\)で V/.test(pat) || short.includes("place of action")) {
    add((P, i) => {
      const place = pick(poolByCat(P, "place", lesson), i);
      const verb = pick(poolByCat(P, "verb", lesson), i);
      if (!place || !verb) return null;
      return [
        `I ${shortEn(verb.en)} at ${shortEn(place.en)}.`,
        `${place.d}で ${verb.d}。`,
        "で marks where the action happens",
        place.lesson < lesson || verb.lesson < lesson ? "review" : "lesson"
      ];
    });
  }

  if (/ませんか/.test(pat)) {
    add((P, i) => {
      const verb = pick(poolByCat(P, "verb", lesson), i);
      if (!verb) return null;
      const stem = stemMasu(verb.d);
      if (!stem) return null;
      const jpVerb = verb.d.replace(/ます$/, "ませんか");
      return [
        `Won't you ${shortEn(verb.en)}?`,
        `${jpVerb}。`,
        "ませんか is a soft invitation",
        verb.lesson < lesson ? "review" : "lesson"
      ];
    });
  }

  if (/ましょう/.test(pat)) {
    add((P, i) => {
      const verb = pick(poolByCat(P, "verb", lesson), i);
      if (!verb || !stemMasu(verb.d)) return null;
      return [
        `Let's ${shortEn(verb.en)}.`,
        `${verb.d.replace(/ます$/, "ましょう")}。`,
        "ましょう proposes doing it together",
        verb.lesson < lesson ? "review" : "lesson"
      ];
    });
  }

  if (/い-adjective|い-adj|い形容/.test(pat + short) || (pat.includes("い-adjective"))) {
    add((P, i) => {
      const adj = pick(poolByCat(P, "iadj", lesson), i);
      const noun = pick(poolByCat(P, "thing", lesson).concat(poolByCat(P, "place", lesson)), i);
      if (!adj || !noun) return null;
      return [
        `${aAn(shortEn(noun.en))} is ${shortEn(adj.en)}.`,
        `${noun.d}は ${adj.d}です。`,
        "い-adjectives link with です",
        adj.lesson < lesson || noun.lesson < lesson ? "review" : "lesson"
      ];
    });
  }

  if (/な-adjective|な-adj/.test(pat + short)) {
    add((P, i) => {
      const adj = P.filter(p => /元気|暇|便利|有名|上手|好き|嫌|静|簡単|大切|必要|綺麗|きれい|静か|暇|親切|下手/.test(p.d + p.r));
      const a = pick(adj.length ? adj : poolByCat(P, "thing", lesson), i);
      const noun = pick(poolByCat(P, "person", lesson).concat(poolByCat(P, "place", lesson)), i);
      if (!a || !noun) return null;
      return [
        `${shortEn(noun.en)} is ${shortEn(a.en)}.`,
        `${noun.d}は ${a.d}です。`,
        "な-adjectives take です in predicates",
        a.lesson < lesson || noun.lesson < lesson ? "review" : "lesson"
      ];
    });
  }

  if (/あります|います/.test(pat) && /に/.test(pat)) {
    add((P, i) => {
      const place = pick(poolByCat(P, "place", lesson), i);
      const thing = pick(poolByCat(P, "thing", lesson), i);
      const person = pick(poolByCat(P, "person", lesson), i);
      if (!place) return null;
      if (i % 2 === 0 && thing) {
        return [
          `There is ${aAn(shortEn(thing.en))} in/at ${shortEn(place.en)}.`,
          `${place.d}に ${thing.d}が あります。`,
          "あります for non-living things",
          place.lesson < lesson || thing.lesson < lesson ? "review" : "lesson"
        ];
      }
      if (person) {
        return [
          `There is ${aAn(shortEn(person.en))} in/at ${shortEn(place.en)}.`,
          `${place.d}に ${person.d}が います。`,
          "います for people and animals",
          place.lesson < lesson || person.lesson < lesson ? "review" : "lesson"
        ];
      }
      return null;
    });
  }

  if (/たいです/.test(pat)) {
    add((P, i) => {
      const verb = pick(poolByCat(P, "verb", lesson), i);
      if (!verb || !stemMasu(verb.d)) return null;
      return [
        `I want to ${shortEn(verb.en)}.`,
        `${verb.d.replace(/ます$/, "たいです")}。`,
        "ます-stem + たいです",
        verb.lesson < lesson ? "review" : "lesson"
      ];
    });
  }

  if (/て ください|てください/.test(pat) || /て form/.test(short) && /please/i.test(point.explain || "")) {
    add((P, i) => {
      const verb = pick(poolByCat(P, "verb", lesson), i);
      if (!verb) return null;
      /* Use ます form + note — full て conversion is irregular; prefer cloning for quality. */
      return null;
    });
  }

  if (/から|まで/.test(pat) && /N1から/.test(pat)) {
    add((P, i) => {
      const a = pick(poolByCat(P, "place", lesson).concat(poolByCat(P, "time", lesson)), i);
      const b = pick(poolByCat(P, "place", lesson).concat(poolByCat(P, "time", lesson)), i + 3);
      if (!a || !b || a.d === b.d) return null;
      return [
        `From ${shortEn(a.en)} to ${shortEn(b.en)}.`,
        `${a.d}から ${b.d}までです。`,
        "から…まで marks a range",
        a.lesson < lesson || b.lesson < lesson ? "review" : "lesson"
      ];
    });
  }

  if (/N\(time\)に V/.test(pat) || (pat.includes("に V") && /time/i.test(pat))) {
    add((P, i) => {
      const t = pick(poolByCat(P, "time", lesson), i);
      const verb = pick(poolByCat(P, "verb", lesson), i);
      if (!t || !verb) return null;
      return [
        `I ${shortEn(verb.en)} at ${shortEn(t.en)}.`,
        `${t.d}に ${verb.d}。`,
        "に marks an absolute time",
        t.lesson < lesson || verb.lesson < lesson ? "review" : "lesson"
      ];
    });
  }

  if (/person\)と V/.test(pat) || short.includes("with someone")) {
    add((P, i) => {
      const person = pick(poolByCat(P, "person", lesson), i);
      const verb = pick(poolByCat(P, "verb", lesson), i);
      if (!person || !verb) return null;
      return [
        `I ${shortEn(verb.en)} with ${shortEn(person.en)}.`,
        `${person.d}と ${verb.d}。`,
        "と marks a companion",
        person.lesson < lesson || verb.lesson < lesson ? "review" : "lesson"
      ];
    });
  }

  if (/tool／means\)で|means\)で/.test(pat)) {
    add((P, i) => {
      const tool = pick(poolByCat(P, "thing", lesson), i);
      const verb = pick(poolByCat(P, "verb", lesson), i);
      if (!tool || !verb) return null;
      return [
        `I ${shortEn(verb.en)} with/by ${shortEn(tool.en)}.`,
        `${tool.d}で ${verb.d}。`,
        "で marks the tool or means",
        tool.lesson < lesson || verb.lesson < lesson ? "review" : "lesson"
      ];
    });
  }

  /* Generic masu sentence fallback for verb-heavy points */
  if (/ます/.test(pat) && !T.length) {
    add((P, i) => {
      const verb = pick(poolByCat(P, "verb", lesson), i);
      const thing = pick(poolByCat(P, "thing", lesson), i);
      if (!verb) return null;
      if (thing && i % 2 === 0) {
        return [
          `I ${shortEn(verb.en)} ${shortEn(thing.en)}.`,
          `${thing.d}を ${verb.d}。`,
          point.short || "",
          verb.lesson < lesson || thing.lesson < lesson ? "review" : "lesson"
        ];
      }
      return [
        `I ${shortEn(verb.en)}.`,
        `${verb.d}。`,
        point.short || "",
        verb.lesson < lesson ? "review" : "lesson"
      ];
    });
  }

  return T;
}

function aAn(word) {
  const w = String(word || "").trim();
  if (!w) return w;
  return /^[aeiou]/i.test(w) ? `an ${w}` : `a ${w}`;
}

/* ---------- clone / substitute existing drills ---------- */

function findHits(jp, pool) {
  const hits = [];
  const used = new Set();
  for (const p of pool) {
    if (p.bare.length < 2) continue;
    if (jp.includes(p.d) || jp.includes(p.bare)) {
      const key = p.bare;
      if (used.has(key)) continue;
      used.add(key);
      hits.push(p);
    }
  }
  return hits;
}

function looksBroken(en, jp) {
  const b = bare(jp);
  if (/たちたち|さんさん|のですのです|はは |をを |にに |でで /.test(b)) return true;
  if (/\{[^}]*\{/.test(jp)) return true;
  if (/\ba\s+a\b|\ban\s+an\b|\bthe\s+the\b/i.test(en)) return true;
  if (/\bis a you\b|\ba you\b|\ban I\b|\ba I\b/i.test(en)) return true;
  if (/\(\s*\)/.test(en)) return true;
  if (/～|〜/.test(b)) return true;
  return false;
}

function swapDrill(drill, oldW, newW, lesson) {
  const [en, jp, note, tier] = drill;
  if (!jp.includes(oldW.d) && !jp.includes(oldW.bare)) return null;
  /* Only swap when the English gloss is clearly present — avoids "a you". */
  const enBit = shortEn(oldW.en);
  if (!enBit || enBit.length < 3) return null;
  const enRe = new RegExp(
    `\\b${enBit.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
    "i"
  );
  if (!enRe.test(en)) return null;
  if (oldW.cat !== newW.cat) return null;
  let newJp = jp;
  if (jp.includes(oldW.d)) newJp = jp.split(oldW.d).join(newW.d);
  else newJp = jp.split(oldW.bare).join(newW.d);
  if (newJp === jp) return null;
  const repl = shortEn(newW.en);
  const newEn = en.replace(enRe, repl);
  if (looksBroken(newEn, newJp)) return null;
  const review =
    newW.lesson < lesson || tier === "review" || oldW.lesson < lesson
      ? "review"
      : "lesson";
  const out = [newEn, newJp, note || ""];
  if (review === "review") out.push("review");
  return out;
}

function readingOf(display) {
  /* Prefer kana inside {} if present; else bare text. Strip group tags. */
  const m = String(display || "").match(/\{([^}]+)\}/);
  const raw = m ? m[1] : bare(display);
  return String(raw)
    .replace(/［.*?］/g, "")
    .replace(/\[.*?\]/g, "")
    .replace(/\s+/g, "")
    .replace(/III/g, "")
    .replace(/II/g, "")
    .replace(/([^a-zA-Z])I$/g, "$1");
}

function isGroupII(display) {
  const b = bare(display);
  const r = readingOf(display);
  if (/します$/.test(b) && b !== "します") return false; /* 勉強します etc = III */
  if (/します$/.test(r) && r !== "します") return false;
  if (b === "来ます" || /来\{き\}ます/.test(display) || r === "きます") return false;
  if (b === "します" || r === "します") return false;
  /* Group II: ます-stem ends in e-row OR the classic みます/びます… no — みます is GI.
     Group II from ます-form: drop ます and the stem ends with e/i vowel sound in kana:
     たべます→べ, みます(見る)→み. Minna marks many with II in the gloss; also
     e-row before ます is reliably GII, and i-row ます that are GII are いる/みる/etc. */
  if (/II/.test(display)) return true;
  if (/[えけせてねべめれげぜでぺ]ます$/.test(r)) return true;
  if (/^(み|い|おり|あび|かり|たり|しめ|つけ|あけ|しめ)ます$/.test(r)) return true;
  return false;
}

function isGroupIII(display) {
  const b = bare(display);
  const r = readingOf(display);
  if (/III/.test(display)) return true;
  if (b === "します" || r === "します") return true;
  if (b === "来ます" || /来\{き\}ます/.test(display) || r === "きます") return true;
  if (/します$/.test(r) && r !== "します") return true;
  if (/してきます$|てきます$/.test(r)) return true;
  return false;
}

function conjugateFromMasu(display, kind) {
  const d = display;
  const b = bare(d);
  const r = readingOf(d);
  const g3 = isGroupIII(d);
  const g2 = !g3 && isGroupII(d);
  /* Use reading for ending checks so kanji verbs conjugate correctly. */
  const end = r || b;

  const replEnd = (readingSuffix, replacement) => {
    /* Replace ます-ending on the display string when possible; fall back to reading-only. */
    if (new RegExp(readingSuffix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$").test(b)) {
      return d.replace(new RegExp(readingSuffix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$"), replacement);
    }
    /* Kanji verb: replace trailing ます after adjusting via reading map */
    if (/ます$/.test(d) || /ます$/.test(b)) {
      const stemDisp = d.replace(/ます$/, "").replace(/\{[^}]+\}$/, m => m);
      /* simpler: strip ます from display and append replacement without the old ending kana */
      if (g2 || g3) return d.replace(/ます$/, replacement.replace(/^(られ|れ|よ|ろ|れば|な)?/, ""));
    }
    return null;
  };

  /* Helper: produce form by rewriting the reading inside {} or the bare ending. */
  const rewrite = mapFn => {
    if (/\{[^}]+\}/.test(d)) {
      return d.replace(/\{([^}]+)\}/, (_, rd) => {
        const next = mapFn(rd.replace(/\s+/g, ""));
        return next == null ? `{${rd}}` : `{${next}}`;
      }).replace(/ます$/, () => {
        /* if mapFn already returned full form in braces only, also fix outer */
        return "ます";
      });
    }
    const next = mapFn(end);
    return next;
  };

  /* Cleaner approach: conjugate the reading, then rebuild display. */
  const conjReading = mapFn => {
    const nextRead = mapFn(end);
    if (nextRead == null) return null;
    if (/\{[^}]+\}/.test(d)) {
      /* Replace reading and sync the outer kana ending with the new reading end. */
      const outer = bare(d);
      const oldRead = end;
      if (!oldRead.endsWith("ます")) return null;
      const oldStemLen = oldRead.length - 2;
      const newStem = nextRead.replace(/(ます|て|で|た|だ|ない|る|う|く|ぐ|す|つ|ぬ|ぶ|む|よう|おう|ろう|とう|そう|こう|ごう|もう|ぼう|のう|ろ|え|け|せ|て|ね|べ|め|れ|げ|ぜ|で|ぺ|な|ば)$/, "");
      /* Build: kanji/kana stem from display + new ending from nextRead */
      const dispStem = outer.endsWith("ます") ? outer.slice(0, -2) : outer;
      const newEnding = nextRead.slice(oldStemLen > 0 && nextRead.startsWith(oldRead.slice(0, Math.min(3, oldStemLen))) ? -1 : 0);
      /* Simpler reliable path: use reading-only answer when kanji rebuild is hard */
      const kanjiPart = d.replace(/\{[^}]+\}ます$/, "").replace(/ます$/, "");
      if (kanjiPart && nextRead) {
        /* e.g. 食べ{たべ}ます → need 食べ{たべ}て : keep kanji stem, new reading */
        const kStem = bare(d).replace(/ます$/, "");
        const rStem = oldRead.replace(/ます$/, "");
        const rNewStem = nextRead.replace(/(ます|て|で|た|だ|ない|る|う|く|ぐ|す|つ|ぬ|ぶ|む|よう|おう|ろう|とう|そう|こう|ごう|もう|ぼう|のう|ろ|え|け|せ|ね|べ|め|れ|げ|ぜ|ぺ|な|ば|れば|られます|られます|できます|します|して|した|しない|する|しろ|こい|こよう|くれば|こられます)$/u, "");
        const ending = nextRead.slice(rStem.length > 0 ? rNewStem.length : 0);
        /* Use full nextRead as furigana of conjugated word written in kana if needed */
        if (/^[ぁ-んァ-ンー]+$/.test(kStem) || kStem.length <= 1) return nextRead;
        /* Map common: keep kanji stem, attach ending from conjugated reading */
        const conjugatedEnding = nextRead.slice(rStem.length);
        if (conjugatedEnding) return `${kStem.replace(/[ぁ-ん]+$/,"")}${kStem.match(/[ぁ-ん]+$/)?.[0] || ""}${conjugatedEnding}`.replace(/ます$/, "") || `${kStem.slice(0, -0)}${conjugatedEnding}`;
      }
      return nextRead;
    }
    return mapFn(end);
  };

  /* Practical conjugator: work on reading, return reading form (with kanji when trivial). */
  const fromReading = mapFn => {
    const next = mapFn(end);
    if (!next) return null;
    if (!/\{/.test(d)) return next;
    const kStem = bare(d).replace(/ます$/, "");
    const rStem = end.replace(/ます$/, "");
    if (!end.endsWith("ます") || !kStem) return next;
    const suffix = next.startsWith(rStem) ? next.slice(rStem.length) : null;
    if (suffix != null) {
      /* Keep kanji stem + phonetic suffix; add furigana for the stem if original had it */
      const furigana = d.match(/\{([^}]+)\}/);
      if (furigana) {
        const stemFuri = furigana[1].replace(/ます$/, "");
        /* Find kanji portion before okurigana */
        const m = kStem.match(/^(.+?)([ぁ-ん]*)$/);
        if (m) return `${m[1]}{${stemFuri}}${m[2] || ""}${suffix}`;
      }
      return kStem + suffix;
    }
    return next;
  };

  if (kind === "passive") {
    return fromReading(rd => {
      rd = rd.replace(/III|II/g, "");
      if (rd === "きます") return "こられます";
      if (g3 || /します$/.test(rd)) return rd.replace(/します$/, "されます");
      if (g2) return rd.replace(/ます$/, "られます");
      if (/います$/.test(rd)) return rd.replace(/います$/, "われます");
      if (/ちます$/.test(rd)) return rd.replace(/ちます$/, "たれます");
      if (/ります$/.test(rd)) return rd.replace(/ります$/, "られます");
      if (/みます$/.test(rd)) return rd.replace(/みます$/, "まれます");
      if (/びます$/.test(rd)) return rd.replace(/びます$/, "ばれます");
      if (/にます$/.test(rd)) return rd.replace(/にます$/, "なれます");
      if (/きます$/.test(rd)) return rd.replace(/きます$/, "かれます");
      if (/ぎます$/.test(rd)) return rd.replace(/ぎます$/, "がれます");
      if (/します$/.test(rd)) return rd.replace(/します$/, "されます");
      return null;
    });
  }

  if (kind === "potential") {
    return fromReading(rd => {
      if (rd === "きます") return "こられます";
      if (g3 || (/します$/.test(rd) && rd !== "します" && isGroupIII(d))) return rd.replace(/します$/, "できます");
      if (rd === "します") return "できます";
      if (g2) return rd.replace(/ます$/, "られます");
      if (/います$/.test(rd)) return rd.replace(/います$/, "えます");
      if (/ちます$/.test(rd)) return rd.replace(/ちます$/, "てます");
      if (/ります$/.test(rd)) return rd.replace(/ります$/, "れます");
      if (/みます$/.test(rd)) return rd.replace(/みます$/, "めます");
      if (/びます$/.test(rd)) return rd.replace(/びます$/, "べます");
      if (/にます$/.test(rd)) return rd.replace(/にます$/, "ねます");
      if (/きます$/.test(rd)) return rd.replace(/きます$/, "けます");
      if (/ぎます$/.test(rd)) return rd.replace(/ぎます$/, "げます");
      if (/します$/.test(rd)) return rd.replace(/します$/, "せます");
      return null;
    });
  }

  if (kind === "te") {
    return fromReading(rd => {
      if (rd === "きます") return "きて";
      if (g3 || /します$/.test(rd)) return rd.replace(/します$/, "して");
      if (g2) return rd.replace(/ます$/, "て");
      if (/います$|ちます$|ります$/.test(rd)) return rd.replace(/(います|ちます|ります)$/, "って");
      if (/みます$|びます$|にます$/.test(rd)) return rd.replace(/(みます|びます|にます)$/, "んで");
      if (/きます$/.test(rd)) return rd.replace(/きます$/, "いて");
      if (/ぎます$/.test(rd)) return rd.replace(/ぎます$/, "いで");
      if (/します$/.test(rd)) return rd.replace(/します$/, "して");
      return null;
    });
  }

  if (kind === "ta") {
    const te = conjugateFromMasu(d, "te");
    if (!te) return null;
    return te.replace(/て$/, "た").replace(/で$/, "だ");
  }

  if (kind === "nai") {
    return fromReading(rd => {
      if (rd === "きます") return "こない";
      if (g3 || /します$/.test(rd)) return rd.replace(/します$/, "しない");
      if (g2) return rd.replace(/ます$/, "ない");
      if (/います$/.test(rd)) return rd.replace(/います$/, "わない");
      if (/ちます$/.test(rd)) return rd.replace(/ちます$/, "たない");
      if (/ります$/.test(rd)) return rd.replace(/ります$/, "らない");
      if (/みます$/.test(rd)) return rd.replace(/みます$/, "まない");
      if (/びます$/.test(rd)) return rd.replace(/びます$/, "ばない");
      if (/にます$/.test(rd)) return rd.replace(/にます$/, "なない");
      if (/きます$/.test(rd)) return rd.replace(/きます$/, "かない");
      if (/ぎます$/.test(rd)) return rd.replace(/ぎます$/, "がない");
      if (/します$/.test(rd)) return rd.replace(/します$/, "さない");
      return null;
    });
  }

  if (kind === "dict") {
    return fromReading(rd => {
      if (rd === "きます") return "くる";
      if (g3 || /します$/.test(rd)) return rd.replace(/します$/, "する");
      if (g2) return rd.replace(/ます$/, "る");
      if (/います$/.test(rd)) return rd.replace(/います$/, "う");
      if (/ちます$/.test(rd)) return rd.replace(/ちます$/, "つ");
      if (/ります$/.test(rd)) return rd.replace(/ります$/, "る");
      if (/みます$/.test(rd)) return rd.replace(/みます$/, "む");
      if (/びます$/.test(rd)) return rd.replace(/びます$/, "ぶ");
      if (/にます$/.test(rd)) return rd.replace(/にます$/, "ぬ");
      if (/きます$/.test(rd)) return rd.replace(/きます$/, "く");
      if (/ぎます$/.test(rd)) return rd.replace(/ぎます$/, "ぐ");
      if (/します$/.test(rd)) return rd.replace(/します$/, "す");
      return null;
    });
  }

  if (kind === "volitional") {
    return fromReading(rd => {
      if (rd === "きます") return "こよう";
      if (g3 || /します$/.test(rd)) return rd.replace(/します$/, "しよう");
      if (g2) return rd.replace(/ます$/, "よう");
      if (/います$/.test(rd)) return rd.replace(/います$/, "おう");
      if (/ちます$/.test(rd)) return rd.replace(/ちます$/, "とう");
      if (/ります$/.test(rd)) return rd.replace(/ります$/, "ろう");
      if (/みます$/.test(rd)) return rd.replace(/みます$/, "もう");
      if (/びます$/.test(rd)) return rd.replace(/びます$/, "ぼう");
      if (/にます$/.test(rd)) return rd.replace(/にます$/, "のう");
      if (/きます$/.test(rd)) return rd.replace(/きます$/, "こう");
      if (/ぎます$/.test(rd)) return rd.replace(/ぎます$/, "ごう");
      if (/します$/.test(rd)) return rd.replace(/します$/, "そう");
      return null;
    });
  }

  if (kind === "imperative") {
    return fromReading(rd => {
      if (rd === "きます") return "こい";
      if (g3 || /します$/.test(rd)) return rd.replace(/します$/, "しろ");
      if (g2) return rd.replace(/ます$/, "ろ");
      if (/います$/.test(rd)) return rd.replace(/います$/, "え");
      if (/ちます$/.test(rd)) return rd.replace(/ちます$/, "て");
      if (/ります$/.test(rd)) return rd.replace(/ります$/, "れ");
      if (/みます$/.test(rd)) return rd.replace(/みます$/, "め");
      if (/びます$/.test(rd)) return rd.replace(/びます$/, "べ");
      if (/にます$/.test(rd)) return rd.replace(/にます$/, "ね");
      if (/きます$/.test(rd)) return rd.replace(/きます$/, "け");
      if (/ぎます$/.test(rd)) return rd.replace(/ぎます$/, "げ");
      if (/します$/.test(rd)) return rd.replace(/します$/, "せ");
      return null;
    });
  }

  if (kind === "prohibitive") {
    const dict = conjugateFromMasu(d, "dict");
    return dict ? bare(dict) + "な" : null;
  }

  if (kind === "conditional") {
    return fromReading(rd => {
      if (rd === "きます") return "くれば";
      if (g3 || /します$/.test(rd)) return rd.replace(/します$/, "すれば");
      if (g2) return rd.replace(/ます$/, "れば");
      if (/います$/.test(rd)) return rd.replace(/います$/, "えば");
      if (/ちます$/.test(rd)) return rd.replace(/ちます$/, "てば");
      if (/ります$/.test(rd)) return rd.replace(/ります$/, "れば");
      if (/みます$/.test(rd)) return rd.replace(/みます$/, "めば");
      if (/びます$/.test(rd)) return rd.replace(/びます$/, "べば");
      if (/にます$/.test(rd)) return rd.replace(/にます$/, "ねば");
      if (/きます$/.test(rd)) return rd.replace(/きます$/, "けば");
      if (/ぎます$/.test(rd)) return rd.replace(/ぎます$/, "げば");
      if (/します$/.test(rd)) return rd.replace(/します$/, "せば");
      return null;
    });
  }

  return null;
}

function detectConjugationKind(point, sampleEn) {
  const blob = `${point.pattern} ${point.short} ${sampleEn || ""}`;
  if (/て-form|てform|Vて form|て form/i.test(blob) && !/ください|います|あげる|もらう/.test(blob))
    return "te";
  if (/ない-form|ないform|Vないform|plain negative/i.test(blob)) return "nai";
  if (/dictionary form|辞書形/i.test(blob)) return "dict";
  if (/た-form|たform|Vたform|plain past/i.test(blob)) return "ta";
  if (/potential|可能/i.test(blob)) return "potential";
  if (/volitional|意向/i.test(blob)) return "volitional";
  if (/imperative|命令/i.test(blob)) return "imperative";
  if (/prohibitive|禁止/i.test(blob)) return "prohibitive";
  if (/conditional|条件形/i.test(blob)) return "conditional";
  if (/passive|受身/i.test(blob)) return "passive";
  return null;
}

function expandConjugationDrills(point, pool, lesson, haveKeys, need) {
  const added = [];
  const verbs = poolByCat(pool, "verb", lesson).filter(v => stemMasu(v.d));
  const samples = (point.drills || []).filter(
    d => isConjugationPrompt(d[0]) || /form of /i.test(d[0]) || /-form of /i.test(d[0])
  );
  if (!samples.length || !verbs.length) return added;
  const kind =
    detectConjugationKind(point, samples[0][0]) ||
    detectConjugationKind(point, point.short);

  const label = {
    te: "て-form",
    nai: "ない-form",
    dict: "dictionary form",
    ta: "た-form",
    potential: "potential form",
    volitional: "volitional form",
    imperative: "imperative",
    prohibitive: "prohibitive",
    conditional: "conditional form",
    passive: "passive form"
  };

  for (let i = 0; added.length < need && i < need * 20; i++) {
    const sample = samples[i % samples.length];
    const verb = verbs[i % verbs.length];
    const useKind = kind || detectConjugationKind(point, sample[0]);
    if (!useKind) continue;
    const answer = conjugateFromMasu(verb.d, useKind);
    if (!answer || answer === verb.d) continue;
    const en = `Give the ${label[useKind] || useKind} of ${verb.d} (${shortEn(verb.en)}).`;
    const note =
      (sample[2] || label[useKind] || useKind).replace(/· review vocab/g, "").trim() +
      (verb.lesson < lesson ? " · review vocab" : "");
    const drill = [en, answer, note];
    if (verb.lesson < lesson) drill.push("review");
    const k = uniqKey(drill[1] + "|" + drill[0]);
    if (haveKeys.has(k)) continue;
    haveKeys.add(k);
    added.push(drill);
  }
  return added;
}

function expandPoint(n, pi, point) {
  const pool = vocabPool(n);
  const drills = (point.drills || []).map(d => d.slice());
  const haveKeys = new Set(drills.map(d => uniqKey(d[1])));
  const need = Math.max(0, MIN - drills.length);
  if (need === 0) return drills;

  const added = [];
  const push = d => {
    if (!d || !d[0] || !d[1]) return;
    if (looksBroken(d[0], d[1])) return;
    const k = uniqKey(d[1]);
    if (haveKeys.has(k)) return;
    const k2 = uniqKey(d[1]) + "|" + d[0].toLowerCase().replace(/\s+/g, " ");
    if (haveKeys.has(k2)) return;
    haveKeys.add(k);
    haveKeys.add(k2);
    const row = [d[0], d[1], d[2] || ""];
    if (d[3] === "review") row.push("review");
    added.push(row);
  };

  const tpls = templatesFor(point, n);
  const isConjHeavy =
    (point.drills || []).filter(
      d => isConjugationPrompt(d[0]) || /form of /i.test(d[0]) || /-form of /i.test(d[0])
    ).length >= 2;

  /* 1) Conjugation banks first when this point is a form drill. */
  if (
    isConjHeavy ||
    detectConjugationKind(point, (point.drills || [])[0]?.[0] || "")
  ) {
    expandConjugationDrills(point, pool, n, haveKeys, need).forEach(push);
  }

  /* 2) Pattern templates. */
  let ti = 0;
  while (drills.length + added.length < MIN && tpls.length && ti < need * 40) {
    for (const fn of tpls) {
      if (drills.length + added.length >= MIN) break;
      push(fn(pool, ti));
      ti++;
    }
    if (!tpls.length) break;
  }

  /* 3) Conservative vocab swaps on original sentence drills only. */
  const sentenceDrills = drills.filter(d => !isConjugationPrompt(d[0]));
  let guard = 0;
  while (drills.length + added.length < MIN && guard < need * 50) {
    guard++;
    const base = sentenceDrills[guard % Math.max(1, sentenceDrills.length)];
    if (!base) break;
    const hits = findHits(base[1], pool).filter(h =>
      ["thing", "person", "place", "time", "proper", "iadj"].includes(h.cat)
    );
    if (!hits.length) continue;
    const oldW = hits[guard % hits.length];
    /* Require the JP token to be bounded (avoid partial matches). */
    const jp = base[1];
    const tokenOk =
      jp.includes(` ${oldW.d}`) ||
      jp.includes(`${oldW.d} `) ||
      jp.includes(`${oldW.d}。`) ||
      jp.includes(`${oldW.d}、`) ||
      jp.includes(`${oldW.d}は`) ||
      jp.includes(`${oldW.d}が`) ||
      jp.includes(`${oldW.d}を`) ||
      jp.includes(`${oldW.d}に`) ||
      jp.includes(`${oldW.d}で`) ||
      jp.includes(`${oldW.d}へ`) ||
      jp.includes(`${oldW.d}の`) ||
      jp.startsWith(oldW.d);
    if (!tokenOk) continue;
    const cands = poolByCat(pool, oldW.cat, n).filter(
      p => p.bare !== oldW.bare && p.d !== oldW.d && shortEn(p.en).length >= 3
    );
    if (!cands.length) continue;
    push(swapDrill(base, oldW, cands[(guard * 7) % cands.length], n));
  }

  /* 4) Example sentences with the same conservative swaps. */
  for (const ex of point.examples || []) {
    if (drills.length + added.length >= MIN) break;
    const fake = [ex[1], ex[0], "from the model sentence"];
    const hits = findHits(ex[0], pool).filter(h =>
      ["thing", "person", "place", "time", "proper"].includes(h.cat)
    );
    for (let i = 0; i < hits.length && drills.length + added.length < MIN; i++) {
      const oldW = hits[i];
      const cands = poolByCat(pool, oldW.cat, n).filter(p => p.bare !== oldW.bare);
      if (!cands.length) continue;
      push(swapDrill(fake, oldW, cands[i % cands.length], n));
    }
  }

  /* 5) If still short: more template passes with offset seeds, then
     mirror originals with a clear lesson/prior noun appended as a parallel
     prompt only for です／ます style points. */
  while (drills.length + added.length < MIN && tpls.length && ti < need * 80) {
    for (const fn of tpls) {
      if (drills.length + added.length >= MIN) break;
      push(fn(pool, ti + 100));
      ti++;
    }
  }

  if (drills.length + added.length < MIN) {
    const things = poolByCat(pool, "thing", n).filter(p => p.lesson <= n);
    const places = poolByCat(pool, "place", n);
    const people = poolByCat(pool, "person", n);
    const verbs = poolByCat(pool, "verb", n);
    let ri = 0;
    const pat = point.pattern + point.short;
    while (drills.length + added.length < MIN && ri < need * 40) {
      const thing = pick(things, ri);
      const place = pick(places, ri);
      const person = pick(people, ri);
      const verb = pick(verbs, ri);
      if (/です/.test(pat) && !/ました|ません|たい|て/.test(pat) && person && thing) {
        push([
          `${shortEn(person.en)} is ${aAn(shortEn(thing.en))}.`,
          `${person.d}は ${thing.d}です。`,
          point.short || "",
          person.lesson < n || thing.lesson < n ? "review" : "lesson"
        ]);
      } else if (/ます/.test(pat) && verb && place && /で|へ|を|に/.test(pat)) {
        if (/へ/.test(pat) && place) {
          push([
            `I am going to ${shortEn(place.en)}.`,
            `${place.d}へ 行{い}きます。`,
            point.short || "",
            place.lesson < n ? "review" : "lesson"
          ]);
        } else if (/を/.test(pat) && thing && verb) {
          push([
            `I ${shortEn(verb.en)} ${shortEn(thing.en)}.`,
            `${thing.d}を ${verb.d}。`,
            point.short || "",
            thing.lesson < n || verb.lesson < n ? "review" : "lesson"
          ]);
        } else if (verb) {
          push([
            `I ${shortEn(verb.en)}.`,
            `${verb.d}。`,
            point.short || "",
            verb.lesson < n ? "review" : "lesson"
          ]);
        }
      } else if (isConjHeavy && verb) {
        const sample = drills.find(d => isConjugationPrompt(d[0]));
        if (sample) {
          push([
            sample[0].replace(/\([^)]*\)/, `(${shortEn(verb.en)})`).replace(/of\s+\S+/, `of ${verb.d}`),
            sample[1].includes("ます") || sample[1].includes("{")
              ? sample[1]
              : verb.d,
            (sample[2] || "") + (verb.lesson < n ? " · review vocab" : ""),
            verb.lesson < n ? "review" : "lesson"
          ]);
        }
      } else {
        break;
      }
      ri++;
    }
  }

  /* 6) Hard pad with guaranteed-unique Japanese strings. */
  const padNames = [
    "ミラーさん","山田{やまだ}さん","佐藤{さとう}さん","鈴木{すずき}さん","田中{たなか}さん",
    "カリナさん","サントスさん","タワポンさん","スミスさん","キムさん","チェンさん",
    "ブラウンさん","グリーンさん","うえださん","なかむらさん","もりさん","はやしさん",
    "いしいさん","まつもとさん","シュミトさん","ワットさん","マイクさん","李{り}さん","姜{かん}さん"
  ];
  const padRoles = poolByCat(pool, "person", n).concat(poolByCat(pool, "thing", n));
  const padVerbs = poolByCat(pool, "verb", n);
  let pad = 0;
  while (drills.length + added.length < MIN && pad < 200) {
    const kind = detectConjugationKind(point, (point.drills || [])[0]?.[0] || "");
    if (kind && padVerbs.length) {
      /* Walk every verb until one yields a new answer string. */
      let placed = false;
      for (let vi = 0; vi < padVerbs.length && !placed; vi++) {
        const verb = padVerbs[(pad + vi) % padVerbs.length];
        const ans = conjugateFromMasu(verb.d, kind);
        if (!ans || haveKeys.has(uniqKey(ans))) continue;
        push([
          `Give the ${kind} form of ${verb.d} (${shortEn(verb.en)}).`,
          ans,
          point.short || kind,
          verb.lesson < n ? "review" : "lesson"
        ]);
        placed = true;
      }
      if (!placed) break;
    } else if (/ください/.test(point.pattern) && padVerbs.length) {
      let placed = false;
      for (let vi = 0; vi < padVerbs.length && !placed; vi++) {
        const verb = padVerbs[(pad + vi) % padVerbs.length];
        const te = conjugateFromMasu(verb.d, "te");
        if (!te) continue;
        const jp = `${te} ください。`;
        if (haveKeys.has(uniqKey(jp))) continue;
        push([
          `Please ${shortEn(verb.en)}.`,
          jp,
          "て ください",
          verb.lesson < n ? "review" : "lesson"
        ]);
        placed = true;
      }
      if (!placed) break;
    } else if (/じゃ ありません|では ありません/.test(point.pattern) && padRoles.length) {
      const who = padNames[pad % padNames.length];
      const role = padRoles[pad % padRoles.length];
      const jp = `${who}は ${role.d}じゃ ありません。`;
      if (!haveKeys.has(uniqKey(jp))) {
        push([
          `${bare(who)} is not ${aAn(shortEn(role.en))}.`,
          jp,
          "negative of です",
          role.lesson < n ? "review" : "lesson"
        ]);
      }
    } else {
      break;
    }
    pad++;
  }

  return drills.concat(added).slice(0, Math.max(MIN, drills.length));
}

function jsString(s) {
  return JSON.stringify(s);
}

function emitDrill(d, indent) {
  const sp = " ".repeat(indent);
  const parts = d.slice(0, 3).map(jsString);
  if (d[3] === "review") parts.push(jsString("review"));
  return `${sp}[${parts.join(", ")}]`;
}

function emitPoint(p, indent) {
  const sp = " ".repeat(indent);
  const sp2 = " ".repeat(indent + 2);
  const sp3 = " ".repeat(indent + 4);
  let out = "";
  out += `${sp}{\n`;
  out += `${sp2}pattern: ${jsString(p.pattern)},\n`;
  out += `${sp2}short: ${jsString(p.short)},\n`;
  out += `${sp2}explain: ${jsString(p.explain)},\n`;
  out += `${sp2}formation: ${jsString(p.formation)},\n`;
  out += `${sp2}examples: [\n`;
  for (const ex of p.examples || []) {
    out += `${sp3}[${jsString(ex[0])}, ${jsString(ex[1])}],\n`;
  }
  out += `${sp2}],\n`;
  out += `${sp2}drills: [\n`;
  for (const d of p.drills || []) {
    out += emitDrill(d, indent + 4) + ",\n";
  }
  out += `${sp2}]\n`;
  out += `${sp}}`;
  return out;
}

function emitContent(content) {
  let out = "const CONTENT = {\n\n";
  const keys = Object.keys(content)
    .map(Number)
    .sort((a, b) => a - b);
  for (const n of keys) {
    out += `${n}: { points: [\n`;
    const pts = content[n].points || [];
    pts.forEach((p, i) => {
      out += emitPoint(p, 2);
      out += i < pts.length - 1 ? ",\n" : "\n";
    });
    out += `]},\n\n`;
  }
  out += "};\n";
  return out;
}

/* ---------- run ---------- */
let expandedPoints = 0;
let addedTotal = 0;
const shortBefore = [];

for (let n = 1; n <= MAX_LESSON; n++) {
  if (!CONTENT[n]) continue;
  CONTENT[n].points.forEach((p, pi) => {
    const before = (p.drills || []).length;
    if (before < MIN) shortBefore.push({ n, pi, before, pattern: p.pattern });
    const next = expandPoint(n, pi, p);
    const after = next.length;
    if (after > before) {
      expandedPoints++;
      addedTotal += after - before;
      p.drills = next;
    }
  });
}

const stillShort = [];
for (let n = 1; n <= MAX_LESSON; n++) {
  if (!CONTENT[n]) continue;
  CONTENT[n].points.forEach((p, pi) => {
    const len = (p.drills || []).length;
    if (len < MIN) stillShort.push({ n, pi, len, pattern: p.pattern });
  });
}

console.log(
  JSON.stringify(
    {
      shortBefore: shortBefore.length,
      expandedPoints,
      addedTotal,
      stillShort: stillShort.length,
      stillShortSample: stillShort.slice(0, 20)
    },
    null,
    2
  )
);

if (stillShort.length) {
  console.error("ERROR: some points still under", MIN);
  process.exitCode = 2;
}

const start = src.indexOf("/* CONTENT_DATA_START */");
const end = src.indexOf("/* CONTENT_DATA_END */");
if (start < 0 || end < 0) throw new Error("CONTENT markers missing");
const before = src.slice(0, start + "/* CONTENT_DATA_START */".length);
const after = src.slice(end);
const body = "\n" + emitContent(CONTENT) + "\n";
fs.writeFileSync(DATA, before + body + after);
console.log("Wrote", DATA);
