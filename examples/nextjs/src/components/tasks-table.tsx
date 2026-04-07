"use client";

import {
  DataTable,
  DataTablePagination,
  DataTableToolbar,
  useDataTable,
  useNuqsSearchAdapter,
} from "@ada/ui/components/data-table";
import { columns, filterColumnsConfig } from "~/shared/columns";
import type { Task } from "~/shared/tasks";
import { TasksTableActionBar } from "./tasks-table-action-bar";

interface TasksTableProps {
  data: Array<Task>;
  pageCount: number;
  total: number;
}

export function TasksTable({ data, pageCount, total }: TasksTableProps) {
  const adapter = useNuqsSearchAdapter();

  const { table, filterColumns, filters, joinOperator, actions } = useDataTable(
    {
      data,
      columns,
      columnsConfig: filterColumnsConfig,
      strategy: "server",
      adapter,
      pageCount,
    }
  );

  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <h1 className="font-semibold text-2xl tracking-tight">Tasks</h1>
        <p className="text-muted-foreground text-sm">{total} tasks total</p>
      </div>
      <DataTableToolbar
        actions={actions}
        columns={filterColumns}
        filters={filters}
        joinOperator={joinOperator}
        table={table}
      />
      <div className="*:rounded-lg *:border">
        <DataTable table={table} />
      </div>
      <DataTablePagination table={table} />
      <TasksTableActionBar table={table} />
    </div>
  );
}
