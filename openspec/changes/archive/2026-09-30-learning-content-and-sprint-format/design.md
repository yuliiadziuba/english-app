# Design

## Context

The repository currently contains product documentation and OpenSpec configuration, with no application scaffold or content schema. See `proposal.md` for motivation and the three delta specifications for observable behaviour. The contract must work for Git-authored starter content and JSON copied from an external AI chat, while the MVP performs no runtime AI calls.

## Goals / Non-Goals

**Goals:**

- Establish one canonical, versioned contract from which runtime validation, exported JSON Schema, TypeScript types, fixtures, and content authoring rules can be derived.
- Make malformed or unsafe imported content fail before persistence.
- Represent the full progressive learning loop without coupling content to page components.
- Create a complete reference activity that exercises the first implementation vertically.
- Preserve evidence provenance so future personalisation does not turn help usage or partial work into diagnosed weakness.

**Non-Goals:**

- Build screens, database tables, authentication, or deployment in this change.
- Implement the full thirty-activity starter library.
- Generate content through an API, evaluate free text with AI, or provide arbitrary live translation.
- Finalise the later database schema beyond the boundaries the content and import contracts require.

## Decisions

### 1. Canonical runtime schema with generated representations

Implement the contract as composable runtime schemas in `src/domain/content/`, then infer TypeScript types and generate a JSON Schema for prompt/export documentation. The runtime schema is authoritative; generated output is checked for drift.

This avoids maintaining separate hand-written TypeScript and JSON schemas. A JSON-Schema-only design was considered, but it would make application-level transforms and typed discriminated unions less direct. The exact validation library will be selected when the app is scaffolded; the v2 plan currently prefers Zod.

### 2. Strict versioned envelope

Version 1 uses `schema_version: "1.0"`, exactly seven slots, stable external string keys, and strict objects that reject unsupported fields. Internal database IDs never appear in portable content. A future version receives an explicit migration rather than permissive coercion.

Strictness makes AI output correction more visible. Allowing unknown fields was considered but rejected because misspelled fields could silently remove learning behaviour.

### 3. Slot contains one default plan and optional alternatives

Each slot has a required `default_activity` and may have bounded alternatives tagged by state/mode. At assignment time one plan is frozen as the activity snapshot. The initial complete sample can use only defaults; alternative selection is covered by the contract without requiring the selection engine in this change.

Putting one activity directly on each slot would be simpler, but would force a schema revision to support the already agreed state/mode adaptation.

### 4. Discriminated step union

Steps share `key`, `phase`, `title`, `progress_bearing`, and `completion_rule`, then branch by `type`:

- `content_acknowledgement`: structured text plus an explicit continue action.
- `language_noticing`: selectable glossary references.
- `inline_text`: one or more closed blanks with accepted variants.
- `reconstruction`: ordered closed prompts for larger chunks.
- `free_text`: learner prompt, natural examples, comparison checklist, and target references.
- `reflection`: glossary choices, optional note, and scoped self-assessment.

UI-shaped arbitrary JSON was rejected because it would couple imports to components and make validation too weak. A single universal step object was rejected because fields irrelevant to a type could conceal missing required behaviour.

### 5. Structured learner-visible text

Use arrays of `{ type: "text", value }` and `{ type: "glossary_ref", key, display }` segments. Render all values as text. The contract deliberately excludes raw HTML and Markdown rendering.

Plain strings with character offsets were considered, but offsets are brittle after content correction or localisation. Markdown was rejected for the first version because sanitisation and accessible interactive annotations complicate a content-first milestone.

### 6. Deterministic answer matching stays local and explicit

Each closed response provides accepted strings and a small normalisation policy: case folding, whitespace collapsing, and selected terminal punctuation handling. No edit-distance or semantic fuzzy matching is used. Multi-blank answers are checked independently and preserve raw input.

This creates predictable tests and prevents a broad matcher from accepting target grammar errors. A learner can flag an unlisted plausible answer for later author review.

### 7. Validation pipeline and immutable preview

The planned import pipeline is:

1. Enforce the 256 KiB encoded-input limit.
2. Strip surrounding whitespace and optionally one enclosing JSON code fence.
3. Parse JSON once.
4. Validate strict schema and documented limits.
5. Perform cross-reference and semantic checks not expressible in the basic shape.
6. Resolve returning references against the current owner's export reference map.
7. Compute a canonical owner-scoped fingerprint.
8. Create an immutable preview representation.
9. On explicit acceptance, persist that exact representation in one transaction.

Keeping preview state derived from editable source would allow content to change between preview and commit. The accepted preview therefore carries its fingerprint/request key and must be revalidated if the input changes.

### 8. Exact reference activity

The B2 reference activity is designed as follows. These strings and accepted answers become the implementation fixture; copy editing may correct clear mistakes but must preserve the learning targets and scenarios in the specs.

**Identity**

- Title: `A critical bug before release`
- Topic: QA/testing and release communication
- Objective: `Explain a critical issue, describe its impact, and recommend a next step to a team lead.`
- Primary mode: `Reconstruct`
- Suitable states: `Ready`, `Focused`, and `Tired` with the same content and optional earlier finish
- Target level: B2

**Glossary**

| Key | Canonical form | Contextual Russian meaning | Example / pattern note |
|---|---|---|---|
| `notice-an-issue` | notice an issue | заметить проблему | `I noticed an issue during regression testing.` |
| `during-regression-testing` | during regression testing | во время регрессионного тестирования | Time/context chunk. |
| `affect-a-flow` | affect the checkout flow | влиять на процесс оформления заказа | `The bug affects the checkout flow.` |
| `prevent-from-ing` | prevent someone from doing something | мешать кому-либо сделать что-либо | `It prevents users from completing their orders.` Pattern: `prevent + object + from + -ing`. |
| `recommend-ing` | recommend + -ing | рекомендовать сделать что-либо | `I'd recommend fixing it before the release.` Pattern: `recommend + -ing`; do not use `recommend to fix`. |
| `main-concern` | My main concern is… | Меня больше всего беспокоит… | A diplomatic way to introduce risk. |

**Step 1 — Understand (`content_acknowledgement`)**

Instruction: `Read the update. Tap an underlined phrase if you want contextual help.`

Source:

> I noticed a critical issue during regression testing. The bug affects the checkout flow and prevents users from completing their orders. I'd recommend fixing it before the release.

Annotate all glossary phrases present in the source. Completion rule: learner explicitly continues. This step contributes to progress.

**Step 2 — Notice (`language_noticing`)**

Prompt: `Which phrases help the speaker do these jobs? Select one phrase for each.`

- Introduce the discovery → `notice an issue`.
- Explain the consequence → `prevent someone from doing something`.
- Recommend an action → `recommend + -ing`.

The step shows the complete source and permits contextual cards. Completion requires one selection for each communicative job. It contributes to progress; selections do not themselves create weakness signals.

**Step 3 — Rebuild (`inline_text`)**

Prompt: `Complete the update. Use the meaning around each gap.`

1. `I noticed a ___ during regression testing.` Accepted: `critical issue`; additionally accept `critical problem` as an authored valid alternative, while showing `critical issue` as the target chunk.
2. `The bug ___ the checkout flow.` Accepted: `affects`.
3. `It prevents users ___ their orders.` Accepted: `from completing`, `from finishing`.
4. `I'd recommend ___ it before the release.` Accepted: `fixing`, `resolving`.

Normalise case, repeated whitespace, and terminal punctuation only. Show per-gap results and the complete target update after submission. Completion requires one submitted value for each gap. This step contributes to progress.

**Step 4 — Retrieve (`free_text`)**

Prompt: `The original update is hidden. Explain the problem and your recommendation to your team lead in 2–4 sentences.`

Natural answer:

> I noticed a critical issue during regression testing. It affects the checkout flow and prevents users from completing their orders. I'd recommend fixing it before the release.

Comparison checklist:

- `Did I say what I discovered?`
- `Did I explain the effect on users?`
- `Did I recommend a next step?`
- `Did I use at least one useful phrase from the activity?`

The full source remains hidden until explicit help is requested. Help first reveals the three intentions, then allows individual target phrases. Submit before comparison whenever the learner provides a response. This step contributes to progress.

**Step 5 — Transfer (`free_text`)**

New situation:

> Your team lead replies: “The release is tomorrow. Can we ship now and fix it next week?”

Prompt: `Reply in 2–4 sentences. Explain your main concern and give a clear recommendation.`

Natural answer A:

> My main concern is that customers won't be able to complete their orders. Since the bug affects a critical flow, I'd recommend delaying the release until we fix it.

Natural answer B:

> We could release as planned, but the checkout issue may directly affect sales. I'd recommend fixing the critical path first and then reassessing the release.

Comparison checklist:

- `Did I respond to the proposed release decision?`
- `Did I explain a consequence or trade-off?`
- `Did I make a clear, professional recommendation?`
- `Does my wording preserve my intended meaning?`

This is self-comparison, not automatic grading. The response is saved before examples appear. An optional revision creates a new attempt. The step contributes to progress.

**Step 6 — Reflect (`reflection`)**

Heading: `Useful language from this activity`.

Offer all six glossary items with any explicitly saved items preselected. Include the optional field `Anything else you want to practise?` with placeholder `A phrase, pattern, or situation…`. Offer scoped activity self-assessment: `I expressed it clearly`, `Almost — I want to try again`, `I need more support`.

Completion requires only an explicit `Save and finish`; selections, notes, and self-assessment remain optional. This step contributes to progress. `Finish for now` remains available before this point.

### 9. Sample sprint strategy

The complete activity will occupy one slot in a valid seven-slot fixture. The other six slots will be minimal but valid authored activities sufficient to exercise the envelope and cross-references; they are test fixtures, not the promised thirty-activity starter library. Each must still include an active learner response and valid comparison/checking data.

## Risks / Trade-offs

- **[Schema becomes too large for reliable AI output]** → Keep a compact portable representation, strict limits, a complete example, and a generated schema; provide repair errors with paths.
- **[Strict validation rejects linguistically useful output]** → Separate structural validity from human content preview and allow repair rather than coercing fields silently.
- **[Accepted answers imply exhaustive correctness]** → Use “matched/unmatched” language and a flag-for-review path.
- **[Reference example becomes mistaken for the full content library]** → Label the six supporting fixture activities as contract examples and retain the separate starter-library phase.
- **[B1–C1 labels overstate assessment precision]** → Treat levels as content metadata and authoring targets, never learner certification.
- **[Progress percentage feels evaluative]** → Derive it solely from completed planned interactions and keep answer evidence separate.

## Migration Plan

This is the first OpenSpec content contract and no production content exists to migrate. Implementation will introduce schema version 1.0, fixtures, and validation together. Future incompatible changes will add an explicit new schema version and migration/compatibility policy while preserving stored activity snapshots.
