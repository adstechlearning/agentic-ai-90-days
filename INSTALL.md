# Installation procedure

One linear sequence, start to finish. Stages 1–3 are all most people need (about 15 minutes). Stage 4 is optional and only for instructors who want to monitor a cohort.

Each stage ends with a **Checkpoint** — do not move on until it passes.

---

## Before you start

| You need | Why | Check |
|---|---|---|
| A web browser | To run the portal | Any modern browser |
| A GitHub account | To publish it | github.com/signup — free |
| Git installed | To push the files | `git --version` |
| Python 3 *(optional)* | Only for local testing in Stage 1b | `python --version` |

You do **not** need Node, npm, a build tool, a server, or a paid host. There is nothing to compile.

---

## Stage 1 — Verify the files locally

### 1a. Confirm the folder is complete

Your folder must contain exactly these, with `icons/` and `apps-script/` as subfolders:

```
agentic-ai-90-days-main/
├── index.html               the portal
├── manifest.webmanifest     app identity
├── sw.js                    offline caching
├── teacher-dashboard.html   instructor view (optional to publish)
├── .nojekyll                GitHub Pages directive — easy to miss, keep it
├── icons/
│   ├── icon-192.png
│   ├── icon-512.png
│   ├── icon-maskable-192.png
│   ├── icon-maskable-512.png
│   └── apple-touch-icon.png
└── apps-script/
    └── Code.gs              only used in Stage 4
```

`.nojekyll` starts with a dot, so it is hidden by default. On macOS press `Cmd+Shift+.` in Finder; on Windows enable *Hidden items* in the View tab. If it is missing, create an empty file with that exact name.

The `.md` files are documentation and do not affect how the portal runs.

### 1b. Open it

Double-click `index.html`.

You should see the dashboard with a **Start here** panel, ten phase cards, and a 90-square calendar.

> App installation and offline mode will **not** work yet. Those need a real web address, which Stage 2 provides. Everything else works.

If you prefer to test the way it will actually be served, run a local server from inside the folder:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`. Browsers treat `localhost` as secure, so PWA features work here too.

### ✅ Checkpoint 1

- The dashboard renders and the **Start here** panel expands
- **Continue Learning** opens Day 1 with resource links and three questions
- Ticking a checkbox moves the progress bar off 0%

---

## Stage 2 — Publish to GitHub Pages

### 2a. Create the repository

On GitHub: **New repository** → name it (for example `agentic-ai-90-days`) → **Public** → **Create**.

Public is required for free GitHub Pages. Nothing here is sensitive at this stage.

### 2b. Push the files

From inside the folder:

```bash
git init
git add .
git commit -m "Add 90-day agentic AI study portal"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git push -u origin main
```

Then confirm on GitHub that `.nojekyll` and the `icons/` folder both appear. `git add .` normally includes dotfiles, but verify — a missing `.nojekyll` is a common cause of odd behaviour later.

### 2c. Turn on Pages

Repository → **Settings** → **Pages** → under *Build and deployment*:

- **Source:** Deploy from a branch
- **Branch:** `main`, folder `/ (root)`
- **Save**

Wait 1–3 minutes for the first build. The page will show your URL when it's ready:

```
https://YOUR-USERNAME.github.io/YOUR-REPO/
```

The trailing slash matters. Open it.

### ✅ Checkpoint 2

- The site loads over **https** with a padlock
- Right-click → View Page Source shows the real HTML, not a 404
- The icons load (check the browser tab icon)

If you get 404 for a minute or two, that's normal on first deploy. If it persists past five minutes, confirm the branch and folder settings and that `index.html` is at the repository root, not inside a subfolder.

---

## Stage 3 — Install it as an app

Do this from the **published https URL**, not from a local file.

### Android — Chrome, Edge, Samsung Internet

1. Open the site.
2. An **⤓ Install App** button appears on the dashboard. Tap it.
3. If it doesn't appear, use ⋮ menu → **Install app** (or *Add to Home screen*).

### Desktop — Chrome, Edge, Brave

1. Open the site.
2. Click **⤓ Install App** on the dashboard, or the install icon (⊕ / monitor symbol) at the right end of the address bar.
3. Or: ⋮ menu → *Cast, save and share* → **Install page as app**.

### iPhone / iPad — Safari only

Apple blocks the in-page install button, so:

1. Open the site **in Safari** (not Chrome or Firefox — third-party iOS browsers cannot install PWAs).
2. Tap the **Share** button.
3. Scroll down → **Add to Home Screen** → **Add**.

### Firefox desktop

Firefox does not install PWAs. Offline caching still works, so bookmark it and carry on.

### ✅ Checkpoint 3

- The app opens in its own window with no address bar
- Turn off wifi and mobile data, then reopen it — the full 90-day plan still renders
- Progress ticked in the browser also shows in the installed app (same origin, shared storage)

If the install option never appears, open DevTools → **Application** → **Service Workers** and confirm the status reads *activated and is running*.

---

## Stage 4 — Cohort tracking (instructors, optional)

Skip this entirely if you're using the portal for yourself. Until it's configured, nothing is transmitted and no tracking UI appears.

### 4a. Create the Sheet and script

1. Create a new Google Sheet.
2. **Extensions → Apps Script**. Delete the placeholder `myFunction`.
3. Paste the whole of `apps-script/Code.gs`. Save.
4. Function dropdown → **`setup`** → **Run**. Approve the permission prompt (it's your own script editing your own Sheet).
5. Open the execution log. Copy both keys:

```
WRITE_KEY   = …    goes into index.html — students can read it, that's expected
TEACHER_KEY = …    goes into the dashboard — keep private
```

### 4b. Deploy the script

**Deploy → New deployment → ⚙ → Web app**:

| Field | Value |
|---|---|
| Execute as | **Me** |
| Who has access | **Anyone** |

Deploy, approve, copy the URL ending in `/exec`.

*"Anyone" is required* — students' browsers call it anonymously. The `WRITE_KEY` gates writes, and no data can be read without the `TEACHER_KEY`.

### 4c. Point the portal at it

In `index.html`, find the config block at **line 140**:

```js
const SYNC={
 url:"",   // paste the /exec URL here
 key:""    // paste the WRITE_KEY here
};
```

Fill both in.

### 4d. Bump the cache version

In `sw.js`, **line 10**:

```js
const CACHE_VERSION = "v2";   →   "v3"
```

**This step is not optional.** Skip it and students with the app installed may keep running the old version indefinitely.

### 4e. Republish

```bash
git add index.html sw.js
git commit -m "Enable cohort tracking"
git push
```

Wait 1–2 minutes for Pages to rebuild.

### 4f. Open the dashboard

Open `teacher-dashboard.html` — locally by double-clicking, or from your published URL. Enter the `/exec` URL and your `TEACHER_KEY`, then **Load**.

Publishing the dashboard file is safe: it contains no key until you type one in, and it's stored only in your own browser. Just never commit a copy with the key hard-coded.

### ✅ Checkpoint 4

- The published portal now shows a **Class tracking** card on the dashboard
- Enter a test roll number and name → the status line reads *"Synced at HH:MM"*
- A row appears in your Sheet's **Progress** tab
- The dashboard loads and shows that test student

Full reference — dashboard columns, weekly workflow, data caveats: **`TEACHER-SETUP.md`**

---

## Publishing updates later

Any time you change `index.html`:

1. Edit the file.
2. Bump `CACHE_VERSION` in `sw.js` (`"v3"` → `"v4"`).
3. Commit and push.

Anyone with the app open then sees an **"Update available"** banner and can reload when ready. Nothing swaps out mid-session.

---

## Troubleshooting

| Symptom | Cause and fix |
|---|---|
| 404 on the Pages URL | Wrong branch/folder, or `index.html` is inside a subfolder rather than the repo root |
| Site loads but no **Install App** button | Not https, service worker not registered, or you already dismissed the prompt — try an incognito window |
| Icons missing / broken app icon | `icons/` wasn't pushed, or was flattened. It must be a subfolder beside `index.html` |
| Changes don't appear for returning users | `CACHE_VERSION` wasn't bumped. Fix it and push again |
| Offline mode doesn't work | Open DevTools → Application → Service Workers. Status must be *activated and is running* |
| Odd behaviour on GitHub Pages only | `.nojekyll` is missing — create the empty file and push |
| Student sees "Could not reach your instructor's sheet" | Wrong `/exec` URL or mismatched `WRITE_KEY` |
| Dashboard says "bad key" | `TEACHER_KEY` mistyped, or you edited `Code.gs` without redeploying |
| Edits to `Code.gs` have no effect | **Deploy → Manage deployments → edit → Version: New version → Deploy.** Saving alone never updates the live URL. This catches almost everyone once |

---

## Uninstalling

**The app:** Android — long-press the icon → Uninstall. Desktop Chrome — ⋮ inside the app window → Uninstall. iOS — long-press → Remove App.

**Progress data:** Reset Progress in the portal, or clear site data for the origin. Export first if you want a copy.

**Tracking:** Clear `SYNC.url` in `index.html`, bump `CACHE_VERSION`, republish. Delete the Google Sheet to remove collected data.

**The whole site:** Settings → Pages → set Source to *None*, or delete the repository. Anyone with the app installed keeps a cached copy until they uninstall it.
