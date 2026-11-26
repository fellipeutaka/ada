import type {
  ColumnDef,
  ColumnFiltersState,
  ReactTable,
  Row,
  RowData,
} from "@tanstack/react-table";
import {
  columnFacetingFeature,
  columnFilteringFeature,
  columnOrderingFeature,
  columnPinningFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  createFacetedRowModel,
  createFacetedUniqueValues,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFns,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFns,
  tableFeatures,
} from "@tanstack/react-table";
import type { Column, FilterModel, FiltersState } from "../types";
import {
  dateFilterFn as dateFn,
  multiOptionFilterFn,
  numberFilterFn as numberFn,
  optionFilterFn,
  textFilterFn as textFn,
} from "../utils/filter-fns";
import {
  isColumnOption,
  isColumnOptionArray,
  isStringArray,
} from "../utils/helpers";

export const dataTableFeatures = tableFeatures({
  columnFilteringFeature,
  columnFacetingFeature,
  columnOrderingFeature,
  columnPinningFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  filteredRowModel: createFilteredRowModel(),
  facetedRowModel: createFacetedRowModel(),
  facetedUniqueValues: createFacetedUniqueValues(),
  paginatedRowModel: createPaginatedRowModel(),
  sortedRowModel: createSortedRowModel(),
  filterFns,
  sortFns,
});

export type DataTableFeatures = typeof dataTableFeatures;
export type DataTableInstance<TData extends RowData> = ReactTable<
  DataTableFeatures,
  TData
>;

interface CreateTSTColumnsInput<TData extends RowData> {
  // biome-ignore lint/suspicious/noExplicitAny: generic column defs
  columns: Array<ColumnDef<DataTableFeatures, TData, any>>;
  configs: Array<Column<TData>>;
}

/**
 * Patches TanStack Table column defs with the correct `filterFn`
 * based on each column's filter config type.
 */
export function createTSTColumns<TData extends RowData>({
  columns,
  configs,
}: CreateTSTColumnsInput<TData>): Array<ColumnDef<DataTableFeatures, TData>> {
  const result: Array<ColumnDef<DataTableFeatures, TData>> = [];

  for (const col of columns) {
    const colId = col.id ?? (col as { accessorKey?: string }).accessorKey;
    const config = configs.find((c) => c.id === colId);

    if (col.enableColumnFilter === false || !config) {
      result.push(col);
      continue;
    }

    // Shallow-clone so we never mutate the caller's column defs
    const patched = { ...col };

    patched.meta = {
      ...patched.meta,
      label: config.displayName,
      icon: config.icon,
    };

    if (config.type === "text") {
      patched.filterFn = (
        row: Row<DataTableFeatures, TData>,
        columnId: string,
        filterValue: FilterModel<"text">
      ) => textFn(row.getValue<string>(columnId) ?? "", filterValue);
      result.push(patched);
      continue;
    }

    if (config.type === "number") {
      patched.filterFn = (
        row: Row<DataTableFeatures, TData>,
        columnId: string,
        filterValue: FilterModel<"number">
      ) => numberFn(row.getValue<number>(columnId), filterValue);
      result.push(patched);
      continue;
    }

    if (config.type === "date") {
      patched.filterFn = (
        row: Row<DataTableFeatures, TData>,
        columnId: string,
        filterValue: FilterModel<"date">
      ) => dateFn(row.getValue<Date>(columnId), filterValue);
      result.push(patched);
      continue;
    }

    if (config.type === "option") {
      patched.filterFn = (
        row: Row<DataTableFeatures, TData>,
        columnId: string,
        filterValue: FilterModel<"option">
      ) => {
        const value = row.getValue<unknown>(columnId);
        if (!value) {
          return false;
        }
        if (typeof value === "string") {
          return optionFilterFn(value, filterValue);
        }
        if (isColumnOption(value)) {
          return optionFilterFn(value.value, filterValue);
        }
        const sanitized = config.transformOptionFn?.(value as never);
        return sanitized ? optionFilterFn(sanitized.value, filterValue) : false;
      };
    }

    if (config.type === "multiOption") {
      patched.filterFn = (
        row: Row<DataTableFeatures, TData>,
        columnId: string,
        filterValue: FilterModel<"multiOption">
      ) => {
        const value = row.getValue(columnId);
        if (!value) {
          return false;
        }
        if (isStringArray(value)) {
          return multiOptionFilterFn(value, filterValue);
        }
        if (isColumnOptionArray(value)) {
          return multiOptionFilterFn(
            value.map((v) => v.value),
            filterValue
          );
        }
        const { transformOptionFn } = config;
        if (!(transformOptionFn && Array.isArray(value))) {
          return false;
        }
        const sanitized = (value as Array<never>).map(
          (option) => transformOptionFn(option).value
        );
        return multiOptionFilterFn(sanitized, filterValue);
      };
    }

    result.push(patched);
  }

  return result;
}

/**
 * Converts FiltersState to TanStack Table's ColumnFiltersState.
 */
export function createTSTFilters(filters: FiltersState): ColumnFiltersState {
  return filters.map((filter) => ({ id: filter.columnId, value: filter }));
}
