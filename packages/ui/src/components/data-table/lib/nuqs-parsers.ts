import { parseAsInteger, parseAsJson, parseAsStringLiteral } from "nuqs/server";
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

/**
 * nuqs parsers for data-table search state.
 *
 * Can be reused with `createSearchParamsCache` / `createSerializer`
 * on the server side (import from "nuqs/server").
 */
export const dataTableParsers = {
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  joinOperator: parseAsStringLiteral(["and", "or"] as const).withDefault("and"),
  filters: parseAsJson(z.array(filterModelSchema)).withDefault([]),
  sort: parseAsJson(z.array(sortSchema)).withDefault([]),
};
