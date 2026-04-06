import type { RegistryItem } from "shadcn/schema";

export const hooks: Array<RegistryItem> = [
  {
    name: "use-mobile",
    type: "registry:hook",
    files: [{ path: "src/hooks/use-mobile.ts", type: "registry:hook" }],
  },
];
