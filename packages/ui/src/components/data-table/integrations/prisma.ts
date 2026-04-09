/**
 * Converts data-table filter models into Prisma `where` clause objects.
 *
 * This is the ONLY file in data-table/ that understands Prisma's filter syntax.
 * It has ZERO runtime dependencies — it produces plain objects that satisfy
 * Prisma's `where` input types.
 *
 * Usage:
 * ```ts
 * const conditions = search.filters.map((f) => buildPrismaFilterCondition(f));
 * const where = joinOperator === "and" ? { AND: conditions } : { OR: conditions };
 * const rows = await prisma.task.findMany({ where });
 * ```
 */
import type { DataTableSearchSchema } from "../utils/search-schema";

type FilterInput = DataTableSearchSchema["filters"][number];

// biome-ignore lint/suspicious/noExplicitAny: Prisma where clause values are intentionally loose
type PrismaCondition = Record<string, any>;

/**
 * Internal result from condition builders.
 *
 * - `fieldCondition`: a condition to be nested under the column key
 *   e.g. `{ contains: "foo" }` → `{ title: { contains: "foo" } }`
 * - `whereCondition`: a condition that is already a complete where clause
 *   (used when the condition requires top-level operators like `OR`/`NOT`)
 *   e.g. `{ OR: [{ title: { lt: 5 } }, { title: { gt: 20 } }] }`
 */
type ConditionResult =
  | { kind: "field"; condition: PrismaCondition }
  | { kind: "where"; condition: PrismaCondition };

function fieldResult(condition: PrismaCondition): ConditionResult {
  return { kind: "field", condition };
}

function whereResult(condition: PrismaCondition): ConditionResult {
  return { kind: "where", condition };
}

function buildTextCondition({
  columnId,
  operator,
  values,
}: FilterInput): ConditionResult | undefined {
  const q = String(values[0] ?? "");
  switch (operator) {
    case "contains":
      return q ? fieldResult({ contains: q, mode: "insensitive" }) : undefined;
    case "does not contain":
      return q
        ? whereResult({
            NOT: { [columnId]: { contains: q, mode: "insensitive" } },
          })
        : undefined;
    case "is":
      return q ? fieldResult({ equals: q, mode: "insensitive" }) : undefined;
    case "is not":
      return q ? fieldResult({ not: q }) : undefined;
    case "is empty":
      return fieldResult({ equals: "" });
    case "is not empty":
      return whereResult({ NOT: { [columnId]: { equals: "" } } });
    default:
      return undefined;
  }
}

function buildOptionCondition({
  operator,
  values,
}: FilterInput): ConditionResult | undefined {
  const vals = values as Array<string>;
  if (vals.length === 0) {
    return undefined;
  }

  switch (operator) {
    case "is":
      return fieldResult({ equals: vals[0] });
    case "is not":
      return fieldResult({ not: vals[0] });
    case "is any of":
      return fieldResult({ in: vals });
    case "is none of":
      return fieldResult({ notIn: vals });
    default:
      return undefined;
  }
}

function buildMultiOptionCondition({
  columnId,
  operator,
  values,
}: FilterInput): ConditionResult | undefined {
  const vals = values as Array<string>;
  if (vals.length === 0) {
    return undefined;
  }

  switch (operator) {
    case "include":
    case "include any of":
      return fieldResult({ hasSome: vals });
    case "exclude":
    case "exclude if any of":
      return whereResult({ NOT: { [columnId]: { hasSome: vals } } });
    case "include all of":
      return fieldResult({ hasEvery: vals });
    case "exclude if all":
      return whereResult({ NOT: { [columnId]: { hasEvery: vals } } });
    default:
      return undefined;
  }
}

function buildNumberCondition({
  columnId,
  operator,
  values,
}: FilterInput): ConditionResult | undefined {
  const v0 = values[0] as number;
  switch (operator) {
    case "is":
      return fieldResult({ equals: v0 });
    case "is not":
      return fieldResult({ not: v0 });
    case "is greater than":
      return fieldResult({ gt: v0 });
    case "is greater than or equal to":
      return fieldResult({ gte: v0 });
    case "is less than":
      return fieldResult({ lt: v0 });
    case "is less than or equal to":
      return fieldResult({ lte: v0 });
    case "is between": {
      if (values.length < 2) {
        return undefined;
      }
      const v1 = values[1] as number;
      return fieldResult({ gte: v0, lte: v1 });
    }
    case "is not between": {
      if (values.length < 2) {
        return undefined;
      }
      const v1 = values[1] as number;
      return whereResult({
        OR: [{ [columnId]: { lt: v0 } }, { [columnId]: { gt: v1 } }],
      });
    }
    default:
      return undefined;
  }
}

function buildDateCondition({
  columnId,
  operator,
  values,
}: FilterInput): ConditionResult | undefined {
  const d0 = new Date(values[0] as string);
  switch (operator) {
    case "is":
      return fieldResult({ equals: d0 });
    case "is not":
      return fieldResult({ not: d0 });
    case "is before":
      return fieldResult({ lt: d0 });
    case "is after":
      return fieldResult({ gt: d0 });
    case "is between": {
      if (values.length < 2) {
        return undefined;
      }
      const d1 = new Date(values[1] as string);
      return fieldResult({ gte: d0, lte: d1 });
    }
    case "is not between": {
      if (values.length < 2) {
        return undefined;
      }
      const d1 = new Date(values[1] as string);
      return whereResult({
        OR: [{ [columnId]: { lt: d0 } }, { [columnId]: { gt: d1 } }],
      });
    }
    default:
      return undefined;
  }
}

const conditionBuilders: Record<
  string,
  (filter: FilterInput) => ConditionResult | undefined
> = {
  text: buildTextCondition,
  option: buildOptionCondition,
  multiOption: buildMultiOptionCondition,
  number: buildNumberCondition,
  date: buildDateCondition,
};

/**
 * Converts a single data-table filter into a Prisma-compatible condition
 * for the filter's column. Returns `undefined` if the filter can't be mapped.
 *
 * The returned object is keyed by `columnId`:
 * ```ts
 * { columnId: { contains: "foo", mode: "insensitive" } }
 * ```
 *
 * Usage with `buildPrismaWhere`:
 * ```ts
 * const where = buildPrismaWhere(search.filters, search.joinOperator);
 * const rows = await prisma.task.findMany({ where, skip, take, orderBy });
 * ```
 */
export function buildPrismaFilterCondition(
  filter: FilterInput
): PrismaCondition | undefined {
  const builder = conditionBuilders[filter.type];
  const result = builder?.(filter);
  if (!result) {
    return undefined;
  }

  if (result.kind === "where") {
    return result.condition;
  }

  return { [filter.columnId]: result.condition };
}

/**
 * Converts an array of data-table filters into a complete Prisma `where` clause,
 * joined by the specified operator ("and" / "or").
 *
 * Returns `undefined` if no valid conditions are produced.
 *
 * ```ts
 * const where = buildPrismaWhere(search.filters, search.joinOperator);
 * const rows = await prisma.task.findMany({ where });
 * ```
 */
export function buildPrismaWhere(
  filters: DataTableSearchSchema["filters"],
  joinOperator: "and" | "or" = "and"
): PrismaCondition | undefined {
  const conditions = filters
    .map(buildPrismaFilterCondition)
    .filter((c): c is PrismaCondition => c != null);

  if (conditions.length === 0) {
    return undefined;
  }
  if (conditions.length === 1) {
    return conditions[0];
  }

  return joinOperator === "and" ? { AND: conditions } : { OR: conditions };
}
