import type { Registry } from "shadcn/schema";

import { dataTable } from "./data-table/_registry";
import { hooks } from "./hooks/_registry";
import { lib } from "./lib/_registry";
import { ui } from "./ui/_registry";

export const registry = {
  name: "ada",
  homepage: "https://ada-wong.vercel.app",
  items: [...ui, ...lib, ...hooks, ...dataTable],
} satisfies Registry;
