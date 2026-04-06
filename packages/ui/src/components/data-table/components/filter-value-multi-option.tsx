import {
  Autocomplete,
  AutocompleteCheckboxItem,
  AutocompleteEmpty,
  AutocompleteInput,
  AutocompleteList,
} from "@ada/ui/components/ui/autocomplete";
import { useMemo } from "react";
import type { Column, DataTableFilterActions, FilterModel } from "../types";

interface FilterValueMultiOptionProps<TData> {
  actions: DataTableFilterActions;
  column: Column<TData, "multiOption">;
  filter: FilterModel<"multiOption">;
}

interface OptionItem {
  count?: number;
  label: string;
  selected: boolean;
  value: string;
}

export function FilterValueMultiOption<TData>({
  filter,
  column,
  actions,
}: FilterValueMultiOptionProps<TData>) {
  const options = column.getOptions();
  const faceted = column.getFacetedUniqueValues();

  const items = useMemo<Array<OptionItem>>(() => {
    return options
      .map((opt) => ({
        value: opt.value,
        label: opt.label,
        selected: filter.values.includes(opt.value),
        count: faceted?.get(opt.value),
      }))
      .toSorted((a, b) => {
        if (a.selected && !b.selected) {
          return -1;
        }
        if (!a.selected && b.selected) {
          return 1;
        }
        return 0;
      });
  }, [options, filter.values, faceted]);

  const handleItemClick = (value: string) => {
    const isSelected = filter.values.includes(value);
    if (isSelected) {
      actions.removeFilterValue(column, [value]);
    } else {
      actions.addFilterValue(column, [value]);
    }
  };

  return (
    <Autocomplete
      autoHighlight="always"
      inline
      items={items}
      keepHighlight
      open
    >
      <AutocompleteInput
        className="w-full border-b p-2.5 text-xs"
        placeholder={`Search ${column.displayName}...`}
      />
      <AutocompleteEmpty>No options found.</AutocompleteEmpty>
      <AutocompleteList className="max-h-48 p-1">
        {(item: OptionItem) => (
          <AutocompleteCheckboxItem
            checked={item.selected}
            className="text-xs"
            key={item.value}
            onClick={() => handleItemClick(item.value)}
            value={item}
          >
            <span className="flex-1 truncate text-left">{item.label}</span>
            {item.count !== undefined && (
              <span className="text-muted-foreground text-xs tabular-nums">
                {item.count}
              </span>
            )}
          </AutocompleteCheckboxItem>
        )}
      </AutocompleteList>
    </Autocomplete>
  );
}

export function FilterValueMultiOptionDisplay({
  filter,
  column,
}: {
  filter: FilterModel<"multiOption">;
  column: Column<unknown, "multiOption">;
}) {
  const options = column.getOptions();
  if (filter.values.length === 0) {
    return <span className="text-muted-foreground">Select...</span>;
  }

  if (filter.values.length === 1) {
    const opt = options.find((o) => o.value === filter.values[0]);
    return (
      <span className="max-w-24 truncate">
        {opt?.label ?? filter.values[0]}
      </span>
    );
  }

  return <span>{filter.values.length} selected</span>;
}
