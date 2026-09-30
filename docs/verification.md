# Verification record

OpenSpec change: `learning-content-and-sprint-format`

Verified on 2026-09-30 after a clean `npm.cmd ci` install:

- `npm.cmd run typecheck` — passed.
- `npm.cmd test` — passed: 3 test files, 29 tests.
- `npm.cmd run schema:check` — passed; generated JSON Schema is current.
- `npm.cmd run content:validate` — passed; the sample sprint contains 7 valid slots.
- `npm audit --omit=dev` (reported during install) — 0 vulnerabilities.

The sample content is a contract fixture. It does not count toward the planned thirty-activity starter library.

## MVP interface verification

OpenSpec change: `mvp-learning-interface`

Verified on 2026-09-30:

- `npm.cmd run typecheck` — passed.
- `npm.cmd test` — passed: 5 test files, 35 tests.
- `npm.cmd run build` — passed; Vite produced a static browser build.
- `npm.cmd run schema:check` — passed; generated JSON Schema is current.
- `npm.cmd run content:validate` — passed; the bundled sample sprint contains 7 valid slots.
- Manual local-browser smoke check — passed: home → sample sprint → first progressive activity rendered with its annotated glossary controls.
