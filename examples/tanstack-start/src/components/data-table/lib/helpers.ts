import { isBefore } from "date-fns";
import type { Column, ColumnOption } from "../types";

export function generateFilterId(): string {
  return crypto.randomUUID().slice(0, 8);
}

export function getColumn<TData>(
  columns: Array<Column<TData>>,
  id: string
): Column<TData> {
  const column = columns.find((c) => c.id === id);
  if (!column) {
    throw new Error(`Column with id ${id} not found`);
  }
  return column;
}

export function createNumberFilterValue(
  values: Array<number> | undefined
): Array<number> {
  if (!values || values.length === 0) {
    return [];
  }
  if (values.length === 1) {
    return [values[0]];
  }
  return createNumberRange(values);
}

export function createDateFilterValue(
  values: [Date, Date] | [Date] | [] | undefined
): Array<Date> {
  if (!values || values.length === 0) {
    return [];
  }
  if (values.length === 1) {
    return [values[0]];
  }
  return createDateRange(values as [Date, Date]);
}

export function createDateRange(values: [Date, Date]): [Date, Date] {
  const [a, b] = values;
  return isBefore(a, b) ? [a, b] : [b, a];
}

export function createNumberRange(values: Array<number>): Array<number> {
  const a = values[0] ?? 0;
  const b = values[1] ?? 0;
  return a < b ? [a, b] : [b, a];
}

export function isColumnOption(value: unknown): value is ColumnOption {
  return (
    typeof value === "object" &&
    value !== null &&
    "value" in value &&
    "label" in value
  );
}

export function isColumnOptionArray(
  value: unknown
): value is Array<ColumnOption> {
  return Array.isArray(value) && value.every(isColumnOption);
}

export function isStringArray(value: unknown): value is Array<string> {
  return Array.isArray(value) && value.every((v) => typeof v === "string");
}

export function isColumnOptionMap(
  value: unknown
): value is Map<string, number> {
  if (!(value instanceof Map)) {
    return false;
  }
  for (const key of value.keys()) {
    if (typeof key !== "string") {
      return false;
    }
  }
  for (const val of value.values()) {
    if (typeof val !== "number") {
      return false;
    }
  }
  return true;
}

export function isMinMaxTuple(value: unknown): value is [number, number] {
  return (
    Array.isArray(value) &&
    value.length === 2 &&
    typeof value[0] === "number" &&
    typeof value[1] === "number"
  );
}

// ─── Array utilities ───

export function intersection<T>(a: Array<T>, b: Array<T>): Array<T> {
  return a.filter((x) => b.includes(x));
}

export function uniq<T>(arr: Array<T>): Array<T> {
  const seen = new Set<string>();
  const result: Array<T> = [];
  for (const item of arr) {
    const key = JSON.stringify(item);
    if (!seen.has(key)) {
      seen.add(key);
      result.push(item);
    }
  }
  return result;
}

export function addUniq<T>(arr: Array<T>, values: Array<T>): Array<T> {
  return uniq([...arr, ...values]);
}

export function removeUniq<T>(arr: Array<T>, values: Array<T>): Array<T> {
  return arr.filter(
    (v) => !values.some((val) => JSON.stringify(val) === JSON.stringify(v))
  );
}

export function isAnyOf<T>(value: T, values: Array<T>): boolean {
  return values.includes(value);
}

const VALUELESS_OPERATORS = new Set(["is empty", "is not empty"]);

export function isValuelessOperator(operator: string): boolean {
  return VALUELESS_OPERATORS.has(operator);
}
