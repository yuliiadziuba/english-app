# Tasks

## 1. Static application foundation

- [x] 1.1 Add the smallest React and Vite application scaffold that preserves the existing TypeScript domain modules; verify `npm.cmd run dev`, `npm.cmd run build`, and the existing domain test command are available.
- [x] 1.2 Add application-wide CSS tokens and accessible base styles for the English-first, mobile-first interface; verify focus visibility, reduced-motion handling, and a 44px minimum primary-control target in component tests or rendered markup checks.

## 2. Local learner state

- [x] 2.1 Define a versioned local learner snapshot and pure reducer for accepted sprint snapshots, active activity, answers, progress, saved glossary items, self-assessment, and learner notes; verify reducer tests preserve immutable accepted content and deduplicate saved items.
- [x] 2.2 Implement a validated `localStorage` adapter with safe empty-state fallback; verify tests cover missing, malformed, unsupported, and valid persisted snapshots.
- [x] 2.3 Load the bundled sample sprint through the same acceptance reducer path used by imports; verify a freshly initialized state can start and resume the sample activity.

## 3. Activity player and reflection

- [x] 3.1 Implement structured-text rendering and an accessible contextual glossary card with contextual Russian help and explicit save toggle; verify card interaction saves exactly one selected item and renders imported strings as text.
- [x] 3.2 Implement typed step renderers for the current activity contract, deterministic closed-answer feedback, free-text attempt preservation, example comparison, and planned-step progress; verify component tests cover the bug activity's accepted answers, `recommend to fix`, and free-text comparison.
- [x] 3.3 Implement finish and reflection views with selected glossary entries, scoped self-assessment, optional learner note, neutral partial-practice summary, and resume action; verify tests cover early finish before an answer and finish after a substantive attempt.
- [x] 3.4 Persist meaningful player actions through the local-state adapter; verify a render/unmount/reload integration test restores progress and draft responses.

## 4. Import and sprint views

- [x] 4.1 Implement the paste-based import screen using the existing validation and repair-prompt domain APIs; verify invalid fenced and malformed JSON retain text and show field-path errors without altering active state.
- [x] 4.2 Implement the complete seven-slot preview and explicit acceptance flow; verify a valid preview imports an immutable local snapshot, activates it only after confirmation, and rejects duplicate acceptance cleanly.
- [x] 4.3 Implement sprint overview and local review views that show slot progress, saved language, learner notes, and the browser-data limitation; verify the display uses neutral learner-owned labels and no AI-diagnosis claim.

## 5. Shell, documentation, and integration

- [x] 5.1 Connect home, sprint, activity, reflection, import, and review views through typed in-app navigation; verify first visit, sample start, resume, import, and review can be completed in an end-to-end component flow.
- [x] 5.2 Document local-only storage, sample-sprint use, JSON import, and the commands to run the app; verify the documented commands work and do not claim runtime AI, accounts, or cloud sync.
- [x] 5.3 Run `npm.cmd run typecheck`, `npm.cmd test`, `npm.cmd run build`, schema drift, and sample-content validation; record actual outcomes and fix any regressions before marking the change ready for review.
