import {
  createColumnConfigHelper,
  DataTableColumnHeader,
} from "@ada/ui/components/data-table";
import { Checkbox } from "@ada/ui/components/ui/checkbox";
import {
  CalendarIcon,
  HashIcon,
  StackIcon,
  TagIcon,
  TextAaIcon,
} from "@phosphor-icons/react";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { PRIORITIES, STATUSES, type Task } from "~/shared/tasks";

// ─── Column filter config ───

const col = createColumnConfigHelper<Task>();

export const filterColumnsConfig = [
  col
    .text()
    .id("title")
    .accessor((row) => row.title)
    .displayName("Title")
    .icon(TextAaIcon)
    .build(),
  col
    .option()
    .id("priority")
    .accessor((row) => row.priority)
    .displayName("Priority")
    .icon(TagIcon)
    .options(
      PRIORITIES.map((p) => ({
        label: p.charAt(0).toUpperCase() + p.slice(1),
        value: p,
      }))
    )
    .build(),
  col
    .multiOption()
    .id("status")
    .accessor((row) => row.status)
    .displayName("Status")
    .icon(StackIcon)
    .options(
      STATUSES.map((s) => ({
        label: s
          .split("_")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" "),
        value: s,
      }))
    )
    .build(),
  col
    .date()
    .id("createdAt")
    .accessor((row) => row.createdAt)
    .displayName("Created At")
    .icon(CalendarIcon)
    .build(),
  col
    .number()
    .id("estimatedHours")
    .accessor((row) => row.estimatedHours)
    .displayName("Est. Hours")
    .icon(HashIcon)
    .min(0)
    .max(40)
    .build(),
] as const;

// ─── Table column defs ───

export const columns: Array<ColumnDef<Task>> = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        aria-label="Select all"
        checked={table.getIsAllPageRowsSelected()}
        indeterminate={
          table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()
        }
        onCheckedChange={(checked) =>
          table.toggleAllPageRowsSelected(!!checked)
        }
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        aria-label="Select row"
        checked={row.getIsSelected()}
        onCheckedChange={(checked) => row.toggleSelected(!!checked)}
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 40,
  },
  {
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
    cell: ({ row }) => (
      <span className="font-mono text-xs">{row.getValue("id")}</span>
    ),
    meta: {
      icon: HashIcon,
      label: "ID",
    },
    enableSorting: false,
    enableColumnFilter: false,
  },
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title" />
    ),
    cell: ({ row }) => (
      <span className="max-w-64 truncate">{row.getValue("title")}</span>
    ),
  },
  {
    accessorKey: "priority",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Priority" />
    ),
    cell: ({ row }) => {
      const priority = row.getValue("priority") as string;
      return <span className="capitalize">{priority}</span>;
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as Array<string>;
      return (
        <div className="flex gap-1">
          {status.map((s) => (
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs" key={s}>
              {s.replace(/_/g, " ")}
            </span>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
    ),
    cell: ({ row }) => format(row.getValue("createdAt"), "MMM d, yyyy"),
  },
  {
    accessorKey: "estimatedHours",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Est. Hours" />
    ),
    cell: ({ row }) => (
      <span className="tabular-nums">
        {(row.getValue("estimatedHours") as number).toFixed(1)}h
      </span>
    ),
  },
];
