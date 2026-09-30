# Implementation Plan v1 — Personal English Learning Web App

## 1. Goal and MVP boundary

Build a private, responsive web application for one learner. It implements the Learning System Specification v1 through this core flow:

```text
State → Mode → Activity → Feedback → Learning Ledger → Next useful return
```

The MVP is English-first, text-first, cloud-hosted, and usable from the same link on desktop and phone. It preserves a single user’s profile, learning history, active sprint, useful language, and recurring errors.

### In scope

- One private account and profile.
- 7-session sprint with archive/start-new behaviour.
- State check, mode selection, curated text activities, feedback, Ledger, and error loop.
- English UI with Russian fallback.
- Responsive deployment by HTTPS link.
- Optional AI personalization with strong cost controls and non-AI fallback.
- Architecture ready for future voice/transcripts.

### Explicitly out of scope for v1

- Social or shared profiles; public profiles; leaderboards.
- Payments, push notifications, complex analytics, live web research, and user-authored content tools.
- Microphone recording, speech-to-text, pronunciation scoring, text-to-speech, and live voice calls.
- A large full-history dashboard or a placement test.

## 2. Recommended stack

| Concern | Recommendation | Reason |
|---|---|---|
| Application | Next.js with TypeScript and App Router | One maintainable codebase for UI and protected server endpoints. |
| Styling | Tailwind CSS plus local reusable UI components | Quick, consistent implementation without a heavy design system. |
| Forms/schema validation | React Hook Form and Zod | Reliable answer handling and structured AI validation. |
| Authentication/database | Supabase Auth and Postgres | Private cloud persistence across phone and desktop. |
| Hosting | Vercel | Simple Next.js deployment and HTTPS URL. |
| AI | Provider adapter; OpenAI implementation first | Keeps the app independent from one model vendor. |
| Tests | Vitest, Testing Library, Playwright | Covers logic, UI, and actual end-to-end learner paths. |

Do not put an AI key or Supabase service-role key into browser code.

## 3. Deployment architecture

```text
Browser on phone or desktop
        ↓ HTTPS
Vercel-hosted Next.js application
        ↓                    ↓
Protected server routes       Supabase Auth + Postgres
        ↓
Optional AI provider
```

### Deployment requirements

1. Create a Git repository for the app.
2. Create a Supabase project and apply versioned SQL migrations.
3. Configure Vercel from the Git repository.
4. Store secrets in Vercel environment variables only.
5. Use the Vercel deployment URL first; a custom domain is optional.
6. Verify the deployed URL works on a phone and desktop before enabling AI.

## 4. Private profile and security

Use Supabase Auth with a single email-and-password owner account.

- No public profile directory and no anonymous profile switching.
- Disable public sign-up after the owner account is created, or protect it behind a temporary configuration flag.
- Every personal record has a `user_id`.
- Use Row Level Security on every user-owned table: a user may only read, insert, update, and delete their own rows.
- Server routes authenticate the user and validate input before database or AI calls.
- Avoid logging full learner answers in infrastructure logs. Answers are stored in the database only where the learning history requires them.
- Never expose raw provider errors to the learner.

## 5. Data model

Use UUID primary keys and timestamps. JSON is acceptable for activity payloads and structured answers, but validate its shape with Zod.

| Table | Core fields | Use |
|---|---|---|
| `profiles` | `id`, `display_name`, `ui_language`, `explanation_language`, `timezone`, `goals`, `onboarding_complete` | Learner settings. |
| `sprints` | `id`, `user_id`, `title`, `status`, `started_at`, `ended_at`, `target_sessions` | Active and archived learning containers. |
| `sessions` | `id`, `user_id`, `sprint_id`, `state`, `mode`, `started_at`, `completed_at`, `duration_seconds` | One learning visit. |
| `activity_templates` | `id`, `type`, `topic`, `level`, `tags`, `payload`, `is_active` | Curated reusable content. |
| `activities` | `id`, `session_id`, `template_id`, `source`, `activity_plan`, `status` | A concrete assigned activity. |
| `attempts` | `id`, `activity_id`, `step`, `answer_payload`, `result`, `submitted_at` | Learner responses and grading outcome. |
| `learning_units` | `id`, `user_id`, `kind`, `canonical_text`, `meaning`, `example`, `tags` | Chunks, patterns, phrases, and useful language. |
| `unit_progress` | `id`, `learning_unit_id`, `strength`, `next_due_at`, `last_seen_at`, `error_count` | Retrieval scheduling data. |
| `error_items` | `id`, `user_id`, `category`, `original_text`, `recommended_form`, `explanation`, `status`, `linked_unit_id` | Future practice material. |
| `ledger_entries` | `id`, `user_id`, `session_id`, `kind`, `summary`, `linked_unit_ids` | Human-readable learning events. |
| `ai_usage_events` | `id`, `user_id`, `purpose`, `model`, `input_tokens`, `output_tokens`, `status` | Cost and failure monitoring. |

## 6. Content architecture

All activity formats must use structured data. Do not hard-code exercise texts, answers, or UI-specific flows into page components.

Seed at least 20–30 curated templates before enabling AI generation. Spread them across:

- QA/testing and release work;
- automation and investigation;
- marketing and communication;
- everyday conversation;
- useful opinions, concerns, clarifications, suggestions, and updates.

Required activity types:

1. `progressive_reconstruction`
2. `inline_dialogue_gap`
3. `conversation_bubble`
4. `choose_then_personalize`
5. `say_it_another_way`
6. `text_scenario`
7. `micro_explore`

Each activity payload should contain its instructions, steps, source text, expected answers where relevant, hints, tags, learning units, and optional Russian-help copy.

## 7. Learning engine

The MVP engine is deterministic first. AI may enrich it, but the app must remain useful without AI.

### State mapping

| State | Target length | Engine behaviour |
|---|---:|---|
| Ready | 10–12 min | Balanced practice plus a transfer step. |
| Tired | 5–7 min | Familiar language, fewer prompts, generous support. |
| Bored | 6–10 min | Novel, brisk activity; avoid long reading. |
| Curious | 10–15 min | New topic or deeper micro-exploration. |
| Focused | 12–15 min | More retrieval and fuller transfer task. |

### Mode mapping

- **Reconstruct:** prioritise progressive gap-fill, rebuilding, and recall.
- **Talk about something:** prioritise response bubbles and short work/everyday scenarios.
- **Explore a topic:** introduce a short text, pattern, or phrase family, followed by recall.
- **Surprise me:** select a fitting activity with a novelty preference.

### Candidate ranking

Rank eligible templates and/or generated plans using:

1. selected state fit;
2. selected mode fit;
3. due learning units;
4. unresolved or repeated errors;
5. topic relevance to stated goals;
6. avoidance of recently repeated topic/format;
7. a small novelty boost for `Surprise me` and `Bored`.

Show a simple human explanation when useful, such as: “I brought back *recommend + -ing* because it was tricky last time.” Do not expose internal scores.

## 8. Feedback, Ledger, and error loop

### Feedback rules

- Grade simple gap fills deterministically in the app.
- For free text, use AI only when available and permitted.
- Preserve the learner’s intended meaning; correct one to three high-value issues rather than every possible issue.
- Return what worked, an improved natural phrasing where useful, and a short explanation.
- Feedback is English by default; concise Russian explanation is available when selected.

### Error loop

1. Save the attempt before calling AI.
2. Identify a meaningful error, near-miss, or useful phrase.
3. Create or update a linked learning unit and error item.
4. Schedule the item for return in a different context.
5. Reduce its priority after later successful retrieval.

Use error categories: grammar pattern, word order, collocation/chunk, preposition or verb pattern, clarity, tone/register, and range.

### Learning Ledger

Show concise, encouraging entries under:

- Useful now
- Returning soon
- Becoming automatic
- Tiny wins

Avoid marks, XP, levels, leaderboards, and punitive streaks.

## 9. Sprint, home, and history behaviour

- A sprint aims for seven completed sessions, not seven consecutive calendar days.
- Existing active sprints stay intact after a long absence.
- Home offers `Continue gently` for an unfinished activity; otherwise it starts the state check.
- The learner can archive the current sprint and start a new one. Archiving retains the Ledger and useful language.
- The first MVP history view is compact: current sprint, session markers, recent Ledger entries, and returning-soon items.

## 10. MVP screens

1. **Sign in** — private email/password access.
2. **Onboarding** — name, goals, UI language, explanation language; no lengthy test.
3. **Home / return** — quiet greeting, current sprint, continue/start action, one recent win.
4. **State check** — one centered question and five state cards.
5. **Mode selection** — one centered question and four mode cards.
6. **Activity player** — one focused activity with inline fields, bubbles, choices, hints, and draft persistence.
7. **Reflection** — feedback, useful phrase, one next action, finish option.
8. **Learning Ledger** — browsable useful language and wins.
9. **Sprint** — calm 7-session view; archive/start-new action.
10. **Settings** — languages, AI status/on-off, sign out.

## 11. AI layer

### Provider boundary

Define an `AIProvider` abstraction. The rest of the app depends on structured contracts, not a vendor SDK.

Required operations:

- `generateActivity(context) -> ActivityPlan`
- `evaluateAttempt(activity, answer, context) -> FeedbackPlan`
- `suggestLearningUpdates(feedback) -> LedgerUpdatePlan`

Use schema-validated structured responses. The initial OpenAI adapter should make server-side Responses API calls with a configurable model name. Never allow the browser to call the provider directly.

### Minimal AI responsibilities

1. Adapt or generate a scenario when curated content is insufficient.
2. Evaluate free-text responses.
3. Extract only useful learning units and recurring errors.
4. Suggest a concise next-session recommendation.

### Cost controls

- `AI_ENABLED` feature flag; curated flow is the default development path.
- Send compact context only: state, mode, active topic, five due units, three active errors, and a short session summary.
- Do not send a full database export, all history, or unnecessary personal information.
- Cap output size and validate structured output.
- Combine response evaluation and Ledger/error suggestions in one request.
- Cache safely reusable generated plans.
- Use deterministic review scheduling instead of AI calls.
- Record call count and token usage.
- Configure daily maximum calls, estimated spending limit, and regeneration limit per activity.
- Do not run live web search in learner sessions in v1.

### Failure behaviour

If an API key is absent, invalid, rate-limited, over budget, timed out, or returns invalid structured output:

- do not lose the submitted answer;
- continue using a curated activity matching the state and mode;
- show a warm, plain message rather than raw technical errors;
- save the activity and progress normally;
- offer an explicit retry, never an automatic paid retry loop.

## 12. English-first and Russian fallback

- Build all interface copy from `en` and `ru` translation dictionaries from day one.
- Default interface and activity framing: English.
- Learning texts, examples, and corrections remain English.
- Russian switches navigation and concise explanations; it must not turn the product into a Russian-language course.
- Pass the selected explanation language to AI feedback when AI is enabled.

## 13. Design direction

### Desired feel

Modern, soft, calm, and lightly playful: a personal studio tool, neither corporate nor childish.

### Rules

- One primary decision or task per screen.
- Generous whitespace and comfortable reading width.
- Consistent rounded UI: cards around 24px; buttons and response bubbles around 16px; inline gap fields around 10–12px.
- Equal-width, rounded 2px outlines for interactive elements and line icons.
- Very subtle elevation; no harsh shadows.
- Transitions under 180ms; respect `prefers-reduced-motion`.
- Maintain accessible contrast and visible keyboard focus.

### Suggested palette

- paper: `#FFFDF8`
- ink: `#29313D`
- mint: `#DDF4E8`
- lilac: `#EEE7FF`
- butter: `#FFF1C9`
- peach: `#FFDCD2`

Use one soft accent per mode/activity, not every pastel at once. Use a readable sans-serif such as Manrope or Nunito Sans. Rounded outline icons and restrained emoji are acceptable; avoid mascots, confetti, badges, and gamified visual noise.

### Responsive rules

- Mobile-first single-column layout.
- Desktop content width roughly 640–760px.
- All touch targets at least 44px high.
- Inline answer fields wrap without breaking sentence context.
- Important information cannot depend on hover.

## 14. Voice-ready, text-first implementation

Do not implement voice in v1. Prepare for it by:

- defining response types: `choice`, `inline_text`, `free_text`, `conversation_text`, and future `voice_transcript`;
- storing answers generically enough for transcript metadata later;
- making the response surface replaceable by a future mic/transcript component;
- keeping current text scenarios compatible with future spoken scenarios.

## 15. Testing

### Unit tests

- state-to-session mapping;
- candidate ranking and repetition avoidance;
- due-item scheduling;
- gap-fill normalization/grading;
- error item updates;
- sprint archive/current selection;
- AI fallback selection.

### Component tests

- keyboard-accessible state/mode flow;
- inline gaps and response bubbles;
- Russian UI fallback;
- long answers and narrow mobile layouts.

### End-to-end tests

Use local Supabase/test data and a mocked AI provider:

1. sign in;
2. start a sprint;
3. choose `Tired → Reconstruct`;
4. complete a curated activity;
5. refresh and verify persistence;
6. verify the same data in a second viewport;
7. simulate an AI rate limit and confirm fallback;
8. archive a sprint and start a new one without losing Ledger history.

### Manual release checks

- iPhone-sized, Android-sized, and desktop layouts;
- keyboard-only and screen-reader labels;
- no secret in build output or network payload;
- RLS test using a second account;
- deployed production smoke test with AI off, then one controlled AI request.

## 16. Development phases

### Phase 0 — Foundation

Create repository, app conventions, environment template, Supabase project, migrations, authentication, and preview deployment.

**Done when:** one user signs in from two devices and sees the same empty profile.

### Phase 1 — Curated learning

Create activity contracts, seed 20–30 templates, build renderer and answer persistence.

**Done when:** all four modes lead to usable content without an AI key.

### Phase 2 — Daily experience

Build Home → State → Mode → Activity → Reflection; implement drafts and sprint lifecycle.

**Done when:** a session can be completed, refreshed, resumed, and counted in the active sprint.

### Phase 3 — Engine and Ledger

Implement scheduling, learning units, error loop, Ledger, and archive/new sprint behaviour.

**Done when:** a useful phrase or repeated error can return in a new relevant context.

### Phase 4 — Optional AI

Implement provider adapter, protected endpoint, schemas, usage logging, limits, and fallback states.

**Done when:** AI enriches free-text feedback but its absence cannot block a session.

### Phase 5 — Polish and verification

Apply design direction, i18n, responsive/accessibility work, tests, security checks, and production deployment.

**Done when:** the product feels calm and intentional on a phone and meets the test checklist.

## 17. MVP acceptance criteria

The MVP is ready when:

- one private HTTPS link works on desktop and phone;
- a private user profile persists across devices;
- state → mode → activity is complete;
- all four modes are represented;
- progressive reconstruction and transfer exist;
- answers, Ledger, errors, and sprint status persist;
- a sprint can be continued or archived;
- AI is optional, cost-limited, and fails gracefully;
- UI is English-first with Russian fallback;
- the product is responsive, accessible, and visually coherent.

## 18. Work order for the coding agent

1. Read `learning-system-specification-v1.md` completely.
2. Read this implementation plan completely; report only genuine contradictions or missing credentials.
3. Build the no-AI curated path first.
4. Add authentication, persistence, sprint, Ledger, and error loop.
5. Apply the responsive design direction and test the mobile flow.
6. Add the optional AI adapter behind feature flags and strict schemas.
7. Test AI-off, limit-reached, and provider-error paths.
8. Deploy the private MVP and verify one real learning session.

Do not paste live credentials into prompts, source code, or Git. Add them only to local `.env` files excluded from Git and protected Vercel project settings.
