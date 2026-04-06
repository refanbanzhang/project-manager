# AGENTS.md

This file gives coding agents a quick working guide for the `project-manager` repository.

## Repo Overview

- Root scripts orchestrate a small full-stack workspace.
- `backend/` is an Express API that reads and writes `backend/data.json`.
- `frontend/` is a Next.js app (`src/app` router) with shared components in `src/components` and API helpers in `src/lib`.
- `design-system/` contains design reference material and should be treated as documentation unless the task explicitly targets it.

## Run The Project

From the repository root:

```bash
npm run setup
npm run dev
```

Useful alternatives:

```bash
npm run dev:server
npm run dev:client
cd frontend && npm run test
cd frontend && npm run lint
```

Default local ports:

- Frontend: `http://localhost:3000`
- Backend: Express server started from `backend/index.js` (check code or terminal output if the port changes)

## Structure

- `package.json`: root workspace scripts
- `backend/index.js`: main API server and project scanning logic
- `backend/data.json`: persisted app data
- `frontend/src/app/page.tsx`: dashboard/home page
- `frontend/src/app/project/[id]/page.tsx`: project detail page
- `frontend/src/components/`: reusable UI components
- `frontend/src/lib/api.ts`: frontend API access
- `frontend/src/lib/types.ts`: shared frontend types
- `frontend/tests/`: Vitest + Testing Library tests

## Working Agreements

- Check `git status` before editing. The worktree may already contain user changes.
- Do not overwrite or revert unrelated modifications.
- Prefer small, targeted changes that match existing code style.
- Optimize for lower overall complexity, not just “working code”.
- Prefer code that is obvious to the next reader over clever or highly compressed implementations.
- When changing API contracts, update both backend handlers and the frontend types/API helpers together.
- When changing UI behavior, add or update tests in `frontend/tests/` when practical.
- Avoid editing generated output such as `frontend/.next/` or dependencies inside `node_modules/`.

## Design Principles

- Reduce change amplification: avoid solutions that require the same change in many files or layers.
- Reduce cognitive load: a few extra lines are fine if they make behavior easier to understand.
- Prefer deep modules: keep public interfaces small and let implementation absorb the complexity.
- Hide decisions in one place: do not leak storage formats, request shapes, or business rules across multiple modules.
- Avoid pass-through code: do not add wrappers, props, variables, or helper layers unless they add real abstraction.
- Pull complexity downward: if a module can choose a sane default or handle an edge case internally, prefer that over pushing work to every caller.
- Keep related logic together when splitting would only create more interfaces.
- If a change has multiple plausible designs, briefly compare at least two approaches and choose the simpler interface.
- Favor general-purpose helpers when they simplify the interface for current use cases, but do not generalize speculatively.
- Design away special cases when possible so the normal path handles them naturally.

## Comments And Naming

- Write comments for information that is not obvious from the code, especially why, constraints, invariants, and cross-module assumptions.
- Do not add comments that merely restate the code.
- Keep comments near the code they describe and update them in the same change.
- Choose precise names that create a clear mental model and use those names consistently across layers.
- For exported functions, shared utilities, or non-obvious flows, prefer a short high-value comment over a long implementation walkthrough.

## Validation

Run the smallest relevant checks for the area you touched:

- Frontend UI or type changes: `cd frontend && npm run test`
- Frontend lint-sensitive changes: `cd frontend && npm run lint`
- Full local smoke test: `npm run dev`

If you cannot run a check, say so clearly in your handoff.

## Notes For Agents

- This repo is not using a formal monorepo tool; scripts rely on `cd` into subfolders.
- Backend code is plain ESM JavaScript.
- Frontend uses Next.js 16, React 19, TypeScript, Vitest, and HeroUI.
- `philosophy_of_software_design.md` is reference material, not app code.

## Safe Defaults

- Add new frontend code under `frontend/src/`.
- Keep persisted data format backward-compatible unless the task explicitly allows a breaking change.
- Favor incremental edits over large rewrites.
