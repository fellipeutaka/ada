import { useState } from "react";
import { Button } from "../../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { isValuelessOperator } from "../lib/helpers";
import type { Column, DataTableFilterActions, FilterModel } from "../types";
import { FilterValueDate, FilterValueDateDisplay } from "./filter-value-date";
import {
  FilterValueMultiOption,
  FilterValueMultiOptionDisplay,
} from "./filter-value-multi-option";
import {
  FilterValueNumber,
  FilterValueNumberDisplay,
} from "./filter-value-number";
import {
  FilterValueOption,
  FilterValueOptionDisplay,
} from "./filter-value-option";
import { FilterValueText, FilterValueTextDisplay } from "./filter-value-text";

interface FilterValueProps<TData> {
  actions: DataTableFilterActions;
  column: Column<TData>;
  filter: FilterModel;
}

export function FilterValue<TData>({
  filter,
  column,
  actions,
}: FilterValueProps<TData>) {
  const [open, setOpen] = useState(false);

  if (isValuelessOperator(filter.operator)) {
    return null;
  }

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger render={<Button size="xs" variant="outline" />}>
        <FilterValueDisplay column={column} filter={filter} />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto min-w-52 gap-0 p-0">
        <FilterValueController
          actions={actions}
          column={column}
          filter={filter}
        />
      </PopoverContent>
    </Popover>
  );
}

function FilterValueDisplay<TData>({
  filter,
  column,
}: {
  filter: FilterModel;
  column: Column<TData>;
}) {
  switch (column.type) {
    case "text":
      return <FilterValueTextDisplay filter={filter as FilterModel<"text">} />;
    case "number":
      return (
        <FilterValueNumberDisplay filter={filter as FilterModel<"number">} />
      );
    case "date":
      return <FilterValueDateDisplay filter={filter as FilterModel<"date">} />;
    case "option":
      return (
        <FilterValueOptionDisplay
          column={column as unknown as Column<unknown, "option">}
          filter={filter as FilterModel<"option">}
        />
      );
    case "multiOption":
      return (
        <FilterValueMultiOptionDisplay
          column={column as unknown as Column<unknown, "multiOption">}
          filter={filter as FilterModel<"multiOption">}
        />
      );
    default:
      throw new Error(`Unsupported column type: ${column.type}`);
  }
}

function FilterValueController<TData>({
  filter,
  column,
  actions,
}: FilterValueProps<TData>) {
  switch (column.type) {
    case "text":
      return (
        <FilterValueText
          actions={actions}
          column={column as Column<TData, "text">}
          filter={filter as FilterModel<"text">}
        />
      );
    case "number":
      return (
        <FilterValueNumber
          actions={actions}
          column={column as Column<TData, "number">}
          filter={filter as FilterModel<"number">}
        />
      );
    case "date":
      return (
        <FilterValueDate
          actions={actions}
          column={column as Column<TData, "date">}
          filter={filter as FilterModel<"date">}
        />
      );
    case "option":
      return (
        <FilterValueOption
          actions={actions}
          column={column as Column<TData, "option">}
          filter={filter as FilterModel<"option">}
        />
      );
    case "multiOption":
      return (
        <FilterValueMultiOption
          actions={actions}
          column={column as Column<TData, "multiOption">}
          filter={filter as FilterModel<"multiOption">}
        />
      );
    default:
      throw new Error(`Unsupported column type: ${column.type}`);
  }
}
