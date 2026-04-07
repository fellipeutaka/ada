import fs from "node:fs/promises";
import path from "node:path";

interface RegistryFileEntry {
  content?: string;
  path: string;
  target?: string;
  type: string;
}

interface RegistryEntry {
  dependencies?: Array<string>;
  files: Array<RegistryFileEntry>;
  name: string;
  registryDependencies?: Array<string>;
  type: string;
}

/**
 * Read a registry item's JSON from the public/r/ directory.
 */
export async function getRegistryItem(
  name: string
): Promise<RegistryEntry | null> {
  try {
    const filePath = path.join(process.cwd(), "public", "r", `${name}.json`);
    const content = await fs.readFile(filePath, "utf-8");
    return JSON.parse(content) as RegistryEntry;
  } catch {
    return null;
  }
}

export function getRegistryFileMeta(file: RegistryFileEntry) {
  const language = file.path.split(".").pop();
  const title = file.path.split("/").pop();
  return { language, title };
}
