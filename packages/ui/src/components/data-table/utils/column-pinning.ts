import type { Column, RowData } from "@tanstack/react-table";
import type { DataTableFeatures } from "../core/tanstack-table";

export function getColumnPinningStyle<TData extends RowData, TValue>({
  column,
  withBorder = false,
}: {
  column: Column<DataTableFeatures, TData, TValue>;
  withBorder?: boolean;
}): React.CSSProperties {
  const isPinned = column.getIsPinned();
  const isLastStartPinnedColumn =
    isPinned === "start" && column.getIsLastColumn("start");
  const isFirstEndPinnedColumn =
    isPinned === "end" && column.getIsFirstColumn("end");

  return {
    boxShadow: withBorder
      ? isLastStartPinnedColumn
        ? "-4px 0 4px -4px var(--border) inset"
        : isFirstEndPinnedColumn
          ? "4px 0 4px -4px var(--border) inset"
          : undefined
      : undefined,
    insetInlineStart:
      isPinned === "start" ? `${column.getStart("start")}px` : undefined,
    insetInlineEnd:
      isPinned === "end" ? `${column.getAfter("end")}px` : undefined,
    opacity: isPinned ? 0.97 : 1,
    position: isPinned ? "sticky" : "relative",
    background: isPinned ? "var(--background)" : "var(--background)",
    width: column.getSize(),
    zIndex: isPinned ? 1 : undefined,
  };
}
