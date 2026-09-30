import sampleSprint from "../content/examples/sample-sprint.v1.json";
import { describe, expect, it } from "vitest";
import { LOCAL_STORAGE_KEY, emptyLocalState, loadLocalState, localReducer, saveLocalState } from "../src/app/state.js";
import type { Sprint } from "../src/domain/content/schema.js";

const sample = sampleSprint as Sprint;

describe("local learner state", () => {
  it("accepts an immutable sprint snapshot and deduplicates saved language", () => {
    let state = localReducer(emptyLocalState(), { type: "accept_sprint", sprint: sample });
    const activity = sample.slots[0]!.default_activity;
    state = localReducer(state, { type: "open_activity", activityKey: activity.key });
    state = localReducer(state, { type: "toggle_glossary", activityKey: activity.key, glossaryKey: "recommend-ing" });
    state = localReducer(state, { type: "toggle_glossary", activityKey: activity.key, glossaryKey: "recommend-ing" });
    state = localReducer(state, { type: "toggle_glossary", activityKey: activity.key, glossaryKey: "recommend-ing" });
    expect(state.activityWork[activity.key]!.savedGlossaryKeys).toEqual(["recommend-ing"]);
    expect(state.sprints[sample.sprint_key]).not.toBe(sample);
  });

  it("restores valid state and safely ignores malformed or unsupported data", () => {
    const storage = new Map<string, string>();
    const adapter = { getItem: (key: string) => storage.get(key) ?? null, setItem: (key: string, value: string) => storage.set(key, value) };
    let state = localReducer(emptyLocalState(), { type: "accept_sprint", sprint: sample });
    const activity = sample.slots[0]!.default_activity;
    state = localReducer(state, { type: "open_activity", activityKey: activity.key });
    state = localReducer(state, { type: "set_answer", activityKey: activity.key, stepKey: "retrieve-update", answer: "My saved answer." });
    saveLocalState(state, adapter);
    expect(loadLocalState(adapter).activityWork[activity.key]!.answers["retrieve-update"]).toBe("My saved answer.");
    storage.set(LOCAL_STORAGE_KEY, "not-json");
    expect(loadLocalState(adapter).sprints).toEqual({});
    storage.set(LOCAL_STORAGE_KEY, JSON.stringify({ ...state, version: 999 }));
    expect(loadLocalState(adapter).sprints).toEqual({});
  });
});
