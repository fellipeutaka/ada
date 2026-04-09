import { buildFilterCondition } from "@ada/ui/components/data-table/integrations/drizzle";
import { dataTableSearchSchema } from "@ada/ui/components/data-table/integrations/tanstack-router";
import { createServerFn } from "@tanstack/react-start";
import { and, asc, count, desc, or } from "drizzle-orm";
import { db } from "../db";
import { tasks } from "../db/schema";

export const getTasks = createServerFn({
  method: "POST",
})
  .inputValidator(dataTableSearchSchema)
  .handler(async ({ data }) => {
    const conditions = data.filters
      .map((f) => buildFilterCondition(tasks, f))
      .filter((c) => !!c);

    const where =
      conditions.length > 0
        ? data.joinOperator === "or"
          ? or(...conditions)
          : and(...conditions)
        : undefined;

    const orderBy =
      data.sort.length > 0
        ? (data.sort[0].desc ? desc : asc)(
            tasks[data.sort[0].id as keyof typeof tasks.$inferSelect]
          )
        : undefined;

    const offset = (data.page - 1) * data.perPage;

    const [rows, [total]] = await Promise.all([
      db
        .select()
        .from(tasks)
        .where(where)
        .orderBy(orderBy ?? asc(tasks.id))
        .limit(data.perPage)
        .offset(offset),
      db.select({ count: count() }).from(tasks).where(where),
    ]);

    return {
      data: rows,
      total: total.count,
      pageCount: Math.ceil(total.count / data.perPage),
    };
  });
