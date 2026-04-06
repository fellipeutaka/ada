import { useDebouncedCallback } from "@tanstack/react-pacer";
import { useEffect, useState } from "react";
import { Input } from "../../ui/input";
import type { Column, DataTableFilterActions, FilterModel } from "../types";

interface FilterValueTextProps<TData> {
  actions: DataTableFilterActions;
  column: Column<TData, "text">;
  filter: FilterModel<"text">;
}

export function FilterValueText<TData>({
  filter,
  column,
  actions,
}: FilterValueTextProps<TData>) {
  const [value, setValue] = useState(filter.values.at(0) ?? "");

  const debouncedSet = useDebouncedCallback(
    (val: string) => {
      if (val.trim() === "") {
        actions.removeFilter(column.id);
      } else {
        actions.setFilterValue(column, [val]);
      }
    },
    { wait: 300 }
  );

  useEffect(() => {
    setValue(filter.values.at(0) ?? "");
  }, [filter.values]);

  return (
    <Input
      onChange={(e) => {
        const val = e.target.value;
        setValue(val);
        debouncedSet(val);
      }}
      placeholder={`Filter ${column.displayName}...`}
      value={value}
    />
  );
}

export function FilterValueTextDisplay({
  filter,
}: {
  filter: FilterModel<"text">;
}) {
  const value = filter.values.at(0);
  if (!value) {
    return <span className="text-muted-foreground">Empty</span>;
  }

  return <span className="max-w-24 truncate">{value}</span>;
}
