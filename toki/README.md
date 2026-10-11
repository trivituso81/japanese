# TOKI - Japan, one story at a time

An iPhone-first, self-contained web app for learning Japanese history through stories, contextual questions, social decisions, and spaced practice.

Content snapshot: October 10, 2026. Version 1.0.0.

## Start here

The app is already built. No package install, account, API key, paid service, or build step is necessary to use it.

In this repository it lives at **`toki/`** and is published with the study guide on GitHub Pages:

`https://trivituso81.github.io/japanese/toki/`

For a desktop preview, open `toki/index.html` in a browser that permits local HTML scripts. Local-file storage behavior varies between browsers; a hosted origin is the intended environment for reliable progress persistence and iPhone installation.

For iPhone, open the Pages URL above in Safari. Open Share (sometimes inside the page menu), select **Add to Home Screen**, enable **Open as Web App** when shown, and tap **Add**. Launch TOKI from that icon. This is a web app, not an App Store application.

Keep these files together with their relative paths unchanged:

- `index.html`
- `sw.js`
- `manifest.webmanifest`
- `icon-192.png`
- `icon-512.png`

No backend or special routing rules are needed: navigation uses URL fragments.

Apple's instructions: https://support.apple.com/guide/iphone/iphea86e5236/ios

Opening an HTML attachment in the iPhone Files preview is not equivalent to running a hosted website.

## What is actually playable

The 18 chapters contain 90 authored missions, with 270 reading cards and 10,341 words in those reading cards alone. Each chapter explores the world, power, daily life, society, and language.

The chronological route covers first arrivals, Jomon, Yayoi, Kofun, Asuka, Nara, Heian, Kamakura, Muromachi, the age of war and unification, Edo, Bakumatsu, Meiji, Taisho, empire and war, postwar reconstruction and growth, Heisei, and Reiwa through the dated 2026 snapshot. All chapters are available immediately; completing one is not a gate to the next.

Every mission has three reading cards, one contextual vocabulary card, one conceptual/application question, one vocabulary retrieval question, explanatory feedback, sources, and a place for a personal reflection.

Additional playable modes:

- **Focused review:** an adaptive queue drawn from due and missed questions.
- **Mixed recall:** ten questions sampled from 180 conceptual and vocabulary prompts.
- **Time shuffle:** order four events sampled from 29 dated historical anchors. Optional date hints and full explanations are available.
- **Word match:** connect four terms and their meanings. It draws from completed stories once at least four have been completed; otherwise it samples the full glossary.
- **Live a day:** six fictional, three-decision stories with changing resource, relationship, and insight meters. Prior choices affect contextual feedback and the ending. These are constrained teaching exercises, not open-ended historical simulators.
- **Phrase lab:** twelve contemporary social situations with Japanese expressions, readings, explanations, and optional modern device speech.

Search all lessons, filter by perspective, compare any two eras, bookmark missions, collect 18 era stamps, write notes, and view daily activity and recall strength.

## Progress, privacy, and backups

Progress uses the browser's `localStorage` under the key `toki.history.v1`. It saves completed missions, unfinished mission steps and answers, review records and due dates, notes, bookmarks, XP, daily activity, settings, and decision-story choices.

No analytics, advertisements, accounts, trackers, or cloud storage are included. The app does not transmit learning data. External source links open their respective publishers' websites.

Use **Passport > Back up your progress** to export a JSON file. Use **Restore a backup** to import it. Import validates the schema and requires confirmation before replacing local progress. Notes are rendered as text, not executable HTML.

Important limitations:

- Progress is local to the browser/storage context and site origin. There is no automatic cross-device or account-based synchronization.
- Clearing website data, private browsing, storage eviction, a different browser/address, or a lost device may remove access to progress. Keep exported backups.
- Completed game awards and answered review questions save immediately. The temporary ordering or selection state of a currently unfinished timeline, word-match, mixed-review, or phrase round is not restored after a full page reload. Unfinished lesson steps and decision stories are restored.
- The app shows a warning if browser storage fails. An exported backup remains the recommended safeguard.

## Learning and reward rules

First mission completion: 25 XP plus 5 XP for each of the two correct answers. Replaying a completed mission can improve its best score but never awards mission XP again.

Decision stories: 20 XP once per story. Time shuffle, each recall mode, and the phrase lab award 15 XP once per local calendar day. Word match awards 12 XP once per day. There are no timers or lost lives.

A correct first retrieval schedules review one day later. Subsequent correct retrievals at least 20 hours apart advance to 3, 7, 14, and 30 days. An incorrect answer resets the streak and schedules a return in 10 minutes; the missed item is also immediately accessible through focused review. Same-day repetitions do not inflate spaced-recall strength.

An era stamp means all five missions were explored. It does not certify mastery. The memory view labels questions strengthened only after two successful retrievals separated by at least 20 hours. Reflection and comparison prompts invite explanation beyond multiple-choice recognition.

## Historical scope and editorial cautions

This is a broad foundation across the full chronological arc, not an exhaustive history, a scholarly reference work, or a complete Japanese-language course. Its most useful next step is deeper reading of the linked sources.

There are 48 selected references to museum, archive, university, official, and language-corpus materials. Sources appear within lessons and in the source library. Selected references support the chapter, not a claim that every original teaching sentence is quoted or independently footnoted at clause level.

Prehistoric dates are approximate and regional transitions are uneven. Some period boundaries overlap and alternative founding dates are explained. Government statements are treated as institutional primary sources, not automatically neutral accounts. The contemporary chapter identifies the dates of political events and statistical releases. It is not a live news feed.

Scenarios, characters, imagined situations, illustrations, and resource values are fictional or schematic teaching devices. They are not reconstructed conversations, archaeological drawings, or numerical models of historical societies.

Japanese speech uses an available modern `ja` device voice. The app reports when one is unavailable. Audio may depend on the device or network; it does not reconstruct historical pronunciation. Romanization omits macrons, so long vowels must not be inferred to be short. Prehistoric Japanese labels are explicitly modern study terms.

War and colonial violence are described without graphic images or conquest-game mechanics.

## Offline behavior

All curriculum, game data, CSS, and JavaScript are embedded in `index.html`. There are no external libraries, fonts, image downloads, or API calls needed to render the learning app.

When served from HTTPS (or a supported localhost development origin), the included service worker is designed to cache the app shell, manifest, and icons after the first successful load. External sources and some device speech voices can still require internet access.

A physical iPhone installation and airplane-mode test remain necessary before calling a deployment production-ready. The environment used to build this app did not permit actual HTTP/file browser navigation, so service-worker installation and native Safari storage durability were not verified here.

## Quality checks performed

The included test report records:

- All 90 missions completed through their DOM controls, awarding the expected 3,150 XP and 18 stamps for first-pass correct answers.
- All 180 question prompts checked for valid, distinct choices and valid source references.
- Mid-lesson and decision-story restoration from serialized progress.
- Review scheduling, same-day repetition behavior, wrong-answer reset, and no duplicate mission XP.
- The 12-situation phrase lab and 10-question mixed-recall round.
- All 162 possible three-choice paths across the six decision stories evaluated for valid resource values.
- Bookmarking, note restoration with HTML-like text, search/filtering, era comparison, backup export/import, and larger-text settings.
- No horizontal overflow in ten main views at 320, 375, 390, 430, and 1,280 CSS-pixel widths.
- No JavaScript runtime errors in these checks.

Tests used Chromium DOM rendering with an isolated serialized-storage adapter because sandbox policy blocked ordinary HTTP/file navigation. This validates application and serialization logic, not real-device Safari behavior, native localStorage durability, accessibility conformance, or offline installation. No independent historian or native Japanese-language specialist review is claimed.

## Editing the app

`index.html` is the ready-to-use build. Authoring files are also included:

- `app.js`: view rendering, games, state validation, storage, and interaction logic.
- `style.css`: responsive visual design and accessibility-oriented preferences.
- `build_content.py`: the authored curriculum and source references.
- `build_activities.py`: timeline anchors, decision stories, and phrase situations.
- `build.py`: creates the bundled HTML, icons, and manifest.
- `content.json` and `activities.json`: generated human-readable data.

To rebuild after editing, use Python 3 with Pillow installed and run `python build.py` inside this folder. This writes `index.html` and a standalone `TOKI-Japanese-History.html` here. The app itself does not need Python.

When publishing an updated release, change the cache version in `sw.js`; otherwise an existing installation can continue using its previous cached build. Keep the public site origin stable to preserve users' local progress, and keep changes to the progress schema backward compatible or provide migration code.
