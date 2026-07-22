# CLAUDE.md — OMR Evaluator

Standing guidance for any AI session working in this repo. Read this first, every time. Keep it
**current**: when we make a decision or add a convention, update this file in the same change.

> **OMR Evaluator** is a client-only Next.js (static export) single-page app for grading OMR answer
> sheets (NEET / JEE / custom tests), saving results, and tracking progress with charts. No
> backend, no accounts — all data lives in the browser's `localStorage`.

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
- PWA: **Serwist** (App-Router-compatible service worker tooling) for installability/offline.
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

- **Marking:** Correct **+4**, Incorrect **−1**, Unattempted **0** (all editable).
  `score = correct*correctMark − incorrect*wrongMark`; `attempted = correct + incorrect`;
  `accuracy% = round(correct/attempted*100)`.
- **Question status:** exactly one of `"correct" | "incorrect" | "unattempted"` per question.
- **Presets & section ranges (inclusive):**
  - **NEET** — 180 Qs: Physics 1–45, Chemistry 46–90, Botany 91–135, Zoology 136–180.
  - **JEE** — 75 Qs: Physics 1–25, Chemistry 26–50, Maths 51–75.
  - **Test** — custom total, no sections.
- **Keyboard shortcuts:** `1`=correct, `2`=incorrect, `3`=unattempted, `Z`/`Backspace`=undo
  (ignored while an input/textarea is focused).
- **Records filter:** analytics are always scoped to one exam type — never plot NEET and JEE
  (different max marks) on the same axis.

## Data model (localStorage)

- Key **`omr:current`** — in-progress sheet:
  `{ schemaVersion, examType, title, student, totalQ, correctMark, wrongMark, answers[], targets:{neet,jee,test} }`.
- Key **`omr:records`** — array of saved records:
  `{ id, schemaVersion, examType, title, student, savedAt(ISO), correctMark, wrongMark, totalQ,
   answers[], score, maxMarks, correct, incorrect, unattempted, graded, attempted, accuracy,
   sections:[{ name, color, c, w, u, marks, maxM, count }] }`.
- Include `schemaVersion` and migrate old data on load rather than discarding it.
- **Export/Import backup:** a JSON export/import of `omr:records` (and optionally `omr:current`) is
  in scope for v1, since storage is device-local and easy to lose.

## Design tokens

- paper `#E8E9E2` · surface `#FCFCFA` · ink `#212429` · muted `#71747B` · line `#D9D7CD`
- correct/green `#1C8A4A` · incorrect/red `#D33F3B` · unattempted/grey `#9A9CA1`
- subjects: Physics `#3B6FE0` · Chemistry `#E0871E` · Botany `#1C8A4A` · Zoology `#B0479B` · Maths `#B0479B`
- Motifs: OMR dot-grid background, real bubble styling, soft-shadow cards (~16px radius), tabular
  mono numbers. Micro-interactions: press "pop" (Web Animations API), mobile haptic
  (`navigator.vibrate`), score pop, bubble pop-in, and a tap color-flash that **eases back to
  neutral** (never leaves a button stuck-colored). Gate `:hover` tints behind `@media (hover:hover)`
  so they don't stick on touch.
- **Dark mode:** deferred; v1 ships the single light "exam paper" palette above.

## PDF export

Browser print-to-PDF only (no libraries): a hidden print-only report + `@media print` +
`window.print()`, with `print-color-adjust: exact`.

## Version control & GitHub (production workflow)

Use Git/GitHub like a professional team — not one commit at the end.

- **`main` is protected and always deployable.** No direct pushes; all work lands via Pull Requests
  with passing CI.
- **Branch + PR flow:** short-lived `feat/…`, `fix/…`, `chore/…`, `docs/…` branches → PR with a
  clear what/why/how-to-test description → **squash-merge** for a clean, linear history.
- **Conventional Commits** (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`); small, atomic,
  meaningful.
- **CI:** GitHub Actions (`.github/workflows/ci.yml`) runs install → lint → test → build on push and
  PR; red pipeline blocks merge.
- **Hygiene:** `.gitignore` excludes `node_modules`, `out`, `.next`, env, editor files; **never
  commit secrets or build artifacts**; don't force-push shared branches.
- **Templates/releases:** keep `.github/pull_request_template.md`; tag releases with SemVer
  (`v1.0.0`) and cut GitHub Releases for milestones. Dependabot enabled for dependency-update PRs.
- **Repo:** public, name `omr-evaluator`, MIT licensed —
  [github.com/DevrajParmarr/omr-evaluator](https://github.com/DevrajParmarr/omr-evaluator).
  Branch protection on `main` requires a passing `build` status check and a PR (0 required
  approvals, since solo); only squash-merge is enabled; force-push/deletion blocked.
- **Netlify from GitHub:** `main` auto-deploys to production; PRs get deploy previews. Manual
  drag-and-drop deploy is only a fallback.

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
  work via feature branches + PRs with green CI · Conventional Commits · update this file on
  decisions.
- ❌ Add a backend/DB/`window.storage` · introduce Tailwind or a UI kit without asking · mix exam
  types in one chart · leave the build/CI broken · push straight to `main` · commit
  `node_modules`/`out`/`.next`/secrets · make silent scope or dependency changes.

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
- **2026-07-22** — Git workflow: **PR-based with branch protection** on `main` (not trunk-based).
- **2026-07-22** — Repo: **public**, name **`omr-evaluator`**, **Dependabot enabled**, **MIT license**,
  no custom domain.
- **2026-07-22** — Phase 1 scaffold pushed to
  [github.com/DevrajParmarr/omr-evaluator](https://github.com/DevrajParmarr/omr-evaluator);
  branch protection enabled on `main` (required `build` status check, PR required, squash-merge
  only, force-push/deletion blocked). `ci.yml` was added via the GitHub web UI rather than pushed
  from the CLI, because the local `gh` token lacked the `workflow` OAuth scope and repeated attempts
  to add it via `gh auth refresh`/`gh auth login --scopes` stalled in this environment.
