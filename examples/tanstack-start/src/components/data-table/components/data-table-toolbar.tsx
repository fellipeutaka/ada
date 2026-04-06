import { ToggleGroup, ToggleGroupItem } from "../../ui/toggle-group";
import type {
  Column,
  DataTableFilterActions,
  FiltersState,
  JoinOperator,
} from "../types";
import { ActiveFilters } from "./active-filters";
import { FilterActions } from "./filter-actions";
import { FilterSelector } from "./filter-selector";

interface DataTableToolbarProps<TData> {
  actions: DataTableFilterActions;
  columns: Array<Column<TData>>;
  filters: FiltersState;
  joinOperator: JoinOperator;
}

export function DataTableToolbar<TData>({
  columns,
  filters,
  joinOperator,
  actions,
}: DataTableToolbarProps<TData>) {
  return (
    <div className="flex flex-wrap items-center gap-2">
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
  );
}
