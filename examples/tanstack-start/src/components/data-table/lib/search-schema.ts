import { z } from "zod";

const filterModelSchema = z.object({
  filterId: z.string(),
  columnId: z.string(),
  type: z.enum(["text", "number", "date", "option", "multiOption"]),
  operator: z.string(),
  values: z.array(z.unknown()),
});

const sortSchema = z.object({
  id: z.string(),
  desc: z.boolean(),
});

export const dataTableSearchSchema = z.object({
  page: z.number().int().min(1).catch(1).default(1),
  perPage: z.number().int().min(1).max(100).catch(10).default(10),
  sort: z.array(sortSchema).catch([]).default([]),
  filters: z.array(filterModelSchema).catch([]).default([]),
  joinOperator: z.enum(["and", "or"]).catch("and").default("and"),
});

export type DataTableSearchSchema = z.infer<typeof dataTableSearchSchema>;

export const defaultDataTableSearch: DataTableSearchSchema =
  dataTableSearchSchema.parse({});
