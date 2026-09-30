import type { Normalisation } from "./schema.js";

export interface AnswerMatch {
  raw: string;
  normalised: string;
  status: "matched" | "unmatched";
  matchedValue?: string;
}

export function normaliseAnswer(value: string, policy: Normalisation): string {
  let result = value;
  if (policy.collapse_whitespace) result = result.trim().replace(/\s+/gu, " ");
  if (policy.ignore_terminal_punctuation) result = result.replace(/[.!?]+$/u, "").trimEnd();
  if (policy.ignore_case) result = result.toLocaleLowerCase("en");
  return result;
}

export function matchAnswer(raw: string, accepted: readonly string[], policy: Normalisation): AnswerMatch {
  const normalised = normaliseAnswer(raw, policy);
  const matchedValue = accepted.find((candidate) => normaliseAnswer(candidate, policy) === normalised);
  return matchedValue === undefined
    ? { raw, normalised, status: "unmatched" }
    : { raw, normalised, status: "matched", matchedValue };
}
