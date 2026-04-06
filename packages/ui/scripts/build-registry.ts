import fs from "node:fs/promises";
import path from "node:path";
import { registrySchema } from "shadcn/schema";
import { registry } from "../src/registry/registry";

const ROOT = path.resolve(import.meta.dirname, "..");
const REGISTRY_JSON = path.join(ROOT, "registry.json");
const OUTPUT_DIR = path.join(ROOT, "r");

const parsedRegistry = registrySchema.parse(registry);

async function buildRegistryJson() {
  await fs.writeFile(REGISTRY_JSON, JSON.stringify(parsedRegistry, null, 2));
  console.info(`  ${parsedRegistry.items.length} items -> registry.json`);
}

async function transformImports() {
  // Post-process: replace @ada/ui/ → @/ in generated JSON files
  const files = await fs.readdir(OUTPUT_DIR);
  const jsonFiles = files.filter((f) => f.endsWith(".json"));

  let transformedCount = 0;
  for (const file of jsonFiles) {
    const filePath = path.join(OUTPUT_DIR, file);
    const content = await fs.readFile(filePath, "utf-8");
    const transformed = content.replace(/@ada\/ui\//g, "@/");

    if (transformed !== content) {
      await fs.writeFile(filePath, transformed);
      transformedCount++;
    }
  }

  console.info(
    `  ${transformedCount} files had @ada/ui/ -> @/ import transforms`
  );
}

try {
  console.info("Building registry.json...");
  await buildRegistryJson();

  console.info("\nRunning shadcn build...");
  const { execSync } = await import("node:child_process");
  execSync("pnpm shadcn build --output ./r", {
    cwd: ROOT,
    stdio: "inherit",
  });

  console.info("\nTransforming imports...");
  await transformImports();

  console.info("\nDone!");
} catch (error) {
  console.error(error);
  process.exit(1);
}
