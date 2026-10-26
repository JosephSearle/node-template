# AGENTS.md

Guidance for AI coding agents working in this repository.

## What this repo is

A NestJS 12 HTTP service on Node 24, created from node-template. CI, release and deploy come from workflow-catalog's reusable workflows. See README.md.

## Commands

```sh
npm ci
npm run lint        # Biome; npm run format fixes
npm run typecheck
npm test            # Jest, tests in test/
npm run build
pre-commit run --all-files
```

## Layout

- `src/main.ts` starts the server. `src/app.ts` builds the app, so tests can listen on a free port (`test/support.ts`).
- `src/config/`: the env schema (zod) and validation. Only this folder may read `process.env`.
- `src/health/`: `/healthz`, `/readyz` and `ReadinessRegistry`. Register a check per hard dependency.
- `src/hello/`: the example module. New modules follow its shape: zod-validate the input in the controller, put the logic in a service.

## Rules

- Add every new env var to `src/config/config.schema.ts` with a default or a clear failure.
- Readiness responses never include error messages, only `ok`, `error` or `timeout`.
- Workflows: `permissions: {}` at the top, least privilege per job, `timeout-minutes` on every job, third-party actions pinned to a full SHA with a `# vX.Y.Z` comment, `persist-credentials: false`, and never `${{ }}` inside `run:`.
- `.github/`, `Dockerfile` and `scripts/init.sh` are platform-owned. Keep changes there minimal and call them out in the PR.
- PR titles are Conventional Commits (see CONTRIBUTING.md).
