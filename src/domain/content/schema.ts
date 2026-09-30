import { z } from "zod";

export const CONTENT_LIMITS = {
  encodedDocumentBytes: 256 * 1024,
  stepsPerActivity: 12,
  glossaryItemsPerSprint: 60,
  sourceCharacters: 5_000,
  promptCharacters: 2_000,
  acceptedVariants: 20,
  alternativesPerSlot: 3,
} as const;

const KeySchema = z.string().min(1).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const ShortTextSchema = z.string().min(1).max(CONTENT_LIMITS.promptCharacters);
const SourceTextSchema = z.string().min(1).max(CONTENT_LIMITS.sourceCharacters);

export const LevelSchema = z.enum(["B1", "B2", "C1"]);
export const ModeSchema = z.enum([
  "reconstruct",
  "talk-about-something",
  "explore-a-topic",
  "surprise-me",
]);
export const StateSchema = z.enum(["ready", "tired", "bored", "curious", "focused"]);
export const PhaseSchema = z.enum([
  "understand",
  "notice",
  "rebuild",
  "retrieve",
  "transfer",
  "reflect",
]);

const TextSegmentSchema = z.strictObject({
  type: z.literal("text"),
  value: SourceTextSchema,
});

const GlossarySegmentSchema = z.strictObject({
  type: z.literal("glossary_ref"),
  key: KeySchema,
  display: ShortTextSchema,
});

export const StructuredTextSchema = z
  .array(z.discriminatedUnion("type", [TextSegmentSchema, GlossarySegmentSchema]))
  .min(1)
  .max(100);

export const GlossaryItemSchema = z.strictObject({
  key: KeySchema,
  kind: z.enum(["word", "chunk", "pattern", "communicative_intention"]),
  canonical_form: ShortTextSchema,
  meaning_ru: ShortTextSchema,
  example_en: ShortTextSchema,
  pattern_note: ShortTextSchema.optional(),
});

export const NormalisationSchema = z.strictObject({
  ignore_case: z.boolean(),
  collapse_whitespace: z.boolean(),
  ignore_terminal_punctuation: z.boolean(),
});

const AcceptedAnswerSchema = z.strictObject({
  value: z.string().min(1).max(500),
  label: z.enum(["target", "valid_alternative"]),
});

const ClosedItemSchema = z.strictObject({
  key: KeySchema,
  prompt: ShortTextSchema,
  accepted_answers: z.array(AcceptedAnswerSchema).min(1).max(CONTENT_LIMITS.acceptedVariants),
  target_glossary_key: KeySchema.optional(),
});

const StepBase = {
  key: KeySchema,
  phase: PhaseSchema,
  title: ShortTextSchema,
  progress_bearing: z.boolean(),
  optional: z.boolean().default(false),
};

const ContentAcknowledgementStepSchema = z.strictObject({
  ...StepBase,
  type: z.literal("content_acknowledgement"),
  completion_rule: z.literal("explicit_continue"),
  instruction: StructuredTextSchema,
  content: StructuredTextSchema,
  continue_label: ShortTextSchema,
});

const LanguageNoticingStepSchema = z.strictObject({
  ...StepBase,
  type: z.literal("language_noticing"),
  completion_rule: z.literal("complete_selections"),
  prompt: StructuredTextSchema,
  source: StructuredTextSchema,
  jobs: z
    .array(
      z.strictObject({
        key: KeySchema,
        label: ShortTextSchema,
        accepted_glossary_keys: z.array(KeySchema).min(1).max(10),
      }),
    )
    .min(1)
    .max(10),
});

const InlineTextStepSchema = z.strictObject({
  ...StepBase,
  type: z.literal("inline_text"),
  completion_rule: z.literal("submit_all"),
  prompt: StructuredTextSchema,
  items: z.array(ClosedItemSchema).min(1).max(20),
  normalisation: NormalisationSchema,
  completed_text: StructuredTextSchema,
});

const ReconstructionStepSchema = z.strictObject({
  ...StepBase,
  type: z.literal("reconstruction"),
  completion_rule: z.literal("submit_all"),
  prompt: StructuredTextSchema,
  items: z.array(ClosedItemSchema).min(1).max(20),
  normalisation: NormalisationSchema,
  completed_text: StructuredTextSchema,
});

const FreeTextStepSchema = z.strictObject({
  ...StepBase,
  type: z.literal("free_text"),
  completion_rule: z.literal("submit_response"),
  prompt: StructuredTextSchema,
  scenario: StructuredTextSchema.optional(),
  natural_examples: z
    .array(z.strictObject({ label: ShortTextSchema, text: ShortTextSchema }))
    .min(1)
    .max(5),
  comparison_checklist: z.array(ShortTextSchema).min(1).max(10),
  target_language_keys: z.array(KeySchema).min(1).max(20),
  source_visibility: z.enum(["visible", "hidden_until_help"]),
  hints: z
    .array(
      z.strictObject({
        level: z.number().int().min(1).max(3),
        content: StructuredTextSchema,
        reveals_target_language: z.boolean(),
      }),
    )
    .max(3),
});

const ReflectionStepSchema = z.strictObject({
  ...StepBase,
  type: z.literal("reflection"),
  completion_rule: z.literal("explicit_finish"),
  heading: ShortTextSchema,
  glossary_keys: z.array(KeySchema).min(1).max(60),
  custom_note_prompt: ShortTextSchema,
  custom_note_placeholder: ShortTextSchema,
  self_assessment_scope: z.enum(["activity", "item"]),
  self_assessment_options: z
    .array(z.enum(["clear", "try_again", "need_support"]))
    .length(3),
});

export const ActivityStepSchema = z.discriminatedUnion("type", [
  ContentAcknowledgementStepSchema,
  LanguageNoticingStepSchema,
  InlineTextStepSchema,
  ReconstructionStepSchema,
  FreeTextStepSchema,
  ReflectionStepSchema,
]);

export const ReturningItemSchema = z.strictObject({
  ref_id: z.string().min(1).max(100),
  provenance: z.enum([
    "learner_selected",
    "self_reported_support",
    "closed_task_match",
    "translation_opened",
    "support_used",
  ]),
  intended_use: ShortTextSchema,
  claim: z.enum(["saved_for_practice", "needs_support", "returning_review"]),
});

const ActivityPlanShape = {
  key: KeySchema,
  content_version: z.string().regex(/^\d+\.\d+$/),
  title: ShortTextSchema,
  level: LevelSchema,
  topic: ShortTextSchema,
  learning_objective: ShortTextSchema,
  activity_type: z.enum([
    "progressive_reconstruction",
    "inline_dialogue_gap",
    "conversation_bubble",
    "choose_then_personalize",
    "say_it_another_way",
    "text_scenario",
    "micro_explore",
  ]),
  compatible_modes: z.array(ModeSchema).min(1).max(4),
  compatible_states: z.array(StateSchema).min(1).max(5),
  target_language_keys: z.array(KeySchema).min(1).max(20),
  glossary: z.array(GlossaryItemSchema).min(1).max(60),
  returning_items: z.array(ReturningItemSchema).max(20).default([]),
  steps: z.array(ActivityStepSchema).min(1).max(CONTENT_LIMITS.stepsPerActivity),
};

export const ActivityPlanSchema = z.strictObject(ActivityPlanShape).superRefine((activity, ctx) => {
  validateActivityReferences(activity, ctx);
});

const RawActivityPlanSchema = z.strictObject(ActivityPlanShape);

const SlotSchema = z.strictObject({
  key: KeySchema,
  position: z.number().int().min(1).max(7),
  default_activity: RawActivityPlanSchema,
  alternatives: z.array(RawActivityPlanSchema).max(CONTENT_LIMITS.alternativesPerSlot).default([]),
});

export const SprintSchema = z
  .strictObject({
    schema_version: z.literal("1.0"),
    sprint_key: KeySchema,
    title: ShortTextSchema,
    learning_goal: ShortTextSchema,
    fixture_only: z.boolean().default(false),
    slots: z.array(SlotSchema).length(7),
  })
  .superRefine((sprint, ctx) => {
    const slotKeys = new Map<string, number>();
    const positions = new Map<number, number>();
    const activityKeys = new Map<string, string>();
    let glossaryCount = 0;

    sprint.slots.forEach((slot, slotIndex) => {
      addUniqueIssue(slotKeys, slot.key, slotIndex, ["slots", slotIndex, "key"], "slot key", ctx);
      addUniqueIssue(positions, slot.position, slotIndex, ["slots", slotIndex, "position"], "slot position", ctx);

      const plans = [slot.default_activity, ...slot.alternatives];
      plans.forEach((activity, activityIndex) => {
        const path = ["slots", slotIndex, activityIndex === 0 ? "default_activity" : "alternatives", ...(activityIndex === 0 ? [] : [activityIndex - 1])];
        const priorPath = activityKeys.get(activity.key);
        if (priorPath) {
          ctx.addIssue({ code: "custom", path: [...path, "key"], message: `Duplicate activity key '${activity.key}' also used at ${priorPath}` });
        } else {
          activityKeys.set(activity.key, path.join("."));
        }
        glossaryCount += activity.glossary.length;
        validateActivityReferences(activity, ctx, path);
      });
    });

    if (glossaryCount > CONTENT_LIMITS.glossaryItemsPerSprint) {
      ctx.addIssue({ code: "custom", path: ["slots"], message: `Sprint contains ${glossaryCount} glossary items; maximum is ${CONTENT_LIMITS.glossaryItemsPerSprint}` });
    }
  });

function addUniqueIssue<K>(
  seen: Map<K, number>,
  value: K,
  index: number,
  path: PropertyKey[],
  label: string,
  ctx: z.RefinementCtx,
) {
  const previous = seen.get(value);
  if (previous !== undefined) {
    ctx.addIssue({ code: "custom", path, message: `Duplicate ${label} '${String(value)}' also used at slots.${previous}` });
  } else {
    seen.set(value, index);
  }
}

function validateActivityReferences(
  activity: z.infer<typeof RawActivityPlanSchema>,
  ctx: z.RefinementCtx,
  basePath: PropertyKey[] = [],
) {
  const glossaryKeys = new Set<string>();
  activity.glossary.forEach((item, index) => {
    if (glossaryKeys.has(item.key)) {
      ctx.addIssue({ code: "custom", path: [...basePath, "glossary", index, "key"], message: `Duplicate glossary key '${item.key}'` });
    }
    glossaryKeys.add(item.key);
  });

  activity.target_language_keys.forEach((key, index) => {
    requireGlossaryKey(key, glossaryKeys, [...basePath, "target_language_keys", index], ctx);
  });

  const stepKeys = new Set<string>();
  let hasLearnerResponse = false;
  activity.steps.forEach((step, stepIndex) => {
    const stepPath = [...basePath, "steps", stepIndex];
    if (stepKeys.has(step.key)) {
      ctx.addIssue({ code: "custom", path: [...stepPath, "key"], message: `Duplicate step key '${step.key}'` });
    }
    stepKeys.add(step.key);
    if (["language_noticing", "inline_text", "reconstruction", "free_text", "reflection"].includes(step.type)) {
      hasLearnerResponse = true;
    }
    for (const ref of collectStepGlossaryReferences(step)) {
      requireGlossaryKey(ref.key, glossaryKeys, [...stepPath, ...ref.path], ctx);
    }
  });
  if (!hasLearnerResponse) {
    ctx.addIssue({ code: "custom", path: [...basePath, "steps"], message: "Activity requires at least one learner-response step" });
  }
}

function collectStepGlossaryReferences(step: z.infer<typeof ActivityStepSchema>) {
  const refs: Array<{ key: string; path: PropertyKey[] }> = [];
  const collectSegments = (segments: z.infer<typeof StructuredTextSchema>, prefix: PropertyKey[]) => {
    segments.forEach((segment, index) => {
      if (segment.type === "glossary_ref") refs.push({ key: segment.key, path: [...prefix, index, "key"] });
    });
  };
  if ("instruction" in step) collectSegments(step.instruction, ["instruction"]);
  if ("content" in step) collectSegments(step.content, ["content"]);
  if ("prompt" in step && Array.isArray(step.prompt)) collectSegments(step.prompt, ["prompt"]);
  if ("source" in step) collectSegments(step.source, ["source"]);
  if ("completed_text" in step) collectSegments(step.completed_text, ["completed_text"]);
  if ("scenario" in step && step.scenario) collectSegments(step.scenario, ["scenario"]);
  if ("jobs" in step) step.jobs.forEach((job, jobIndex) => job.accepted_glossary_keys.forEach((key, index) => refs.push({ key, path: ["jobs", jobIndex, "accepted_glossary_keys", index] })));
  if ("items" in step) step.items.forEach((item, index) => item.target_glossary_key && refs.push({ key: item.target_glossary_key, path: ["items", index, "target_glossary_key"] }));
  if ("target_language_keys" in step) step.target_language_keys.forEach((key, index) => refs.push({ key, path: ["target_language_keys", index] }));
  if ("glossary_keys" in step) step.glossary_keys.forEach((key, index) => refs.push({ key, path: ["glossary_keys", index] }));
  if ("hints" in step) step.hints.forEach((hint, hintIndex) => collectSegments(hint.content, ["hints", hintIndex, "content"]));
  return refs;
}

function requireGlossaryKey(key: string, glossaryKeys: Set<string>, path: PropertyKey[], ctx: z.RefinementCtx) {
  if (!glossaryKeys.has(key)) {
    ctx.addIssue({ code: "custom", path, message: `Unknown glossary reference '${key}'` });
  }
}

export type Sprint = z.infer<typeof SprintSchema>;
export type ActivityPlan = z.infer<typeof ActivityPlanSchema>;
export type ActivityStep = z.infer<typeof ActivityStepSchema>;
export type Normalisation = z.infer<typeof NormalisationSchema>;
