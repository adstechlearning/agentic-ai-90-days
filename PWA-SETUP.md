# Using the study portal as a PWA

The portal is now an installable Progressive Web App: it gets its own icon and window, and once you've opened it online a single time it works completely offline — all 90 days, all 136 links, and your progress.

## What's in the folder

```
index.html              the app
manifest.webmanifest    name, icons, colours, start URL
sw.js                   service worker — offline caching + update prompt
icons/                  192px, 512px, maskable and Apple touch icons
.nojekyll               stops GitHub Pages from reprocessing the files
```

All paths are **relative**, so this works from a GitHub Pages project subfolder (`username.github.io/repo-name/`), from a domain root, or from any static host — no configuration needed.

---

## Publishing it

1. Commit all of the above to your repository (keep the folder structure — `icons/` must stay a subfolder next to `index.html`).
2. **Settings → Pages → Source: Deploy from a branch**, pick your branch and `/ (root)`.
3. Wait for the green check, then open `https://<username>.github.io/<repo-name>/`.

**HTTPS is mandatory.** A service worker will not register over plain `http://`, so PWA features are silently skipped. GitHub Pages is HTTPS by default. The one exception is `http://localhost`, which browsers treat as secure for testing.

To test locally before pushing:

```bash
cd path/to/agentic-ai-90-days-main
python3 -m http.server 8000
# then open http://localhost:8000
```

Opening `index.html` by double-clicking it (a `file://` URL) will run the app fine but will **not** enable PWA features — the code detects this and skips registration rather than throwing errors.

---

## Installing it

**Android (Chrome / Edge / Samsung Internet)** — an "Install App" button appears on the dashboard once the browser decides the app qualifies. You can also use the ⋮ menu → *Install app* / *Add to Home screen*.

**Desktop (Chrome / Edge / Brave)** — same dashboard button, or the ⊕ install icon at the right-hand end of the address bar, or ⋮ menu → *Cast, save and share → Install page as app*.

**iPhone / iPad (Safari)** — Apple doesn't allow the in-page install button, so use the Share button → **Add to Home Screen**. Offline caching still works; it must be Safari, as third-party iOS browsers can't install PWAs.

**Firefox desktop** doesn't install PWAs. It will still cache the app for offline use, so bookmarking works fine.

Once installed, it launches in its own window with no address bar, and the app's long-press menu offers shortcuts straight to the Roadmap, Resources and Projects.

---

## How updates work

When you publish a change, anyone with the app open sees an **"Update available"** banner with *Reload* and *Later*. Nothing swaps out mid-session — the new version only takes over when they choose to reload. The app also re-checks each time it's brought back into focus.

**Whenever you edit `index.html`, bump the version in `sw.js`:**

```js
const CACHE_VERSION = "v1";   // → "v2", "v3", …
```

If you forget, returning visitors may keep seeing the cached old page. The navigation strategy is network-first so most people will still get the new file, but the version bump is what reliably clears out stale assets.

---

## Your progress data

Progress lives in `localStorage`, scoped to the site's origin. Practical consequences:

- The installed app and the same site in your browser **share** progress — same origin.
- Progress does **not** sync across devices. Use **Export Progress** on one and **Import Progress** on the other.
- Clearing site data, or uninstalling the app on some platforms, wipes it. Export occasionally if the streak matters to you.
- Progress survives app updates — the service worker only caches files, never your data.

---

## If it won't install

Open DevTools → **Application** and work down this list:

| Check | Where | Expected |
|---|---|---|
| Page is HTTPS or localhost | address bar | padlock, not "Not secure" |
| Manifest loads | Application → Manifest | no red errors; icons preview |
| Service worker is running | Application → Service Workers | status **activated and is running** |
| Files are cached | Application → Cache Storage | `agentic90-v1` with 8 entries |
| Offline actually works | Network → **Offline**, then reload | app still renders |

Two failure modes account for most problems:

- **`sw.js` in the wrong place.** It must sit next to `index.html`. A service worker can only control pages at or below its own directory, so putting it in a subfolder silently limits its scope.
- **A stale worker from earlier testing.** Application → Service Workers → *Unregister*, then hard-reload (Ctrl/Cmd + Shift + R).

Chrome also won't offer installation if you've dismissed the prompt recently on that site — try a fresh profile or an incognito window to confirm.

---

## Removing the PWA later

Delete `manifest.webmanifest`, `sw.js` and `icons/`, and remove the two blocks at the end of `index.html` marked `/* ---------- PWA` plus the `<link rel="manifest">` line. The portal returns to a plain single HTML file with nothing broken.

Anyone who already installed it will keep a cached copy until they unregister the worker, so if you're reverting deliberately, publish a `sw.js` that calls `self.registration.unregister()` for one release cycle rather than deleting the file outright.
