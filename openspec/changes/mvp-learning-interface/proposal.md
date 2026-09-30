# Proposal

## Why

The validated content domain cannot yet be used by a learner because the repository has no application interface. A focused local-first MVP will make the seven-slot sprint, progressive activities, translations, and manual JSON import usable on phone and desktop without adding accounts, a backend, or runtime AI costs.

## What Changes

- Add a responsive English-first web application shell with home, sprint, activity, reflection, and import views.
- Render the existing validated activity contract as an interactive progressive learning flow, including progress, closed-answer matching, free-text comparison, contextual Russian help, glossary selection, and neutral early finish.
- Add an import and preview flow for pasted JSON that uses the existing validation domain and requires an explicit import action.
- Add browser-local persistence for imported sprints, activity work, saved language, learner notes, and active-sprint selection.
- Add a compact learner-facing data summary that can later supply context to the manual AI prompt workflow; direct AI calls remain out of scope.

## Capabilities

### New Capabilities
- `learner-app-shell`: Responsive navigation and views for starting, resuming, importing, and reviewing local learning work.
- `local-learning-state`: Versioned browser-local persistence for active sprints, progress, language selections, and learner notes.

### Modified Capabilities
- None. The existing progressive-activity and import-validation specifications already define the learner-visible behaviour this interface will fulfil.

## Impact

Adds a React-based application layer, local browser storage, component and integration tests, and application build/lint commands. It reuses the existing TypeScript content-domain modules and does not add a database, authentication, hosted service, AI provider, voice feature, or runtime translation API.
