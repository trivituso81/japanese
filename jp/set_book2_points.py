"""Replace the reconstructed Book II grammar points with the textbook's own.

Taken from the CONTENTS pages of "Minna no Nihongo II — Translation &
Grammatical Notes" (section IV, Grammar Explanation, for each lesson). The
earlier lists were assembled from memory and cross-checked against the
listening workbook, and they differed from the book in both grouping and
count.
"""
import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

POINTS = {
26: [
  ("普通形{ふつうけい} ＋ んです", "Explaining, asking for an explanation, or setting up a request"),
  ("Vて-form いただけませんか", "Could you possibly …? — more polite than て ください"),
  ("疑問詞{ぎもんし} ＋ Vた-form ら いいですか", "What / where / when should I …? — asking for advice"),
  ("N(object)は 好{す}きです ／ 上手{じょうず}です ／ あります, etc.", "Fronting the object as topic with these predicates"),
],
27: [
  ("可能動詞{かのうどうし}", "Potential verbs: how they are formed"),
  ("可能動詞{かのうどうし}の 文{ぶん}", "Potential sentences — the object takes が, not を"),
  ("見{み}えます／聞{き}こえます", "Spontaneous perception, distinct from the potential"),
  ("できます", "Be able to, be completed, come into existence"),
  ("は", "は marking contrast"),
  ("も", "も for emphasis and 'as much as'"),
  ("しか", "しか ＋ negative: only, nothing but"),
],
28: [
  ("V₁ます-form ながら V₂", "Doing two things at once, the main action second"),
  ("Vて-form います", "Habitual or repeated action over a period"),
  ("普通形{ふつうけい} し、～", "Listing reasons or qualities with an 'and what's more' feel"),
  ("それに", "What's more — adding a second reason"),
  ("それで", "And so — the consequence of what was just said"),
  ("よく この 喫茶店{きっさてん}に 来{く}るんですか", "んですか asking about a habit"),
],
29: [
  ("Vて-form います", "Resulting state of an intransitive verb"),
  ("Vて-form しまいました ／ しまいます", "Completing something, finishing it off"),
  ("Vて-form しまいました", "Doing something regrettable or accidental"),
  ("ありました", "It turned up — finding what was lost"),
  ("どこかで ／ どこかに", "Somewhere: particle placement with 疑問詞 ＋ か"),
],
30: [
  ("Vて-form あります", "A state left deliberately by someone's action"),
  ("Vて-form おきます", "Doing something in advance, or leaving it as it is"),
  ("まだ V(affirmative)", "Still doing / still in that state"),
  ("それは ～", "Picking up what was just said to comment on it"),
],
31: [
  ("意向形{いこうけい}", "The volitional form: how it is made"),
  ("意向形{いこうけい}の 使{つか}い方{かた}", "Using the volitional alone, and with と 思{おも}って います"),
  ("V dictionary form ／ Vない-form ない ＋ つもりです", "Intend to / intend not to"),
  ("V dictionary form ／ Nの ＋ 予定{よてい}です", "Be scheduled to — an arrangement, not a wish"),
  ("まだ Vて-form いません", "Have not done it yet"),
  ("こ～ ／ そ～", "この／その and friends pointing back into the conversation"),
],
32: [
  ("Vた-form ／ Vない-form ない ＋ ほうが いいです", "Giving advice: you'd better / you'd better not"),
  ("普通形{ふつうけい} ＋ でしょう", "Probably — a confident guess"),
  ("普通形{ふつうけい} ＋ かも しれません", "Might, possibly — much weaker than でしょう"),
  ("きっと ／ たぶん ／ もしかしたら", "Grading your certainty with adverbs"),
  ("何{なに}か 心配{しんぱい}な こと", "疑問詞 ＋ か modified by an adjective"),
  ("Quantifierで", "In / within that amount of time or money"),
],
33: [
  ("命令形{めいれいけい}・禁止形{きんしけい}", "The imperative and prohibitive forms: how they are made"),
  ("命令形{めいれいけい}・禁止形{きんしけい}の 使{つか}い方{かた}", "Where these blunt forms are actually used"),
  ("～と 読{よ}みます ／ ～と 書{か}いて あります", "Reading a sign aloud, saying what is written"),
  ("Xは Yと いう 意味{いみ}です", "X means Y"),
  ("「S」／普通形{ふつうけい} ＋ と 言{い}って いました", "Reporting what someone said"),
  ("「S」／普通形{ふつうけい} ＋ と 伝{つた}えて いただけませんか", "Could you pass on the message that …"),
],
34: [
  ("V₁ dictionary form ／ V₁た-form ／ Nの ＋ とおりに、V₂", "Do it the way … — following a model"),
  ("V₁た-form ／ Nの ＋ あとで、V₂", "After doing …"),
  ("V₁て-form ／ V₁ない-form ないで ＋ V₂", "Doing B in the state of having done A, or without doing A"),
  ("V₁ない-form ないで、V₂", "Doing B instead of A"),
],
35: [
  ("条件形{じょうけんけい}の 作{つく}り方{かた}", "The conditional form: how it is made"),
  ("条件形{じょうけんけい}、～", "If — the general conditional"),
  ("Nなら、～", "As for X — taking up the other person's topic"),
  ("疑問詞{ぎもんし} ＋ 条件形{じょうけんけい} いいですか", "What should I do? — asking for instructions"),
  ("条件形{じょうけんけい} ＋ ほど", "The more … the more"),
],
36: [
  ("V₁ dictionary form ／ V₁ない-form ない ＋ ように、V₂", "So that — purpose with a non-volitional verb"),
  ("V dictionary form ように ／ Vない-form なく ＋ なります", "Came to / no longer — a change over time"),
  ("V dictionary form ／ Vない-form ない ＋ ように します", "Making a point of doing (or not doing) something"),
  ("とか", "Things like — listing examples loosely"),
],
37: [
  ("受身動詞{うけみどうし}", "Passive verbs: how they are formed"),
  ("N₁(person₁)は N₂(person₂)に V passive", "Someone did something to me"),
  ("N₁(person₁)は N₂(person₂)に N₃を V passive", "Someone did something to my …"),
  ("N(thing)が ／ は V passive", "Passive with a thing as subject, agent left out"),
  ("N₁は N₂(person)に よって V passive", "Made or written by — naming the creator"),
  ("Nから ／ Nで つくります", "Made from / made of"),
],
38: [
  ("V普通形{ふつうけい} ＋ の", "Turning a clause into a noun"),
  ("V dictionary form のは [形容詞{けいようし}]です", "Doing … is difficult / fun / dangerous"),
  ("V dictionary form のが [形容詞{けいようし}]です", "Be good at / fond of doing …"),
  ("V dictionary form のを 忘{わす}れました", "Forgot to do …"),
  ("V普通形{ふつうけい} のを 知{し}って いますか", "Do you know that …?"),
  ("普通形{ふつうけい} ＋ のは Nです", "It is X that … — highlighting one element"),
  ("～ときも ／ ～ときや ／ ～ときの ／ ～ときに", "とき taking further particles"),
],
39: [
  ("Vて-form ／ Vない-form なくて ／ い-adj くて ／ な-adj で、～", "Cause and effect, where the result is beyond your control"),
  ("Nで", "Because of — a noun as cause"),
  ("普通形{ふつうけい} ＋ ので、～", "Because — softer and more objective than から"),
  ("途中{とちゅう}で", "On the way, partway through"),
],
40: [
  ("疑問詞{ぎもんし} ＋ 普通形{ふつうけい} ＋ か、～", "Embedded question with a question word"),
  ("普通形{ふつうけい} ＋ か どうか、～", "Whether or not"),
  ("Vて-form みます", "Try doing something and see"),
  ("い-adj (～い) → ～さ", "Turning an adjective into a noun of measurement"),
  ("ハンスは 学校{がっこう}で どうでしょうか。", "How is …? — asking for an assessment"),
],
41: [
  ("やりもらいの 表現{ひょうげん}", "Giving and receiving: いただきます、くださいます、やります"),
  ("動作{どうさ}の やりもらい", "Giving and receiving actions with the て-form"),
  ("Vて-form くださいませんか", "Would you be so kind as to …?"),
  ("Nに V", "に marking the recipient"),
],
42: [
  ("V dictionary form ／ Nの ＋ ために、～", "In order to — purpose you can decide on"),
  ("V dictionary formの ／ N ＋ に ～", "For the purpose of — used with かかります, いります, 使{つか}います"),
  ("Quantifierは", "At least that much"),
  ("Quantifierも", "As much as — the speaker finds it a lot"),
],
43: [
  ("Vます-form ／ い-adj ／ な-adj ＋ そうです", "It looks like — judging from appearance"),
  ("Vて-form 来{き}ます", "Go, do it and come back; or a change coming on"),
],
44: [
  ("Vます-form ／ い-adj ／ な-adj ＋ すぎます", "Too much, excessively"),
  ("Vます-form ＋ やすいです ／ にくいです", "Easy to / hard to do"),
  ("い-adj → ～く ／ な-adj → に ／ Nに ＋ します", "Making something into a state"),
  ("Nに します", "I'll have … — choosing"),
  ("い-adj → ～く ／ な-adj → に ＋ V", "Adverbial use of adjectives"),
],
45: [
  ("V dictionary form ／ Vた-form ／ Vない-form ない ／ い-adj ／ な-adjな ／ Nの ＋ 場合{ばあい}は、～", "In the case that / in the event of"),
  ("普通形{ふつうけい} ＋ のに、～", "Even though — carrying surprise or dissatisfaction"),
],
46: [
  ("V dictionary form ／ Vて-form いる ／ Vた-form ＋ ところです", "Just about to / in the middle of / just finished"),
  ("Vた-form ばかりです", "Only just did it"),
  ("V dictionary form ／ Vない-form ない ／ い-adj ／ な-adjな ／ Nの ＋ はずです", "It should be the case that — logical expectation"),
],
47: [
  ("普通形{ふつうけい} ＋ そうです", "I hear that — passing on information unchanged"),
  ("普通形{ふつうけい} ＋ ようです", "It seems that — your own inference from evidence"),
  ("声{こえ}／音{おと}／におい／味{あじ}が します", "Perceiving a sound, smell or taste"),
],
48: [
  ("使役動詞{しえきどうし}", "Causative verbs: how they are formed"),
  ("使役動詞{しえきどうし}の 文{ぶん}", "Causative sentences: を and に with the person"),
  ("使役{しえき}の 使{つか}い方{かた}", "Making someone do it, and letting someone do it"),
  ("V causative て-form いただけませんか", "Would you let me …? — asking permission humbly"),
],
49: [
  ("敬語{けいご}", "Honorific language: what it is for"),
  ("敬語{けいご}の 種類{しゅるい}", "The three types: 尊敬語、謙譲語、丁寧語"),
  ("尊敬語{そんけいご}", "Respectful forms: (ら)れます、お～に なります、special verbs"),
  ("敬語{けいご}と 文体{ぶんたい}", "Keigo and the style of the sentence"),
  ("文{ぶん}の 中{なか}の 敬語{けいご}の レベル", "Keeping one level of politeness across a sentence"),
  ("～まして", "The て-form made polite"),
],
50: [
  ("謙譲語{けんじょうご}", "Humble forms: お／ご～します and special verbs"),
  ("丁寧語{ていねいご}", "Polite forms: ございます、で ございます"),
],
}


def main():
    meta = json.load(open(os.path.join(ROOT, "jp", "book2-meta.json"), encoding="utf-8"))
    path = os.path.join(ROOT, "japanese-data.js")
    lines = open(path, encoding="utf-8").read().split("\n")

    start = next(i for i, l in enumerate(lines) if l.startswith("{n:26,"))
    end = next(i for i, l in enumerate(lines) if l.startswith("];") and i > start)

    block = []
    for n in range(26, 51):
        m = meta[str(n)]
        head = "{n:%d, book:2, %stitle:%s, jp:%s, points:[" % (
            n, "current:true, " if m["current"] else "",
            json.dumps(m["title"], ensure_ascii=False),
            json.dumps(m["jp"], ensure_ascii=False))
        block.append(head)
        for pattern, gloss in POINTS[n]:
            block.append("  [%s,%s]," % (json.dumps(pattern, ensure_ascii=False),
                                         json.dumps(gloss, ensure_ascii=False)))
        block[-1] = block[-1].rstrip(",")
        block.append("]},")
    block[-1] = block[-1].rstrip(",")

    open(path, "w", encoding="utf-8").write("\n".join(lines[:start] + block + lines[end:]))
    print("lessons rewritten:", len(POINTS),
          "| points:", sum(len(v) for v in POINTS.values()))


if __name__ == "__main__":
    main()
