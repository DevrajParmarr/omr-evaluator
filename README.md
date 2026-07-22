# OMR Evaluator

A mobile-first, client-only app for grading OMR answer sheets (NEET / JEE / custom tests), saving
results, and tracking progress over time with charts. Everything runs in the browser — **no
backend, no accounts** — data is stored in `localStorage`.

> Status: **Phase 0 complete** (planning). Feature code has not been written yet — see the phase
> plan below.

## Tech stack

- [Next.js](https://nextjs.org/) (App Router), deployed as a **static export** — no server runtime
- TypeScript
- CSS Modules
- [recharts](https://recharts.org/) for charts, [lucide-react](https://lucide.dev/) for icons
- Vitest for unit-testing the scoring/section logic
- Deployed to [Netlify](https://www.netlify.com/) as a static site

See [`CLAUDE.md`](./CLAUDE.md) for the full architecture, conventions, and decision log.

## Getting started

```bash
npm install       # install dependencies
npm run dev       # start the local dev server
npm run build     # production build -> out/
npm run lint      # ESLint
npm test          # unit tests
```

## Exam presets

| Type | Total Qs | Marking            | Sections                                                      |
| ---- | -------- | ------------------ | ------------------------------------------------------------- |
| NEET | 180      | +4 / −1            | Physics 1–45, Chemistry 46–90, Botany 91–135, Zoology 136–180 |
| JEE  | 75       | +4 / −1            | Physics 1–25, Chemistry 26–50, Maths 51–75                    |
| Test | custom   | +4 / −1 (editable) | none                                                          |

## Deployment

Builds to a static export in `out/`, published via Netlify (`netlify.toml`). `main` auto-deploys to
production; pull requests get deploy previews. See `CLAUDE.md` → _Deploy_ for details.

## Project phases

1. **Discovery** — tech decisions, folder structure, task list. ✅ done
2. **Scaffold, config & repo** — Next.js + TS project, tooling, CI, GitHub setup
3. **Evaluate tab** — grading engine, mark buttons, keyboard shortcuts, answer sheet
4. **Records tab** — history, stat cards, target tracker, charts, backup export/import
5. **PDF export & polish** — print report, micro-interactions, accessibility, mobile pass
6. **Ship** — final build, Netlify↔GitHub wiring, `v1.0.0` release

## License

MIT
