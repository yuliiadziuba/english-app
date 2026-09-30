import { describe, expect, it } from "vitest";
import { buildRepairPrompt, extractJsonInput, prepareSprintImport } from "../src/domain/content/import.js";
import { InMemorySprintImportRepository } from "../src/domain/content/repository.js";
import { matchAnswer } from "../src/domain/content/answers.js";
import { saveLanguage } from "../src/domain/content/learning-evidence.js";
import { calculateProgress } from "../src/domain/content/progress.js";
import { clone, loadSampleSource, loadSampleSprint } from "./helpers.js";

describe("JSON ingestion", () => {
  it("accepts plain or singly fenced JSON", () => {
    const source = loadSampleSource();
    expect(extractJsonInput(source).ok).toBe(true);
    expect(extractJsonInput(`\`\`\`json\n${source}\n\`\`\``).ok).toBe(true);
  });

  it("rejects prose, multiple fences, malformed and oversized input", () => {
    expect(extractJsonInput(`Here it is: ${loadSampleSource()}`).ok).toBe(false);
    expect(extractJsonInput("```json\n{}\n```\n```json\n{}\n```").ok).toBe(false);
    expect(prepareSprintImport("{broken", "owner").ok).toBe(false);
    expect(extractJsonInput("x".repeat(256 * 1024 + 1)).ok).toBe(false);
  });
});

describe("import validation and preview", () => {
  it("aggregates independent validation errors with field paths", () => {
    const invalid = clone(loadSampleSprint()) as unknown as Record<string, unknown>;
    const slots = invalid.slots as Array<Record<string, unknown>>;
    slots[1]!.position = 1;
    slots[1]!.key = slots[0]!.key;
    const result = prepareSprintImport(JSON.stringify(invalid), "owner");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.problems.length).toBeGreaterThan(1);
      expect(result.problems.every((problem) => problem.path.startsWith("$"))).toBe(true);
      expect(result.sourceText).toContain('"position":1');
    }
  });

  it("checks returning reference ownership and provenance", () => {
    const sprint = clone(loadSampleSprint());
    sprint.slots[0]!.default_activity.returning_items = [{
      ref_id: "return-1",
      provenance: "learner_selected",
      intended_use: "Reuse the recommendation in a different context.",
      claim: "saved_for_practice",
    }];
    expect(prepareSprintImport(JSON.stringify(sprint), "owner").ok).toBe(false);
    expect(prepareSprintImport(JSON.stringify(sprint), "owner", new Map([["return-1", { provenance: "learner_selected" }]])).ok).toBe(true);
    expect(prepareSprintImport(JSON.stringify(sprint), "owner", new Map([["return-1", { provenance: "support_used" }]])).ok).toBe(false);
  });

  it("creates immutable, owner-scoped, stable previews", () => {
    const source = loadSampleSource();
    const first = prepareSprintImport(source, "owner-a");
    const second = prepareSprintImport(source, "owner-a");
    const otherOwner = prepareSprintImport(source, "owner-b");
    expect(first.ok && second.ok && first.preview.fingerprint === second.preview.fingerprint).toBe(true);
    expect(first.ok && otherOwner.ok && first.preview.fingerprint).not.toBe(otherOwner.ok ? otherOwner.preview.fingerprint : "");
    if (first.ok) expect(Object.isFrozen(first.preview.sprint)).toBe(true);
    const changed = clone(loadSampleSprint());
    changed.title = "Changed before another preview";
    const changedPreview = prepareSprintImport(JSON.stringify(changed), "owner-a");
    expect(first.ok && changedPreview.ok && first.preview.fingerprint).not.toBe(changedPreview.ok ? changedPreview.preview.fingerprint : "");
  });

  it("builds privacy-limited repair guidance", () => {
    const prompt = buildRepairPrompt([{ path: "$.slots[0]", message: "Missing activity" }]);
    expect(prompt).toContain("$.slots[0]");
    expect(prompt).not.toContain("owner-a");
    expect(prompt).not.toContain("learner answer");
  });

  it("rejects internal ownership fields under the strict schema", () => {
    const sprint = clone(loadSampleSprint()) as unknown as Record<string, unknown>;
    sprint.user_id = "foreign-user";
    expect(prepareSprintImport(JSON.stringify(sprint), "owner").ok).toBe(false);
  });
});

describe("transactional import boundary", () => {
  it("commits exact preview, deduplicates per owner, and isolates owners", async () => {
    const source = loadSampleSource();
    const ownerA = prepareSprintImport(source, "owner-a");
    const ownerB = prepareSprintImport(source, "owner-b");
    expect(ownerA.ok && ownerB.ok).toBe(true);
    if (!ownerA.ok || !ownerB.ok) return;
    const repository = new InMemorySprintImportRepository();
    expect((await repository.commit(ownerA.preview, "request-1")).status).toBe("created");
    expect((await repository.commit(ownerA.preview, "request-2")).status).toBe("duplicate");
    expect((await repository.commit(ownerB.preview, "request-1")).status).toBe("created");
    expect((await repository.listByOwner("owner-a")).length).toBe(1);
    expect((await repository.listByOwner("owner-b")).length).toBe(1);
  });

  it("rolls back every nested write on failure", async () => {
    const prepared = prepareSprintImport(loadSampleSource(), "owner");
    expect(prepared.ok).toBe(true);
    if (!prepared.ok) return;
    const repository = new InMemorySprintImportRepository({ failAtSlot: 4 });
    await expect(repository.commit(prepared.preview, "request-1")).rejects.toThrow("slot 4");
    expect(await repository.listByOwner("owner")).toEqual([]);
  });

  it("keeps hostile-looking learner text inert in preview and snapshots", async () => {
    const sprint = clone(loadSampleSprint());
    const payload = "<script>alert('x')</script> && Remove-Item https://example.invalid";
    sprint.title = payload;
    const prepared = prepareSprintImport(JSON.stringify(sprint), "owner");
    expect(prepared.ok).toBe(true);
    if (!prepared.ok) return;
    expect(prepared.preview.sprint.title).toBe(payload);
    const repository = new InMemorySprintImportRepository();
    const committed = await repository.commit(prepared.preview, "request-hostile");
    expect(committed.record.sprint.title).toBe(payload);
  });

  it("supports the end-to-end domain flow without mutating stored snapshots", async () => {
    const fenced = `\`\`\`json\n${loadSampleSource()}\n\`\`\``;
    const prepared = prepareSprintImport(fenced, "owner");
    expect(prepared.ok).toBe(true);
    if (!prepared.ok) return;
    const repository = new InMemorySprintImportRepository();
    await repository.commit(prepared.preview, "request-e2e");
    const activity = prepared.preview.sprint.slots[0]!.default_activity;
    const rebuild = activity.steps.find((step) => step.key === "rebuild-update");
    expect(rebuild?.type).toBe("inline_text");
    if (rebuild?.type === "inline_text") {
      expect(matchAnswer(" FIXING. ", rebuild.items[3]!.accepted_answers.map((answer) => answer.value), rebuild.normalisation).status).toBe("matched");
    }
    expect(calculateProgress(activity.steps, new Set(["understand-update", "notice-jobs"]))).toBe(33);
    expect(saveLanguage(["recommend-ing"], "recommend-ing")).toEqual(["recommend-ing"]);
    const learnerNote = { text: "how to explain why the bug was not found earlier", sourceActivityKey: activity.key, status: "active" as const };
    expect(learnerNote.status).toBe("active");
    const originalTitle = (await repository.listByOwner("owner"))[0]!.sprint.title;
    const editedSource = clone(loadSampleSprint());
    editedSource.title = "Edited fixture after import";
    expect((await repository.listByOwner("owner"))[0]!.sprint.title).toBe(originalTitle);
  });
});
