import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { Sprint } from "../src/domain/content/schema.js";

export function loadSampleSource(): string {
  return readFileSync(resolve("content/examples/sample-sprint.v1.json"), "utf8");
}

export function loadSampleSprint(): Sprint {
  return JSON.parse(loadSampleSource()) as Sprint;
}

export function clone<T>(value: T): T {
  return structuredClone(value);
}
