# Implementation Plan v2 — Personal English Learning App

Status: current implementation plan. Updated: 2026-09-30.

Implements `learning-system-specification-v2.md` and supersedes `implementation-plan-v1.md`. Product behaviour is governed by the v2 specification. Original v1 documents remain historical. This is a plan, not a claim that the application, services, content, or OpenSpec have been created.

## 1. Delivery boundary and stack

Build a text-first, private responsive application with external AI content generation through prompt export and JSON import. The released MVP makes no runtime AI calls and has no AI-key prerequisite. It evaluates closed tasks and supports honest self-comparison of free text.

Retain the proposed stack: Next.js App Router with TypeScript, Tailwind and local components, Zod for validation, Supabase Auth/Postgres, Vercel hosting, Vitest/Testing Library/Playwright. Use React Hook Form where it simplifies complex forms. Choose supported versions and lock dependencies when scaffolding; do not assume dependencies already exist.

MVP architecture: browser → protected app/server operations → Supabase. Manual generation is a separate user action: exported prompt → external AI chat → pasted/uploaded JSON → validation and preview → database.

No agent orchestration, vector database, runtime translation service, or AI evaluation endpoint is needed for this version.

## 2. First deliverable: content contract and one complete example

Before scaffolding the full application, define a versioned sprint schema and one complete `A critical bug before release` activity. Include instructions, annotated source text, gaps, retrieval, a new-context transfer task, accepted answers, natural examples, self-check criteria, glossary, and Russian help.

Design proposed source locations:

- `src/domain/content/`: schema and validation contracts.
- `content/sets/`: versioned starter content.
- `content/examples/`: a complete example sprint.
- `content/prompts/`: generation and repair templates.
- `supabase/migrations/`: versioned database changes.
- `tests/`: meaningful domain, component, and end-to-end checks.

These paths are planned; create them in the content-contract implementation step. Generate the external JSON Schema from the canonical validation definitions where practical, to prevent two independently maintained formats drifting.

### Sprint envelope

Require `schema_version`, an external `sprint_key`, title, goal, and exactly seven ordered slots with unique keys. Each slot contains eligible activity plans with level, mode/state suitability, and topic. A default plan is required; curated alternatives can support a different state or mode. Selection freezes one plan for that slot's active instance.

Every activity plan requires:

- Stable content key/version, supported type, B1/B2/C1 level, topic, and learning objective.
- Explicit target language IDs and a glossary with contextual examples and supplied translations.
- Typed source/instruction text segments with optional glossary references; no raw executable markup.
- Ordered unique step keys, phase, response type, and a completion rule.
- Closed-answer variants and normalisation rules where applicable.
- Open-response example answers and comparison criteria where applicable.
- Hints, example-reveal behaviour, and curated scenario turns/branches where relevant.
- Optional returning-item references drawn only from the export's reference list.

Use a discriminated union of step types so irrelevant fields cannot silently stand in for missing answers. Allow subsets of learning phases; validate that a practiseable plan includes an active-response step. Optional steps are outside the progress denominator.

Set explicit limits in the schema: import bytes, text lengths, steps per activity, alternatives per slot, and item counts. Document the chosen limits alongside the contract after checking the example. Do not accept unsupported versions or silently discard required fields.

## 3. Data ownership and persistence

Supabase is the authoritative cross-device store. Use UUID primary keys, timestamps, foreign keys, uniqueness constraints, and indexed ownership columns. `profiles.id` is the authentication user ID; all other personal tables explicitly include `user_id`. Enforce ownership consistency through composite foreign keys or equivalent database checks as well as RLS.

| Entity | Required responsibilities |
|---|---|
| `profiles` | Name, timezone, goals, interests, preferred task level, onboarding; English UI is fixed in MVP. |
| `content_sets` / `activity_templates` | Shared versioned curated content, validated payload, active flag; authenticated read, administrative writes only. |
| `sprint_imports` | Owner, content hash, schema version, source kind, validated payload, committed sprint reference. |
| `sprints` | Owner, title, goal, active/completed/archived status, target slot count, immutable content snapshot, source. |
| `sprint_slots` | Owner, sprint, unique slot index, first counted-practice timestamp, selected plan reference. |
| `activities` | Owner, slot, frozen plan and step denominator, current step, selected state/mode, revision, last finish timestamp. |
| `activity_drafts` | Owner, activity, step key, draft payload, revision, save timestamps; unique activity/step draft. |
| `step_progress` | Owner, activity/step, first completion timestamp and interaction evidence; unique activity/step. |
| `attempts` | Owner, activity/step, immutable answer, check status, accepted-match result if applicable, support used, self-assessment, request key. |
| `learning_units` | Owner, canonical item, kind, meaning, example, level, source reference; saved selection independent of support status. |
| `activity_learning_units` | Owner, activity, unit, source-content reference, contextual wording. |
| `learning_signals` | Owner, activity/attempt, nullable unit, signal type, provenance, occurred/dismissed timestamps. |
| `unit_progress` | Owner, unit, next suitable return date, independent closed-retrieval stage, self-reported confidence, support summary. |
| `learner_notes` | Owner, source activity, free text, active/dismissed status; not automatically treated as verified language. |
| `ledger_entries` | Owner, activity/sprint, event kind, honest summary and evidence references. |
| `prompt_exports` | Owner, export key, template/schema version, selected item IDs, reference map, previewed content, created timestamp. |

Do not create an AI-inferred errors table for the MVP. Closed-answer mismatches are attempt results; inferred and self-reported signals retain their provenance. No AI usage table is necessary until direct API integration is implemented.

Keep curated source files in Git and load validated versions into the database. Each assigned activity keeps a snapshot so content changes cannot rewrite past answers or progress. Imported generated material belongs to its importing user.

### Authentication and sharing

Use email/password accounts with public signup disabled and manually provisioned invitees. Include password recovery. Apply RLS to every private table and test with a second account. Protect server actions and derive ownership from the authenticated session, never from an imported user ID. Server-role secrets must never reach the client. Each invitee receives independent starter data and history.

## 4. Drafts, finishes, and consistency

- Save a local draft as input changes and debounce cloud saves by approximately one second.
- Persist on step transitions and explicit finish; do not rely exclusively on browser-unload requests.
- Use revision checks for cloud writes. On conflict preserve both versions and ask which to retain.
- Partition local storage by account and remove cached private data on sign-out. Full offline operation is not required.
- Show `Saving…`, `Saved`, or `Saved on this device` accurately.
- Store submitted attempts separately from mutable drafts; revisions produce new attempts.
- Record each planned step once for progress. Calculate percentage from completed planned steps and the frozen denominator.
- `Finish for now` persists available work and generates a neutral summary at any progress percentage.
- Count a sprint slot at most once after an explicit finish with a substantive submitted answer; exclude blank/whitespace answers and passive reading. Wrong answers still qualify.
- Perform finish, slot counting, and sprint completion updates transactionally and idempotently.
- Retain lower step completion when a slot counts early; slot practice completion is not 100% task completion or proficiency.
- Resume the same activity without recounting its slot. Permit a fresh choice without treating saved work as debt.
- Enforce at most one active sprint per user; activating another archives the current one unless already completed.

## 5. Checking and reflection

Implement a small configurable normaliser and accepted-variant matcher for closed tasks. Do not use broad fuzzy matching that can accept a wrong grammar pattern. Preserve raw answers and whether help was shown before submission.

Free text receives no automatic grade. Render the saved learner answer beside supplied natural examples, target phrases, and task-specific questions. Permit example reveal even without an attempt, but record it as support and do not invent an answer. Revisions retain original attempts.

Self-assessment is optional and stored with its scope. Whole-activity difficulty must not label every target unit as weak. Separate observed closed-task evidence from free-text confidence throughout the UI, review scheduler, and exported prompt.

## 6. Language cards, glossary, and signals

Use typed text annotations that reference glossary entries. Cards contain contextual Russian meaning, English example, pattern notes, and a save toggle. Render the same accessible component in instructions, activity content, and examples.

Allow selecting an unannotated visible span and saving it; translation is available only when provided in the content. Mobile selection and keyboard equivalents need explicit interaction testing. Never expose hidden retrieval source text through a tooltip.

At finish, display the activity glossary with earlier selections checked and a free-text additional-practice field. Save selections idempotently. Deselecting removes the save preference while preserving legitimate historical evidence. Distinguish repeated canonical patterns by sense where needed; do not automatically merge unrelated meanings.

Automatic support events can suggest a review, but cannot silently create a confirmed weakness. Dismissed suggestions must remain dismissed unless materially new evidence arises. Partial completion never increases difficulty priority.

## 7. Review and selection engine

Implement a deterministic, inspectable policy with configurable defaults:

1. Match level, mode, and state to eligible content.
2. Prioritise explicitly selected items and active learner notes.
3. Add explicit item-level difficulty, then non-dismissed support suggestions.
4. Consider return date and recent contexts; avoid repeating the same wording.
5. Prefer novelty for Bored/Surprise me and stronger scaffolding for Tired.

Use initial closed-retrieval intervals of 1/3/7/14/30 days, advancing only on independent matching evidence. Hint-assisted work does not advance that stage. Self-reported confidence can influence recommendations but is not equivalent to validated correctness. No backlog penalties or mandatory overdue catch-up.

Export normally 4–7 returning items for a seven-slot sprint, using fewer when history is limited. The learner can review or exclude candidates. Aim for the product specification's flexible new/review balance; do not invent weak areas to fill a quota.

## 8. Prompt export and sprint import

### Export

Build the prompt deterministically from versioned instructions, the schema/example, selected levels/topics, compact learning context, and selected items with stable opaque reference IDs. Include provenance such as `learner_selected`, `self_reported_support`, or `closed_task_match`.

Offer a complete generation prompt and its history-only supplement. The preview allows excluding items and notes before copying/downloading. Exclude account identifiers and complete answer histories by default. Treat custom notes as quoted data, not instructions that override the output schema.

Ask the external AI for one JSON object, seven slots, supported types, contextual translations, natural examples, and reused reference IDs. Explain that correctness and pedagogical quality require review; do not promise that any model always returns valid content.

### Import

1. Accept JSON paste or a JSON file; optionally unwrap a single enclosing JSON code fence.
2. Validate size, version, shape, supported types, keys, answer contracts, reference integrity, and required translations.
3. Validate supplied return references against this user's export map. Reject unknown or foreign references; do not trust incoming database IDs.
4. Show readable errors with field paths and keep the entered material available. Offer a deterministic repair prompt.
5. Preview the valid sprint and examples before an explicit import/start action.
6. Commit the whole sprint transactionally, generating internal IDs and retaining snapshots.
7. Use an owner-scoped content hash and request key to prevent accidental duplicate imports or double submissions.

An invalid import cannot replace the active sprint or partially write activities. Imported strings are text; do not execute HTML, scripts, or model-generated code. Shared curated content cannot be overwritten by a private import.

### Curated fallback

Assemble a seven-slot sprint deterministically from the starter library without external AI. Map compatible saved items when available; retain unsupported requests for future generation rather than claiming the library covers them. The starter path also supports a separate invited demonstration account.

## 9. Screens and design

Screens: sign-in/recovery; brief onboarding; home; state/mode selection; activity player; compare/reflect/glossary; saved language/Ledger; sprint view; prompt preview/export; import validation/preview; settings.

Carry the v2 specification's palette and calm mobile-first design into the initial components. Typical card radius 24px, button/bubble radius 16px, field radius 10–12px, restrained 2px outlines, reading width around 640–760px on desktop. Check actual contrast. Keep transitions brief and respect reduced motion.

Use one English UI string source from the start. Russian help is content metadata, not a second full navigation dictionary. Include focus management and screen-reader labels for popovers, validation errors, comparison panels, and progress indicators.

## 10. Test strategy

Test the rules that can lose data or misrepresent learning:

- Closed-answer variants, meaningful grammar mismatches, hint provenance, and unknown alternatives.
- Progress with skipped/optional steps, early finish, repeated finish, resume, and two-device conflicts.
- Unique slot counting, seven-slot completion, archival, and retained history.
- Explicit saves versus support inference; partial work never causing a weakness label.
- Repeated saves without duplicates and whole-activity assessments without false item attribution.
- Return scheduling that distinguishes independent checking and self-report.
- Export provenance, excluded items, stable references, and absence of account/private answer leakage.
- Import malformed/oversized/version-mismatched content, invalid references, duplicate requests, and atomic rollback.
- RLS isolation between owner and invited user, including nested records and imported content.

End-to-end acceptance path: sign in → choose Tired/Reconstruct → save a phrase from a translation card → submit a closed response → compare a free answer → select glossary items and add a note → finish early → refresh/resume → export prompt → import a valid new sprint → confirm old history remains. Also exercise invalid import, curated fallback, narrow viewport, and invited-account isolation.

Run appropriate type, lint, unit, integration, and build checks as implemented. Verify keyboard/touch and a real hosted phone/desktop session. No tests need a paid AI call. Document actual runnable commands in AGENTS.md after scaffolding.

## 11. Implementation phases

### Phase 0 — Content contract

Create the canonical schemas, generation/repair prompt templates, one complete activity, and a valid seven-slot sample sprint. Validate examples and review the learner flow before expanding content.

Done when: the complete example can represent every agreed interaction and invalid variants are rejected with useful errors.

### Phase 1 — Application and persistence foundation

Initialise Git and the app, pin dependencies, create README/environment examples, core accessible components, Supabase migrations/authentication, and draft/attempt persistence. Set up an isolated test environment and preview deployment when service access is available.

Done when: the owner can access the same saved practice from two devices and a second account cannot access it.

### Phase 2 — One complete practice

Implement state/mode selection, the example activity player, checking/comparison, annotated help, glossary and notes, early finish, accurate progress, and resume.

Done when: one complete learning cycle works with no AI service and no punitive partial-work handling.

### Phase 3 — Learning history and manual generation

Implement the seven-slot sprint lifecycle, saved language/support provenance, review priorities, Ledger, prompt export, JSON preview/import, and repair prompts.

Done when: practice selections survive a round trip through export/import and return in a new context without losing history.

### Phase 4 — Starter library and coverage

Complete ten thematic sets with B1/B2/C1 activities, distribute all formats and modes, and provide deterministic starter sprints. Review accepted variants, contextual translations, examples, and levels.

Done when: thirty base activities are usable and each mode has meaningful content without external generation.

### Phase 5 — Release verification

Complete accessibility, mobile, privacy, import robustness, recovery, and deployment checks. Provision an invited demonstration account through the existing private account mechanism.

Done when: the v2 product acceptance criteria pass on the hosted application and the owner can share the link without sharing personal learning data.

## 12. Future API integration

When explicitly requested, implement server-side `generateSprint(context)` returning the same validated contract. Add provider configuration, secrets, request deduplication, cost reservations/limits, usage logging, timeout handling, and explicit retries. Validate and preview generated content through the same import pipeline. Do not prebuild these systems for the manual MVP.

Personal AI evaluation is a separate later feature. It must retain attempts, distinguish corrections from stylistic suggestions, and store evaluation provenance. Voice is also separate. No model name, price, or subscription entitlement is a dependency of the current implementation.

## 13. Documentation and OpenSpec adoption

Next tooling step: initialise Git and install/initialise OpenSpec for Codex, then create `learning-content-and-sprint-format` as the first change. Verify current CLI instructions at installation time. OpenSpec is not installed or initialised by this document.

Use the product specification for intent and accepted behaviour, this plan for architecture, and OpenSpec for concrete change scenarios, design, and tasks. Keep them aligned when behaviour changes; do not maintain contradictory sources of truth.

Infrastructure account provisioning, final dependency versions, exact import-size limits, and deployment configuration are implementation tasks. Content format examples, starter sets, and executable schemas still need to be created; the two v1 documents contain concepts rather than complete exercise packs.
