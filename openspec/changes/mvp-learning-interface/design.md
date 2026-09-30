# Design

## Context

The repository contains a tested TypeScript content domain and a seven-slot sample sprint, but no learner-facing application. See `proposal.md` for motivation and the existing OpenSpec specifications for learning and import behaviour.

## Goals / Non-Goals

**Goals:**

- Deliver a small usable browser application around the existing content contract.
- Keep active work across refreshes with validated browser-local state.
- Reuse deterministic domain rules for import validation, answer matching, progress, and evidence.
- Make one complete sample sprint usable before adding a larger content library.

**Non-Goals:**

- Authentication, shared accounts, cloud sync, Supabase, or a database.
- Runtime AI generation, AI answer evaluation, API keys, voice, automatic translation, or a full Russian interface.
- A generalized routing, design-system, or state-management framework beyond what the MVP needs.

## Decisions

### Static React application with Vite

Add React and Vite to the existing TypeScript project and build a static single-page application. This has a short local setup path, no server surface, and can later be hosted as static files. Next.js was considered because it appears in the long-term plan, but it adds server conventions and framework cost before this local-only MVP needs them.

### Screen state instead of a routing dependency

Use a typed in-app screen state for `home`, `sprint`, `activity`, `reflection`, `import`, and `review`. Browser history routing is deferred because the MVP has one local learner and no shareable URLs. A page refresh restores the active activity from persisted state.

### Domain-first adapter layer

Keep `src/domain/content/` framework-independent. Add an application layer that translates domain activity steps into UI view models and dispatches user actions. The UI calls existing `validateSprintImport`, answer matching, progress, and evidence helpers; it does not reimplement validation or checking in components.

### Versioned local reducer and storage adapter

Represent all learner-owned state as one schema-versioned local snapshot managed by a pure reducer. A browser storage adapter validates and deep-clones data on read/write, treats malformed state as empty, and writes after meaningful actions. `localStorage` is used because the data is small and the MVP needs no offline queue or cross-device conflict resolution.

### Import as draft → validation → preview → acceptance

Keep raw pasted input separate from local accepted sprint snapshots. Validation produces either field errors plus repair guidance or an immutable preview. Only the explicit accept action adds the sprint to learner state and sets it active. The sample sprint is loaded through the same acceptance path.

### Accessible content-first presentation

Use semantic HTML, visible focus styles, labelled controls, and CSS custom properties for the calm palette. Render learner-visible imported strings as text nodes, never HTML. Glossary help is a controlled dialog/popover with keyboard close and no hidden retrieval-source leakage.

### Focused verification

Keep existing domain tests. Add reducer/storage tests and component tests for high-risk flows: import acceptance, partial finish, response comparison, glossary selection, and refresh restoration. Run build/typecheck/tests in one batch at completion; use manual browser smoke checks only once the interface exists.

## Risks / Trade-offs

- [Local-only state is erased with browser site data] → explain the limitation in the review/settings area and keep the state schema portable for later export or cloud migration.
- [A static app cannot safely provide cross-device persistence] → leave account and backend concerns out of this MVP instead of pretending local storage syncs.
- [Step schemas can grow] → isolate step renderers behind a discriminated component map and provide a clear fallback for unsupported future step types.
- [Free-text comparison may be mistaken for grading] → label examples and checklist explicitly, and never show a correctness verdict for free text.
- [Large import payloads can make rendering noisy] → reuse existing content limits and use compact slot cards in preview.

## Migration Plan

1. Add the static application scaffold without touching the domain contract.
2. Seed local state from the validated sample sprint and add import/preview acceptance.
3. Add activity, reflection, and review views backed by the reducer.
4. Verify the application and commit it as a standalone MVP interface change.

Rollback consists of serving the previous static build; browser-local state is isolated from source files and can be ignored by a prior build.
