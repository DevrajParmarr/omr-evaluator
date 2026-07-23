# CLAUDE.md — OMR Evaluator

Standing guidance for any AI session working in this repo. Read this first, every time. Keep it
**current**: when we make a decision or add a convention, update this file in the same change.

> **OMR Evaluator** is a client-only Next.js (static export) single-page app, scoped to **JEE-only**
> students, for grading OMR/MCQ answer sheets and Subjective (topic-tagged) tests, saving results,
> and tracking progress with charts. No backend, no accounts — all data lives in the browser's
> `localStorage`.

---

## How to behave in this repo (rules of engagement)

1. **Ask before assuming.** If a task is ambiguous or a choice affects architecture, scope, UX,
   data shape, or dependencies, **stop and ask** — batch related questions. Never invent
   requirements.
2. **Plan, then build.** Share a short plan and wait for approval before non-trivial work.
3. **Discuss suggestions.** See a better/simpler/safer approach or a missed standard? Raise it and
   discuss before acting. Don't silently deviate; don't silently comply if something looks wrong.
4. **Small, verifiable steps.** Prefer incremental, reviewable changes with Conventional Commits.
5. **No silent scope/dependency changes.** New libraries, stack changes, big refactors, or dropped
   features need explicit sign-off first, with reasoning.
6. **Verify before "done".** Run lint + tests + a production build and check the console and mobile
   layout. Never leave the build broken.
7. **Act like a senior engineer.** Clean, idiomatic, accessible, maintainable code. Boring and
   proven beats clever.

## Commands

```bash
npm install        # install deps
npm run dev        # local dev server
npm run build      # production build -> out/ (Next.js static export)
npm run preview    # serve `out/` locally to sanity-check the static build (not used for deploy)
npm run lint       # ESLint (next/core-web-vitals config; fix all warnings)
npm run format     # Prettier --write
npm test           # Vitest unit tests (scoring/section logic in src/lib)
```

## Tech stack

- **Next.js (App Router) + TypeScript**, deployed as a **static export** (`output: 'export'` in
  `next.config.ts`) — no SSR, no API routes, no server runtime. Chosen over Vite per an explicit
  stack decision on 2026-07-22 (see Decision log).
- recharts (charts), lucide-react (icons), CSS Modules (no Tailwind/UI kit).
- Fonts via `next/font/google`: Space Grotesk (display), JetBrains Mono (numbers), Inter (body).
- State: local component state + React Context (no external store library).
- PWA: **Serwist** (`@serwist/next` + `serwist`) for installability/offline — service worker
  source at `src/app/sw.ts`, manifest at `src/app/manifest.ts` (needs
  `export const dynamic = "force-static"` for static export), icons generated from
  `public/icons/icon-source.svg` via `npm run icons` (uses `sharp`, a devDependency). `dev`/`build`
  **force webpack** (`next dev --webpack` / `next build --webpack`) because `@serwist/next` doesn't
  support Turbopack (Next 16's default) and the Turbopack build fails outright; `@serwist/turbopack`
  exists but is explicitly experimental with a different (React-hook-based) API, so webpack was the
  pragmatic choice — see Decision log. `public/sw.js` is a build artifact Serwist writes into the
  tracked `public/` dir; it's gitignored and eslint-ignored, not committed.
- Persistence: **`localStorage` only**. Never add a backend, DB, or `window.storage`.

## Architecture & conventions

- **Pure logic vs UI:** all scoring, section mapping, accuracy, and aggregation live in
  `src/lib/*.ts` as **pure functions** (no React) and are unit-tested with Vitest. Components
  contain no business logic.
- **Side effects isolated:** `localStorage` access lives only in `src/lib/storage.ts` (or a hook in
  `src/hooks/`). Wrap all reads/writes and `JSON.parse` in try/catch; validate + migrate loaded
  data; debounce writes. A corrupt record must never crash the app — add an error boundary.
- **Routing:** two real routes, `src/app/evaluate/page.tsx` and `src/app/records/page.tsx` (root
  `/` redirects to `/evaluate`). Since each tab is now its own route rather than shared in-memory
  state, **Evaluate always hydrates from `localStorage` (`omr:current`) on mount** and
  debounce-writes on change, so switching to Records and back is lossless.
- **Components:** small and single-responsibility; derive data with `useMemo`; avoid needless
  re-renders. Lazy-load chart-heavy Records components so Evaluate stays fast.
- **Styling:** one CSS Module per component (`Component.module.css`); shared design tokens in a
  global stylesheet (CSS custom properties).
- **Naming:** descriptive; no dead code; no copy-paste duplication; comment the "why", not the "what".
- **Accessibility (required):** semantic HTML, labelled inputs, full keyboard support, visible
  `:focus-visible`, sufficient contrast, `aria-live` for score/"saved" updates, and
  `prefers-reduced-motion` handling. Charts need accessible labels/fallbacks.
- **Formatting/linting:** Prettier + ESLint (`next/core-web-vitals`, which bundles `react-hooks` and
  `jsx-a11y` rules); zero warnings; no stray `console.log`.
- **i18n:** English only; no translation scaffolding for now.

## Domain rules — DO NOT get these wrong

- **Marking:** Correct **+4**, Incorrect **−1**, Unattempted **0** (all editable). Applies to
  **every** exam type, including Subjective — there is no separate partial-credit scoring model.
  `score = correct*correctMark − incorrect*wrongMark`; `attempted = correct + incorrect`;
  `accuracy% = round(correct/attempted*100)`.
- **Question status:** exactly one of `"correct" | "incorrect" | "unattempted"` per question.
- **Presets & section ranges (inclusive):**
  - **JEE** — 75 Qs, range-based sections: Physics 1–25, Chemistry 26–50, Maths 51–75.
  - **Test** — custom total, no sections.
  - **Subjective** — custom total (default 25), no fixed ranges. Instead, each question can
    carry an optional per-question **Subject + Unit tag** (see below) for topic-wise analysis.
  - NEET was removed **2026-07-22** (app is now JEE-only) — see Decision log.
- **Unit tagging (Subjective only):** `src/lib/units.ts` holds the static JEE syllabus —
  `Subject = "Physics" | "Chemistry" | "Maths"`, each with its official unit list
  (`SUBJECT_UNIT_GROUPS`; Chemistry is further split into Physical/Inorganic/Organic groups for
  the dropdown). While grading a Subjective sheet, `UnitPicker` lets the user pick a Subject+Unit
  that stays selected ("sticky") across consecutive questions; each `Correct`/`Incorrect`/
  `Unattempted` press tags the just-graded question with the current selection (or `null` for
  non-Subjective sheets). Tags are stored parallel-indexed to `answers` — see Data model.
- **Keyboard shortcuts:** `1`=correct, `2`=incorrect, `3`=unattempted, `Z`/`Backspace`=undo
  (ignored while an input/textarea is focused).
- **Records filter:** analytics are always scoped to one exam type — never plot two exam types
  (different max marks/structure) on the same axis.

## Data model (localStorage)

- Key **`omr:current`** — in-progress sheet:
  `{ schemaVersion, examType, title, student, totalQ, correctMark, wrongMark, answers[], units[],
 targets:{jee,test,subjective} }`.
- Key **`omr:records`** — array of saved records:
  `{ id, schemaVersion, examType, title, student, savedAt(ISO), correctMark, wrongMark, totalQ,
 answers[], units[], score, maxMarks, correct, incorrect, unattempted, graded, attempted, accuracy,
 sections:[{ name, color, c, w, u, marks, maxM, count }] }`.
- `units[]` is a `(QuestionTag | null)[]` array, **parallel-indexed to `answers[]`**
  (`QuestionTag = { subject, unit }`, from `src/lib/units.ts`). Always present; empty/all-null for
  JEE and Test, populated per-question for Subjective sheets. Optional on load for backward
  compatibility — missing/invalid entries default to `[]`/`null` rather than failing validation.
- Include `schemaVersion` and migrate old data on load rather than discarding it. The exception is
  `examType` itself: a value outside the current `ExamType` union (e.g. a retired NEET sheet/record)
  falls back to a fresh sheet / is dropped, since that preset no longer exists in the app.
- **Export/Import backup:** a JSON export/import of `omr:records` (and optionally `omr:current`) is
  in scope for v1, since storage is device-local and easy to lose.

## Design tokens

- paper `#E8E9E2` · surface `#FCFCFA` · ink `#212429` · muted `#71747B` · line `#D9D7CD`
- correct/green `#1C8A4A` · incorrect/red `#D33F3B` · unattempted/grey `#9A9CA1`
- subjects: Physics `#3B6FE0` · Chemistry `#E0871E` · Maths `#B0479B` (also used for unit-tagged
  Subjective-test breakdowns via `SUBJECT_COLORS` in `src/lib/units.ts`)
- Motifs: OMR dot-grid background, real bubble styling, soft-shadow cards (~16px radius), tabular
  mono numbers. Micro-interactions: press "pop" (Web Animations API), mobile haptic
  (`navigator.vibrate`), score pop, bubble pop-in, and a tap color-flash that **eases back to
  neutral** (never leaves a button stuck-colored). Gate `:hover` tints behind `@media (hover:hover)`
  so they don't stick on touch.
- **Dark mode:** deferred; v1 ships the single light "exam paper" palette above.

## PDF export

Browser print-to-PDF only (no libraries): a hidden print-only report + `@media print` +
`window.print()`, with `print-color-adjust: exact`.

## Version control & GitHub

Kept deliberately simple for solo work — no CI, no Dependabot, no required PRs.

- **Direct pushes to `main`** are the normal flow. No branch protection, no required status
  checks, no mandatory PR review. Feature branches + PRs are fine to use when you want a review
  checkpoint, but nothing enforces it.
- **Conventional Commits** (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`); small, atomic,
  meaningful.
- **No GitHub Actions CI.** Run `npm run lint`, `npm test`, and `npm run build` locally before
  pushing — see rule 6 above.
- **Hygiene:** `.gitignore` excludes `node_modules`, `out`, `.next`, env, editor files; **never
  commit secrets or build artifacts**; don't force-push shared branches.
- **Repo:** public, name `omr-evaluator`, MIT licensed —
  [github.com/DevrajParmarr/omr-evaluator](https://github.com/DevrajParmarr/omr-evaluator).
- **Releases:** tag with SemVer (`v1.0.0`) at meaningful milestones; optional, not required per push.
- **Netlify from GitHub:** `main` auto-deploys to production. Manual drag-and-drop deploy is only a
  fallback.

## Deploy (Netlify, static export)

- Build → `out/` (Next.js `output: 'export'`, **not** `dist/`). `netlify.toml`: build
  `npm run build`, publish `out`, `NODE_VERSION=20`.
- Static export produces a real HTML file per route, so no blanket SPA `/* → /index.html` rewrite is
  used; only a narrow 404 fallback if needed.
- Everything is client-side; no env secrets; no Netlify Next.js runtime/adapter (not needed since
  there's no SSR/ISR/API routes).
- No custom domain planned; Netlify auto-generated `*.netlify.app` subdomain.

## Do / Don't

- ✅ Ask when unsure · keep logic pure & tested · handle storage errors · stay accessible ·
  run lint/test/build locally before pushing · Conventional Commits · update this file on
  decisions.
- ❌ Add a backend/DB/`window.storage` · introduce Tailwind or a UI kit without asking · mix exam
  types in one chart · leave the build broken · commit `node_modules`/`out`/`.next`/secrets ·
  make silent scope or dependency changes.

## Decision log

_Record dated, one-line decisions as we make them so future sessions stay consistent._

- **2026-07-22** — Framework switched from the original Vite+React brief to **Next.js (App Router)
  with static export**, per explicit user request after trade-offs were discussed (no SSR/API-route
  need exists; static export keeps the "no backend" model intact).
- **2026-07-22** — Language: **TypeScript** (bundled with the Next.js switch).
- **2026-07-22** — Styling: **CSS Modules** (one `.module.css` per component), not a single global
  stylesheet.
- **2026-07-22** — State: local component state + **React Context**, no Zustand.
- **2026-07-22** — Navigation: **separate routes** (`/evaluate`, `/records`) instead of state-based
  tabs; Evaluate persists via `localStorage` hydration to survive route changes.
- **2026-07-22** — Testing: **Vitest**, scoring/section logic only (no React Testing Library for v1).
- **2026-07-22** — PWA: **yes**, installable + offline, implemented with **Serwist**.
- **2026-07-22** — Dark mode: **deferred** past v1.
- **2026-07-22** — Export/Import JSON backup of records: **included** in v1 scope.
- **2026-07-22** — Compare-two-attempts and CSV export: **deferred** past v1.
- **2026-07-22** — i18n: **English only**, no scaffolding.
- **2026-07-22** — Repo: **public**, name **`omr-evaluator`**, **MIT license**, no custom domain —
  [github.com/DevrajParmarr/omr-evaluator](https://github.com/DevrajParmarr/omr-evaluator).
- **2026-07-22** — Git workflow **reversed**: tried PR-based branch protection + GitHub Actions CI +
  Dependabot first, but the setup friction (device-flow auth repeatedly stalling for the `workflow`
  OAuth scope, PR-vs-main-drift merge conflicts, immediate Dependabot noise) outweighed the benefit
  for solo work. Simplified to **direct pushes to `main`, no CI, no Dependabot, no branch
  protection** — see _Version control & GitHub_ above. Local `lint`/`test`/`build` before pushing is
  the safety net instead.
- **2026-07-22** — Scope narrowed to **JEE-only students**: the **NEET preset was removed**
  entirely (type, preset, UI, `EXAM_TYPES`); any old NEET sheet/record is dropped on load rather
  than migrated, since there's no real user base yet. Added a new **Subjective** exam type
  (custom total, no fixed sections) reusing the exact same +4/−1/0 marking engine — no new scoring
  formula. Added per-question **Subject + Unit tagging** (`src/lib/units.ts`, the official JEE
  syllabus) for Subjective sheets only, surfaced via a sticky `UnitPicker` in Evaluate and a new
  `UnitBreakdown` weakest-units chart in Records. JEE's MCQ flow (range-based sections) is
  unchanged; unit tagging was deliberately scoped to Subjective only, not added to JEE.
- **2026-07-23** — Phase 4 (PDF export & polish) done: print-only report (`PrintReport`) shown via
  `@media print` + `window.print()`; a `src/lib/motion.ts` helper (Web Animations API pop, a
  color-flash-to-neutral, `navigator.vibrate`, all skipped under `prefers-reduced-motion`) wired
  into mark buttons, the score hero, answer-sheet bubbles, and Save/Undo/Reset; accessible sr-only
  fallback tables added to the `SubjectProgress` and `UnitBreakdown` charts (`TrendChart`/
  `SubjectRadar` already had them); `totalQ`/`correctMark`/`wrongMark` inputs now reject
  non-finite/non-integer/`<1` values (previously `totalQ<=0` could crash `AnswerSheet`'s
  `Array.from({length: totalQ})`); removed dead `--color-botany`/`--color-zoology` CSS variables
  left over from the NEET removal. **PWA (Serwist) is still outstanding** — it was a Phase 0
  decision but was never assigned to a specific phase in the plan; flagged to the user, who chose
  to fold it into **Phase 5 (Ship)** alongside the Netlify connection and `v1.0.0` tag, rather than
  building it as a standalone step now.
- **2026-07-23** — Phase 5 PWA implementation: `@serwist/next`'s webpack-only build broke outright
  under Next 16's default Turbopack (`next build` failed, not just warned). Chose to **force
  webpack** for `dev`/`build` over adopting `@serwist/turbopack` (explicitly experimental, different
  React-hook-based API) or dropping PWA — the reliability of a proven integration won out over
  staying on Turbopack for a small app where the build-speed difference is negligible. App icon is
  a simple generated bubble motif (paper background, filled ink circle) via `sharp` + a checked-in
  SVG source, not a placeholder or a full brand identity pass.
