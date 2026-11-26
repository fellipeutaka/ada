import type { SQL } from "drizzle-orm";
import {
  and,
  arrayContains,
  arrayOverlaps,
  between,
  eq,
  gt,
  gte,
  ilike,
  isNotNull,
  isNull,
  lt,
  lte,
  ne,
  not,
  notIlike,
  or,
} from "drizzle-orm";
import type { PgColumn, PgTable } from "drizzle-orm/pg-core";
import type { DataTableSearchSchema } from "../utils/search-schema";

interface FilterInput {
  operator: string;
  values: Array<unknown>;
}

function buildTextCondition(
  col: PgColumn,
  { operator, values }: FilterInput
): SQL | undefined {
  const q = String(values[0] ?? "");
  switch (operator) {
    case "contains":
      return q ? ilike(col, `%${q}%`) : undefined;
    case "does not contain":
      return q ? notIlike(col, `%${q}%`) : undefined;
    case "is":
      return q ? eq(col, q) : undefined;
    case "is not":
      return q ? ne(col, q) : undefined;
    case "is empty":
      return or(isNull(col), eq(col, ""));
    case "is not empty":
      return and(isNotNull(col), ne(col, ""));
    default:
      return undefined;
  }
}

function buildOptionCondition(
  col: PgColumn,
  { operator, values }: FilterInput
): SQL | undefined {
  const vals = values as Array<string>;
  if (vals.length === 0) {
    return undefined;
  }
  switch (operator) {
    case "is":
      return eq(col, vals[0]);
    case "is not":
      return ne(col, vals[0]);
    case "is any of": {
      const ors = vals.map((v) => eq(col, v));
      return or(...ors);
    }
    case "is none of": {
      const condition = or(...vals.map((value) => eq(col, value)));
      return condition && not(condition);
    }
    default:
      return undefined;
  }
}

function buildMultiOptionCondition(
  col: PgColumn,
  { operator, values }: FilterInput
): SQL | undefined {
  const vals = values as Array<string>;
  if (vals.length === 0) {
    return undefined;
  }
  switch (operator) {
    case "include":
    case "include any of":
      return arrayOverlaps(col, vals);
    case "exclude":
    case "exclude if any of":
      return not(arrayOverlaps(col, vals));
    case "include all of":
      return arrayContains(col, vals);
    case "exclude if all":
      return not(arrayContains(col, vals));
    default:
      return undefined;
  }
}

function buildNumberCondition(
  col: PgColumn,
  { operator, values }: FilterInput
): SQL | undefined {
  const v0 = values[0] as number;
  switch (operator) {
    case "is":
      return eq(col, v0);
    case "is not":
      return ne(col, v0);
    case "is greater than":
      return gt(col, v0);
    case "is greater than or equal to":
      return gte(col, v0);
    case "is less than":
      return lt(col, v0);
    case "is less than or equal to":
      return lte(col, v0);
    case "is between": {
      if (values.length < 2) {
        return undefined;
      }
      const v1 = values[1] as number;
      return between(col, v0, v1);
    }
    case "is not between": {
      if (values.length < 2) {
        return undefined;
      }
      const v1 = values[1] as number;
      return not(between(col, v0, v1));
    }
    default:
      return undefined;
  }
}

function buildDateCondition(
  col: PgColumn,
  { operator, values }: FilterInput
): SQL | undefined {
  const d0 = new Date(values[0] as string);
  switch (operator) {
    case "is":
      return eq(col, d0);
    case "is not":
      return ne(col, d0);
    case "is before":
      return lt(col, d0);
    case "is after":
      return gt(col, d0);
    case "is between": {
      if (values.length < 2) {
        return undefined;
      }
      const d1 = new Date(values[1] as string);
      return between(col, d0, d1);
    }
    case "is not between": {
      if (values.length < 2) {
        return undefined;
      }
      const d1 = new Date(values[1] as string);
      return not(between(col, d0, d1));
    }
    default:
      return undefined;
  }
}

const filterConditionBuilders = {
  text: buildTextCondition,
  option: buildOptionCondition,
  multiOption: buildMultiOptionCondition,
  number: buildNumberCondition,
  date: buildDateCondition,
} satisfies Record<
  string,
  (col: PgColumn, filter: FilterInput) => SQL | undefined
>;

export function buildFilterCondition<T extends PgTable>(
  table: T,
  filter: DataTableSearchSchema["filters"][0]
): SQL | undefined {
  const col = table[filter.columnId as keyof T] as PgColumn | undefined;
  if (!col) {
    return undefined;
  }

  const builder = filterConditionBuilders[filter.type];

  return builder?.(col, filter);
}
