#!/usr/bin/env node
/* Expand Lesson 40 CONTENT points to 30 correctly categorised drills each. */
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const DATA = path.join(ROOT, "japanese-data.js");

const L40_POINTS = [
  {
    pattern: "疑問詞{ぎもんし} ＋ 普通形{ふつうけい} ＋ か、～",
    short: "embedded question",
    explain: "A question containing a question word can be built into a larger sentence instead of standing on its own. Put the question into the plain form, close it with か, and let the main verb follow — typically 調{しら}べます、聞{き}きます、話{はな}します、覚{おぼ}えて います or わかりません. The question word stays where it belongs inside the clause, and な-adjectives and nouns drop their だ before か.",
    formation: "[疑問詞{ぎもんし} ＋ plain form] ＋ か、＋ 調{しら}べます／わかりません など　（な-adj・N drop だ）",
    examples: [
      ["JL107便{びん}は 何時{なんじ}に 到着{とうちゃく}するか、調{しら}べて ください。", "Please check what time flight JL107 arrives."],
      ["わたしたちが 初{はじ}めて 会{あ}ったのは いつか、覚{おぼ}えて いますか。", "Do you remember when it was that we first met?"],
      ["パーティーに だれが 来{く}るか、まだ わかりません。", "I still don't know who is coming to the party."],
      ["この 漢字{かんじ}を どう 読{よ}むか、教{おし}えて ください。", "Please tell me how to read this kanji."],
    ],
    drills: [
      ["Please check what time flight JL107 arrives.", "JL107便{びん}は 何時{なんじ}に 到着{とうちゃく}するか、調{しら}べて ください。", "the plain form, then か"],
      ["Do you remember when it was that we first met?", "わたしたちが 初{はじ}めて 会{あ}ったのは いつか、覚{おぼ}えて いますか。", "a noun-like いつ needs no だ before か"],
      ["I still don't know who is coming to the party.", "パーティーに だれが 来{く}るか、まだ わかりません。", "the question word stays inside the clause"],
      ["Please tell me how to read this kanji.", "この 漢字{かんじ}を どう 読{よ}むか、教{おし}えて ください。", ""],
      ["We are talking about where to hold the year-end party.", "忘年会{ぼうねんかい}を どこで するか、話{はな}して います。", "忘年会{ぼうねんかい} is new in this lesson"],
      ["Please ask how much this costs.", "これは いくらか、聞{き}いて ください。", "いくら takes no だ before か"],
      ["Please ask why the reply is late.", "返事{へんじ}は どうして 遅{おく}れるか、聞{き}いて ください。", "返事{へんじ} is new in this lesson"],
      ["I don't know when the contest starts.", "コンテストは いつ 始{はじ}まるか、わかりません。", ""],
      ["Do you remember who is coming to the New Year's party?", "新年会{しんねんかい}に だれが 来{く}るか、覚{おぼ}えて いますか。", "新年会{しんねんかい} is new in this lesson"],
      ["Please check how much the motorcycle costs.", "オートバイは いくら かかるか、調{しら}べて ください。", ""],
      ["We are talking about where to hold the second party.", "二次会{にじかい}を どこで するか、話{はな}して います。", "二次会{にじかい} is new in this lesson"],
      ["Please tell me what time the weather forecast is on.", "天気予報{てんきよほう}は 何時{なんじ}からか、教{おし}えて ください。", "天気予報{てんきよほう} is new in this lesson"],
      ["Please check who loaded the luggage.", "だれが 荷物{にもつ}を 積{つ}んだか、調{しら}べて ください。", "積{つ}みます is new in this lesson"],
      ["I don't know where the driver went.", "運転手{うんてんしゅ}は どこへ 行{い}ったか、わかりません。", "運転手{うんてんしゅ} is new in this lesson"],
      ["Please ask when the marathon starts.", "マラソンは いつ 始{はじ}まるか、聞{き}いて ください。", ""],
      ["Do you remember how this machine moves?", "この 機械{きかい}は どう 動{うご}くか、覚{おぼ}えて いますか。", ""],
      ["Please tell me why the train departed late.", "電車{でんしゃ}は どうして 遅{おく}れて 出発{しゅっぱつ}したか、教{おし}えて ください。", "出発{しゅっぱつ}します is new in this lesson"],
      ["I don't know which flight has arrived.", "どの 便{びん}が 到着{とうちゃく}したか、わかりません。", "到着{とうちゃく}します is new in this lesson"],
      ["Please check how many glasses there are.", "コップが 何個{なんこ} あるか、調{しら}べて ください。", ""],
      ["We are talking about who will speak at the meeting.", "発表会{はっぴょうかい}で だれが 話{はな}すか、話{はな}して います。", "発表会{はっぴょうかい} is new in this lesson"],
      ["Please ask where the remote town is.", "離{はな}れた 町{まち}は どこか、聞{き}いて ください。", "離{はな}れた is new in this lesson"],
      ["I don't know what time the ceremony starts.", "成人式{せいじんしき}は 何時{なんじ}に 始{はじ}まるか、わかりません。", ""],
      ["Please tell me how many kilograms this suitcase is.", "この スーツケースは 何キロか、教{おし}えて ください。", ""],
      ["Do you remember why this rumour started?", "この うわさは どうして 始{はじ}まったか、覚{おぼ}えて いますか。", ""],
      ["Please check who the criminal is.", "犯人{はんにん}は だれか、調{しら}べて ください。", "犯人{はんにん} is new in this lesson"],
      ["I don't know when the application ends.", "申し込み{もうしこみ}は いつ 終{お}わるか、わかりません。", "申し込み{もうしこみ} is new in this lesson"],
      ["Please ask how the earth looks from space.", "宇宙{うちゅう}から 地球{ちきゅう}は どう 見{み}えるか、聞{き}いて ください。", ""],
      ["We are talking about where to put this box.", "この 箱{はこ}を どこに 置{お}くか、話{はな}して います。", ""],
      ["Please tell me which class has good results.", "どの クラスの 成績{せいせき}が いいか、教{おし}えて ください。", "成績{せいせき} is new in this lesson"],
      ["I don't know how suddenly the car moved.", "車{くるま}は どう 急{きゅう}に 動{うご}いたか、わかりません。", "急{きゅう}に is new in this lesson"],
    ]
  },
  {
    pattern: "普通形{ふつうけい} ＋ か どうか、～",
    short: "whether or not",
    explain: "When the embedded question has no question word in it — that is, when it is a plain yes-or-no question — か on its own is not enough and か どうか is required. As before the clause takes the plain form, and な-adjectives and nouns drop their だ. Where English would say 'whether there are any mistakes', Japanese prefers to put it the other way round and ask まちがいが ないか どうか, because the speaker is hoping to confirm that there are none.",
    formation: "[plain form] ＋ か どうか、＋ 調{しら}べます／わかりません など　（な-adj・N drop だ）",
    examples: [
      ["忘年会{ぼうねんかい}に 出席{しゅっせき}するか どうか、金曜日{きんようび}までに 返事{へんじ}を ください。", "Please reply by Friday whether or not you will attend the year-end party."],
      ["その 話{はなし}は ほんとうか どうか、わかりません。", "I don't know whether that story is true or not."],
      ["まちがいが ないか どうか、調{しら}べて ください。", "Please check whether there are any mistakes."],
      ["サイズが 合{あ}うか どうか、着{き}て みて ください。", "Please try it on and see whether the size fits."],
    ],
    drills: [
      ["Please reply by Friday whether or not you will attend the year-end party.", "忘年会{ぼうねんかい}に 出席{しゅっせき}するか どうか、金曜日{きんようび}までに 返事{へんじ}を ください。", "no question word, so か どうか"],
      ["I don't know whether that story is true or not.", "その 話{はなし}は ほんとうか どうか、わかりません。", "a noun drops だ before か どうか"],
      ["Please check whether there are any mistakes.", "まちがいが ないか どうか、調{しら}べて ください。", "Japanese asks 'whether there are none'"],
      ["I haven't decided yet whether I will go or not.", "行{い}くか どうか、まだ 決{き}めて いません。", ""],
      ["Please make sure whether Mr Miller is coming.", "ミラーさんが 来{く}るか どうか、確{たし}かめて ください。", "確{たし}かめます is new in this lesson"],
      ["Please tell me whether this water is safe.", "この 水{みず}が 安全{あんぜん}か どうか、教{おし}えて ください。", "a な-adjective drops な and だ"],
      ["Please check whether the size fits.", "サイズが 合{あ}うか どうか、調{しら}べて ください。", "合{あ}います is new in this lesson"],
      ["I don't know whether the train has departed yet.", "電車{でんしゃ}が もう 出発{しゅっぱつ}したか どうか、わかりません。", "出発{しゅっぱつ}します is new in this lesson"],
      ["Please make sure whether the application arrived.", "申し込み{もうしこみ}が 到着{とうちゃく}したか どうか、確{たし}かめて ください。", ""],
      ["I haven't decided yet whether I will consult the teacher.", "先生{せんせい}に 相談{そうだん}するか どうか、まだ 決{き}めて いません。", "相談{そうだん}します is new in this lesson"],
      ["Please tell me whether this is dangerous.", "これは 危険{きけん}か どうか、教{おし}えて ください。", "危険{きけん} drops だ before か どうか"],
      ["Please reply whether you will take the test.", "テストを 受{う}けるか どうか、返事{へんじ}を ください。", ""],
      ["Please check whether this is necessary.", "これは 必要{ひつよう}か どうか、調{しら}べて ください。", "必要{ひつよう} drops だ"],
      ["I don't know whether he got drunk.", "彼{かれ}が 酔{よ}ったか どうか、わかりません。", "酔{よ}います is new in this lesson"],
      ["Please make sure whether the front and back match.", "表{おもて}と 裏{うら}が 合{あ}って いるか どうか、確{たし}かめて ください。", "表{おもて}・裏{うら} are new"],
      ["I haven't decided whether I will run the marathon.", "マラソンを 走{はし}るか どうか、まだ 決{き}めて いません。", ""],
      ["Please tell me whether the rumour is true.", "うわさは ほんとうか どうか、教{おし}えて ください。", ""],
      ["Please check whether there is a scratch.", "傷{きず}が ないか どうか、調{しら}べて ください。", "傷{きず} is new in this lesson"],
      ["I don't know whether the criminal was caught.", "犯人{はんにん}が 捕{つか}まったか どうか、わかりません。", "犯人{はんにん} is new in this lesson"],
      ["Please make sure whether the reply came.", "返事{へんじ}が 来{き}たか どうか、確{たし}かめて ください。", ""],
      ["Please tell me whether this change is necessary.", "この 変化{へんか}が 必要{ひつよう}か どうか、教{おし}えて ください。", ""],
      ["I haven't decided whether I will attend the New Year's party.", "新年会{しんねんかい}に 出席{しゅっせき}するか どうか、まだ 決{き}めて いません。", ""],
      ["Please check whether the motorcycle will go in.", "オートバイが 入{はい}るか どうか、調{しら}べて ください。", ""],
      ["I don't know whether the presentation went well.", "発表会{はっぴょうかい}が うまく 行{い}ったか どうか、わかりません。", "うまく 行{い}きます"],
      ["Please make sure whether the counting is finished.", "数{かぞ}えるのが 終{お}わったか どうか、確{たし}かめて ください。", "数{かぞ}えます is new in this lesson"],
      ["Please reply whether you need this.", "これが 必要{ひつよう}か どうか、返事{へんじ}を ください。", ""],
      ["I don't know whether the situation is dangerous.", "様子{ようす}が 危険{きけん}か どうか、わかりません。", "様子{ようす} is new in this lesson"],
      ["Please check whether the class results came out.", "クラスの 成績{せいせき}が 出{で}たか どうか、調{しら}べて ください。", ""],
      ["Please tell me whether he is still trying hard.", "彼{かれ}が 今{いま}でも 一生懸命{いっしょうけんめい} やって いるか どうか、教{おし}えて ください。", "一生懸命{いっしょうけんめい} is new"],
      ["I haven't decided whether I will load it now.", "今{いま} 積{つ}むか どうか、まだ 決{き}めて いません。", "積{つ}みます is new in this lesson"],
    ]
  },
  {
    pattern: "Vて-form みます",
    short: "try and see",
    explain: "Adding みます to the て-form says that you do something as a trial, to find out what will happen or what it is like. It is not the たい of wanting nor the volitional of resolving; the point is the experiment itself, and the result is left open. みます here is written in kana and conjugates as an ordinary Group II verb, so 〜て みたいです and 〜て みても いいですか are both available.",
    formation: "[V て-form] ＋ みます　（みたいです／みても いいですか／みました）",
    examples: [
      ["もう 一度{いちど} 考{かんが}えて みます。", "I'll think it over again."],
      ["宇宙{うちゅう}から 地球{ちきゅう}を 見{み}て みたいです。", "I'd like to see the earth from space."],
      ["この ズボンを はいて みても いいですか。", "May I try on this pair of trousers?"],
      ["この 店{みせ}の ケーキを 食{た}べて みました。", "I tried the cake at this shop."],
    ],
    drills: [
      ["I'll think it over again.", "もう 一度{いちど} 考{かんが}えて みます。", "the て-form plus みます"],
      ["I'd like to see the earth from space.", "宇宙{うちゅう}から 地球{ちきゅう}を 見{み}て みたいです。", "みます conjugates as a Group II verb"],
      ["May I try on this pair of trousers?", "この ズボンを はいて みても いいですか。", "clothes worn below the waist take はきます"],
      ["I tried the cake at this shop.", "この 店{みせ}の ケーキを 食{た}べて みました。", ""],
      ["Please try asking the person at the front desk.", "フロントの 人{ひと}に 聞{き}いて みて ください。", ""],
      ["I want to try living in Japan once.", "一度{いちど} 日本{にほん}に 住{す}んで みたいです。", ""],
      ["Please try measuring this parcel.", "この 荷物{にもつ}を 測{はか}って みて ください。", "測{はか}ります is new in this lesson"],
      ["I'll try confirming the reservation.", "予約{よやく}を 確{たし}かめて みます。", "確{たし}かめます is new in this lesson"],
      ["I want to try consulting the section chief.", "課長{かちょう}に 相談{そうだん}して みたいです。", ""],
      ["Please try starting the machine.", "機械{きかい}を 動{うご}かして みて ください。", "動{うご}かします is new in this lesson"],
      ["I tried counting the glasses.", "コップを 数{かぞ}えて みました。", "数{かぞ}えます is new in this lesson"],
      ["I'd like to try running a marathon once.", "一度{いちど} マラソンを 走{はし}って みたいです。", ""],
      ["Please try weighing this suitcase.", "この スーツケースを 量{はか}って みて ください。", "量{はか}ります is new in this lesson"],
      ["I'll try loading the boxes.", "箱{はこ}を 積{つ}んで みます。", "積{つ}みます is new in this lesson"],
      ["I want to try riding a motorcycle once.", "一度{いちど} オートバイに 乗{の}って みたいです。", ""],
      ["Please try reading the weather forecast.", "天気予報{てんきよほう}を 読{よ}んで みて ください。", ""],
      ["I tried drinking a little and got drunk.", "少{すこ}し 飲{の}んで みたら、酔{よ}って しまいました。", "酔{よ}います is new in this lesson"],
      ["May I try using this class room?", "この クラスの 部屋{へや}を 使{つか}って みても いいですか。", ""],
      ["I'll try asking about the application.", "申し込み{もうしこみ}に ついて 聞{き}いて みます。", ""],
      ["I want to try attending the year-end party.", "忘年会{ぼうねんかい}に 出{で}て みたいです。", ""],
      ["Please try checking for mistakes.", "まちがいが ないか、調{しら}べて みて ください。", "still て みる — the check is a trial"],
      ["I tried walking with all my effort.", "一生懸命{いっしょうけんめい} 歩{ある}いて みました。", "一生懸命{いっしょうけんめい} is new"],
      ["I'd like to try seeing the Tanabata Festival.", "七夕祭り{たなばたまつり}を 見{み}て みたいです。", "七夕祭り{たなばたまつり} is new"],
      ["Please try starting it suddenly.", "急{きゅう}に 動{うご}かして みて ください。", ""],
      ["I'll try writing a reply.", "返事{へんじ}を 書{か}いて みます。", ""],
      ["I want to try talking with elderly people.", "お年寄{としよ}りと 話{はな}して みたいです。", "お年寄{としよ}り is new"],
      ["Please try confirming the situation.", "様子{ようす}を 確{たし}かめて みて ください。", "様子{ようす} is new"],
      ["I tried putting it on the front side.", "表{おもて}に 置{お}いて みました。", "表{おもて} is new"],
      ["I'd like to try going to a remote place.", "離{はな}れた 所{ところ}へ 行{い}って みたいです。", ""],
      ["Please try counting once more.", "もう 一度{いちど} 数{かぞ}えて みて ください。", ""],
    ]
  },
  {
    pattern: "い-adj (～い) → ～さ",
    short: "adjective to noun",
    explain: "Change the final い of an い-adjective into さ and you have a noun naming the measurement or degree of that quality. 高{たか}い gives 高{たか}さ, height; 長{なが}い gives 長{なが}さ, length; 大{おお}きい gives 大{おお}きさ, size. These behave as ordinary nouns, so they take は, が, を and の like any other, and they are the natural way to ask or state how tall, how long or how heavy something is.",
    formation: "い-adj（〜い）→ 〜さ　（高{たか}い→高{たか}さ、長{なが}い→長{なが}さ、重{おも}い→重{おも}さ、大{おお}きい→大{おお}きさ）",
    examples: [
      ["山{やま}の 高{たか}さは どのくらいですか。", "About how high is the mountain?"],
      ["新{あたら}しい 橋{はし}の 長{なが}さは 3,911メートルです。", "The new bridge is 3,911 metres long."],
      ["この 荷物{にもつ}の 重{おも}さを 量{はか}って ください。", "Please weigh this parcel."],
      ["部屋{へや}の 大{おお}きさは どのくらいですか。", "What size is the room?"],
    ],
    drills: [
      ["About how high is the mountain?", "山{やま}の 高{たか}さは どのくらいですか。", "高{たか}い becomes the noun 高{たか}さ"],
      ["The new bridge is 3,911 metres long.", "新{あたら}しい 橋{はし}の 長{なが}さは 3,911メートルです。", "長{なが}い becomes 長{なが}さ"],
      ["Please weigh this parcel.", "この 荷物{にもつ}の 重{おも}さを 量{はか}って ください。", "the noun takes を like any other"],
      ["What size is the room?", "部屋{へや}の 大{おお}きさは どのくらいですか。", "大{おお}きい becomes 大{おお}きさ"],
      ["The speed of this train is amazing.", "この 電車{でんしゃ}の 速{はや}さは すごいです。", "速{はや}い becomes 速{はや}さ"],
      ["Please tell me the length and the weight of the desk.", "机{つくえ}の 長{なが}さと 重{おも}さを 教{おし}えて ください。", "two 〜さ nouns joined by と"],
      ["What is the height of this building?", "この 建物{たてもの}の 高{たか}さは どのくらいですか。", ""],
      ["Please measure the length of this table.", "この テーブルの 長{なが}さを 測{はか}って ください。", ""],
      ["The weight of this suitcase is over 20 kilograms.", "この スーツケースの 重{おも}さは 20キロ 以上{いじょう}です。", "以上{いじょう} is new in this lesson"],
      ["What size is this box?", "この 箱{はこ}の 大{おお}きさは どのくらいですか。", ""],
      ["Please tell me the height and the length of the room.", "部屋{へや}の 高{たか}さと 長{なが}さを 教{おし}えて ください。", ""],
      ["The speed of the Shinkansen is amazing.", "新幹線{しんかんせん}の 速{はや}さは すごいです。", ""],
      ["Please measure the height of this tree.", "この 木{き}の 高{たか}さを 測{はか}って ください。", ""],
      ["The length of this trousers is not enough.", "この ズボンの 長{なが}さは 足{た}りません。", ""],
      ["What is the weight of this motorcycle?", "この オートバイの 重{おも}さは どのくらいですか。", ""],
      ["The size of the earth is amazing.", "地球{ちきゅう}の 大{おお}きさは すごいです。", ""],
      ["Please tell me the speed of this machine.", "この 機械{きかい}の 速{はや}さを 教{おし}えて ください。", ""],
      ["This parcel's weight is under 5 kilograms.", "この 荷物{にもつ}の 重{おも}さは 5キロ 以下{いか}です。", "以下{いか} is new in this lesson"],
      ["What is the length of this bridge?", "この 橋{はし}の 長{なが}さは どのくらいですか。", ""],
      ["Please check the size of the class room.", "クラスの 部屋{へや}の 大{おお}きさを 調{しら}べて ください。", ""],
      ["The height of that building is over 100 metres.", "あの 建物{たてもの}の 高{たか}さは 100メートル 以上{いじょう}です。", ""],
      ["I was surprised at the speed of the train.", "電車{でんしゃ}の 速{はや}さに 驚{おどろ}きました。", ""],
      ["Please write the length and the height here.", "ここに 長{なが}さと 高{たか}さを 書{か}いて ください。", ""],
      ["What is the size of this suitcase?", "この スーツケースの 大{おお}きさは どのくらいですか。", ""],
      ["The weight of one box is 2 kilograms.", "箱{はこ} 一個{いっこ}の 重{おも}さは 2キロです。", ""],
      ["Please compare the height of these two trees.", "この 二本{にほん}の 木{き}の 高{たか}さを 比{くら}べて ください。", ""],
      ["I don't know the length of this table.", "この テーブルの 長{なが}さが わかりません。", ""],
      ["The size of the new room is just right.", "新{あたら}しい 部屋{へや}の 大{おお}きさは ちょうど いいです。", ""],
      ["Please teach me how to measure weight.", "重{おも}さの 測{はか}り方{かた}を 教{おし}えて ください。", ""],
      ["The speed and the length are both important.", "速{はや}さも 長{なが}さも 大切{たいせつ}です。", ""],
    ]
  },
  {
    pattern: "ハンスは 学校{がっこう}で どうでしょうか。",
    short: "asking for assessment",
    explain: "でしょうか normally asks about something the listener may be unsure of, but it is also used for questions the listener is perfectly able to answer. Used that way it is simply a gentler, more roundabout どうですか, and so it sounds more polite. It is the natural form for asking a teacher how your child is getting on, or a colleague how a piece of work is going.",
    formation: "N ＋ は ＋ ［place で］＋ どうでしょうか。　（＝ どうですか, but more polite）",
    examples: [
      ["息子{むすこ}は 学校{がっこう}で どうでしょうか。", "How is my son getting on at school?"],
      ["クラスの 成績{せいせき}は どうでしょうか。", "How are his marks in the class?"],
      ["あしたの 天気{てんき}は どうでしょうか。", "What will the weather be like tomorrow?"],
      ["この 服{ふく}の サイズは どうでしょうか。", "How is the size of these clothes?"],
    ],
    drills: [
      ["How is my son getting on at school?", "息子{むすこ}は 学校{がっこう}で どうでしょうか。", "gentler than どうですか"],
      ["How are his marks in the class?", "クラスの 成績{せいせき}は どうでしょうか。", "成績{せいせき} is new in this lesson"],
      ["What will the weather be like tomorrow?", "あしたの 天気{てんき}は どうでしょうか。", "here the listener really may not know"],
      ["How is the size of these clothes?", "この 服{ふく}の サイズは どうでしょうか。", ""],
      ["How is your new work going?", "新{あたら}しい 仕事{しごと}は どうでしょうか。", ""],
      ["How was my daughter's test?", "娘{むすめ}の テストは どうだったでしょうか。", "the past goes on the plain form before でしょうか"],
      ["How is the weather forecast for tomorrow?", "あしたの 天気予報{てんきよほう}は どうでしょうか。", "天気予報{てんきよほう} is new in this lesson"],
      ["How was the presentation meeting?", "発表会{はっぴょうかい}は どうだったでしょうか。", "発表会{はっぴょうかい} is new in this lesson"],
      ["How is the situation at the office?", "会社{かいしゃ}の 様子{ようす}は どうでしょうか。", "様子{ようす} is new in this lesson"],
      ["How was the marathon?", "マラソンは どうだったでしょうか。", ""],
      ["How is the Snow Festival in Sapporo?", "札幌{さっぽろ}の 雪祭{ゆきまつ}りは どうでしょうか。", ""],
      ["How will the Tanabata Festival be?", "七夕祭り{たなばたまつり}は どうでしょうか。", "七夕祭り{たなばたまつり} is new in this lesson"],
      ["How is the year-end party plan?", "忘年会{ぼうねんかい}の 予定{よてい}は どうでしょうか。", ""],
      ["How was the New Year's party?", "新年会{しんねんかい}は どうだったでしょうか。", ""],
      ["How is this motorcycle?", "この オートバイは どうでしょうか。", ""],
      ["How was the reply from the section chief?", "課長{かちょう}からの 返事{へんじ}は どうだったでしょうか。", ""],
      ["How is the application going?", "申し込み{もうしこみ}は どうでしょうか。", ""],
      ["How was the contest?", "コンテストは どうだったでしょうか。", ""],
      ["How is life in space, do you think?", "宇宙{うちゅう}の 生活{せいかつ}は どうでしょうか。", ""],
      ["How is the condition of the earth?", "地球{ちきゅう}の 様子{ようす}は どうでしょうか。", ""],
      ["How was the second party?", "二次会{にじかい}は どうだったでしょうか。", ""],
      ["How is this pair of trousers?", "この ズボンは どうでしょうか。", ""],
      ["How was your son's coming-of-age ceremony?", "息子{むすこ}の 成人式{せいじんしき}は どうだったでしょうか。", ""],
      ["How is the situation of the case?", "事件{じけん}の 様子{ようす}は どうでしょうか。", "事件{じけん} is new in this lesson"],
      ["How was the driver's work?", "運転手{うんてんしゅ}の 仕事{しごと}は どうだったでしょうか。", ""],
      ["How is the Snow Festival?", "雪祭{ゆきまつ}りは どうでしょうか。", ""],
      ["How was living with elderly people?", "お年寄{としよ}りとの 生活{せいかつ}は どうだったでしょうか。", ""],
      ["How is the machine's condition?", "機械{きかい}の 様子{ようす}は どうでしょうか。", ""],
      ["How was yesterday's test?", "きのうの テストは どうだったでしょうか。", ""],
      ["How is Hans at school?", "ハンスは 学校{がっこう}で どうでしょうか。", "the textbook's model question"],
    ]
  }
];

function bare(s) {
  return String(s).replace(/\{[^}]+\}/g, "");
}

function validate() {
  const checks = [
    [(p) => p.drills.every((d) => /か/.test(d[1]) && !/か\s*どうか|かどうか/.test(d[1]) && /(何|いつ|どこ|だれ|どう|いくら|どの)/.test(bare(d[1]))), "embedded"],
    [(p) => p.drills.every((d) => /か\s*どうか|かどうか/.test(d[1])), "whether"],
    [(p) => p.drills.every((d) => /[てで]\s*み/.test(d[1]) || /てみ|でみ/.test(bare(d[1]).replace(/\s/g, ""))), "temiru"],
    [(p) => p.drills.every((d) => /(高さ|長さ|重さ|大きさ|速さ|高\{[^}]+\}さ|長\{[^}]+\}さ|重\{[^}]+\}さ|大\{[^}]+\}きさ|速\{[^}]+\}さ)/.test(d[1])), "sa"],
    [(p) => p.drills.every((d) => /でしょうか/.test(d[1])), "deshouka"],
  ];
  L40_POINTS.forEach((p, i) => {
    if (p.drills.length !== 30) throw new Error(`point ${i} has ${p.drills.length} drills`);
    const keys = new Set();
    p.drills.forEach((d, di) => {
      const k = bare(d[1]).replace(/\s/g, "");
      if (keys.has(k)) throw new Error(`point ${i} duplicate ${di}: ${d[1]}`);
      keys.add(k);
    });
    if (!checks[i][0](p)) {
      p.drills.forEach((d, di) => {
        if (i === 3 && !/(高|長|重|大|速)(\{[^}]+\})?さ/.test(d[1])) {
          console.error("sa fail", di, d[1]);
        }
      });
      throw new Error(`point ${i} failed ${checks[i][1]} check`);
    }
  });
}

function emitPoint(p, indent) {
  const ind = (n) => " ".repeat(n);
  const lines = [];
  lines.push(`${ind(indent)}{`);
  lines.push(`${ind(indent + 2)}pattern: ${JSON.stringify(p.pattern)},`);
  lines.push(`${ind(indent + 2)}short: ${JSON.stringify(p.short)},`);
  lines.push(`${ind(indent + 2)}explain: ${JSON.stringify(p.explain)},`);
  lines.push(`${ind(indent + 2)}formation: ${JSON.stringify(p.formation)},`);
  lines.push(`${ind(indent + 2)}examples: [`);
  p.examples.forEach((ex) => {
    lines.push(`${ind(indent + 4)}[${JSON.stringify(ex[0])}, ${JSON.stringify(ex[1])}],`);
  });
  lines.push(`${ind(indent + 2)}],`);
  lines.push(`${ind(indent + 2)}drills: [`);
  p.drills.forEach((d) => {
    lines.push(`${ind(indent + 4)}[${JSON.stringify(d[0])}, ${JSON.stringify(d[1])}, ${JSON.stringify(d[2] || "")}],`);
  });
  lines.push(`${ind(indent + 2)}]`);
  lines.push(`${ind(indent)}}`);
  return lines.join("\n");
}

validate();

const src = fs.readFileSync(DATA, "utf8");
const startMark = "\n40: { points: [";
const start = src.indexOf(startMark);
if (start < 0) throw new Error("L40 CONTENT block not found");
const after = start + 1; // keep leading newline via rewrite
const endMark = "\n41: { points: [";
const end = src.indexOf(endMark, start);
if (end < 0) throw new Error("L41 CONTENT block not found");

const block =
  "40: { points: [\n" +
  L40_POINTS.map((p) => emitPoint(p, 2)).join(",\n") +
  "\n]},\n";

const out = src.slice(0, start) + "\n" + block + src.slice(end + 1);
fs.writeFileSync(DATA, out);
console.log("Wrote L40 with", L40_POINTS.map((p) => p.drills.length).join("/"), "drills");
