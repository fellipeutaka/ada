import { Button } from "../../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { filterTypeOperatorDetails } from "../config";
import type {
  Column,
  ColumnDataType,
  DataTableFilterActions,
  FilterModel,
} from "../types";

interface FilterOperatorProps<TData> {
  actions: DataTableFilterActions;
  column: Column<TData>;
  filter: FilterModel;
}

export function FilterOperator<TData>({
  filter,
  column,
  actions,
}: FilterOperatorProps<TData>) {
  // biome-ignore lint/suspicious/noExplicitAny: dynamic operator lookup
  const details = filterTypeOperatorDetails[column.type] as Record<string, any>;
  const currentDetail = details[filter.operator];

  const operators = Object.values(details).filter(
    // biome-ignore lint/suspicious/noExplicitAny: dynamic operator value
    (op: any) =>
      op.value === filter.operator ||
      (currentDetail &&
        (Array.isArray(currentDetail.relativeOf)
          ? currentDetail.relativeOf.includes(op.value)
          : currentDetail.relativeOf === op.value))
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            className="text-muted-foreground"
            size="xs"
            variant="outline"
          />
        }
      >
        <FilterOperatorDisplay operator={filter.operator} type={column.type} />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-[calc(100%+(--spacing(2)))]"
      >
        <DropdownMenuRadioGroup
          onValueChange={(value) =>
            actions.setFilterOperator(filter.columnId, value)
          }
          value={filter.operator}
        >
          {/* biome-ignore lint/suspicious/noExplicitAny: dynamic operator */}
          {operators.map((op: any) => (
            <DropdownMenuRadioItem
              className="text-xs"
              closeOnClick
              key={op.value}
              value={op.value}
            >
              {op.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function FilterOperatorDisplay({
  operator,
  type,
}: {
  operator: string;
  type: ColumnDataType;
}) {
  // biome-ignore lint/suspicious/noExplicitAny: dynamic operator lookup
  const details = filterTypeOperatorDetails[type] as Record<string, any>;
  const detail = details[operator];
  return <span>{detail?.label ?? operator}</span>;
}
