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
import type { DataTableSearchSchema } from "./search-schema";

type FilterInput = DataTableSearchSchema["filters"][number];

// biome-ignore lint/suspicious/noExplicitAny: Prisma where clause values are intentionally loose
type PrismaCondition = Record<string, any>;

function buildTextCondition({
  operator,
  values,
}: FilterInput): PrismaCondition | undefined {
  const q = String(values[0] ?? "");
  switch (operator) {
    case "contains":
      return q ? { contains: q, mode: "insensitive" } : undefined;
    case "does not contain":
      return q ? { NOT: { contains: q, mode: "insensitive" } } : undefined;
    case "is":
      return q ? { equals: q, mode: "insensitive" } : undefined;
    case "is not":
      return q ? { not: { equals: q, mode: "insensitive" } } : undefined;
    case "is empty":
      return { OR: [{ equals: null }, { equals: "" }] };
    case "is not empty":
      return { NOT: { OR: [{ equals: null }, { equals: "" }] } };
    default:
      return undefined;
  }
}

function buildOptionCondition({
  operator,
  values,
}: FilterInput): PrismaCondition | undefined {
  const vals = values as Array<string>;
  if (vals.length === 0) {
    return undefined;
  }

  switch (operator) {
    case "is":
      return { equals: vals[0] };
    case "is not":
      return { not: vals[0] };
    case "is any of":
      return { in: vals };
    case "is none of":
      return { notIn: vals };
    default:
      return undefined;
  }
}

function buildMultiOptionCondition({
  operator,
  values,
}: FilterInput): PrismaCondition | undefined {
  const vals = values as Array<string>;
  if (vals.length === 0) {
    return undefined;
  }

  switch (operator) {
    case "include":
    case "include any of":
      return { hasSome: vals };
    case "exclude":
    case "exclude if any of":
      return { NOT: { hasSome: vals } };
    case "include all of":
      return { hasEvery: vals };
    case "exclude if all":
      return { NOT: { hasEvery: vals } };
    default:
      return undefined;
  }
}

function buildNumberCondition({
  operator,
  values,
}: FilterInput): PrismaCondition | undefined {
  const v0 = values[0] as number;
  switch (operator) {
    case "is":
      return { equals: v0 };
    case "is not":
      return { not: v0 };
    case "is greater than":
      return { gt: v0 };
    case "is greater than or equal to":
      return { gte: v0 };
    case "is less than":
      return { lt: v0 };
    case "is less than or equal to":
      return { lte: v0 };
    case "is between": {
      if (values.length < 2) {
        return undefined;
      }
      const v1 = values[1] as number;
      return { gte: v0, lte: v1 };
    }
    case "is not between": {
      if (values.length < 2) {
        return undefined;
      }
      const v1 = values[1] as number;
      return { NOT: { gte: v0, lte: v1 } };
    }
    default:
      return undefined;
  }
}

function buildDateCondition({
  operator,
  values,
}: FilterInput): PrismaCondition | undefined {
  const d0 = new Date(values[0] as string);
  switch (operator) {
    case "is":
      return { equals: d0 };
    case "is not":
      return { not: d0 };
    case "is before":
      return { lt: d0 };
    case "is after":
      return { gt: d0 };
    case "is between": {
      if (values.length < 2) {
        return undefined;
      }
      const d1 = new Date(values[1] as string);
      return { gte: d0, lte: d1 };
    }
    case "is not between": {
      if (values.length < 2) {
        return undefined;
      }
      const d1 = new Date(values[1] as string);
      return { NOT: { gte: d0, lte: d1 } };
    }
    default:
      return undefined;
  }
}

const conditionBuilders: Record<
  string,
  (filter: FilterInput) => PrismaCondition | undefined
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
  const condition = builder?.(filter);
  if (!condition) {
    return undefined;
  }

  return { [filter.columnId]: condition };
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
