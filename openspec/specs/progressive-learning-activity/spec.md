# Progressive Learning Activity Specification

## Purpose

Defines the learner-visible behaviour of a progressive activity that moves from contextual understanding to retrieval and transfer while supporting calm early finish, comparison, and future practice selection.

## Requirements

### Requirement: Complete bug-before-release reference activity
The reference content SHALL include a B2 progressive-reconstruction activity titled `A critical bug before release` whose objective is to explain a problem, its effect, and a recommendation to a team lead. It SHALL include the six phases Understand, Notice, Rebuild, Retrieve, Transfer, and Reflect with the exact learning content defined in the change design.

#### Scenario: Reference fixture covers the learning cycle
- **WHEN** the reference activity is inspected or rendered
- **THEN** it contains contextual input, target-language noticing, deterministic reconstruction, unsupported retrieval, a new complication requiring free production, and final comparison/glossary reflection

#### Scenario: Reference fixture validates
- **WHEN** the reference activity is embedded in a conforming seven-slot sample sprint
- **THEN** it passes the same content validation used for external imports

### Requirement: Planned-step progress
The system SHALL calculate activity progress from completed planned steps divided by the frozen count of planned progress-bearing steps. Correctness, hints, translations, saved phrases, and optional extensions SHALL NOT reduce or enlarge that denominator.

#### Scenario: Two of six planned steps completed
- **WHEN** the learner completes two of six progress-bearing steps
- **THEN** the activity reports 33% after applying the documented whole-number rounding rule

#### Scenario: Learner uses a hint
- **WHEN** a hint is revealed before a response
- **THEN** the relevant support event is recorded and the step can still contribute normally to progress

### Requirement: Finish for now on every step
The activity SHALL provide `Finish for now` at every step. Finishing SHALL save available work and show a neutral summary of performed practice. It SHALL NOT mark unvisited steps complete, describe the learner as failing, or create a weakness solely from partial progress.

#### Scenario: Finish before an answer
- **WHEN** the learner chooses `Finish for now` before submitting a substantive answer
- **THEN** the activity is saved for optional return but the sprint slot is not counted as practised

#### Scenario: Finish after an incorrect answer
- **WHEN** the learner submits a substantive answer and chooses `Finish for now`
- **THEN** the slot counts once as practice regardless of answer correctness while mastery evidence remains separate

### Requirement: Progressive support removal
The activity SHALL move from visible contextual language to increasingly reduced support. During retrieval, the full source SHALL remain hidden unless the learner explicitly requests help; such a reveal SHALL be recorded as support without a score penalty.

#### Scenario: Independent retrieval
- **WHEN** the learner enters the Retrieve phase without opening help
- **THEN** the source text remains unavailable in the response surface and the attempt is marked as independent

#### Scenario: Retrieval with help
- **WHEN** the learner explicitly reveals a target phrase
- **THEN** the phrase is shown, the attempt is labelled support-assisted, and progress is unaffected

### Requirement: Deterministic rebuild feedback
Rebuild steps SHALL compare closed answers against authored variants using their configured normalisation and SHALL show an accepted form after submission. An unmatched response SHALL be described as not matching the supplied answers and SHALL offer a way to flag a plausible alternative.

#### Scenario: Target grammar mismatch
- **WHEN** the learner enters `recommend to fix` for a blank targeting `recommend fixing`
- **THEN** the system reports no match and shows `recommend fixing` as the target pattern

### Requirement: Honest free-response comparison
Retrieve and Transfer free responses SHALL be saved before examples are revealed. Comparison SHALL display the learner's response beside one or more natural answers, target language, and task-specific questions, without claiming automatic correction or semantic evaluation.

#### Scenario: Compare transfer response
- **WHEN** the learner submits a reply to the new release complication and chooses `Compare answers`
- **THEN** the system preserves the original, reveals the natural examples and checklist, and allows an optional revision as a new attempt

### Requirement: Contextual help and explicit phrase saving
Annotated language SHALL open a contextual card with Russian meaning, an English example, optional pattern guidance, and `Save for practice`. Opening help alone SHALL remain weak support evidence and SHALL NOT save the phrase or label it as a weakness.

#### Scenario: Save from help card
- **WHEN** the learner selects `Save for practice` for `prevent someone from doing something`
- **THEN** the item is selected for future practice with explicit-selection provenance

#### Scenario: Open without saving
- **WHEN** the learner opens and closes a translation card without selecting save
- **THEN** only the help-open event is recorded and no confirmed future-practice item is created

### Requirement: Optional reflection glossary and learner note
The final summary SHALL list useful language from the activity with previously saved items selected, allow idempotent selection or deselection, and provide an optional `Anything else you want to practise?` field. Finishing SHALL remain possible without selecting an item or writing a note.

#### Scenario: Add absent practice need
- **WHEN** the learner writes `how to explain why the bug was not found earlier`
- **THEN** the text is stored as a learner note and not represented as a verified error or preclassified grammar item

#### Scenario: Save the same item twice
- **WHEN** an item was saved in its help card and remains selected in the final glossary
- **THEN** one saved-language selection remains, without duplication

### Requirement: Optional self-assessment has explicit scope
Reflection MAY offer `I expressed it clearly`, `Almost — I want to try again`, and `I need more support`. The stored result SHALL identify whether it applies to the whole activity or a specific language item; an activity-level response MUST NOT mark every glossary item as difficult.

#### Scenario: Activity-level support request
- **WHEN** the learner selects `I need more support` for the activity without choosing a specific phrase
- **THEN** the system records activity-level self-reported difficulty and does not create item-level weakness records
