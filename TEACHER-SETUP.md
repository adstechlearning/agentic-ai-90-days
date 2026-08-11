# Monitoring student progress

Students tick checkboxes in the portal; those ticks are written to a Google Sheet you own; you watch the cohort in a dashboard. No server, no hosting bill, no accounts to administer.

**Read this first.** These are self-reported checkboxes. A student can tick four boxes in ten seconds and the data will look identical to a student who studied for three hours. Use this to spot *disengagement* — who has gone quiet, who is stuck in Phase 3, who never started — and verify actual learning against the `day-NN-topic` folders they commit to GitHub. The `Syncs` column helps: 45 days complete across 2 syncs means someone back-filled a month in one sitting.

---

## What you'll end up with

```
Google Sheet ── Progress   one row per student, updated live
             └─ Log        append-only history of every update

teacher-dashboard.html     sortable table, filters, CSV export
apps-script/Code.gs        the collector (pasted into Apps Script)
```

Setup takes about ten minutes, once.

---

## 1. Create the Sheet and the script

1. Create a new Google Sheet. Name it something like *90-Day AI Cohort*.
2. **Extensions → Apps Script**. Delete the placeholder `myFunction`.
3. Paste the entire contents of `apps-script/Code.gs`. Save.
4. In the function dropdown pick **`setup`** and click **Run**. Approve the permissions prompt — it's your own script asking to edit your own Sheet.
5. Open **View → Logs** (or the Execution log). You'll see two keys:

```
WRITE_KEY   = a1b2c3…    goes in index.html
TEACHER_KEY = x9y8z7…    goes in teacher-dashboard.html
```

Copy both somewhere safe now — you can always re-read them under **Project Settings → Script Properties**.

Your Sheet now has `Progress` and `Log` tabs with headers.

## 2. Deploy it as a web app

**Deploy → New deployment → ⚙ → Web app**, then:

| Field | Value |
|---|---|
| Description | anything |
| Execute as | **Me** |
| Who has access | **Anyone** |

Deploy, approve, and copy the URL. It ends in `/exec`.

"Anyone" sounds alarming but is required — students' browsers call this anonymously. Access is gated by the `WRITE_KEY`, and the script only ever accepts a valid progress payload. It cannot read your Sheet or return data without the `TEACHER_KEY`.

## 3. Point the portal at it

Open `index.html`, find this block near the top of the `<script>` (around line 108):

```js
const SYNC={
 url:"",   // e.g. "https://script.google.com/macros/s/AKfy.../exec"
 key:""    // the WRITE_KEY printed by setup()
};
```

Fill in both, save, and republish to GitHub Pages. **Bump `CACHE_VERSION` in `sw.js`** at the same time so the PWA picks up the change.

A "Class tracking" card now appears on the dashboard. While `url` is blank the card stays hidden and the portal behaves exactly as before — fully offline and anonymous.

## 4. Open the dashboard

Open `teacher-dashboard.html` (locally by double-clicking, or publish it alongside the portal). Paste the `/exec` URL and your `TEACHER_KEY`, press **Load**. Both are remembered in that browser.

If you publish it, remember **the `TEACHER_KEY` is visible to anyone who opens the page and types it in — but the page itself doesn't contain the key until you enter it**, so publishing the file is safe. Just don't commit a copy with your key hard-coded.

---

## What students see

A card asking for roll number, full name, and class. They fill it in once. After that, every checkbox tick is queued and written about 2.5 seconds later, so rapid ticking produces one write, not four. If they're offline it retries when they reconnect. Nothing is sent until they link, and **Unlink this device** stops it permanently while keeping their local progress.

Only four things leave the browser: name, ID, class, and a 90-character string where each character is how many of that day's four boxes are ticked. No email, no IP logging by you, no browsing history.

Tell them this. It takes one sentence and avoids the "is this spyware" conversation.

---

## Reading the dashboard

| Column | Meaning |
|---|---|
| **Days** | Days with all four boxes ticked |
| **Progress** | Days ÷ 90 |
| **On day** | First day not yet fully complete — where they are now |
| **Phases** | Ten mini-bars, one tick per completed day. Shows *where* someone stalled |
| **Pace** | Days completed ÷ days since they joined. 100% = one day per day. Green ≥80%, amber ≥50%, red below |
| **Syncs** | How many times progress was written. Low number + high days = back-filled |
| **Last active** | Green ≤2 days, amber ≤5, red beyond |

Pace is measured from each student's own join date, so someone who started last week isn't compared against someone who started in January.

The filters that earn their keep: **Inactive 5+ days** (the intervention list) and **Never synced after joining** (students who linked once and vanished).

---

## Running it week to week

**A weekly nudge list.** Filter to *Inactive 5+ days*, download the CSV, mail those students. Five minutes.

**Automatic digests.** In Apps Script, **Triggers → Add trigger → `dailyDigest` → Time-driven → Week timer**. It emails you the cohort average and everyone who's gone quiet. It writes nothing.

**Grading checkpoints.** At each phase boundary, sort by the phase column and cross-check the top and bottom against their GitHub repos. The dashboard tells you who to look at; the repos tell you whether the work is real.

---

## Limits and honest caveats

**Scale.** Apps Script allows roughly 20,000 executions and 90 minutes of runtime per day on a consumer account (higher on Workspace). At ~1 second per write, 300 students syncing a dozen times a day uses a small fraction of that. You will not hit the ceiling.

**The WRITE_KEY isn't secret.** It sits in JavaScript any student can read. Someone determined could post fabricated progress for a classmate's roll number. This is a classroom tool, not an exam system — the `Log` tab records every write, so tampering leaves a trail, and the GitHub repos remain the real evidence.

**One row per student ID.** If two students type the same roll number they overwrite each other. Announce the exact ID format up front (`22CS001`, not `22cs1`).

**Per-device.** A student who switches laptops and re-links from a blank slate will overwrite their row with lower numbers. Tell them to use Export/Import when moving devices.

**Student data.** You're storing names and roll numbers in Google Sheets. Check your institution's policy, tell students what's collected, and delete the Sheet when the cohort ends. Don't collect email addresses — the portal deliberately doesn't ask.

---

## Troubleshooting

| Symptom | Cause |
|---|---|
| Dashboard says "Rejected: bad key" | `TEACHER_KEY` mistyped, or you redeployed without a new version |
| Dashboard can't reach the script | Deployment isn't **Execute as: Me** + **Who has access: Anyone** |
| Student sees "Could not reach your instructor's sheet" | Wrong `/exec` URL, or `WRITE_KEY` doesn't match |
| Edits to `Code.gs` have no effect | **Deploy → Manage deployments → edit → Version: New version → Deploy.** Saving alone never updates the live URL. This catches everyone at least once |
| Tracking card doesn't appear | `SYNC.url` or `SYNC.key` still blank, or the PWA served a cached `index.html` — bump `CACHE_VERSION` |
| Rows appear with blank Class | Students left the field empty; it's optional by design |

---

## Turning it off

Clear `SYNC.url` in `index.html` and republish. The card disappears, nothing is sent, and every student keeps their local progress. Delete the Sheet to remove the collected data.
