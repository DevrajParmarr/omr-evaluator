# OMR Evaluator

A mobile-first, client-only app for grading OMR/MCQ answer sheets and Subjective (topic-tagged)
tests, saving results, and tracking progress over time with charts. Scoped to **JEE-only**
students. Everything runs in the browser — **no backend, no accounts** — data is stored in
`localStorage`.

> Status: **Phases 0–4 complete** (planning, scaffold, Evaluate, Records, PDF export & polish).
> Phase 5 (ship) is next — see the phase plan below.

## Tech stack

- [Next.js](https://nextjs.org/) (App Router), deployed as a **static export** — no server runtime
- TypeScript
- CSS Modules
- [recharts](https://recharts.org/) for charts, [lucide-react](https://lucide.dev/) for icons
- Vitest for unit-testing the scoring/section/analytics logic
- Deployed to [Netlify](https://www.netlify.com/) as a static site

See [`CLAUDE.md`](./CLAUDE.md) for the full architecture, conventions, and decision log.

## Getting started

```bash
npm install       # install dependencies
npm run dev       # start the local dev server
npm run build     # production build -> out/
npm run preview   # serve out/ locally to sanity-check the static build
npm run lint      # ESLint
npm run format    # Prettier --write
npm test          # unit tests
```

## Exam presets

| Type       | Total Qs    | Marking            | Sections                                      |
| ---------- | ----------- | ------------------ | --------------------------------------------- |
| JEE        | 75          | +4 / −1            | Physics 1–25, Chemistry 26–50, Maths 51–75    |
| Test       | custom      | +4 / −1 (editable) | none                                          |
| Subjective | custom (25) | +4 / −1 (editable) | none — optional per-question Subject+Unit tag |

## Deployment

Builds to a static export in `out/`, published via Netlify (`netlify.toml`). `main` auto-deploys to
production. See `CLAUDE.md` → _Deploy_ for details.

## Project phases

0. **Discovery** — tech decisions, folder structure, task list. ✅ done
1. **Scaffold, config & repo** — Next.js + TS project, tooling, GitHub repo. ✅ done
2. **Evaluate tab** — grading engine, mark buttons, keyboard shortcuts, answer sheet. ✅ done
3. **Records tab** — history, stat cards, target tracker, charts, backup export/import. ✅ done
4. **PDF export & polish** — print report, micro-interactions, accessibility, mobile pass. ✅ done
5. **Ship** — PWA (installable + offline via Serwist), final build, Netlify↔GitHub wiring,
   `v1.0.0` release. ⏳ next

## License

MIT
