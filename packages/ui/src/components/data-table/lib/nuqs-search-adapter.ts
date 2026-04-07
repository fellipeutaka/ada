"use client";

import type { Options } from "nuqs";
import { useQueryStates } from "nuqs";
import { useCallback, useMemo } from "react";
import type { DataTableSearchState } from "../types";
import { dataTableParsers } from "./nuqs-parsers";
import type { SearchStateAdapter } from "./search-state";

export { dataTableParsers } from "./nuqs-parsers";

/**
 * Creates a SearchStateAdapter backed by nuqs URL query state.
 *
 * This is the ONLY file in data-table/ that imports hooks from nuqs.
 * All UI components consume the abstract SearchStateAdapter interface.
 *
 * Requires a NuqsAdapter provider to be set up in the app layout.
 *
 * Defaults to `shallow: false` so URL changes trigger server re-renders
 * (required for server-side filtering/sorting/pagination).
 */
export function useNuqsSearchAdapter(
  options?: Options
): SearchStateAdapter<DataTableSearchState> {
  const [state, setState] = useQueryStates(dataTableParsers, {
    history: "replace",
    shallow: false,
    ...options,
  });

  const search = useMemo(
    () => ({
      page: state.page,
      perPage: state.perPage,
      joinOperator: state.joinOperator,
      filters: state.filters,
      sort: state.sort,
    }),
    [state.page, state.perPage, state.joinOperator, state.filters, state.sort]
  ) as DataTableSearchState;

  const write = useCallback(
    (updater: (prev: DataTableSearchState) => DataTableSearchState) => {
      setState(updater(search));
    },
    [search, setState]
  );

  return useMemo(
    () => ({
      read: () => search,
      write,
    }),
    [search, write]
  );
}
