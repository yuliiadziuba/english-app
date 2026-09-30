# Learning System Specification v1

## 1. Product intent

Create a private, English-first web environment that helps one learner move from mostly passive B1 comprehension toward confident B1–B2 active use. The focus is practical business English for IT testing, automation, marketing, and ordinary spoken interaction.

The product is not a linear course, a vocabulary flashcard app, or a productivity tracker. It is a small personal practice space that adapts each visit to the learner’s current energy, interests, recent language, and recurring difficulties.

## 2. Learner context

- Current self-assessment: around B1 for understanding; active sentence construction and spontaneous expression are weaker.
- Goals: express thoughts more clearly; use more natural phrases and structures; develop work/business English; improve conversational confidence.
- Relevant themes: QA/testing, automation, AI, marketing, workplace communication, and interesting everyday topics.
- Constraint: daily practice must be short, varied, low-friction, and non-punitive. Monotony and an excessive sense of obligation reduce the chance of returning.
- Language environment: English should be the default interface and learning environment. Russian is available as an optional fallback for navigation and concise explanations.

## 3. Design principles for learning

1. **Active production over passive recognition.** Understanding a phrase is not the same as retrieving and using it in a new situation.
2. **Chunks in context.** Prioritize natural combinations, sentence patterns, collocations, register, and reusable formulations over isolated word lists.
3. **Progressive removal of support.** Move from seeing and understanding language to rebuilding it, retrieving it, and adapting it.
4. **Short, complete moments.** A five-minute useful session is better than a perfect plan that feels too demanding to start.
5. **Personal relevance and novelty.** Activities should connect to work, curiosity, and current interests while varying their format.
6. **Support without infantilization.** The system may scaffold, suggest, and simplify; it should never shame, over-correct, or make the learner feel tested.
7. **Errors become future material.** Important recurring errors and useful near-misses return in a different context instead of becoming a red mark in a history table.
8. **Visible qualitative progress.** Progress is shown through useful language becoming easier to use, not through streaks, points, rankings, or pressure.

## 4. Core user flow

Every regular learning visit follows this sequence:

```text
How are you today? → What do you want to do? → One fitting activity
→ gentle feedback → Learning Ledger → a useful future return
```

### 4.1 State check

The first main question is:

> **How are you today?**

Initial choices:

- 🙂 Ready
- 😴 Tired
- 🥱 Bored
- 🔥 Curious
- 🧠 Focused

The choice changes the amount of support, expected session length, challenge level, and activity type. It is not a mood score and must not be stored or displayed as a judgement.

Examples:

- **Tired:** familiar language, fewer steps, more context, a five-to-seven-minute finish line.
- **Bored:** a quicker or less predictable format; avoid long reading.
- **Curious:** allow an interesting topic or a small exploration.
- **Focused:** use deeper retrieval and a fuller transfer task.

### 4.2 Mode selection

The next question is:

> **What do you want to do?**

- 🧩 **Reconstruct** — rebuild useful language from context and memory.
- 💬 **Talk about something** — respond inside a short text conversation or scenario.
- 🔬 **Explore a topic** — encounter a short new idea, text, pattern, or phrase family.
- 🎲 **Surprise me** — let the engine pick an unexpected but useful activity.

The learner chooses the kind of experience, not a rigid lesson. The system selects the exact topic and activity from the active sprint, useful language, errors, recent history, and state.

## 5. Central learning loop

The most important reusable pattern is:

**Notice → Rebuild → Retrieve → Transfer → Reflect**

1. **Notice:** encounter a short meaningful dialogue, mini-text, or scenario. Notice chunks, grammar patterns, tone, and word order.
2. **Rebuild:** complete selected gaps while the original context remains visible.
3. **Retrieve:** recreate essential phrases after much of the support has disappeared.
4. **Transfer:** use the same language in a new situation, preferably a personally relevant one.
5. **Reflect:** identify what communicated well, one to three improvements, and one reusable item for the Ledger.

Not every session needs all five steps. The chosen state controls the minimum viable session. A tired learner may complete one good rebuild and one light recall prompt; that is a valid completion.

## 6. Exercise forms

### 6.1 Progressive reconstruction

A short authentic-style work or conversational text is used in stages:

- read the complete text;
- fill contextual gaps;
- rebuild selected chunks or grammar patterns;
- restore key language from sparse prompts;
- use it in a fresh situation.

This is inspired by retrieval practice: language moves from visible input toward memory-based production.

### 6.2 Inline dialogue gaps

Show a whole dialogue, with small response fields directly inside missing parts. Fields should feel like part of the scene, not an external worksheet.

### 6.3 Conversation bubbles

A scenario character speaks; the learner replies in a natural message bubble. Avoid repetitive imperative wording such as “Write your answer.” Prefer invitations such as “Your reply,” “How would you say it?”, or “Make it yours.”

### 6.4 Choose, then personalize

Offer a few useful scaffolds, then invite the learner to adapt the selected one. This makes the path from recognition to production less intimidating.

### 6.5 Say it another way

Ask the learner to make a sentence clearer, more natural, more diplomatic, more specific, or less repetitive.

### 6.6 Interactive mini-scenarios

Use two or three turns around situations such as a bug found before release, explaining a delay, raising a concern, giving an update, clarifying requirements, or discussing an idea.

## 7. Feedback and error loop

Feedback follows these rules:

- Meaning and successful communication come first.
- Highlight only the one to three most useful changes; do not correct every possible imperfection.
- Explain the corrected form in English by default; offer a concise Russian explanation when selected.
- Prefer patterns and chunks: for example, `recommend + -ing`, not just a list of corrected words.
- Keep the learner’s original message visible beside an optional natural revision.

When an error, near-miss, or useful phrase matters, the system creates or updates a future learning item. It returns later in a different activity and context. Successful retrieval gradually reduces its priority.

Suggested categories:

- grammar pattern;
- word order;
- preposition or verb pattern;
- collocation/chunk;
- clarity;
- tone or register;
- range and variety.

## 8. Learning Ledger

The Learning Ledger is a gentle record of language that is becoming usable. It should capture short events, not grades.

Examples:

- “You rebuilt: **I’d recommend fixing it before the release.**”
- “A useful way to raise a concern: **My main concern is…**”
- “Worth returning to: **prevent someone from doing something**.”

The Ledger can group items as:

- Useful now
- Returning soon
- Becoming automatic
- Tiny wins

Avoid XP, leaderboards, numeric ranks, and punitive streaks.

## 9. Sprint and persistence philosophy

The first learning container is a 7-session sprint. It is not seven compulsory consecutive days.

- A learner can continue an active sprint after a long absence.
- The app should greet them warmly and preserve progress.
- They can explicitly archive the sprint and start a new one.
- Archiving does not erase useful language, Ledger entries, or past answers.
- The home screen offers either a gentle continuation of an unfinished activity or a fresh state check.

## 10. AI’s role

AI is an assistant to the learning system, not the system itself. It may:

- generate or adapt a relevant scenario;
- analyze an open response;
- identify a useful recurring error or chunk;
- suggest an appropriate next activity.

The core experience must also work with curated activities and deterministic review logic. AI must be optional, budget-bounded, and capable of failing without losing progress or breaking a session.

## 11. Voice future, text MVP

Version 1 is text-first. Text conversation and free-response activities are prototypes for future voice interaction.

Future voice could add recording, transcription, pronunciation feedback, and spoken conversation, but these are explicitly out of scope for v1. The system should preserve text responses and activity semantics in a way that a future transcript can use the same feedback and Ledger flow.

## 12. Emotional and visual tone

The app should feel modern, calm, warm, and lightly playful:

- minimal cognitive load;
- one central decision or task at a time;
- soft light colours;
- rounded cards and equal-width rounded outlines;
- friendly, clear language;
- no childish mascots, reward explosions, or gamified pressure.

The learner should feel invited to return, not managed.
