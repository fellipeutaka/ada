import {
  ToggleGroup,
  ToggleGroupItem,
} from "@ada/ui/components/ui/toggle-group";
import type { RowData } from "@tanstack/react-table";
import type { DataTableInstance } from "../core/tanstack-table";
import type {
  Column,
  DataTableFilterActions,
  FiltersState,
  JoinOperator,
} from "../types";
import { ActiveFilters } from "./active-filters";
import { DataTableViewOptions } from "./data-table-view-options";
import { FilterActions } from "./filter-actions";
import { FilterSelector } from "./filter-selector";

interface DataTableToolbarProps<TData extends RowData> {
  actions: DataTableFilterActions;
  columns: Array<Column<TData>>;
  filters: FiltersState;
  joinOperator: JoinOperator;
  table?: DataTableInstance<TData>;
}

export function DataTableToolbar<TData extends RowData>({
  columns,
  filters,
  joinOperator,
  actions,
  table,
}: DataTableToolbarProps<TData>) {
  return (
    <div className="flex w-full items-start justify-between gap-2">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <FilterSelector actions={actions} columns={columns} filters={filters} />
        {filters.length > 1 && (
          <ToggleGroup
            onValueChange={(value) => {
              const next = value.at(-1) as JoinOperator | undefined;
              if (next) {
                actions.setJoinOperator(next);
              }
            }}
            size="xs"
            value={[joinOperator]}
            variant="outline"
          >
            <ToggleGroupItem value="and">And</ToggleGroupItem>
            <ToggleGroupItem value="or">Or</ToggleGroupItem>
          </ToggleGroup>
        )}
        <ActiveFilters actions={actions} columns={columns} filters={filters} />
        <FilterActions actions={actions} filters={filters} />
      </div>
      {!!table && (
        <div className="flex items-center gap-2">
          <DataTableViewOptions table={table} />
        </div>
      )}
    </div>
  );
}
