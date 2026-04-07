"use client";

import {
  DataTable,
  DataTablePagination,
  DataTableToolbar,
  useDataTable,
} from "@ada/ui/components/data-table";
import { columns, filterColumnsConfig } from "./columns";
import { tasks } from "./tasks";
import { TasksTableActionBar } from "./tasks-table-action-bar";

export function TasksTableDemo() {
  const { table, filterColumns, filters, joinOperator, actions } = useDataTable(
    {
      data: tasks,
      columns,
      columnsConfig: filterColumnsConfig,
      strategy: "client",
    }
  );

  return (
    <div className="flex flex-col gap-4">
      <DataTableToolbar
        actions={actions}
        columns={filterColumns}
        filters={filters}
        joinOperator={joinOperator}
        table={table}
      />
      <div className="rounded-lg border">
        <DataTable table={table} />
      </div>
      <DataTablePagination table={table} />
      <TasksTableActionBar table={table} />
    </div>
  );
}
