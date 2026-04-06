import { GearSixIcon } from "@phosphor-icons/react";
import type { Table } from "@tanstack/react-table";
import { useMemo } from "react";
import {
  Autocomplete,
  AutocompleteCheckboxItem,
  AutocompleteEmpty,
  AutocompleteInput,
  AutocompleteList,
} from "../../ui/autocomplete";
import { Button } from "../../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";

interface DataTableViewOptionsProps<TData> {
  disabled?: boolean;
  table: Table<TData>;
}

interface ColumnItem {
  label: string;
  value: string;
}

export function DataTableViewOptions<TData>({
  table,
  disabled,
}: DataTableViewOptionsProps<TData>) {
  const columns = useMemo(
    () =>
      table
        .getAllColumns()
        .filter(
          (column) =>
            typeof column.accessorFn !== "undefined" && column.getCanHide()
        ),
    [table]
  );

  const items: Array<ColumnItem> = columns.map((col) => ({
    value: col.id,
    label: col.columnDef.meta?.label ?? col.id,
  }));

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button disabled={disabled} size="xs" variant="outline">
            <GearSixIcon data-icon="inline-start" />
            View
          </Button>
        }
      />
      <PopoverContent align="end" className="w-44 gap-0 p-0">
        <Autocomplete
          autoHighlight="always"
          inline
          items={items}
          keepHighlight
          open
        >
          <AutocompleteInput
            autoFocus
            className="w-full border-b p-2.5 text-xs"
            placeholder="Search columns..."
          />
          <AutocompleteEmpty>No columns found.</AutocompleteEmpty>
          <AutocompleteList className="max-h-48 p-1">
            {(item: ColumnItem) => {
              const col = columns.find((c) => c.id === item.value);
              const Icon = col?.columnDef.meta?.icon;
              return (
                <AutocompleteCheckboxItem
                  checked={col?.getIsVisible() ?? true}
                  className="text-xs"
                  key={item.value}
                  onClick={() => col?.toggleVisibility(!col.getIsVisible())}
                  value={item}
                >
                  {Icon && (
                    <Icon className="size-3.5 shrink-0 text-muted-foreground" />
                  )}
                  <span className="flex-1 truncate text-left">
                    {item.label}
                  </span>
                </AutocompleteCheckboxItem>
              );
            }}
          </AutocompleteList>
        </Autocomplete>
      </PopoverContent>
    </Popover>
  );
}
