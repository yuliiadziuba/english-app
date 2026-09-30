# Spec Delta

## Purpose

Defines a safe and understandable import flow for externally generated sprint JSON, preserving existing learning data while giving the learner control before any sprint is committed.

## ADDED Requirements

### Requirement: JSON input methods
The system SHALL accept sprint JSON pasted as text or selected from a JSON file. It MAY remove one enclosing Markdown JSON code fence and surrounding whitespace, but SHALL reject additional prose or ambiguous multiple blocks.

#### Scenario: Pasted fenced JSON
- **WHEN** the learner pastes one JSON object inside a single JSON code fence
- **THEN** the system removes the fence and validates the contained object

#### Scenario: JSON mixed with prose
- **WHEN** input contains commentary outside the permitted single code fence
- **THEN** the system rejects it and explains that only the sprint JSON is accepted

### Requirement: Complete validation before preview
The system SHALL validate parsing, schema version, limits, object shape, enum values, unique keys, step-specific contracts, glossary references, accepted-answer data, and returning-reference integrity before marking a sprint ready for preview.

#### Scenario: Multiple validation failures
- **WHEN** input contains independently detectable errors
- **THEN** the system reports useful field-level errors together where feasible rather than stopping after the first shape error

#### Scenario: Unsupported schema version
- **WHEN** the document declares an unsupported schema version
- **THEN** the system rejects it and identifies the supported version without attempting a silent conversion

### Requirement: Owner-scoped returning references
The system SHALL accept a returning-language reference only when it exists in the reference map associated with the current learner's prompt export. Incoming content SHALL NOT be allowed to select an internal account, user, or database identifier.

#### Scenario: Unknown or foreign reference
- **WHEN** imported content contains a returning reference absent from the current learner's export map
- **THEN** validation rejects that reference and no learning-history link is created

#### Scenario: User identifier embedded in content
- **WHEN** imported JSON includes an unsupported ownership or internal identifier field
- **THEN** the field is rejected or ignored according to the strict schema and cannot affect ownership

### Requirement: Safe preview before commitment
After successful validation, the system SHALL show a preview of all seven slots, their levels, topics, objectives, target language, step sequences, answer examples, and contextual translations. The learner SHALL explicitly choose to import or start the sprint; validation alone SHALL NOT alter the active sprint.

#### Scenario: Learner rejects valid content
- **WHEN** the learner leaves or rejects the preview
- **THEN** the active sprint and learning history remain unchanged

#### Scenario: Learner accepts preview
- **WHEN** the learner explicitly accepts a valid preview
- **THEN** the exact previewed content is used for the import transaction

### Requirement: Atomic and idempotent import
The system SHALL commit a sprint and all of its slots, plans, glossary data, and reference links atomically. It SHALL use an owner-scoped content fingerprint and request key to prevent accidental duplicate imports and double submissions.

#### Scenario: Failure during commitment
- **WHEN** any required part of the import cannot be stored
- **THEN** no partial sprint becomes available and the existing active sprint remains unchanged

#### Scenario: Repeated import submission
- **WHEN** the same learner submits the same accepted import again with the same request or content fingerprint
- **THEN** the system returns the existing import result or a duplicate notice without creating another sprint

#### Scenario: Same content for another learner
- **WHEN** another authorised learner imports the same content
- **THEN** deduplication does not connect the two learners' private sprint records

### Requirement: Preserve invalid input and provide repair guidance
When validation fails, the system SHALL keep the entered input available, show understandable errors with locations, and offer a copyable repair prompt containing the schema expectations and errors without including unrelated private learning history.

#### Scenario: Correct an invalid sprint
- **WHEN** an import fails validation
- **THEN** the learner can copy repair guidance and revise the original input without re-entering it from scratch

### Requirement: Imported content is inert data
The system SHALL treat imported strings as text and SHALL NOT execute imported HTML, scripts, commands, URLs, or model-produced code. Unsupported fields SHALL NOT become renderable markup or executable configuration.

#### Scenario: Script-shaped imported string
- **WHEN** a learner-visible field contains script or HTML-like text
- **THEN** the preview and activity render it safely as text or reject it according to field rules, without execution

