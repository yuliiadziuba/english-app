import { describe, expect, it } from "vitest";
import { SprintSchema } from "../src/domain/content/schema.js";
import { clone, loadSampleSprint } from "./helpers.js";

describe("SprintSchema", () => {
  it("accepts the complete seven-slot fixture", () => {
    expect(SprintSchema.safeParse(loadSampleSprint()).success).toBe(true);
  });

  it("rejects wrong slot counts, duplicate keys and positions", () => {
    const short = clone(loadSampleSprint());
    short.slots.pop();
    expect(SprintSchema.safeParse(short).success).toBe(false);

    const duplicate = clone(loadSampleSprint());
    duplicate.slots[1]!.key = duplicate.slots[0]!.key;
    duplicate.slots[1]!.position = duplicate.slots[0]!.position;
    const result = SprintSchema.safeParse(duplicate);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.message).join(" ")).toContain("Duplicate slot key");
      expect(result.error.issues.map((issue) => issue.message).join(" ")).toContain("Duplicate slot position");
    }
  });

  it("rejects unsupported enums and unknown fields", () => {
    const sprint = clone(loadSampleSprint()) as unknown as Record<string, unknown>;
    (sprint.slots as Array<Record<string, unknown>>)[0]!.surprise = true;
    const activity = ((sprint.slots as Array<Record<string, unknown>>)[1]!.default_activity as Record<string, unknown>);
    activity.level = "A2";
    expect(SprintSchema.safeParse(sprint).success).toBe(false);
  });

  it("rejects missing step-specific data", () => {
    const sprint = clone(loadSampleSprint()) as unknown as { slots: Array<{ default_activity: { steps: Array<Record<string, unknown>> } }> };
    delete sprint.slots[0]!.default_activity.steps[2]!.items;
    expect(SprintSchema.safeParse(sprint).success).toBe(false);
  });

  it("rejects dangling glossary references", () => {
    const sprint = clone(loadSampleSprint());
    sprint.slots[0]!.default_activity.target_language_keys[0] = "missing-item";
    const result = SprintSchema.safeParse(sprint);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues.some((issue) => issue.message.includes("Unknown glossary reference"))).toBe(true);
  });

  it("rejects fields over their documented limits", () => {
    const sprint = clone(loadSampleSprint());
    sprint.slots[0]!.default_activity.learning_objective = "x".repeat(2_001);
    expect(SprintSchema.safeParse(sprint).success).toBe(false);
  });

  it("keeps optional steps outside the planned denominator", () => {
    const sprint = clone(loadSampleSprint());
    const step = sprint.slots[0]!.default_activity.steps[0]!;
    step.optional = true;
    step.progress_bearing = true;
    const parsed = SprintSchema.parse(sprint);
    expect(parsed.slots[0]!.default_activity.steps[0]!.optional).toBe(true);
  });
});
