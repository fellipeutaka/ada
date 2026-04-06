import type { RegistryItem } from "shadcn/schema";

export const lib: Array<RegistryItem> = [
  {
    name: "cva",
    type: "registry:lib",
    dependencies: ["clsx", "tailwind-merge"],
    files: [{ path: "src/lib/cva.ts", type: "registry:lib" }],
  },
];
