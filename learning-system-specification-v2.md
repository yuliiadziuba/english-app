# Learning System Specification v2

Status: current product specification. Updated: 2026-09-30.

This document supersedes `learning-system-specification-v1.md` for implementation. The v1 files remain historical references. Technical decisions and delivery order are in `implementation-plan-v2.md`; agent working rules are in `AGENTS.md`.

## 1. Product and learner

Build a private, English-first practice space for developing active language production: constructing sentences, retrieving useful language, explaining ideas, and communicating naturally. Primary interests are QA/testing, automation, AI, marketing, workplace communication, and everyday life.

The learner currently describes stronger passive understanding than active expression. Content spans B1, B2, and C1 from the first release. Initial recommendations favour B1/B2 with accessible C1 challenges; the learner can choose difficulty. Level labels describe intended task difficulty, not a certified assessment of the learner.

The experience is calm, varied, adult, and non-punitive. There are no timers, target durations, time-based completion rules, scores, XP, leaderboards, streak penalties, or overdue learning debt.

## 2. MVP decisions

- AI prepares content outside the application through a manual prompt-export and sprint-import workflow.
- The app requires no AI API key and makes no runtime AI calls in the MVP.
- Closed exercises use deterministic checking; open responses use examples and self-comparison.
- Personalisation uses explicit learner selections, self-reported difficulty, and carefully labelled support signals.
- English is the interface and learning language. Russian help appears on demand for annotated language in instructions and content.
- Each activity offers `Finish for now`; partial work remains valuable and resumable.
- A sprint contains seven planned practice slots, not seven consecutive days.
- Start with ten thematic content sets, each containing B1, B2, and C1 activities: thirty base activities in total.
- Cloud persistence supports phone and desktop. An invited viewer can try the product in a separate private account.
- Automated AI generation, AI evaluation, live AI conversation, and voice processing are later extensions.

## 3. Core experience

`Home → State → Mode → Activity → Compare and reflect → Useful language → Future practice`

Home offers a fresh activity and an optional way to return to saved work. It never presents partially explored activities as failures or mandatory catch-up.

State changes support and content selection, not a time allowance:

| State | Behaviour |
|---|---|
| Ready | Balanced reconstruction and personal application. |
| Tired | Fewer steps, familiar language, more support. |
| Bored | A varied format and brisk interaction; avoid long reading. |
| Curious | Explore a relevant topic or phrase family. |
| Focused | Less scaffolding and deeper transfer or argumentation. |

Modes remain `Reconstruct`, `Talk about something`, `Explore a topic`, and `Surprise me`. Talk mode uses authored or imported scenario turns in the MVP; it must not pretend that a scripted reply understood the learner's free text.

## 4. Central learning mechanism

`Understand → Notice → Rebuild → Retrieve → Transfer → Reflect`

1. Understand a short meaningful text, dialogue, or situation.
2. Notice chunks, patterns, collocations, and communicative purposes in context.
3. Rebuild selected missing language with support.
4. Retrieve language after support is reduced or hidden.
5. Transfer it to a different situation, audience, or intention.
6. Compare with a natural example, reflect, and select language to revisit.

An activity can use a subset of these steps. The sequence is a design framework, not a mandatory six-screen course. Target phrases can be chosen from the learner's saved list or selected directly in a text. Gaps must target useful language rather than random words.

Do not equate successful recall with verbatim reproduction. Preserve valid alternatives. A natural stylistic alternative is not automatically a correction.

### Example content direction

Situation: explain a critical bug discovered before release.

> I noticed a critical issue during regression testing. The bug affects the checkout flow and prevents users from completing their orders. I'd recommend fixing it before the release.

Target language includes `notice an issue`, `affect the checkout flow`, `prevent someone from doing something`, and `recommend + -ing`.

- B1: describe the problem with phrase support.
- B2: independently explain consequences and recommend an action.
- C1: discuss uncertainty and trade-offs, and respond diplomatically to an objection.
- Later transfer: reuse a recommendation pattern in a marketing or everyday situation.

This is an illustrative scenario, not the complete release content pack.

## 5. Activity formats and initial content

Support these data-driven formats: progressive reconstruction, inline dialogue gaps, conversation bubbles, choose-then-personalize, say-it-another-way, short text scenarios, and micro-exploration.

Variants include choosing which phrases disappear, retelling in one's own words, responding to a new complication, changing the audience, making a vague sentence precise, and building a reply from a communicative intention.

Initial thematic sets:

1. A bug before release.
2. Clarifying requirements.
3. Updates and delays.
4. Automation decisions.
5. Disagreeing constructively.
6. Marketing and experiments.
7. AI at work.
8. Everyday conversations.
9. Plans and unexpected problems.
10. Stories and opinions.

Each set contains three base activities, one per level B1/B2/C1. Activities contain multiple steps. All modes and formats should be represented across the collection; every theme need not implement every format.

## 6. Finishing, progress, and sprints

An activity is one self-contained practice. A sprint slot contains one selected activity plan; further practice can be offered without increasing that slot's completion count.

- `Finish for now` is available on every activity step, including before an answer.
- Finishing saves current work and opens a lightweight summary. Glossary selection and self-assessment are optional.
- Closing the browser autosaves where possible and leaves a neutral resume option.
- Progress is the proportion of completed planned steps, never a knowledge score. For example, two of four steps is 50%.
- Freeze the step denominator when the activity plan starts. Additional optional practice does not lower the percentage.
- Errors and hints do not subtract step progress. Reaching the summary early does not mark unvisited steps complete.
- A step counts when its required interaction is submitted or explicitly acknowledged; mere screen exposure is insufficient. Content contracts define this per step type.
- Early-finish summaries describe work performed; they do not emphasise missing percentages or manufacture achievements.

A slot counts towards the sprint once the learner chooses to finish after at least one substantive answer attempt. A wrong answer counts as practice; opening, reading, or viewing an example alone does not. Each slot counts at most once, including after resuming or repeating it. Answer correctness and phrase mastery remain separate from slot completion.

After seven counted slots, show a quiet recap and offer a new sprint. A learner can archive any sprint earlier without deleting its activities, attempts, saved language, or history. No calendar deadline applies. Starting a new active sprint preserves the previous one as completed or archived.

## 7. Answers and self-comparison

### Closed exercises

Validate answers against authored accepted variants. Normalisation may ignore case, repeated whitespace, and explicitly permitted punctuation differences. It must preserve meaningful grammatical distinctions such as `recommend fixing` versus `recommend to fix`.

An unmatched answer means it was not matched to the supplied examples; the system must not claim exhaustive linguistic judgement. Offer accepted examples and a way to flag another plausible answer for later content review. A hint-assisted match is recorded separately from independent retrieval.

### Open responses

Save the learner's answer before revealing examples. `Compare answers` shows:

- `Your answer`.
- `A natural answer` or `Example answer` (one or more valid examples).
- Target language and a short task-specific comparison checklist.
- An optional chance to revise the answer, preserving the original attempt.

Optional self-assessment choices are `I expressed it clearly`, `Almost — I want to try again`, and `I need more support`.

No automatic claim of correctness, diagnosed error, or AI understanding is made for free text. Example viewing and self-assessment remain distinct from independently checked evidence.

## 8. Translation and language selection

All navigation, instructions, and examples default to English. Instructions use accessible English even in C1 tasks. A full Russian interface is outside the MVP.

- Annotate potentially unfamiliar words and meaningful multiword expressions in instructions, source texts, and examples.
- Clicking or tapping an annotation opens its contextual Russian meaning, English example, and optional pattern explanation.
- Include `Save for practice` in the card.
- Translations are authored or imported with content and require no runtime AI request.
- The learner can select other visible text and save it as a phrase without retyping. If no translation is supplied, saving still works; do not invent a translation.
- Arbitrary automatic translation of every unannotated selection is deferred.
- During retrieval, hidden source material stays hidden. Explicitly revealing a target phrase counts as support, without a penalty.

Opening a translation alone does not diagnose a weakness or silently add an item to the mandatory practice list.

## 9. End-of-activity glossary

Show `Useful language from this activity` with selectable words, chunks, grammar patterns, and communicative intentions. Include contextual examples and optional translations. Items saved earlier in the activity are already selected. Selecting the same item again must not create a duplicate.

Below the list, provide `Anything else you want to practise?` for a word, phrase, sentence, pattern, or intention absent from the glossary. The learner does not need to classify it. Store this as a learner note rather than an automatically verified language fact.

The summary allows saving and finishing without selecting any item or writing a note.

## 10. Learning evidence and return priorities

Maintain two independent concepts:

- **Saved language:** the learner wants to practise an item.
- **Needs support:** explicit difficulty or reliable task evidence suggests support may help.

An item may belong to both. Store evidence provenance and allow the learner to remove saved selections, dismiss inferred suggestions, or revise their self-assessment.

| Signal | Interpretation |
|---|---|
| Explicit save or glossary selection | Strong preference for future practice, not necessarily difficulty. |
| Learner note | Explicit content need. |
| Item-specific `I need more support` | Explicit difficulty, labelled self-reported. |
| Whole-activity self-assessment | Activity-level signal; do not mark every phrase as difficult. |
| Hint or early example reveal | Support was used; a tentative review suggestion. |
| Translation opened | Contextual help used, weak evidence only. |
| Partial work or browser exit | Resume information only; no weakness inference. |
| Accepted closed answer without target hints | Task-specific independent retrieval evidence. |
| Confident free-text self-assessment | Self-reported confidence, not verified correctness. |

Use neutral labels such as `Worth revisiting`, `Coming back soon`, and `Getting more familiar`. Do not infer errors from repeated `I think` or from ordinary stylistic choices.

### Initial review policy

These are tunable implementation defaults, not scientifically calibrated proficiency measures:

- Independently matched closed retrieval can advance intervals through 1, 3, 7, 14, and 30 days.
- Support-assisted attempts keep or shorten the interval. Explicit difficulty offers a return at the next suitable practice.
- Reading alone does not advance retrieval evidence. Free-text confidence is tracked separately.
- Lack of practice does not create penalties or an overdue queue.
- Export roughly 4–7 prioritised returning items per new sprint, with at most 2–3 in one activity where feasible.
- Prefer explicit selections and learner notes, then explicit support needs, then tentative suggestions. Consider recency and avoid repeating identical contexts.
- Aim for approximately 60% new material, 30% material needing another look, and 10% comfortable review when history permits; this is guidance, not a quota.

The Ledger records evidence honestly: `You practised…`, `You saved…`, or `You felt more comfortable with…`. It must not declare free-text mastery from an example reveal.

## 11. Manual AI workflow

`Practice → Review saved language → Prepare prompt → Generate in an external AI chat → Import and preview → Start sprint`

The app assembles a complete copyable generation prompt: product instructions, schema, target levels, interests, selected returning items, source IDs, evidence labels, and optional learner notes. It can also expose the learning-history section alone as an addition to an existing prompt.

The learner previews and can exclude history items before copying. Include compact language context, not full answer history or account details by default. No automatic external submission occurs.

The AI is instructed to return one structured JSON sprint with seven slots, grounded examples, accepted closed-answer variants, comparison checklists, translations, and references to returning items. It must distinguish self-reported difficulty from verified mistakes and must reuse language in new contexts.

The app validates the import, shows a preview and understandable errors, and commits only a valid complete sprint. An invalid import preserves the current sprint and entered text. A valid structure does not guarantee linguistic quality; preview must allow the learner to reject content and export a repair prompt.

If external AI is unavailable, build a sprint from the starter library. Starting and completing practice never depends on an AI connection.

## 12. Persistence, privacy, and sharing

Keep profile, sprint snapshots, attempts, drafts, selected language, support signals, and notes in the cloud. Maintain a local draft copy for connection interruptions. Distinguish cloud-saved from device-only status. Resolve conflicting edits without silently overwriting either version.

Use a private owner account and manually provisioned invited accounts, with public sign-up disabled. Invited people can use the hosted link and see their own practice, not the owner's data. No social features or public demo account are required.

## 13. Visual and accessibility direction

Modern, warm, calm, and lightly playful. Use a mobile-first single column, generous space, readable text, rounded cards and consistent outline controls. Palette: paper `#FFFDF8`, ink `#29313D`, mint `#DDF4E8`, lilac `#EEE7FF`, butter `#FFF1C9`, peach `#FFDCD2`. Use one restrained accent at a time.

Provide visible keyboard focus, accessible contrast and labels, touch targets at least 44px, and reduced-motion support. Translation cards and text-selection actions must work with keyboard and touch. Do not rely on hover. Avoid mascots, confetti, badges, and punitive visual indicators.

## 14. Future boundaries

Later, a server-side provider can generate the same validated sprint format automatically. Personal AI feedback and live conversation require separate explicit implementation scope and budget controls. Voice recording, transcription, pronunciation feedback, and speech synthesis are outside this MVP. An optional invitation to speak aloud must not imply that the app heard or evaluated the speech.

## 15. Acceptance criteria

- A private hosted link works on phone and desktop with isolated invited-account data.
- Ten thematic sets provide thirty base activities spanning B1–C1.
- All four modes work without runtime AI, with honest scripted scenarios.
- Progressive removal of support and transfer to another context are implemented.
- Every activity can be finished early, saved, and resumed without penalties.
- Step percentages are accurate and independent of answer correctness.
- Closed checking, open-answer comparison, and self-assessment are clearly distinguished.
- Contextual translation, phrase saving, an end glossary, and a custom note are usable.
- Selected language and support evidence inform an editable generation prompt.
- A valid seven-slot sprint imports with preview; invalid or repeated imports cause no data loss or duplicates.
- Archiving and new sprints preserve previous learning history.

