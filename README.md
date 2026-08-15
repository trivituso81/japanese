# Minna no Nihongo study guide

A self-contained study guide for *Minna no Nihongo* I & II — all 50 lessons, with
vocabulary flashcards, grammar explanations, marked translation quizzes, a verb
conjugation drill and a kanji drill.

No build step, no dependencies, no server. Three files and a browser.

## What is in it

- **Flashcards** for every word in the books, with a Leitner box behind each one.
  Press **Listen** (or **P**) to hear the Japanese reading aloud via Google
  Translate’s voice (falls back to the browser’s speech engine offline).
- **Grammar drills**: English sentences to translate, marked strictly, with a
  focused round that chases whichever patterns you got wrong.
- **Verb drill**: conjugation practice that is not tied to a lesson. Choose how
  far through the book you have got, pick a form — て-form, ない-form, potential,
  passive, causative and eleven others — and the round mixes all three verb
  groups. The summary says which group and which Group 1 ending is costing you
  marks, and can deal a new round from just those.
- **Kanji**: the 103 characters expected at JLPT N5 and the 181 at N4, each with
  its readings, an example word and the lesson where the book first uses it.
  The drill shows a character and you type what it means; sensible synonyms
  count and a typo will not fail you, though an answer belonging to a different
  kanji will. A character counts as known once you have had it right twice
  running.

## Put it online

1. Create a new repository on GitHub (public or private — Pages works with both
   on a paid plan; public is free).
2. On the empty repo page choose **uploading an existing file**, then drag in
   **the contents of this folder** — `index.html`, `japanese.html`,
   `japanese-data.js` and `source/`. Drag the files themselves, not the folder
   around them: `index.html` has to land at the top of the repository or the
   site will not answer at its root address.
3. Commit.
4. **Settings → Pages → Build and deployment**. Set *Source* to **Deploy from a
   branch**, and the branch to **main** with folder **/ (root)**. Save.
5. Wait a minute or two. The address appears on that same page and looks like
   `https://<your-username>.github.io/<repo-name>/`.

Every later change is the same drag-and-drop: upload the changed file, commit,
and the site follows within a minute.

## Move your progress across

Progress is kept in the browser's own storage, tied to the address the page was
opened from. A site served from `github.io` is a different address from a file
opened off your disk, so **the two do not share progress**, and neither do two
different browsers or a laptop and a phone.

The home screen shows **Save backup** and **Import file**. Save backup opens
a box of your progress text — tap Select all, Copy, paste into Notes (or Share).
To restore without Files, paste that text back and tap Restore from text.
Re-adding the home icon does not erase progress by itself.

If you have been studying from the local copy, carry it over once:

1. Open the local `index.html`, press **Export** on the home screen, and keep the
   JSON file it saves.
2. Open the published site and press **Import**, then pick that file.

That same Export file is your real backup across updates. On an iPhone, use
**Share backup** → **Save to Files** (or **Copy backup** into Notes). Import
opens the file picker — tap **Browse**, not Recents; look under On My iPhone
or iCloud Drive. Clearing Safari website data still wipes on-device storage.

## Files

| File | What it is |
| --- | --- |
| `index.html` | The study guide. This is the page to open. |
| `japanese-data.js` | Every lesson, word, grammar point, example and drill. Both pages read it, so keep it beside them. |
| `japanese.html` | The earlier, simpler progress tracker. Linked from the footer; safe to delete if you never use it. |
| `source/vocab/` | The raw vocabulary transcriptions the data file was built from. Not used at runtime — kept so the wordlists can be checked against the books. |

## On an iPhone

Open the site in **Safari**, tap **Share → Add to Home Screen**. The home-screen
name is **トムさんの勉強ガイド**, it uses the red **和** seal as its icon, and it
opens without the Safari chrome. If an older icon is already there, delete it
and add the site again so iOS picks up the new name.

The home-screen app caches hard — closing it does **not** pull updates. After a
site change, open the same URL once in Safari (pull to refresh), or delete the
home-screen icon and add it again.

Re-adding the icon does **not** erase progress: it is stored for the website,
not inside the icon. Still tap **Export backup** on the home screen first if you
want a spare JSON file in Files.

## Running it locally

Open `index.html` by double-clicking it. That is all — it works straight off the
filesystem, offline, with no server.
