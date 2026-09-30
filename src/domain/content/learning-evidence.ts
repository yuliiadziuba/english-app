export type SignalType =
  | "saved_for_practice"
  | "translation_opened"
  | "support_revealed"
  | "self_reported_support"
  | "closed_task_match";

export type SignalScope = "activity" | "item";

export interface LearningSignal {
  type: SignalType;
  scope: SignalScope;
  itemKey?: string;
  provenance: "explicit_selection" | "observed_support" | "self_report" | "deterministic_check";
}

export interface LearnerNote {
  text: string;
  sourceActivityKey: string;
  status: "active" | "dismissed";
}

export function saveLanguage(existingKeys: readonly string[], itemKey: string): string[] {
  return [...new Set([...existingKeys, itemKey])];
}

export function evidenceFromHelpOpen(itemKey: string): LearningSignal {
  return { type: "translation_opened", scope: "item", itemKey, provenance: "observed_support" };
}

export function evidenceFromSave(itemKey: string): LearningSignal {
  return { type: "saved_for_practice", scope: "item", itemKey, provenance: "explicit_selection" };
}

export function evidenceFromActivityAssessment(value: "clear" | "try_again" | "need_support"): LearningSignal | undefined {
  return value === "need_support"
    ? { type: "self_reported_support", scope: "activity", provenance: "self_report" }
    : undefined;
}
