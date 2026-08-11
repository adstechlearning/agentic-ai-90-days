# 90 Days to Agentic AI Engineer

A free, self-paced study portal: 90 days, 3 hours a day, Python fundamentals through to deployed and evaluated agentic AI systems. 10 phases, 12 portfolio projects, 136 links to official documentation.

Runs as a static site. No build step, no server, no accounts. Installs as an app and works offline. Optionally reports progress to an instructor's Google Sheet.

---

## Try it in 10 seconds

Double-click `index.html`. That's it — the full 90-day plan, progress tracking and all. Progress saves in your browser.

Two things won't work from a `file://` URL: app installation and offline caching. Both need a real web address, which is the next section.

---

## Publish it (5 minutes)

1. Push this folder to a GitHub repository.
2. **Settings → Pages → Deploy from a branch**, pick your branch and `/ (root)`.
3. Open `https://<username>.github.io/<repo-name>/`.

Keep the folder structure intact — `icons/` must stay a subfolder beside `index.html`. Everything uses relative paths, so it works from a subfolder, a domain root, or any static host.

Numbered steps with checkpoints: **`INSTALL.md`**

---

## For students

**Install it.** On the published site, an **Install App** button appears on the dashboard (Android and desktop Chrome/Edge). On iPhone, use Safari's Share → *Add to Home Screen*. It then opens in its own window and works with no internet.

**Start with Day 0.** The dashboard opens with a **Start here** panel: Python, uv, Git, model access (including free options), and secrets hygiene. About ninety minutes, once. Everything after assumes it's done — skipping it is the usual reason people stall in week one.

**Use it daily.** Press **Continue Learning** and it opens the first unfinished day. Each day gives you:

- learning objectives and the exact GitHub folder name to create
- a 3-hour plan — 45 min study, 90 min code, 30 min challenge, 15 min document
- 3–5 official documentation links for that specific topic, plus a video search
- three questions written for that day, each with an answer key you open after attempting it
- four checkboxes: Study, Code, Challenge, GitHub

**Every seventh day adds a review** — four retrospective questions to answer in your README, and three housekeeping actions. Thirteen checkpoints across the programme.

**The twelve project days carry a full spec** — requirements, acceptance criteria you check yourself, a four-level self-grading rubric, and a stretch goal. These are the days that produce portfolio pieces.

A day counts as complete when all four are ticked. **Mark Day Complete** ticks them all at once, and ticking it again undoes that.

**The checkboxes are not the point.** The programme is built around evidence: each day you commit a `day-NN-topic` folder to GitHub containing your code, a test, an edge case, and a README noting what you learned. That repository is what you show people at the end — not a screenshot of ticked boxes.

**Moving devices.** Progress lives in one browser. Use **Export Progress** on the old device and **Import Progress** on the new one. Worth doing occasionally as a backup.

**Sharing a specific day.** Every day has its own URL — `…/#day-42`. Bookmark it, send it to a study partner.

---

## For instructors

### Publishing to a cohort

Publish once (above) and share the URL. Nothing else is required — students need no accounts and you need no infrastructure.

### Monitoring progress (optional)

Students tick boxes → progress writes to a Google Sheet you own → you watch the cohort in a dashboard. Roughly ten minutes to set up, no hosting cost.

1. Create a Google Sheet → **Extensions → Apps Script** → paste `apps-script/Code.gs` → run `setup()`.
2. Deploy it as a web app (**Execute as: Me**, **Who has access: Anyone**) and copy the `/exec` URL.
3. Paste that URL and the `WRITE_KEY` into the `SYNC` block near the top of the script in `index.html`, then republish.
4. Open `teacher-dashboard.html`, enter the URL and your `TEACHER_KEY`.

Full walkthrough, including what students see and what data leaves their browser: **`TEACHER-SETUP.md`**

**Until you fill in `SYNC.url`, tracking is completely off** — no card appears, nothing is transmitted, the portal stays anonymous and offline.

**What the data is worth.** These are self-reported checkboxes. Four boxes take ten seconds to tick, and the data would look identical to three hours of real study. Use the dashboard to spot *disengagement* — who has gone quiet, who stalled in Phase 3, who never started — then verify actual learning against their GitHub repositories. The `Syncs` column is a useful tell: 45 days complete across 2 syncs means a month was back-filled in one sitting.

### Publishing changes

After editing `index.html`, **bump `CACHE_VERSION` in `sw.js`** (`"v2"` → `"v3"`, and so on). Students then see an "Update available" banner instead of a stale cached page. Skip this step and returning visitors may not see your changes.

---

## What's in the folder

| File | Purpose |
|---|---|
| `index.html` | The portal — content, tracker, PWA and sync all in one file |
| `manifest.webmanifest` | App name, icons, colours |
| `sw.js` | Offline caching and the update prompt. **Bump `CACHE_VERSION` when you republish** |
| `icons/` | App icons, including maskable ones for Android |
| `teacher-dashboard.html` | Cohort table: filters, pace, phase progress, CSV export |
| `apps-script/Code.gs` | The Google Sheets collector |
| `.nojekyll` | Stops GitHub Pages reprocessing the files |
| `INSTALL.md` | **Step-by-step installation, start to finish** |
| `PWA-SETUP.md` | PWA specifics: updates, DevTools checklist, removal |
| `TEACHER-SETUP.md` | Sheet setup, dashboard columns, weekly workflow, caveats |
| `README.md` | This file |
| `AUDIT-REPORT.md` | What was changed from the original and why |
| `index.html.bak` | The original single-file version |

## Privacy

By default nothing leaves the browser. Progress is `localStorage` on the student's own device; there is no analytics, no cookies, no account.

If an instructor enables tracking, four things are sent: name, student ID, class, and a 90-character string of how many boxes are ticked per day. No email, no IP logging, no browsing history. Students can unlink at any time and keep their local progress.

## Editing the content

The 90-day dataset is the `const DATA = {…}` object near the top of the `<script>` in `index.html`. Each day has `topic`, `objectives`, `studyPlan`, `resources`, `knowledgeCheck` (an array of `{q, a}`), `deliverable` and `checks`. Text in study-plan entries supports `**bold**`.

Day 0 lives in `DATA.setup`. Weekly reviews are a `review` object on days 7, 14, … 84 and 90. Project specs are a `spec` object on the twelve project days.

**The dataset stays inline on purpose.** Moving it to `data.json` would make content edits nicer to review in Git, but `fetch()` is blocked on `file://` URLs — so double-clicking `index.html` would stop working, and that's the fastest way for a student to try this. The trade wasn't worth it.
