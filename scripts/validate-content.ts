import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { prepareSprintImport } from "../src/domain/content/import.js";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const paths = process.argv.slice(2);
const contentPaths = paths.length > 0 ? paths : ["content/examples/sample-sprint.v1.json"];

let failed = false;
for (const contentPath of contentPaths) {
  const absolute = resolve(projectRoot, contentPath);
  const source = await readFile(absolute, "utf8");
  const result = prepareSprintImport(source, "content-validation");
  if (!result.ok) {
    failed = true;
    console.error(`${contentPath}: invalid`);
    result.problems.forEach((problem) => console.error(`  ${problem.path}: ${problem.message}`));
  } else {
    console.log(`${contentPath}: valid (${result.preview.sprint.slots.length} slots)`);
  }
}

if (failed) process.exitCode = 1;
