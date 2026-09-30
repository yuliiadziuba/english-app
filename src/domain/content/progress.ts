import type { ActivityStep } from "./schema.js";

export interface AttemptEvidence {
  stepKey: string;
  answer: unknown;
  submitted: boolean;
  supportUsed: boolean;
  matched?: boolean;
}

export function calculateProgress(steps: readonly ActivityStep[], completedStepKeys: ReadonlySet<string>): number {
  const planned = steps.filter((step) => step.progress_bearing && !step.optional);
  if (planned.length === 0) return 0;
  const completed = planned.filter((step) => completedStepKeys.has(step.key)).length;
  return Math.round((completed / planned.length) * 100);
}

export function hasSubstantiveAttempt(attempts: readonly AttemptEvidence[]): boolean {
  return attempts.some((attempt) => {
    if (!attempt.submitted) return false;
    if (typeof attempt.answer === "string") return attempt.answer.trim().length > 0;
    if (Array.isArray(attempt.answer)) return attempt.answer.some((value) => String(value).trim().length > 0);
    return attempt.answer !== undefined && attempt.answer !== null;
  });
}

export function shouldCountSprintSlot(previouslyCounted: boolean, explicitlyFinished: boolean, attempts: readonly AttemptEvidence[]) {
  return !previouslyCounted && explicitlyFinished && hasSubstantiveAttempt(attempts);
}
