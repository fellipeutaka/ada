import { NumberField } from "@base-ui/react/number-field";
import { useDebouncedCallback } from "@tanstack/react-pacer";
import { useEffect, useState } from "react";
import { Input } from "../../ui/input";
import { Slider } from "../../ui/slider";
import type { Column, DataTableFilterActions, FilterModel } from "../types";

interface FilterValueNumberProps<TData> {
  actions: DataTableFilterActions;
  column: Column<TData, "number">;
  filter: FilterModel<"number">;
}

export function FilterValueNumber<TData>({
  filter,
  column,
  actions,
}: FilterValueNumberProps<TData>) {
  const [min, max] = column.getFacetedMinMaxValues() ?? [0, 100];
  const isBetween =
    filter.operator === "is between" || filter.operator === "is not between";

  const [value, setValue] = useState<Array<number>>(
    filter.values.length > 0 ? filter.values : isBetween ? [min, max] : [min]
  );

  const debouncedSet = useDebouncedCallback(
    (vals: Array<number>) => {
      actions.setFilterValue(column, vals);
    },
    { wait: 300 }
  );

  useEffect(() => {
    if (filter.values.length > 0) {
      setValue(filter.values);
    }
  }, [filter.values]);

  if (isBetween) {
    return (
      <div className="flex flex-col gap-3 p-1">
        <Slider
          max={max}
          min={min}
          onValueChange={(val) => {
            const arr = Array.isArray(val) ? [...val] : [val];
            setValue(arr);
            debouncedSet(arr);
          }}
          step={1}
          value={value.length >= 2 ? value : [min, max]}
        />
        <div className="flex items-center gap-2">
          <Input
            onChange={(e) => {
              const v = Number.parseFloat((e.target as HTMLInputElement).value);
              if (Number.isNaN(v)) {
                return;
              }
              const next = [v, value[1] ?? max];
              setValue(next);
              debouncedSet(next);
            }}
            type="number"
            value={value[0] ?? min}
          />
          <span className="text-muted-foreground text-xs">to</span>
          <Input
            onChange={(e) => {
              const v = Number.parseFloat((e.target as HTMLInputElement).value);
              if (Number.isNaN(v)) {
                return;
              }
              const next = [value[0] ?? min, v];
              setValue(next);
              debouncedSet(next);
            }}
            type="number"
            value={value[1] ?? max}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-1">
      <Slider
        max={max}
        min={min}
        onValueChange={(val) => {
          const arr = Array.isArray(val) ? [...val] : [val];
          setValue(arr);
          debouncedSet(arr);
        }}
        step={1}
        value={value}
      />
      <NumberField.Root
        max={max}
        min={min}
        onValueChange={(num) => {
          const next = num ? [num] : [];
          setValue(next);
          debouncedSet(next);
        }}
        value={value.at(0)}
      >
        <NumberField.Input render={<Input className="h-7 text-xs" />} />
      </NumberField.Root>
    </div>
  );
}

export function FilterValueNumberDisplay({
  filter,
}: {
  filter: FilterModel<"number">;
}) {
  if (filter.values.length === 0) {
    return <span className="text-muted-foreground">Any</span>;
  }

  if (filter.values.length === 2) {
    return (
      <span>
        {filter.values[0]} – {filter.values[1]}
      </span>
    );
  }

  return <span>{filter.values[0]}</span>;
}
