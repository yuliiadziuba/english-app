# Proposal

## Why

The project needs a stable, reviewable content contract before application development begins. Without it, externally generated sprints, deterministic answer checking, progress calculation, translations, and future review signals could each assume a different activity shape and force rework.

## What Changes

- Define a versioned JSON contract for importing one seven-slot sprint with stable external keys, ordered activity steps, B1–C1 metadata, target language, contextual Russian help, deterministic answer data, natural examples, and review references.
- Define validation, preview, duplicate detection, and atomic acceptance behaviour for pasted or uploaded sprint JSON, including useful field-level errors and a repair-prompt path.
- Define typed activity steps and completion rules so progress describes completed planned interactions rather than correctness or proficiency.
- Provide one complete reference activity, `A critical bug before release`, covering Understand, Notice, Rebuild, Retrieve, Transfer, and Reflect with an early-finish path.
- Define deterministic checks for closed responses and honest comparison criteria for open responses without runtime AI evaluation.
- Establish the reference content needed to test annotated translation cards, phrase saving, the end glossary, custom practice notes, and returning-language references.

## Capabilities

### New Capabilities

- `sprint-content-contract`: Versioned seven-slot sprint and typed activity data required from curated files and external AI output.
- `sprint-import-validation`: Safe validation, preview, deduplication, and atomic import behaviour for externally generated sprint JSON.
- `progressive-learning-activity`: Learner-visible behaviour and content requirements for progressive reconstruction, answer comparison, contextual help, phrase selection, reflection, and early finish, demonstrated by the complete bug-before-release activity.

### Modified Capabilities

None. The OpenSpec project has no existing capability specifications.

## Impact

- Establishes planned source contracts under `src/domain/content/` and versioned examples under `content/` during implementation.
- Constrains future activity rendering, answer checking, progress tracking, prompt export, import persistence, and starter-content authoring.
- Introduces schema validation and test-fixture work but no runtime AI dependency or external network call.
- Does not implement authentication, Supabase tables, the full thirty-activity library, application screens, deployment, AI evaluation, or automatic API generation in this change.
