import { describe, expect, it } from "vitest";
import { matchAnswer } from "../src/domain/content/answers.js";
import {
  evidenceFromActivityAssessment,
  evidenceFromHelpOpen,
  evidenceFromSave,
  saveLanguage,
} from "../src/domain/content/learning-evidence.js";
import { calculateProgress, hasSubstantiveAttempt, shouldCountSprintSlot } from "../src/domain/content/progress.js";
import { SprintSchema } from "../src/domain/content/schema.js";
import { loadSampleSprint } from "./helpers.js";

const normalisation = {
  ignore_case: true,
  collapse_whitespace: true,
  ignore_terminal_punctuation: true,
};

describe("closed answer matching", () => {
  it("accepts only configured surface normalisation", () => {
    expect(matchAnswer("  FIXING. ", ["fixing"], normalisation).status).toBe("matched");
    expect(matchAnswer("recommend to fix", ["recommend fixing"], normalisation).status).toBe("unmatched");
  });

  it("preserves raw unmatched input", () => {
    expect(matchAnswer("another plausible phrase", ["target"], normalisation)).toMatchObject({
      raw: "another plausible phrase",
      status: "unmatched",
    });
  });
});

describe("learning evidence", () => {
  it("keeps help opens separate from explicit saves", () => {
    expect(evidenceFromHelpOpen("recommend-ing")).toMatchObject({ type: "translation_opened", provenance: "observed_support" });
    expect(evidenceFromSave("recommend-ing")).toMatchObject({ type: "saved_for_practice", provenance: "explicit_selection" });
  });

  it("deduplicates saved language", () => {
    expect(saveLanguage(["recommend-ing"], "recommend-ing")).toEqual(["recommend-ing"]);
  });

  it("keeps whole-activity support assessment at activity scope", () => {
    expect(evidenceFromActivityAssessment("need_support")).toEqual({
      type: "self_reported_support",
      scope: "activity",
      provenance: "self_report",
    });
    expect(evidenceFromActivityAssessment("clear")).toBeUndefined();
  });
});

describe("progress and finish eligibility", () => {
  const activity = SprintSchema.parse(loadSampleSprint()).slots[0]!.default_activity;

  it("rounds two of six planned steps to 33 percent", () => {
    expect(calculateProgress(activity.steps, new Set(["understand-update", "notice-jobs"]))).toBe(33);
  });

  it("does not count hints or correctness in progress", () => {
    expect(calculateProgress(activity.steps, new Set(["rebuild-update"]))).toBe(17);
  });

  it("does not count an early finish without a substantive answer", () => {
    expect(shouldCountSprintSlot(false, true, [])).toBe(false);
    expect(hasSubstantiveAttempt([{ stepKey: "x", answer: "  ", submitted: true, supportUsed: false }])).toBe(false);
  });

  it("counts an incorrect substantive attempt once", () => {
    const attempts = [{ stepKey: "rebuild", answer: "wrong", submitted: true, supportUsed: true, matched: false }];
    expect(shouldCountSprintSlot(false, true, attempts)).toBe(true);
    expect(shouldCountSprintSlot(true, true, attempts)).toBe(false);
  });
});

describe("bug-before-release fixture", () => {
  const activity = SprintSchema.parse(loadSampleSprint()).slots[0]!.default_activity;

  it("contains all six learning phases and exact target responses", () => {
    expect(activity.steps.map((step) => step.phase)).toEqual(["understand", "notice", "rebuild", "retrieve", "transfer", "reflect"]);
    const rebuild = activity.steps.find((step) => step.key === "rebuild-update");
    expect(rebuild?.type).toBe("inline_text");
    if (rebuild?.type === "inline_text") {
      const values = rebuild.items.flatMap((item) => item.accepted_answers.map((answer) => answer.value));
      expect(values).toEqual([
        "critical issue", "critical problem", "affects", "from completing", "from finishing", "fixing", "resolving",
      ]);
      for (const item of rebuild.items) {
        for (const answer of item.accepted_answers) {
          expect(matchAnswer(answer.value, item.accepted_answers.map((candidate) => candidate.value), rebuild.normalisation).status).toBe("matched");
        }
      }
      expect(matchAnswer("recommend to fix", rebuild.items[3]!.accepted_answers.map((answer) => answer.value), rebuild.normalisation).status).toBe("unmatched");
    }
  });

  it("keeps retrieval source hidden and provides comparison examples", () => {
    const retrieve = activity.steps.find((step) => step.key === "retrieve-update");
    const transfer = activity.steps.find((step) => step.key === "transfer-release-decision");
    expect(retrieve?.type === "free_text" && retrieve.source_visibility).toBe("hidden_until_help");
    expect(transfer?.type === "free_text" && transfer.natural_examples.length).toBe(2);
  });
});
