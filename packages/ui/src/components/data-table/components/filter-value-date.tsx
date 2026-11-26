import { Calendar } from "@ada/ui/components/ui/calendar";
import { format } from "date-fns";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import type { Column, DataTableFilterActions, FilterModel } from "../types";

interface FilterValueDateProps<TData> {
  actions: DataTableFilterActions;
  column: Column<TData, "date">;
  filter: FilterModel<"date">;
}

export function FilterValueDate<TData>({
  filter,
  column,
  actions,
}: FilterValueDateProps<TData>) {
  const isBetween =
    filter.operator === "is between" || filter.operator === "is not between";

  const [range, setRange] = useState<DateRange | undefined>(() => {
    if (filter.values.length >= 2) {
      return {
        from: new Date(filter.values[0]),
        to: new Date(filter.values[1]),
      };
    }
    if (filter.values.length === 1) {
      return { from: new Date(filter.values[0]) };
    }
  });

  if (isBetween) {
    return (
      <Calendar
        defaultMonth={range?.from}
        mode="range"
        onSelect={(newRange) => {
          if (!newRange) {
            return;
          }
          setRange(newRange);
          if (newRange.from && newRange.to) {
            actions.setFilterValue(column, [newRange.from, newRange.to]);
          }
        }}
        selected={range}
      />
    );
  }

  return (
    <Calendar
      defaultMonth={filter.values[0] ? new Date(filter.values[0]) : undefined}
      mode="single"
      onSelect={(date) => {
        if (!date) {
          return;
        }
        actions.setFilterValue(column, [date]);
      }}
      selected={filter.values[0] ? new Date(filter.values[0]) : undefined}
    />
  );
}

export function FilterValueDateDisplay({
  filter,
}: {
  filter: FilterModel<"date">;
}) {
  if (filter.values.length === 0) {
    return <span className="text-muted-foreground">Pick date</span>;
  }

  const fmt = (d: Date) => format(new Date(d), "MMM d, yyyy");

  if (filter.values.length >= 2) {
    return (
      <span>
        {fmt(filter.values[0])} – {fmt(filter.values[1])}
      </span>
    );
  }

  return <span>{fmt(filter.values[0])}</span>;
}
