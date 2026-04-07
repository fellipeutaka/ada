import { buildPrismaWhere } from "@ada/ui/components/data-table/lib/prisma-filter";
import type { DataTableSearchState } from "@ada/ui/components/data-table/types";
import { prisma } from "~/db";
import type { Prisma } from "~/generated/prisma/client";

export async function getTasks(search: DataTableSearchState) {
  const where = buildPrismaWhere(search.filters, search.joinOperator) as
    | Prisma.TaskWhereInput
    | undefined;

  const orderBy: Prisma.TaskOrderByWithRelationInput | undefined =
    search.sort.length > 0
      ? {
          [search.sort[0].id]: search.sort[0].desc ? "desc" : "asc",
        }
      : undefined;

  const offset = (search.page - 1) * search.perPage;

  const [rows, total] = await Promise.all([
    prisma.task.findMany({
      where,
      orderBy: orderBy ?? { id: "asc" },
      skip: offset,
      take: search.perPage,
    }),
    prisma.task.count({ where }),
  ]);

  return {
    data: rows,
    total,
    pageCount: Math.ceil(total / search.perPage),
  };
}
