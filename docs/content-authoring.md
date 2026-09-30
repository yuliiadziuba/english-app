# Content authoring contract

The canonical runtime contract lives in `src/domain/content/schema.ts`. `content/schema/sprint-content.v1.schema.json` is generated for external tools and prompts; edit the runtime schema and regenerate rather than changing the JSON Schema by hand.

## Commands

```powershell
npm.cmd run typecheck
npm.cmd test
npm.cmd run schema:generate
npm.cmd run schema:check
npm.cmd run content:validate
```

## Version 1.0 rules

- One document contains exactly seven ordered slots.
- Every slot has one default activity; alternatives are optional and bounded.
- Keys are portable content identifiers, not user or database identifiers.
- Learner-visible content is structured plain text. Raw HTML and executable configuration are unsupported.
- Every activity contains a learner response, valid glossary references, and explicit step completion rules.
- Closed answers list authored variants and the exact allowed normalisation. Report `matched` or `unmatched`; an unmatched answer is not a universal claim that the learner's English is wrong.
- Open responses contain natural examples and a task-specific checklist. They are not automatically graded.
- Russian meanings are contextual help attached to glossary items. Opening help does not automatically save an item or diagnose a weakness.
- Returning-language IDs must come from the learner's prompt-export reference map and retain their provenance.

## Generation and repair workflow

Ask the external AI to return exactly one JSON object with `schema_version` set to `1.0`, seven slots, and no prose. Paste or upload it for validation. The application may unwrap one enclosing JSON code fence.

If validation fails, use the generated repair prompt. It lists field paths and validation messages while excluding unrelated learning history. Repair the same JSON and validate again. A valid structure still requires human preview for linguistic and pedagogical quality.

## Reference content

`content/examples/sample-sprint.v1.json` is a contract fixture. Its first slot is the complete B2 activity `A critical bug before release`. The other six compact activities exercise levels and formats; they are not the planned thirty-activity starter library.

Regenerate the portable schema after any contract change and keep stored activity snapshots tied to their original content version.
