# Project instructions

## Read first

- `learning-system-specification-v2.md`: current product behaviour and acceptance criteria.
- `implementation-plan-v2.md`: current architecture, data contracts, and delivery order.
- Relevant `openspec/` change/spec files once OpenSpec is initialised.

The v1 documents are historical. Follow current user instructions over project documents and update affected v2 documentation when agreed behaviour changes. Keep product intent, implementation plans, and change specifications consistent.

## Product invariants

- Build an English-first, text-first practice app with content spanning B1–C1.
- Prefer contextual chunks, progressive removal of support, retrieval, and transfer.
- The MVP uses manual AI prompt export and validated JSON sprint import. It requires no AI API key and makes no runtime AI calls.
- Check closed exercises against accepted variants. Free text uses natural examples and self-comparison, without invented correctness or AI evaluation.
- Offer contextual Russian help on annotated content; do not build a full Russian interface for the MVP.
- Provide `Finish for now` on every activity step. Preserve partial work without failure labels or learning debt.
- Progress percentages measure completed planned steps, never language proficiency. Do not add timers, target durations, punitive streaks, scores, or XP.
- Keep saved language, support signals, and self-reported confidence distinct. An unfinished activity or opened translation is not a diagnosed weakness.
- Include a selectable activity glossary and optional custom-practice note. Respect dismissed suggestions and avoid duplicate saves.
- Preserve historical answers, activity snapshots, and language selections across new or archived sprints.
- Keep invited users' practice separate from the owner's data. No public registration or social features are required.

## Implementation rules

- Keep content, domain rules, and UI rendering separate. Use versioned validated content and a single canonical contract.
- Validate untrusted imports on the server, check owner-scoped references, preview before commit, and import atomically and idempotently.
- Use versioned SQL migrations, RLS, explicit ownership on personal rows, and database checks for linked-row ownership.
- Preserve raw submitted attempts separately from drafts. Handle save conflicts without silent data loss.
- Keep secrets in ignored local environment files or protected hosting settings. Never expose server credentials or log full learner answers unnecessarily.
- Use accessible mobile-first components with keyboard, touch, and reduced-motion support.
- Do not add runtime AI, arbitrary live translation, voice processing, or unrelated infrastructure without a corresponding user-approved scope change.

## Work order and validation

Begin with the content contract and one complete learning example, then implement the phases in the v2 plan. Expand to ten sets/thirty base activities after the core flow is proven.

No application scaffold, package scripts, test runner, or OpenSpec configuration exists at the time these instructions are created. Inspect the repository before running commands; do not invent commands or claim checks that did not run. Add actual install/dev/typecheck/lint/test/build commands here after scaffolding.

Test changes proportionately, especially import rollback, ownership isolation, saving/resume, unique sprint counting, answer variants, and evidence provenance. Verify mobile and keyboard interactions for learner-facing changes.

Use OpenSpec for substantive features once installed; do not claim a change is validated or archived without completing its checks. Small documentation corrections need no additional process.

## Communication

Explain decisions and report results to the user in Russian. Keep app copy and code identifiers in English. Give concise updates and a short completion report, with actual verification and any remaining limitations.
