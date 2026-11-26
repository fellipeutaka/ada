import { Button } from "@ada/ui/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ada/ui/components/ui/select";
import {
  CaretDoubleLeftIcon,
  CaretDoubleRightIcon,
  CaretLeftIcon,
  CaretRightIcon,
} from "@phosphor-icons/react";
import type { RowData } from "@tanstack/react-table";

import type { DataTableInstance } from "../core/tanstack-table";

interface DataTablePaginationProps<TData extends RowData> {
  pageSizeOptions?: Array<number>;
  table: DataTableInstance<TData>;
}

export function DataTablePagination<TData extends RowData>({
  table,
  pageSizeOptions = [10, 20, 30, 50, 100],
}: DataTablePaginationProps<TData>) {
  return (
    <div className="flex items-center justify-between gap-4 overflow-auto px-2 py-1">
      <div className="text-muted-foreground flex-1 text-sm whitespace-nowrap">
        {table.getFilteredSelectedRowModel().rows.length} of{" "}
        {table.getFilteredRowModel().rows.length} row(s) selected.
      </div>
      <div className="flex items-center gap-4 sm:gap-6 lg:gap-8">
        <div className="flex items-center gap-2">
          <p className="text-sm whitespace-nowrap">Rows per page</p>
          <Select
            onValueChange={(value) => table.setPageSize(value as number)}
            value={table.state.pagination.pageSize}
          >
            <SelectTrigger className="w-18" size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent side="top">
              <SelectGroup>
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={size}>
                    {size}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-center text-sm whitespace-nowrap">
          Page {table.state.pagination.pageIndex + 1} of {table.getPageCount()}
        </div>
        <div className="flex items-center gap-1">
          <Button
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.setPageIndex(0)}
            size="icon-sm"
            variant="outline"
          >
            <CaretDoubleLeftIcon />
            <span className="sr-only">First page</span>
          </Button>
          <Button
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
            size="icon-sm"
            variant="outline"
          >
            <CaretLeftIcon />
            <span className="sr-only">Previous page</span>
          </Button>
          <Button
            disabled={!table.getCanNextPage()}
            onClick={() => table.nextPage()}
            size="icon-sm"
            variant="outline"
          >
            <CaretRightIcon />
            <span className="sr-only">Next page</span>
          </Button>
          <Button
            disabled={!table.getCanNextPage()}
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            size="icon-sm"
            variant="outline"
          >
            <CaretDoubleRightIcon />
            <span className="sr-only">Last page</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
