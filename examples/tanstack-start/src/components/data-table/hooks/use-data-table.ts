import {
  type ColumnDef,
  type ColumnFiltersState,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { createTSTColumns, createTSTFilters } from "../core/tanstack-table";
import type { SearchStateAdapter } from "../lib/search-state";
import type {
  Column,
  ColumnConfig,
  DataTableSearchState,
  FilterStrategy,
} from "../types";
import {
  type UseDataTableFiltersOptions,
  useDataTableFilters,
} from "./use-data-table-filters";

export interface UseDataTableOptions<
  TData,
  // biome-ignore lint/suspicious/noExplicitAny: generic column config
  TColumns extends ReadonlyArray<ColumnConfig<TData, any, any, any>>,
  TStrategy extends FilterStrategy,
> extends Omit<
    UseDataTableFiltersOptions<TData, TColumns, TStrategy>,
    "adapter"
  > {
  adapter?: SearchStateAdapter<DataTableSearchState>;
  // biome-ignore lint/suspicious/noExplicitAny: generic column defs
  columns: Array<ColumnDef<TData, any>>;
  pageCount?: number;
}

export function useDataTable<
  TData,
  // biome-ignore lint/suspicious/noExplicitAny: generic column config
  TColumns extends ReadonlyArray<ColumnConfig<TData, any, any, any>>,
  TStrategy extends FilterStrategy,
>({
  data,
  columns: columnDefs,
  columnsConfig,
  strategy,
  adapter,
  pageCount,
  options,
  faceted,
}: UseDataTableOptions<TData, TColumns, TStrategy>) {
  const {
    columns: filterColumns,
    filters,
    joinOperator,
    actions,
  } = useDataTableFilters({
    strategy,
    data,
    columnsConfig,
    adapter,
    options,
    faceted,
  });

  // Patch column defs with filter functions
  const patchedColumns = useMemo(
    () =>
      createTSTColumns({
        columns: columnDefs,
        configs: filterColumns as Array<Column<TData>>,
      }),
    [columnDefs, filterColumns]
  );

  // Convert filters to TST format
  const columnFilters: ColumnFiltersState = useMemo(
    () => createTSTFilters(filters),
    [filters]
  );

  // Pagination: from adapter or local state
  const searchState = adapter?.read();
  const [localPagination, setLocalPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const pagination: PaginationState = adapter
    ? {
        pageIndex: (searchState?.page ?? 1) - 1,
        pageSize: searchState?.perPage ?? 10,
      }
    : localPagination;

  // Sorting: from adapter or local state
  const [localSorting, setLocalSorting] = useState<SortingState>([]);
  const sorting: SortingState = adapter
    ? (searchState?.sort ?? [])
    : localSorting;

  // Column visibility
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  // Row selection
  const [rowSelection, setRowSelection] = useState({});

  const isServerSide = strategy === "server";

  const table = useReactTable({
    data,
    columns: patchedColumns,
    pageCount: isServerSide ? pageCount : undefined,
    state: {
      columnFilters,
      sorting,
      pagination,
      columnVisibility,
      rowSelection,
    },
    onSortingChange: (updater) => {
      const next = typeof updater === "function" ? updater(sorting) : updater;
      if (adapter) {
        adapter.write((prev) => ({
          ...prev,
          sort: next.map((s) => ({ id: s.id, desc: s.desc })),
          page: 1,
        }));
      } else {
        setLocalSorting(next);
      }
    },
    onPaginationChange: (updater) => {
      const next =
        typeof updater === "function" ? updater(pagination) : updater;
      if (adapter) {
        adapter.write((prev) => ({
          ...prev,
          page: next.pageIndex + 1,
          perPage: next.pageSize,
        }));
      } else {
        setLocalPagination(next);
      }
    },
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: isServerSide ? undefined : getFilteredRowModel(),
    getPaginationRowModel: isServerSide ? undefined : getPaginationRowModel(),
    getSortedRowModel: isServerSide ? undefined : getSortedRowModel(),
    getFacetedRowModel: isServerSide ? undefined : getFacetedRowModel(),
    getFacetedUniqueValues: isServerSide ? undefined : getFacetedUniqueValues(),
    manualFiltering: isServerSide,
    manualPagination: isServerSide,
    manualSorting: isServerSide,
    enableRowSelection: true,
  });

  return {
    table,
    filterColumns,
    filters,
    joinOperator,
    actions,
  };
}
