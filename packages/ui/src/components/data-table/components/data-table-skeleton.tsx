import { Skeleton } from "@ada/ui/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@ada/ui/components/ui/table";

interface DataTableSkeletonProps {
  columnCount: number;
  rowCount?: number;
}

export function DataTableSkeleton({
  columnCount,
  rowCount = 10,
}: DataTableSkeletonProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {Array.from({ length: columnCount }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: Skeleton headers have only positional identity.
            <TableHead key={`head-${i}`}>
              <Skeleton className="h-4 w-24" />
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: rowCount }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: Skeleton rows have only positional identity.
          <TableRow key={`row-${i}`}>
            {Array.from({ length: columnCount }).map((__, j) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: Skeleton cells have only positional identity.
              <TableCell key={`cell-${j}`}>
                <Skeleton className="h-4 w-full" />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
