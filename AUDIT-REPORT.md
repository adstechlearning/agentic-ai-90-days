# `index.html` — audit and rebuild

Audited and rebuilt 11 Aug 2026. Original preserved as `index.html.bak`.

Data integrity was clean going in and stays clean: 90 days, 10 phases, phase ranges align exactly, every day's study plan sums to 180 minutes, no duplicate topics.

---

## 1. Links

Every one of the 21 documentation URLs in the original file was fetched individually. (The 90 YouTube links are `youtube.com/results?search_query=…` searches, which always resolve.)

### Replaced

| Was | Status | Now |
|---|---|---|
| `huggingface.co/learn/context-engineering-course` | **404** — wrong slug | `huggingface.co/learn/context-course/unit0/introduction` |
| `platform.openai.com/docs/overview` | Serves nothing to non-JS clients; OpenAI's docs moved | `developers.openai.com/api/docs` + 25 specific guide pages |
| `skills.github.com` | Now only a "Redirecting…" stub | `learn.github.com/skills` |
| `google.github.io/adk-docs` | Redirect | `adk.dev` |
| `ai.pydantic.dev` | Redirect | `pydantic.dev/docs/ai/overview` |
| `docs.pydantic.dev/latest/` | Redirect | `pydantic.dev/docs/validation/latest/get-started` |
| `modelcontextprotocol.io/specification/draft/basic/security_best_practices` | Redirect to an unstable `draft` path | `modelcontextprotocol.io/docs/draft/tutorials/security/security_best_practices` |
| `modelcontextprotocol.io/docs/2026-07-28/…` (14 links) | Pinned to one spec date — would rot | `/docs/latest/…` (verified the alias resolves) |

### Kept as-is (verified live)

`docs.python.org` · `fastapi.tiangolo.com` · `docs.docker.com` · `docs.langchain.com` · `docs.crewai.com` · `huggingface.co/learn/llm-course` · `huggingface.co/learn/agents-course` · `openai.github.io/openai-agents-python` · `anthropic.com/learn`

---

## 2. Resources expanded: 21 → 136 links

Every day had 1–2 sources; several linked only a framework's homepage rather than the page covering that day's topic. Days now carry **3–5 sources each, matched to the specific topic**.

Every URL is either one I fetched directly, or one harvested from the navigation of a page I fetched — nothing was guessed.

| Source | Links | Used for |
|---|---:|---|
| docs.langchain.com | 25 | LangGraph graph API, persistence, checkpointers, interrupts, streaming, stores, memory; LangSmith observability, evaluation, datasets, deployment |
| developers.openai.com | 30 | Prompting, structured outputs, reasoning, embeddings, retrieval, file search, evals, graders, guardrails, caching, cost/latency, MCP, safety, red teaming, cookbook |
| openai.github.io | 13 | Agents SDK: quickstart, agents, tools, running, guardrails, handoffs, orchestration, sessions, tracing, MCP, human-in-the-loop, examples |
| pydantic.dev | 14 | Pydantic models, validators, settings, JSON Schema; Pydantic AI agents, tools, MCP, evals, multi-agent, testing, graph, Logfire |
| huggingface.co | 9 | LLM course chapters, Agents course, Context course, smolagents |
| adk.dev | 13 | Google ADK get-started, agents, tools, workflows, routing, MCP, memory, skills, evaluation, safety, deployment, observability |
| anthropic.com / platform.claude.com | 4 | Anthropic Academy, Claude developer docs, "Building Effective Agents", Engineering blog |
| modelcontextprotocol.io | 5 | MCP intro, architecture, build a server, build a client, security best practices |
| docs.crewai.com | 6 | Quickstart, agents, tasks, flows, cookbooks |
| docs.python.org | 9 | Control flow, data structures, classes, I/O, errors, modules, venv, asyncio |
| fastapi.tiangolo.com | 7 | First steps, async, types, testing, bigger apps, Docker |
| docs.docker.com | 4 | Containers, Dockerfiles, workshop |
| sbert.net | 1 | Embeddings and semantic search |

Examples of the improvement:

- **Day 42 (State, nodes and edges)** — was *LangGraph Documentation*; now *LangGraph: Graph API* + *Overview* + *Streaming*.
- **Day 21 (Embeddings fundamentals)** — was *HF LLM Course*; now *OpenAI Embeddings Guide* + *Sentence-Transformers* + *HF LLM Course*.
- **Day 79 (Prompt injection and tool security)** — was 2 links; now *MCP Security Best Practices* + *OpenAI Safety Best Practices* + *OpenAI Red Teaming* + *Google ADK Safety*.
- **Day 80 (Cost, latency, caching)** — was 1 generic link; now *Prompt Caching* + *Cost Optimization* + *Latency Optimization*.

The Resources tab now groups all 136 links by source instead of showing one flat list.

---

## 3. Bugs fixed

- **Markdown asterisks rendered literally** on 71 of 90 days (`**Python refresh…**` shown as text). Added an escaping renderer that converts `**…**` to real bold — and escapes HTML while doing it.
- **Dead Previous/Next buttons.** Day 1's Previous and Day 90's Next rendered `onclick=""`; they're now properly `disabled` and visually dimmed.
- **Objectives lowercased the topic mid-sentence** on all 90 days ("Explain the core ideas behind oop, dataclasses, typing and pydantic."). Now uses the real topic, quoted.
- **`new URL(...).hostname` was unguarded** — one malformed URL would blank the whole Resources tab. Now wrapped.
- **`theme-color` was hardcoded dark** while the default theme is light. Now two tags driven by `prefers-color-scheme`.
- **Reading progress wrote to storage.** The completion check created an empty record for all 90 days, bloating every export. Reads are now non-mutating and exports drop empty entries.
- **Portfolio count said "10+"** while the Projects tab lists 12. Now says 12.

## 4. Features added

- **Deep linking.** `#day-42`, `#roadmap`, `#resources`, `#projects` are real URLs — students can bookmark and share a specific day. Out-of-range values clamp; unknown hashes fall back to the dashboard.
- **Import Progress** to pair with the existing export, with validation and a clear error message on a bad file.
- **`<noscript>` fallback** — the page was completely blank without JavaScript.
- **Targeted re-rendering.** Ticking a checkbox no longer rebuilds the day panel, so focus and scroll position survive.
- **Mark Complete now toggles**, so a day can be un-marked.
- **Dark mode follows the OS** on first visit, then remembers your choice.
- **Print stylesheet** — chrome hidden, all views expanded, link URLs printed after their text.

## 5. Accessibility and metadata

- Proper `tablist` / `tab` / `tabpanel` roles with `aria-selected`; the day panel is focused and announced via `aria-live` when opened.
- Calendar buttons carry full labels ("Day 12: Embeddings fundamentals — completed") instead of relying on `title`.
- Progress bar is a real `role="progressbar"` with a live `aria-valuenow`.
- Theme button has `aria-label` and `aria-pressed`; search input has a proper label.
- Visible `:focus-visible` outlines throughout; phase cards are real buttons, so they're keyboard-reachable.
- `prefers-reduced-motion` respected.
- Added meta description, Open Graph and Twitter card tags, `color-scheme`, and an inline SVG favicon — link previews in Slack/WhatsApp/Teams were blank before.
- All external links now carry `rel="noopener noreferrer"`.

---

## 6. Verification

Rendered headlessly and exercised end to end:

- All 90 day pages render — no raw asterisks, correct resource counts, 4 checklist items each.
- Progress, calendar, phase counters, roadmap labels and project cards all update when a day is completed or un-completed.
- Export → import round-trips; storage holds only non-empty days.
- Deep links, hash clamping and unknown-hash fallback behave correctly.
- Theme toggle persists and reports correct `aria-pressed`.
- Zero JavaScript errors.

## 7. Content completed in a second pass

- **270 day-specific knowledge-check questions.** The single repeated template is gone. Every day now has three questions written for that topic, each with an "a good answer covers" key that opens after you attempt it. All 270 are distinct.
- **Day 0 setup guide.** A collapsible panel on the dashboard: Python and uv, editor and Git, model access with free options listed, secrets hygiene in the safe order, and a five-point readiness check.
- **Thirteen weekly reviews.** On days 7, 14 … 84 and 90: a named theme, four retrospective prompts to answer in the README, and three housekeeping actions.
- **Twelve project specs.** Each project day now carries a brief, 4–5 requirements, 4 acceptance criteria written as things the student checks themselves, a four-level self-grading rubric, and a stretch goal.

`CACHE_VERSION` in `sw.js` was bumped to `v2` so existing installs receive all of this.

## 8. One thing deliberately not done

**The dataset stays inline in `index.html`.** Moving `DATA` to `data.json` would make content edits reviewable as diffs instead of one enormous line — a real benefit. But `fetch()` is blocked on `file://` URLs, so double-clicking `index.html` would stop working, and that is the fastest path for a student to try the portal before anything is published. Reviewability of edits lost to usability of the artefact.
