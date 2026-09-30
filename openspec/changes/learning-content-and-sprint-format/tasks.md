# Tasks

## 1. Minimal content-domain foundation

- [ ] 1.1 Scaffold the smallest TypeScript project structure needed for `src/domain/content/`, fixtures, and automated tests without adding learner-facing screens; verify a clean dependency install and record the exact install/typecheck/test commands in `AGENTS.md`.
- [ ] 1.2 Add the chosen runtime-schema and JSON-Schema generation dependencies with locked versions; verify the lockfile is reproducible and the dependency audit introduces no unresolved critical production issue.

## 2. Canonical sprint and activity contract

- [ ] 2.1 Implement strict schema version `1.0` for the seven-slot sprint envelope, external keys, positions, default plans, bounded alternatives, B1/B2/C1 metadata, modes, states, and returning references; verify unit tests reject wrong slot counts, duplicate keys/positions, unsupported enums, and unknown fields.
- [ ] 2.2 Implement the discriminated step schemas and explicit completion rules for acknowledgement, noticing, inline text, reconstruction, free text, and reflection; verify tests reject missing type-specific data and exclude optional steps from the planned denominator.
- [ ] 2.3 Implement structured text segments and glossary schemas with contextual Russian help and cross-reference validation; verify tests cover valid annotations, dangling glossary references, missing translations, and plain-text-only payloads.
- [ ] 2.4 Enforce all documented size and count limits, including the 256 KiB encoded input limit; verify boundary tests pass at the limits and fail with field-specific errors above them.
- [ ] 2.5 Generate TypeScript types and a portable JSON Schema from the canonical runtime contract, add a drift check, and document the versioning rules; verify regeneration produces no uncommitted diff.

## 3. Deterministic learning rules

- [ ] 3.1 Implement configurable closed-answer normalisation and variant matching that preserves meaningful grammar and raw input; verify tests accept allowed case/space/punctuation differences and reject `recommend to fix` for a `recommend + -ing` target.
- [ ] 3.2 Implement the domain representation for unmatched alternatives, support-reveal provenance, saved-language selection, learner notes, and scoped self-assessment; verify tests distinguish explicit saves, help opens, whole-activity difficulty, and item-level evidence without creating false weakness records.
- [ ] 3.3 Implement planned-step progress and substantive-practice eligibility as pure domain calculations; verify tests cover rounding, optional steps, hints, incorrect attempts, early finish before an answer, repeated finish, and finish after a substantive attempt.

## 4. Complete reference content

- [ ] 4.1 Author the exact B2 `A critical bug before release` activity from `design.md`, including six phases, six glossary items, annotations, four deterministic gaps, retrieval and transfer examples/checklists, hint levels, reflection choices, and optional learner note; verify it passes schema and cross-reference validation.
- [ ] 4.2 Add focused content tests for every accepted bug-activity answer, the `recommend to fix` mismatch, hidden-source retrieval, example availability, glossary deduplication, and scoped reflection evidence; verify the full activity contract test suite passes.
- [ ] 4.3 Author six minimal but complete supporting activities to form a seven-slot sample sprint across B1–C1, clearly label them as contract fixtures, and verify the entire sample passes validation without being counted as the thirty-activity starter library.

## 5. Import validation and preview domain

- [ ] 5.1 Implement bounded JSON ingestion for pasted text and files, including optional removal of one enclosing JSON code fence and rejection of surrounding prose; verify parsing tests cover plain JSON, fenced JSON, malformed input, multiple blocks, and oversized input.
- [ ] 5.2 Implement aggregate structural, semantic, and cross-reference validation with stable field paths; verify a fixture containing multiple independent defects reports all feasible errors in one result.
- [ ] 5.3 Implement owner-scoped returning-reference resolution using only an export reference map and reject incoming internal ownership identifiers; verify tests cover valid, unknown, and cross-owner references without exposing database IDs.
- [ ] 5.4 Produce an immutable preview model and canonical owner-scoped content fingerprint from validated input; verify tests show input changes require revalidation and that equivalent canonical input produces the same fingerprint only within the same owner scope.
- [ ] 5.5 Implement a deterministic repair-prompt builder using schema expectations and validation errors while excluding unrelated learning history; verify a failed import preserves the original input and the repair prompt contains field paths but no account identifiers or full answer history.

## 6. Atomic import boundary

- [ ] 6.1 Define the transactional repository boundary for committing the exact validated preview, all seven slots, activity snapshots, glossary data, and returning links; verify contract tests prove rollback on any nested write failure.
- [ ] 6.2 Add owner-scoped request-key and content-fingerprint idempotency behaviour with an in-memory test adapter; verify repeated submissions return the prior result or duplicate outcome while another owner can import the same portable content independently.
- [ ] 6.3 Verify imported learner-visible strings remain inert data across preview and stored snapshots, with test payloads containing HTML-, script-, command-, and URL-shaped text that are never executed or converted to trusted markup.

## 7. Integrated verification and author guidance

- [ ] 7.1 Run one end-to-end domain test from fenced sample JSON through validation, preview, explicit acceptance, transactional import, activity matching, progress, glossary selection, and learner-note capture; verify the resulting stored snapshot matches the accepted preview and remains unchanged after source fixture edits.
- [ ] 7.2 Add invalid-import integration tests for unsupported versions, duplicate slots, dangling glossary/return references, unsafe extra fields, duplicate submissions, and simulated commit failure; verify no case leaves a partially imported sprint.
- [ ] 7.3 Document the content-authoring contract, validation messages, example-generation/repair workflow, and honest `matched`/`unmatched` terminology; verify every JSON example in the documentation validates against schema version `1.0`.
- [ ] 7.4 Run the documented typecheck, test, schema-drift, and content-validation commands from a clean checkout and record the actual results before marking this OpenSpec change ready to archive.
