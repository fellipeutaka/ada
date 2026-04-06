import { Button } from "@ada/ui/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@ada/ui/components/ui/dropdown-menu";
import { getOperatorDetail, getOperatorDetailsList } from "../config";
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
  const currentDetail = getOperatorDetail(column.type, filter.operator);
  const allDetails = getOperatorDetailsList(column.type);

  const operators = allDetails.filter(
    (op) =>
      op.value === filter.operator ||
      (currentDetail &&
        (Array.isArray(currentDetail.relativeOf)
          ? (currentDetail.relativeOf as Array<string>).includes(op.value)
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
          {operators.map((op) => (
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
  const detail = getOperatorDetail(type, operator);
  return <span>{detail?.label ?? operator}</span>;
}
