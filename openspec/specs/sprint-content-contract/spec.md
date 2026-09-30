# Sprint Content Contract Specification

## Purpose

Defines the portable, versioned sprint and activity data that curated content and externally generated content must share so the application can render and evaluate it consistently.

## Requirements

### Requirement: Versioned sprint envelope
The system SHALL accept a sprint content document only when it declares a supported `schema_version`, a stable external `sprint_key`, a title, a learning goal, and exactly seven uniquely keyed ordered slots. Each slot SHALL declare its position and at least one complete default activity plan.

#### Scenario: Complete seven-slot sprint
- **WHEN** a document contains the supported version and seven slots with unique keys and positions 1 through 7
- **THEN** the sprint envelope passes structural validation

#### Scenario: Wrong number of slots
- **WHEN** a document contains fewer or more than seven slots
- **THEN** validation rejects it with an error identifying the slots collection

#### Scenario: Duplicate slot identity or position
- **WHEN** two slots use the same key or position
- **THEN** validation rejects the document and identifies both conflicting entries

### Requirement: Activity identity and learning metadata
Every activity plan SHALL declare a stable external key and content version, a supported B1/B2/C1 level, topic, learning objective, activity type, compatible modes and states, and target-language references. External keys SHALL identify content within the imported document without being treated as database identifiers.

#### Scenario: Supported activity metadata
- **WHEN** an activity uses documented enum values and references target-language items present in its glossary
- **THEN** its learning metadata passes validation

#### Scenario: Unsupported level or dangling target
- **WHEN** an activity uses an unsupported level or references a missing glossary item
- **THEN** validation rejects the activity with field paths for the invalid values

### Requirement: Typed activity steps
An activity SHALL contain ordered, uniquely keyed planned steps expressed as a documented discriminated union. A step SHALL declare its learning phase, response type, whether it contributes to the progress denominator, and an explicit completion rule. The supported contract SHALL cover presentation/acknowledgement, noticing/selecting language, closed inline text, closed reconstruction, open free text, and reflection/glossary selection.

#### Scenario: Practiseable activity
- **WHEN** an activity has at least one learner-response step and all steps contain the fields required by their response type
- **THEN** its step sequence passes validation

#### Scenario: Missing response-specific data
- **WHEN** a closed response lacks accepted answers or an open response lacks comparison material
- **THEN** validation rejects that step rather than silently applying a default

#### Scenario: Optional extension step
- **WHEN** a step is marked optional
- **THEN** it remains outside the activity's planned progress denominator

### Requirement: Structured text annotations and contextual glossary
Instructions, source passages, prompts, and examples SHALL represent learner-visible text as plain text segments with optional references to glossary items. Every referenced glossary item SHALL include a kind, canonical English form, contextual English example, and contextual Russian meaning; a pattern explanation MAY be supplied.

#### Scenario: Learner opens annotated help
- **WHEN** a visible text segment references a glossary item
- **THEN** the renderer has enough data to show its contextual help and `Save for practice` action without a network request

#### Scenario: Annotation references absent glossary data
- **WHEN** a text segment references an unknown glossary key or a referenced item lacks its required contextual translation
- **THEN** validation rejects the content at the referencing field

### Requirement: Closed-answer contract
A closed-response step SHALL provide one or more accepted variants per blank or response and SHALL explicitly declare allowed normalisation. Normalisation SHALL be limited to configured case, whitespace, and punctuation handling and MUST NOT erase meaningful word-form, word-order, or grammar differences.

#### Scenario: Permitted surface difference
- **WHEN** the learner response differs from an accepted variant only by a normalisation explicitly enabled for that response
- **THEN** the deterministic comparison reports a match

#### Scenario: Meaningful grammar difference
- **WHEN** a target expects `recommend fixing` and the response is `recommend to fix`
- **THEN** the response does not match even when case and punctuation normalisation are enabled

#### Scenario: Plausible unlisted answer
- **WHEN** a response does not match the supplied variants
- **THEN** the result is described as unmatched to the supplied answers rather than universally incorrect

### Requirement: Open-answer comparison contract
An open-response step SHALL include at least one labelled natural example, a task-specific comparison checklist, and relevant target-language references. The contract SHALL NOT contain an automatic correctness result for the learner's free text.

#### Scenario: Compare a submitted response
- **WHEN** the learner reveals comparison material after submitting free text
- **THEN** the application can show the saved response, natural examples, target language, and checklist side by side

### Requirement: Returning-language references
Generated content MAY reference returning-language items by opaque reference IDs supplied in the generation input. Each reference SHALL declare how the language is reused in a new context and SHALL NOT assert a diagnosed error unless the supplied provenance explicitly supports that claim.

#### Scenario: Known returning item
- **WHEN** an activity references an ID present in the import's allowed reference map
- **THEN** the reference can be linked to the existing learning item after import

#### Scenario: Unsupported weakness claim
- **WHEN** content describes a selected or translation-opened item as a verified error
- **THEN** content review flags the claim as inconsistent with its provenance

### Requirement: Bounded portable content
The contract SHALL define and enforce finite limits for document size, collection sizes, and learner-visible text fields. The first schema version SHALL allow a maximum encoded document size of 256 KiB, 12 planned steps per activity, 60 glossary items per sprint, 5,000 characters per source passage, 2,000 characters per prompt or example answer, and 20 accepted variants per closed response.

#### Scenario: Content at documented limits
- **WHEN** a valid document remains within every declared limit
- **THEN** it is eligible for preview

#### Scenario: Oversized content
- **WHEN** any declared limit is exceeded
- **THEN** validation rejects the document with the exceeded limit and field path
