import {
  CalendarIcon,
  HashIcon,
  StackIcon,
  TagIcon,
  TextAaIcon,
} from "@phosphor-icons/react";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, stripSearchParams } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

import {
  createColumnConfigHelper,
  DataTable,
  DataTableColumnHeader,
  DataTablePagination,
  DataTableToolbar,
  dataTableSearchSchema,
  useDataTable,
  useRouterSearchAdapter,
} from "../components/data-table";
import {
  type DataTableSearchSchema,
  defaultDataTableSearch,
} from "../components/data-table/lib/search-schema";
import { TasksTableActionBar } from "../components/tasks/tasks-table-action-bar";
import { Checkbox } from "../components/ui/checkbox";
import { getTasks } from "../server/tasks";
import { PRIORITIES, STATUSES, type Task } from "../shared/tasks";

const tasksQueryOptions = (data: DataTableSearchSchema) =>
  queryOptions({
    queryKey: ["tasks", data],
    queryFn: ({ signal }) =>
      getTasks({
        signal,
        data,
      }),
  });

export const Route = createFileRoute("/")({
  validateSearch: dataTableSearchSchema,
  component: TasksPage,
  search: {
    middlewares: [stripSearchParams(defaultDataTableSearch)],
  },
  pendingComponent: () => (
    <div className="flex items-center justify-center p-8">
      <span className="text-muted-foreground text-sm">Loading tasks...</span>
    </div>
  ),
  head: () => ({
    meta: [
      {
        title: "Ada - Tanstack Start Data Table",
      },
    ],
  }),
});

// ─── Column filter config ───

const col = createColumnConfigHelper<Task>();

const filterColumnsConfig = [
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

const columns: Array<ColumnDef<Task>> = [
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

// ─── Page component ───

function TasksPage() {
  const adapter = useRouterSearchAdapter();

  const tasksQuery = useSuspenseQuery(tasksQueryOptions(adapter.read()));

  const { table, filterColumns, filters, joinOperator, actions } = useDataTable(
    {
      data: tasksQuery.data.data,
      columns,
      columnsConfig: filterColumnsConfig,
      strategy: "server",
      adapter,
      pageCount: tasksQuery.data.pageCount,
    }
  );

  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <h1 className="font-semibold text-2xl tracking-tight">Tasks</h1>
        <p className="text-muted-foreground text-sm">
          {tasksQuery.data.total} tasks total
        </p>
      </div>
      <DataTableToolbar
        actions={actions}
        columns={filterColumns}
        filters={filters}
        joinOperator={joinOperator}
      />
      <div className="rounded-lg border">
        <DataTable table={table} />
      </div>
      <DataTablePagination table={table} />
      <TasksTableActionBar table={table} />
    </div>
  );
}
