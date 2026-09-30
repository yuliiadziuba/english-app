# Spec Delta

## Purpose

Defines durable, private browser-local state for the MVP so a learner can resume work and retain selected language without introducing accounts or a backend.

## ADDED Requirements

### Requirement: Versioned local learning snapshot
The MVP SHALL persist imported sprints, active-sprint selection, activity progress, submitted answers, saved language, self-assessment, and learner notes in a versioned browser-local snapshot. A page refresh SHALL restore compatible saved work without requiring sign-in.

#### Scenario: Refresh during an activity
- **WHEN** a learner has entered a response or completed a step and refreshes the page
- **THEN** the compatible activity state and response remain available after the application reloads

### Requirement: Safe local snapshot recovery
The application SHALL validate stored local state before using it. A missing, malformed, or unsupported local snapshot SHALL not prevent the application from opening; it SHALL be ignored or reset without attempting to execute stored text.

#### Scenario: Corrupt browser data
- **WHEN** the stored snapshot cannot be parsed or validated
- **THEN** the application opens with an empty local state and makes the bundled sample sprint available

### Requirement: Immutable imported activity content
Once a learner accepts an imported sprint, the local state SHALL retain the accepted activity content as its snapshot. Later edits to the import draft or source fixture SHALL not rewrite past activity text, answers, progress, or saved-language context.

#### Scenario: Edit an import draft after acceptance
- **WHEN** a learner changes or replaces the draft text after importing a sprint
- **THEN** the previously imported sprint remains unchanged and resumable

### Requirement: Local data boundaries
The MVP SHALL keep all learner state in the current browser profile and SHALL not make network requests to transmit learning answers, notes, or imported content. The interface SHALL state that clearing browser site data removes this MVP's saved local learning state.

#### Scenario: Use without a connection
- **WHEN** the learner opens the already loaded application without a network connection
- **THEN** saved local work remains available to the extent supported by the browser cache and local storage
