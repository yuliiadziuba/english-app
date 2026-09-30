# Spec Delta

## Purpose

Defines the responsive, English-first MVP interface through which a learner starts a sprint, completes its activities, imports content, and reviews locally saved learning context.

## ADDED Requirements

### Requirement: Calm responsive learning entry point
The application SHALL provide an English-first home view that lets a learner start the bundled sample sprint, resume a locally active activity, or open the sprint-import view. It SHALL work in a single-column layout on small screens and expose visible keyboard focus, labelled controls, and touch targets suitable for direct interaction.

#### Scenario: First local visit
- **WHEN** no locally active sprint exists
- **THEN** the home view offers the bundled sample sprint and a way to import another sprint without showing a failure or overdue state

#### Scenario: Resume local work
- **WHEN** an active locally saved activity exists
- **THEN** the home view shows a neutral resume action with its title and saved progress

### Requirement: Contract-driven activity player
The application SHALL render a selected activity using its ordered content steps and the existing progressive-learning contract. It SHALL show the activity title, objective, planned-step percentage, and one current step at a time; optional steps SHALL not change the displayed planned denominator.

#### Scenario: Closed reconstruction response
- **WHEN** a learner submits a closed-response step
- **THEN** the player displays whether the response matched the supplied variants and shows the authored target form without calling an AI service

#### Scenario: Free-response comparison
- **WHEN** a learner submits a free-text response and asks to compare answers
- **THEN** the player preserves the submitted response and presents the authored natural examples and checklist without claiming automatic correctness

### Requirement: Contextual help and reflection controls
The activity player SHALL make annotated glossary language available through an on-demand contextual card containing its Russian meaning, English example, and save control. The final reflection view SHALL offer selected glossary items, scoped self-assessment, an optional learner note, and a neutral `Finish for now` action.

#### Scenario: Save useful language
- **WHEN** a learner saves an item from contextual help or reflection
- **THEN** the interface shows that item as selected without creating duplicate selections

#### Scenario: Finish partial practice
- **WHEN** a learner selects `Finish for now` before completing every planned step
- **THEN** the application preserves available work, reports only performed practice, and offers a neutral return path

### Requirement: Import preview and repair surface
The application SHALL provide a paste-based JSON import view that displays validation errors with field paths, keeps invalid text available for correction, and presents all seven slots of a validated sprint before an explicit import action. The view SHALL expose the deterministic repair guidance when validation fails.

#### Scenario: Invalid pasted content
- **WHEN** pasted text fails validation
- **THEN** the view keeps the text in the input, lists actionable validation messages, and offers repair guidance without changing the active sprint

#### Scenario: Accept validated preview
- **WHEN** a learner explicitly imports a validated preview
- **THEN** the application stores and activates exactly the previewed sprint and returns the learner to a usable sprint view

### Requirement: Learner-owned local summary
The application SHALL provide a local review view for saved language and learner notes. It SHALL present these as learner selections or self-reported practice needs and SHALL not label them as AI-diagnosed errors.

#### Scenario: Review stored context
- **WHEN** the learner opens the review view after saving language or a note
- **THEN** the view lists the saved items and notes with their learner-visible context
