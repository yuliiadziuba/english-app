import { CONTENT_LIMITS, SprintSchema, type Sprint } from "./schema.js";

export interface ValidationProblem {
  path: string;
  message: string;
}

export type ReturningReferenceMap = ReadonlyMap<
  string,
  { provenance: "learner_selected" | "self_reported_support" | "closed_task_match" | "translation_opened" | "support_used" }
>;

export interface ImportPreview {
  ownerScope: string;
  fingerprint: string;
  sprint: Readonly<Sprint>;
  sourceText: string;
}

export type PrepareImportResult =
  | { ok: true; preview: ImportPreview }
  | { ok: false; sourceText: string; problems: ValidationProblem[]; repairPrompt: string };

export function extractJsonInput(sourceText: string): { ok: true; jsonText: string } | { ok: false; problem: ValidationProblem } {
  if (new TextEncoder().encode(sourceText).byteLength > CONTENT_LIMITS.encodedDocumentBytes) {
    return {
      ok: false,
      problem: {
        path: "$",
        message: `Input exceeds ${CONTENT_LIMITS.encodedDocumentBytes} encoded bytes`,
      },
    };
  }

  const trimmed = sourceText.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*\r?\n([\s\S]*?)\r?\n```$/iu);
  if (fenced && !fenced[1]!.includes("```")) return { ok: true, jsonText: fenced[1]!.trim() };
  if (trimmed.includes("```")) {
    return { ok: false, problem: { path: "$", message: "Provide one JSON object, optionally inside one enclosing JSON code fence" } };
  }
  if (!trimmed.startsWith("{") || !trimmed.endsWith("}")) {
    return { ok: false, problem: { path: "$", message: "Only a JSON object is accepted; remove surrounding prose" } };
  }
  return { ok: true, jsonText: trimmed };
}

export function prepareSprintImport(
  sourceText: string,
  ownerScope: string,
  allowedReferences: ReturningReferenceMap = new Map(),
): PrepareImportResult {
  const extracted = extractJsonInput(sourceText);
  if (!extracted.ok) return invalid(sourceText, [extracted.problem]);

  let parsed: unknown;
  try {
    parsed = JSON.parse(extracted.jsonText);
  } catch (error) {
    return invalid(sourceText, [{ path: "$", message: `Invalid JSON: ${error instanceof Error ? error.message : "parse error"}` }]);
  }

  const validated = SprintSchema.safeParse(parsed);
  if (!validated.success) {
    return invalid(
      sourceText,
      validated.error.issues.map((issue) => ({
        path: formatPath(issue.path),
        message: issue.message,
      })),
    );
  }

  const referenceProblems: ValidationProblem[] = [];
  for (const [slotIndex, slot] of validated.data.slots.entries()) {
    for (const activity of [slot.default_activity, ...slot.alternatives]) {
      for (const [referenceIndex, reference] of activity.returning_items.entries()) {
        const allowed = allowedReferences.get(reference.ref_id);
        const path = `$.slots[${slotIndex}].${activity === slot.default_activity ? "default_activity" : "alternatives"}.returning_items[${referenceIndex}]`;
        if (!allowed) {
          referenceProblems.push({ path: `${path}.ref_id`, message: `Unknown returning reference '${reference.ref_id}'` });
        } else if (allowed.provenance !== reference.provenance) {
          referenceProblems.push({ path: `${path}.provenance`, message: `Provenance does not match the exported reference '${reference.ref_id}'` });
        }
      }
    }
  }
  if (referenceProblems.length > 0) return invalid(sourceText, referenceProblems);

  const canonical = stableStringify(validated.data);
  const fingerprint = stableFingerprint(`${ownerScope}\0${canonical}`);
  const immutableSprint = deepFreeze(structuredClone(validated.data));
  return {
    ok: true,
    preview: deepFreeze({ ownerScope, fingerprint, sprint: immutableSprint, sourceText }),
  };
}

export function buildRepairPrompt(problems: readonly ValidationProblem[]): string {
  const lines = problems.map((problem) => `- ${problem.path}: ${problem.message}`).join("\n");
  return [
    "Repair the sprint JSON so it conforms to schema_version 1.0.",
    "Return exactly one JSON object with seven slots and no prose or Markdown fence.",
    "Keep learner-visible content as plain text and preserve valid content where possible.",
    "Validation errors:",
    lines,
  ].join("\n");
}

function invalid(sourceText: string, problems: ValidationProblem[]): PrepareImportResult {
  return { ok: false, sourceText, problems, repairPrompt: buildRepairPrompt(problems) };
}

function formatPath(path: PropertyKey[]): string {
  return path.reduce<string>((result, part) => (typeof part === "number" ? `${result}[${part}]` : `${result}.${String(part)}`), "$" );
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b));
    return `{${entries.map(([key, item]) => `${JSON.stringify(key)}:${stableStringify(item)}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

// A deterministic, browser-compatible identifier for local import deduplication.
// It is not used as a security boundary or to protect private data.
function stableFingerprint(value: string): string {
  let first = 0x811c9dc5;
  let second = 0x01000193;
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    first = Math.imul(first ^ code, 0x01000193);
    second = Math.imul(second ^ (code + index), 0x27d4eb2d);
  }
  return `${(first >>> 0).toString(16).padStart(8, "0")}${(second >>> 0).toString(16).padStart(8, "0")}`;
}

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value as Record<string, unknown>)) deepFreeze(child);
  }
  return value;
}
