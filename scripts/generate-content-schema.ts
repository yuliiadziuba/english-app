import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import { SprintSchema } from "../src/domain/content/schema.js";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = resolve(projectRoot, "content/schema/sprint-content.v1.schema.json");
const generated = `${JSON.stringify(z.toJSONSchema(SprintSchema, { target: "draft-2020-12" }), null, 2)}\n`;

if (process.argv.includes("--check")) {
  const current = await readFile(outputPath, "utf8").catch(() => "");
  if (current !== generated) {
    console.error("Generated sprint schema is out of date. Run npm run schema:generate.");
    process.exitCode = 1;
  } else {
    console.log("Generated sprint schema is up to date.");
  }
} else {
  await writeFile(outputPath, generated, "utf8");
  console.log(`Wrote ${outputPath}`);
}
