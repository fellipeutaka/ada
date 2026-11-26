import type { RegistryItem } from "shadcn/schema";

export const dataTable: Array<RegistryItem> = [
  {
    name: "data-table",
    type: "registry:ui",
    dependencies: [
      "@tanstack/react-table@^9.3.1",
      "@tanstack/react-pacer",
      "@phosphor-icons/react",
      "@base-ui/react",
      "date-fns",
      "zod",
      "react-day-picker",
    ],
    registryDependencies: [
      // shadcn components
      "button",
      "table",
      "dropdown-menu",
      "select",
      "skeleton",
      "toggle-group",
      "popover",
      "calendar",
      "input",
      "separator",
      "slider",
      // Ada components
      "@ada/autocomplete",
      "@ada/button-group",
    ],
    files: [
      // Root
      {
        path: "src/components/data-table/index.ts",
        type: "registry:ui",
        target: "data-table/index.ts",
      },
      {
        path: "src/components/data-table/config.ts",
        type: "registry:ui",
        target: "data-table/config.ts",
      },
      {
        path: "src/components/data-table/types.ts",
        type: "registry:ui",
        target: "data-table/types.ts",
      },
      // Components
      {
        path: "src/components/data-table/components/active-filter.tsx",
        type: "registry:ui",
        target: "data-table/components/active-filter.tsx",
      },
      {
        path: "src/components/data-table/components/active-filters.tsx",
        type: "registry:ui",
        target: "data-table/components/active-filters.tsx",
      },
      {
        path: "src/components/data-table/components/data-table.tsx",
        type: "registry:ui",
        target: "data-table/components/data-table.tsx",
      },
      {
        path: "src/components/data-table/components/data-table-column-header.tsx",
        type: "registry:ui",
        target: "data-table/components/data-table-column-header.tsx",
      },
      {
        path: "src/components/data-table/components/data-table-pagination.tsx",
        type: "registry:ui",
        target: "data-table/components/data-table-pagination.tsx",
      },
      {
        path: "src/components/data-table/components/data-table-skeleton.tsx",
        type: "registry:ui",
        target: "data-table/components/data-table-skeleton.tsx",
      },
      {
        path: "src/components/data-table/components/data-table-toolbar.tsx",
        type: "registry:ui",
        target: "data-table/components/data-table-toolbar.tsx",
      },
      {
        path: "src/components/data-table/components/data-table-view-options.tsx",
        type: "registry:ui",
        target: "data-table/components/data-table-view-options.tsx",
      },
      {
        path: "src/components/data-table/components/filter-actions.tsx",
        type: "registry:ui",
        target: "data-table/components/filter-actions.tsx",
      },
      {
        path: "src/components/data-table/components/filter-operator.tsx",
        type: "registry:ui",
        target: "data-table/components/filter-operator.tsx",
      },
      {
        path: "src/components/data-table/components/filter-selector.tsx",
        type: "registry:ui",
        target: "data-table/components/filter-selector.tsx",
      },
      {
        path: "src/components/data-table/components/filter-subject.tsx",
        type: "registry:ui",
        target: "data-table/components/filter-subject.tsx",
      },
      {
        path: "src/components/data-table/components/filter-value.tsx",
        type: "registry:ui",
        target: "data-table/components/filter-value.tsx",
      },
      {
        path: "src/components/data-table/components/filter-value-date.tsx",
        type: "registry:ui",
        target: "data-table/components/filter-value-date.tsx",
      },
      {
        path: "src/components/data-table/components/filter-value-multi-option.tsx",
        type: "registry:ui",
        target: "data-table/components/filter-value-multi-option.tsx",
      },
      {
        path: "src/components/data-table/components/filter-value-number.tsx",
        type: "registry:ui",
        target: "data-table/components/filter-value-number.tsx",
      },
      {
        path: "src/components/data-table/components/filter-value-option.tsx",
        type: "registry:ui",
        target: "data-table/components/filter-value-option.tsx",
      },
      {
        path: "src/components/data-table/components/filter-value-text.tsx",
        type: "registry:ui",
        target: "data-table/components/filter-value-text.tsx",
      },
      // Core
      {
        path: "src/components/data-table/core/filters.ts",
        type: "registry:ui",
        target: "data-table/core/filters.ts",
      },
      {
        path: "src/components/data-table/core/tanstack-table.ts",
        type: "registry:ui",
        target: "data-table/core/tanstack-table.ts",
      },
      // Hooks
      {
        path: "src/components/data-table/hooks/use-data-table.ts",
        type: "registry:ui",
        target: "data-table/hooks/use-data-table.ts",
      },
      {
        path: "src/components/data-table/hooks/use-data-table-filters.ts",
        type: "registry:ui",
        target: "data-table/hooks/use-data-table-filters.ts",
      },
      // Utils
      {
        path: "src/components/data-table/utils/column-pinning.ts",
        type: "registry:ui",
        target: "data-table/utils/column-pinning.ts",
      },
      {
        path: "src/components/data-table/utils/filter-fns.ts",
        type: "registry:ui",
        target: "data-table/utils/filter-fns.ts",
      },
      {
        path: "src/components/data-table/utils/helpers.ts",
        type: "registry:ui",
        target: "data-table/utils/helpers.ts",
      },
      {
        path: "src/components/data-table/utils/search-state.ts",
        type: "registry:ui",
        target: "data-table/utils/search-state.ts",
      },
      {
        path: "src/components/data-table/utils/search-schema.ts",
        type: "registry:ui",
        target: "data-table/utils/search-schema.ts",
      },
    ],
  },
  {
    name: "nuqs-adapter",
    type: "registry:lib",
    dependencies: ["nuqs"],
    registryDependencies: ["@ada/data-table"],
    files: [
      {
        path: "src/components/data-table/integrations/nuqs.ts",
        type: "registry:lib",
        target: "data-table/integrations/nuqs.ts",
      },
      {
        path: "src/components/data-table/integrations/nuqs.client.ts",
        type: "registry:lib",
        target: "data-table/integrations/nuqs.client.ts",
      },
    ],
  },
  {
    name: "tanstack-router-adapter",
    type: "registry:lib",
    dependencies: ["@tanstack/react-router"],
    registryDependencies: ["@ada/data-table"],
    files: [
      {
        path: "src/components/data-table/integrations/tanstack-router.ts",
        type: "registry:lib",
        target: "data-table/integrations/tanstack-router.ts",
      },
    ],
  },
  {
    name: "prisma-filter",
    type: "registry:lib",
    registryDependencies: ["@ada/data-table"],
    files: [
      {
        path: "src/components/data-table/integrations/prisma.ts",
        type: "registry:lib",
        target: "data-table/integrations/prisma.ts",
      },
    ],
  },
  {
    name: "drizzle-filter",
    type: "registry:lib",
    registryDependencies: ["@ada/data-table"],
    files: [
      {
        path: "src/components/data-table/integrations/drizzle.ts",
        type: "registry:lib",
        target: "data-table/integrations/drizzle.ts",
      },
    ],
  },
];
