# Build Brief — OMR Evaluator (React + Vite → Netlify)

Paste this whole file into Claude Code as your first message. It has two parts:
**(A) how you should work with me**, and **(B) what to build**. Read part A first and follow it
for the entire project. A `CLAUDE.md` accompanies this repo — treat it as the standing source of
truth and keep it updated.

We are starting **from scratch** (empty folder). Do not scaffold everything blindly — plan with me
first (see the phases below).

---

# PART A — How to work with me

## Your role
Act as a **senior front-end engineer**. Produce clean, idiomatic, well-structured, accessible,
maintainable code that a professional team would approve in review. Quality and correctness come
before speed. Prefer boring, proven solutions over clever ones.

## Golden rules (follow these throughout)
1. **Ask, don't assume.** Whenever a decision materially affects architecture, scope, UX, data,
   dependencies, or maintainability and is not explicitly specified here, **stop and ask me**.
   Batch related questions into one message so I can answer them together. Do not invent
   requirements or silently pick a direction on anything that matters.
2. **Plan before code.** At the start of each phase, give me a short plan (what, how, files,
   trade-offs) and **wait for my approval** before implementing.
3. **Discuss suggestions.** If at any point you see a better approach, a risk, a simpler path, or a
   standard I'm missing, **raise it and discuss it with me** before acting. Don't silently deviate
   from this brief, and don't silently comply if you think something is wrong — surface it.
4. **Small, reviewable steps.** Work in phases with checkpoints. After each phase, summarize what
   changed, how to verify it, and pause for my review before moving on.
5. **No silent scope or dependency changes.** Adding a library, changing the stack, doing a large
   refactor, or cutting a feature all require asking me first, with your reasoning.
6. **Explain trade-offs, then recommend.** When you ask a question, give me your recommended option
   and why, plus the main alternatives — so I can decide quickly.
7. **Keep `CLAUDE.md` current.** When we make a decision or add a convention, update `CLAUDE.md` so
   future sessions stay consistent.
8. **Verify before declaring done.** Run lint, tests, and a production build; check the browser
   console; confirm mobile layout. Never report a phase complete if the build is broken.

## Phase plan (checkpoint after each)
- **Phase 0 — Discovery.** Ask me the open questions in "Decisions to confirm" below. Propose the
  final tech choices, folder structure, and a task list. Get my sign-off. Write the initial
  `CLAUDE.md` and `README.md`. **No feature code yet.**
- **Phase 1 — Scaffold, config & repo.** Vite + React project, ESLint + Prettier, `netlify.toml`,
  `.nvmrc`, `.gitignore`, fonts, base styles/design tokens, empty routes/tabs. **Initialize git,
  create the GitHub repo, protect `main`, and add a GitHub Actions CI workflow** (install → lint →
  test → build) plus a PR template. Confirm `npm run dev`, `npm run build`, and `npm run lint` pass
  and CI is green on the first PR.
- **Phase 2 — Evaluate tab.** Presets, grading engine (pure functions + unit tests), mark buttons,
  keyboard shortcuts, answer sheet, summaries, undo/reset, localStorage persistence of the current
  sheet.
- **Phase 3 — Records tab.** Save-to-records, history list, stat cards, target tracker, score-trend
  and subject-performance charts, and the 4-mode Subject-progress panel.
- **Phase 4 — PDF export & polish.** Print report, micro-interactions, accessibility pass, mobile
  touch/hover fixes, reduced-motion, empty/error states.
- **Phase 5 — Ship.** Final build, README deploy steps, and connect Netlify **to the GitHub repo**
  (production deploys from `main`, deploy previews on PRs). Tag a `v1.0.0` release.

## Decisions to confirm with me in Phase 0 (do not assume)
Ask me these (recommend an answer for each):
- **Language:** plain JS/JSX or TypeScript?
- **Testing:** set up Vitest + React Testing Library? What coverage bar for the scoring logic?
- **Styling:** one global CSS file, CSS Modules, or CSS-in-JSX? (No Tailwind.)
- **State:** local state + Context, or a small store (Zustand)? (Prefer the simplest that fits.)
- **Routing/tabs:** simple state-based tabs or React Router?
- **Offline/PWA:** should it be installable and work offline?
- **Dark mode:** include a theme toggle now or later?
- **Data safety:** add an **Export / Import backup** (JSON) so users don't lose records if they
  clear the browser? (Recommended, since storage is device-local.)
- **Scope now vs later:** build the optional Compare-two-attempts and CSV export now, or defer?
- **i18n:** English only, or structure for translations?
- **Repo/site details:** repo name, Netlify site name, and whether a custom domain is planned.
- **GitHub setup:** repo owner (personal/org) and visibility (public/private); PR-based workflow
  with branch protection on `main` (recommended, even solo) vs trunk-based; enable Dependabot?
- **License** and author/attribution for `package.json` and `README`.

## Engineering standards (non-negotiable)
- **Tooling:** ESLint (with `eslint-plugin-react-hooks` and `jsx-a11y`) + Prettier; fix all
  warnings. No `console.log` left in committed code.
- **Accessibility:** semantic HTML, labels for all inputs, full keyboard operability, visible
  `:focus-visible` states, adequate color contrast, `aria-live` for the "saved"/score updates,
  and `prefers-reduced-motion` support. Charts must have text/table fallbacks or accessible labels.
- **Architecture:** small, single-responsibility components; **pure functions** for all scoring /
  section math (no React inside them) so they're unit-testable; keep side effects (storage) in
  dedicated modules; no business logic in JSX.
- **State & performance:** avoid unnecessary re-renders (memoize derived data), keep `localStorage`
  writes debounced, and lazy-load the charts/Records screen so the Evaluate tab stays fast.
- **Resilience:** wrap all storage and JSON parsing in try/catch; validate/migrate loaded data;
  never let a corrupt record crash the app. Add an error boundary.
- **Code quality:** meaningful names, no dead code, no copy-paste duplication, comments only where
  the "why" is non-obvious. Consistent formatting via Prettier.
- **Version control & GitHub — treat this like production (see the dedicated section below).**
- **Security/privacy:** no analytics or third-party calls without asking; no secrets in the repo;
  everything runs client-side.
- **Docs:** maintain `README.md` (run/build/test/deploy) and `CLAUDE.md` (conventions/decisions).

## Version control & GitHub (production workflow)
Use Git and GitHub the way a professional team would — not one giant commit at the end.
- **Init early:** initialize git in Phase 1; the first commit is the scaffold. Push to a GitHub repo
  and work from there.
- **`main` is always deployable and protected.** No direct commits to `main`. Enable branch
  protection: require a Pull Request and **passing CI status checks** before merge.
- **Feature branches + PRs:** do work on short-lived branches (`feat/…`, `fix/…`, `chore/…`,
  `docs/…`), open a Pull Request with a clear title and description (what / why / how to test),
  and **squash-merge** to keep `main` history clean and linear.
- **Conventional Commits:** `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`… Small, atomic,
  logically-scoped commits with meaningful messages.
- **CI with GitHub Actions:** `.github/workflows/ci.yml` runs `install → lint → test → build` on
  every push and PR. A red pipeline blocks merge.
- **Repo hygiene:** a proper `.gitignore` (never commit `node_modules`, `dist`, local env files, or
  editor cruft); **never commit secrets or build artifacts**; don't force-push shared branches.
- **Templates & housekeeping:** add `.github/pull_request_template.md` (and issue templates if I
  want them). Optionally enable Dependabot for dependency updates (ask me).
- **Releases:** tag with semantic versioning (`v1.0.0`, `v1.1.0`) and cut a GitHub Release for
  meaningful milestones.
- **Netlify via GitHub:** connect the repo so `main` auto-deploys to production and every PR gets a
  **deploy preview** — do not deploy by manual drag-and-drop as the primary path.

---

# PART B — What to build

A polished, mobile-first single-page app called **OMR Evaluator** for grading OMR answer sheets
(NEET / JEE / custom tests), saving each result, and tracking progress with charts. It runs fully
in the browser — **no backend, no accounts** — and stores data in `localStorage`. It must deploy to
Netlify as a static site.

## Tech stack (baseline; confirm variations in Phase 0)
- **Vite + React 18**, **recharts** (charts), **lucide-react** (icons), plain CSS.
- Fonts (Google Fonts): `Space Grotesk` (display), `JetBrains Mono` (numbers), `Inter` (body).
- Persistence: **browser `localStorage` only** — never a server, DB, or `window.storage`.

## Core marking rules
- **Correct = +4**, **Incorrect = −1**, **Unattempted = 0** — all three editable.
- Score = correct×correctMark − incorrect×wrongMark. Attempted = correct + incorrect.
  Accuracy % = round(correct ÷ attempted × 100).

## Exam presets (subject sections)
| Type | Total Qs | Marking | Sections (question ranges) |
|------|----------|---------|-----------------------------|
| **NEET** | 180 | +4 / −1 | Physics 1–45, Chemistry 46–90, Botany 91–135, Zoology 136–180 |
| **JEE**  | 75  | +4 / −1 | Physics 1–25, Chemistry 26–50, Maths 51–75 |
| **Test** | custom | +4 / −1 (editable) | none |

Subject colors: Physics `#3B6FE0`, Chemistry `#E0871E`, Botany `#1C8A4A`, Zoology `#B0479B`,
Maths `#B0479B`. While grading, show a "Next: Q_ · Subject" chip.

## Screens (two tabs: Evaluate, Records)

### Evaluate
- Header: exam-type selector (NEET/JEE/Test), editable **title** and optional **Student / Roll no.**,
  and editable Correct(+)/Wrong(−)/Total Qs.
- **Total Score** hero: score / max, progress bar, "Next: Q_ · Subject" chip.
- Three mark buttons: **Correct (+4)**, **Incorrect (−1)**, **Unattempted (0)**; each records the
  next question and advances.
- **Keyboard:** `1` correct, `2` incorrect, `3` unattempted, `Z`/`Backspace` undo (ignore when an
  input is focused).
- **Undo** and **Reset** (two-tap confirm).
- **Quick Summary** (NEET/JEE): per-subject marks/max + correct/incorrect/unattempted + progress bar.
- **Summary**: correct, incorrect, unattempted, attempted/graded, total marks.
- **Answer sheet**: numbered bubbles grouped by subject (flat for Test); green=correct, red=wrong,
  dashed=unattempted; tapping a bubble cycles its state.
- **Save to Records** (toast on save) and **Save & share as PDF**.

### Records (scoped by a NEET/JEE/Test filter — never mix exams on one axis)
- **Stat cards:** Attempts, Best, Average, Latest (with ▲/▼ vs previous).
- **Target score card:** goal input (suggest 650 NEET / 250 JEE), progress bar vs best, "N to go" /
  "🎯 reached".
- **Score trend** line chart with a dashed target reference line.
- **Subject performance** radar: latest vs previous, + strongest / needs-work chips.
- **Subject progress** panel, 4-mode switch:
  1. **By subject** → one subject's correct/incorrect/unattempted lines over attempts.
  2. **By metric** → pick Correct/Incorrect/Unattempted/Attempted → one line per subject.
  3. **Overview** → small-multiples mini chart per subject.
  4. **Stacked** → per attempt, a stacked bar (correct/incorrect/unattempted) for a chosen subject.
- **History list:** title, student, date, score/max, counts, accuracy; tap to reopen in Evaluate;
  trash to delete (two-tap confirm). Friendly empty states everywhere.

## Data model & persistence (localStorage)
- `omr:current` — in-progress sheet: `{ examType, title, student, totalQ, correctMark, wrongMark,
  answers: ("correct"|"incorrect"|"unattempted")[], targets:{neet,jee,test} }`.
- `omr:records` — array of records:
```json
{
  "id": "rec_1712345678",
  "examType": "neet", "title": "Mock 3", "student": "Roll 21",
  "savedAt": "2026-01-10T09:20:00.000Z",
  "correctMark": 4, "wrongMark": 1, "totalQ": 180,
  "answers": ["correct", "incorrect", "unattempted"],
  "score": 512, "maxMarks": 720,
  "correct": 140, "incorrect": 12, "unattempted": 28,
  "graded": 180, "attempted": 152, "accuracy": 92,
  "sections": [{ "name": "Physics", "color": "#3B6FE0", "c": 33, "w": 4, "u": 8, "marks": 128, "maxM": 180, "count": 45 }]
}
```
Include a small **schema version** field and a migration path. Load on start, debounce writes, and
guard everything with try/catch.

## PDF export (no libraries)
Print-to-PDF: a hidden print-only report (title, exam type, date, score, per-subject breakdown,
answer-sheet grid) shown via `@media print`; the button calls `window.print()`; use
`print-color-adjust: exact` for colored bubbles. Works on desktop and mobile.

## Design direction
"Examination-hall" aesthetic, not a generic dashboard:
- Palette: paper `#E8E9E2`, surface `#FCFCFA`, ink `#212429`, muted `#71747B`, line `#D9D7CD`;
  green `#1C8A4A`, red `#D33F3B`, grey `#9A9CA1`.
- Faint **OMR dot-grid** page texture; soft-shadow cards (~16px radius); mono tabular numbers; real
  OMR **bubble** styling.
- Micro-interactions: button press "pop" (Web Animations API), mobile haptic (`navigator.vibrate`),
  score pop on change, bubble pop-in, and a tap **color flash that eases back to neutral** (never
  leave a button stuck-colored).
- **Touch fix:** gate `:hover` tints behind `@media (hover: hover)` (or neutralize in
  `@media (hover: none)`) so buttons don't stick highlighted on phones.
- Respect `prefers-reduced-motion`; add `:focus-visible`; mobile-first, centered, max width ~760px.

## Netlify deployment (must work out of the box)
- `npm run build` → `dist/`. Add `netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "20"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```
- Keep Vite `base` = `"/"`. Add `.nvmrc` (`20`), `.gitignore` (node_modules, dist), and a `README`
  with local run + Netlify deploy steps. Verify `npm run build && npm run preview` is clean before
  finishing. **Connect Netlify to the GitHub repo** so `main` deploys to production and PRs get
  deploy previews (drag-and-drop is only a fallback).

## Suggested structure (adjust and confirm)
```
omr-evaluator/
├─ CLAUDE.md
├─ README.md
├─ LICENSE
├─ netlify.toml
├─ .nvmrc  .gitignore  .eslintrc  .prettierrc
├─ .github/
│  ├─ workflows/ci.yml            # install → lint → test → build (on push + PR)
│  └─ pull_request_template.md
├─ index.html
├─ package.json
└─ src/
   ├─ main.jsx  App.jsx  styles.css
   ├─ lib/        presets.js  scoring.js  storage.js  format.js
   ├─ hooks/      usePersistentState.js
   └─ components/ Tabs.jsx Evaluate.jsx AnswerSheet.jsx MarkButtons.jsx
                  Records.jsx StatCards.jsx TargetCard.jsx TrendChart.jsx
                  SubjectRadar.jsx SubjectProgress.jsx HistoryList.jsx PrintReport.jsx
```

## Definition of done
- Grading (keyboard + buttons) with live score, summaries, grouped answer sheet.
- Save/reopen records persist across refresh; reopening reloads the full answer sheet.
- All Records charts + the 4-mode Subject-progress panel render for NEET/JEE, with correct empty
  states; target tracker and PDF export work.
- `npm run lint`, tests, and `npm run build` all pass; no console errors; clean on mobile (no stuck
  hover, tactile feedback present, reduced-motion respected).
- Deploys to Netlify with the config above.
- **GitHub is set up properly:** protected `main`, work merged via PRs, green GitHub Actions CI, a
  clean `.gitignore` (no `node_modules`/`dist`/secrets committed), and Netlify deploying from GitHub.
- `README.md` and `CLAUDE.md` are complete and current.

## Optional (only after asking me)
Compare two attempts (per-subject deltas); CSV/Excel export of history; in-place update on reopen;
rough NEET/JEE percentile estimate (clearly labelled).

---

**Start with Phase 0: ask me the Decisions-to-confirm questions and propose your plan. Do not write
feature code until I approve.**