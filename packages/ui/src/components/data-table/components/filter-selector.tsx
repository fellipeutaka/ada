import {
  Autocomplete,
  AutocompleteCheckboxItem,
  AutocompleteEmpty,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
} from "@ada/ui/components/ui/autocomplete";
import { Button } from "@ada/ui/components/ui/button";
import { Calendar } from "@ada/ui/components/ui/calendar";
import { Input } from "@ada/ui/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@ada/ui/components/ui/popover";
import { Separator } from "@ada/ui/components/ui/separator";
import { Slider } from "@ada/ui/components/ui/slider";
import { NumberField } from "@base-ui/react";
import { CaretLeftIcon, FunnelIcon } from "@phosphor-icons/react";
import { useCallback, useMemo, useState } from "react";
import type { Column, DataTableFilterActions, FiltersState } from "../types";

interface FilterSelectorProps<TData> {
  actions: DataTableFilterActions;
  columns: Array<Column<TData>>;
  filters: FiltersState;
}

interface ColumnItem {
  label: string;
  value: string;
}

export function FilterSelector<TData>({
  columns,
  actions,
  filters,
}: FilterSelectorProps<TData>) {
  const [open, setOpen] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState<Column<TData> | null>(
    null
  );

  const handleClose = useCallback(() => {
    setOpen(false);
    setSelectedColumn(null);
  }, []);

  return (
    <Popover
      onOpenChange={(next) => {
        if (next) {
          setOpen(true);
        } else {
          handleClose();
        }
      }}
      open={open}
    >
      <PopoverTrigger
        render={
          <Button size="xs" variant="outline">
            <FunnelIcon data-icon="inline-start" />
            Filter
          </Button>
        }
      />
      <PopoverContent align="start" className="w-56 gap-0 p-0">
        {selectedColumn ? (
          <Phase2ValueSelector
            actions={actions}
            column={selectedColumn}
            filters={filters}
            onBack={() => setSelectedColumn(null)}
            onClose={handleClose}
          />
        ) : (
          <Phase1ColumnSelector
            columns={columns}
            onSelect={setSelectedColumn}
          />
        )}
      </PopoverContent>
    </Popover>
  );
}

// ─── Phase 1: Column list ───

function Phase1ColumnSelector<TData>({
  columns,
  onSelect,
}: {
  columns: Array<Column<TData>>;
  onSelect: (column: Column<TData>) => void;
}) {
  const items: Array<ColumnItem> = columns.map((col) => ({
    value: col.id,
    label: col.displayName,
  }));

  return (
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
        placeholder="Filter columns..."
      />
      <AutocompleteEmpty>No columns found.</AutocompleteEmpty>
      <AutocompleteList className="max-h-48 p-1">
        {(item: ColumnItem) => {
          const col = columns.find((c) => c.id === item.value);
          const Icon = col?.icon;
          return (
            <AutocompleteItem
              className="gap-2 text-xs"
              key={item.value}
              onClick={() => col && onSelect(col)}
              value={item}
            >
              {Icon && <Icon className="size-3.5 text-muted-foreground" />}
              <span>{item.label}</span>
            </AutocompleteItem>
          );
        }}
      </AutocompleteList>
    </Autocomplete>
  );
}

// ─── Phase 2: Value input (type-specific) ───

function Phase2ValueSelector<TData>({
  column,
  actions,
  filters,
  onBack,
  onClose,
}: {
  column: Column<TData>;
  actions: DataTableFilterActions;
  filters: FiltersState;
  onBack: () => void;
  onClose: () => void;
}) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-1 p-1">
        <Button onClick={onBack} size="icon-xs" variant="ghost">
          <CaretLeftIcon />
          <span className="sr-only">Back</span>
        </Button>
        <Separator orientation="vertical" />
        <span className="font-medium text-xs">{column.displayName}</span>
      </div>
      <Separator />
      <Phase2Controller
        actions={actions}
        column={column}
        filters={filters}
        onClose={onClose}
      />
    </div>
  );
}

function Phase2Controller<TData>({
  column,
  actions,
  filters,
  onClose,
}: {
  column: Column<TData>;
  actions: DataTableFilterActions;
  filters: FiltersState;
  onClose: () => void;
}) {
  switch (column.type) {
    case "text":
      return (
        <Phase2Text
          actions={actions}
          column={column as Column<TData, "text">}
          onClose={onClose}
        />
      );
    case "number":
      return (
        <Phase2Number
          actions={actions}
          column={column as Column<TData, "number">}
          onClose={onClose}
        />
      );
    case "date":
      return (
        <Phase2Date
          actions={actions}
          column={column as Column<TData, "date">}
          onClose={onClose}
        />
      );
    case "option":
    case "multiOption":
      return (
        <Phase2Option actions={actions} column={column} filters={filters} />
      );
    default:
      throw new Error(`Unsupported column type: ${column.type}`);
  }
}

// ─── Text ───

function Phase2Text<TData>({
  column,
  actions,
  onClose,
}: {
  column: Column<TData, "text">;
  actions: DataTableFilterActions;
  onClose: () => void;
}) {
  const [value, setValue] = useState("");

  const handleSubmit = () => {
    if (value.trim()) {
      actions.setFilterValue(column, [value]);
      onClose();
    }
  };

  return (
    <div className="p-2">
      <Input
        autoFocus
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSubmit();
          }
        }}
        placeholder={`Filter ${column.displayName}...`}
        value={value}
      />
    </div>
  );
}

// ─── Number ───

function Phase2Number<TData>({
  column,
  actions,
  onClose,
}: {
  column: Column<TData, "number">;
  actions: DataTableFilterActions;
  onClose: () => void;
}) {
  const [min, max] = column.getFacetedMinMaxValues() ?? [0, 100];
  const [value, setValue] = useState<Array<number>>([min]);

  const handleSubmit = () => {
    actions.setFilterValue(column, value);
    onClose();
  };

  return (
    <div className="flex flex-col gap-3 p-2">
      <Slider
        max={max}
        min={min}
        onValueChange={(val) => {
          const arr = Array.isArray(val) ? [...val] : [val];
          setValue(arr);
        }}
        step={1}
        value={value}
      />
      <NumberField.Root
        autoFocus
        max={max}
        min={min}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSubmit();
          }
        }}
        onValueChange={(num) => {
          const next = num ? [num] : [];
          setValue(next);
        }}
        value={value.at(0)}
      >
        <NumberField.Input render={<Input className="h-7 text-xs" />} />
      </NumberField.Root>
    </div>
  );
}

// ─── Date ───

function Phase2Date<TData>({
  column,
  actions,
  onClose,
}: {
  column: Column<TData, "date">;
  actions: DataTableFilterActions;
  onClose: () => void;
}) {
  return (
    <Calendar
      mode="single"
      onSelect={(date) => {
        if (!date) {
          return;
        }
        actions.setFilterValue(column, [date]);
        onClose();
      }}
    />
  );
}

// ─── Option / MultiOption ───

interface OptionItem {
  label: string;
  value: string;
}

function Phase2Option<TData>({
  column,
  actions,
  filters,
}: {
  column: Column<TData>;
  actions: DataTableFilterActions;
  filters: FiltersState;
}) {
  const options = column.getOptions();
  const faceted = column.getFacetedUniqueValues();

  const items: Array<OptionItem> = options.map((opt) => ({
    value: opt.value,
    label: opt.label,
  }));

  const activeFilter = filters.find((f) => f.columnId === column.id);
  const selectedValues = useMemo(
    () =>
      new Set<string>(
        (activeFilter?.values as Array<string> | undefined) ?? []
      ),
    [activeFilter?.values]
  );

  const handleItemClick = (value: string) => {
    if (column.type !== "option" && column.type !== "multiOption") {
      return;
    }
    const col = column as Column<TData, "option">;
    if (selectedValues.has(value)) {
      actions.removeFilterValue(col, [value]);
    } else {
      actions.addFilterValue(col, [value]);
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
        autoFocus
        className="w-full border-b p-2.5 text-xs"
        placeholder={`Search ${column.displayName}...`}
      />
      <AutocompleteEmpty>No options found.</AutocompleteEmpty>
      <AutocompleteList className="max-h-48 p-1">
        {(item: OptionItem) => (
          <AutocompleteCheckboxItem
            checked={selectedValues.has(item.value)}
            className="text-xs"
            key={item.value}
            onClick={() => handleItemClick(item.value)}
            value={item}
          >
            <span className="flex-1 truncate text-left">{item.label}</span>
            {faceted && (
              <span className="text-muted-foreground text-xs tabular-nums">
                {faceted.get(item.value) ?? 0}
              </span>
            )}
          </AutocompleteCheckboxItem>
        )}
      </AutocompleteList>
    </Autocomplete>
  );
}
