import type { Column, DataTableFilterActions, FiltersState } from "../types";
import { ActiveFilter } from "./active-filter";

interface ActiveFiltersProps<TData> {
  actions: DataTableFilterActions;
  columns: Array<Column<TData>>;
  filters: FiltersState;
}

export function ActiveFilters<TData>({
  filters,
  columns,
  actions,
}: ActiveFiltersProps<TData>) {
  if (filters.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {filters.map((filter) => {
        const column = columns.find((c) => c.id === filter.columnId);
        if (!column) {
          return null;
        }

        return (
          <ActiveFilter
            actions={actions}
            column={column}
            filter={filter}
            key={filter.filterId}
          />
        );
      })}
    </div>
  );
}
