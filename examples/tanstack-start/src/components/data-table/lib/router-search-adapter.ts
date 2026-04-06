import { useNavigate, useSearch } from "@tanstack/react-router";
import { useCallback, useMemo } from "react";
import type { DataTableSearchState } from "../types";
import { dataTableSearchSchema, defaultDataTableSearch } from "./search-schema";
import type { SearchStateAdapter } from "./search-state";

/**
 * Creates a SearchStateAdapter backed by TanStack Router search params.
 *
 * This is the ONLY file in data-table/ that imports from @tanstack/react-router.
 * All UI components consume the abstract SearchStateAdapter interface.
 *
 * Uses `strict: false` so it works as a shared component across any route
 * that includes data table search params. The Zod schema validates and
 * falls back to defaults for any missing/invalid params.
 */
export function useRouterSearchAdapter(): SearchStateAdapter<DataTableSearchState> {
  const rawSearch = useSearch({ strict: false });
  const navigate = useNavigate();

  const search = useMemo(() => {
    const result = dataTableSearchSchema.safeParse(rawSearch);
    return (
      result.success ? result.data : defaultDataTableSearch
    ) as DataTableSearchState;
  }, [rawSearch]);

  const write = useCallback(
    (updater: (prev: DataTableSearchState) => DataTableSearchState) => {
      const next = updater(search);
      // biome-ignore lint/suspicious/noExplicitAny: search params typing
      navigate({ search: next as any, replace: true });
    },
    [search, navigate]
  );

  return useMemo(
    () => ({
      read: () => search,
      write,
    }),
    [search, write]
  );
}
