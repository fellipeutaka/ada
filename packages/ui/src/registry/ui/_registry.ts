import type { RegistryItem } from "shadcn/schema";

export const ui: Array<RegistryItem> = [
  {
    name: "action-bar",
    type: "registry:ui",
    dependencies: ["@base-ui/react", "@tanstack/react-hotkeys"],
    files: [{ path: "src/components/ui/action-bar.tsx", type: "registry:ui" }],
  },
  {
    name: "autocomplete",
    type: "registry:ui",
    dependencies: ["@base-ui/react", "@phosphor-icons/react"],
    files: [
      { path: "src/components/ui/autocomplete.tsx", type: "registry:ui" },
    ],
  },
  {
    name: "button-group",
    type: "registry:ui",
    dependencies: ["@base-ui/react", "class-variance-authority"],
    registryDependencies: ["separator"],
    files: [
      { path: "src/components/ui/button-group.tsx", type: "registry:ui" },
    ],
  },
  {
    name: "toggle",
    type: "registry:ui",
    dependencies: ["@base-ui/react", "class-variance-authority"],
    files: [{ path: "src/components/ui/toggle.tsx", type: "registry:ui" }],
  },
];
