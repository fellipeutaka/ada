import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@ada/ui/components/ui/table";
import type { RowData } from "@tanstack/react-table";
import type { DataTableInstance } from "../core/tanstack-table";
import { getColumnPinningStyle } from "../utils/column-pinning";

interface DataTableProps<TData extends RowData> {
  table: DataTableInstance<TData>;
}

export function DataTable<TData extends RowData>({
  table,
}: DataTableProps<TData>) {
  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead
                colSpan={header.colSpan}
                key={header.id}
                style={getColumnPinningStyle({ column: header.column })}
              >
                {header.isPlaceholder ? null : (
                  <table.FlexRender header={header} />
                )}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.length ? (
          table.getRowModel().rows.map((row) => (
            <TableRow
              data-state={row.getIsSelected() ? "selected" : undefined}
              key={row.id}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  style={getColumnPinningStyle({ column: cell.column })}
                >
                  <table.FlexRender cell={cell} />
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell
              className="h-24 text-center"
              colSpan={table.getAllColumns().length}
            >
              No results.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
