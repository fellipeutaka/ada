import type { DataTableSearchState } from "@ada/ui/components/data-table";
import { TasksTable } from "~/app/_components/tasks-table";
import { searchParamsCache } from "~/lib/search-params";
import { getTasks } from "~/lib/tasks";

export default async function TasksPage({ searchParams }: PageProps<"/">) {
  const search = (await searchParamsCache.parse(
    searchParams
  )) as DataTableSearchState;
  const { data, total, pageCount } = await getTasks(search);

  return <TasksTable data={data} pageCount={pageCount} total={total} />;
}
