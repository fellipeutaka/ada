import { XIcon } from "@phosphor-icons/react";
import { Button } from "../../ui/button";
import { ButtonGroup } from "../../ui/button-group";
import type { Column, DataTableFilterActions, FilterModel } from "../types";
import { FilterOperator } from "./filter-operator";
import { FilterSubject } from "./filter-subject";
import { FilterValue } from "./filter-value";

interface ActiveFilterProps<TData> {
  actions: DataTableFilterActions;
  column: Column<TData>;
  filter: FilterModel;
}

export function ActiveFilter<TData>({
  filter,
  column,
  actions,
}: ActiveFilterProps<TData>) {
  return (
    <ButtonGroup>
      <FilterSubject column={column} />
      <FilterOperator actions={actions} column={column} filter={filter} />
      <FilterValue actions={actions} column={column} filter={filter} />
      <Button
        onClick={() => actions.removeFilter(filter.columnId)}
        size="icon-xs"
        variant="outline"
      >
        <XIcon />
        <span className="sr-only">Remove filter</span>
      </Button>
    </ButtonGroup>
  );
}
