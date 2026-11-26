import {
  endOfDay,
  isAfter,
  isBefore,
  isSameDay,
  isWithinInterval,
  startOfDay,
} from "date-fns";
import { dateFilterOperators } from "../config";
import type { FilterModel } from "../types";
import { intersection } from "./helpers";

export function textFilterFn(
  inputData: string,
  filterValue: FilterModel<"text">
): boolean {
  if (!filterValue) {
    return true;
  }

  switch (filterValue.operator) {
    case "is empty":
      return !inputData || inputData.trim() === "";
    case "is not empty":
      return !!inputData && inputData.trim() !== "";
    default:
      break;
  }

  if (filterValue.values.length === 0) {
    return true;
  }

  const value = inputData.toLowerCase().trim();
  const filterStr = filterValue.values[0].toLowerCase().trim();

  if (filterStr === "") {
    return true;
  }

  switch (filterValue.operator) {
    case "contains":
      return value.includes(filterStr);
    case "does not contain":
      return !value.includes(filterStr);
    case "is":
      return value === filterStr;
    case "is not":
      return value !== filterStr;
    default:
      throw new Error(`Unsupported operator: ${filterValue.operator}`);
  }
}

export function numberFilterFn(
  inputData: number,
  filterValue: FilterModel<"number">
): boolean {
  if (!filterValue || filterValue.values.length === 0) {
    return true;
  }

  const value = inputData;
  const [filterVal] = filterValue.values;

  switch (filterValue.operator) {
    case "is":
      return value === filterVal;
    case "is not":
      return value !== filterVal;
    case "is greater than":
      return value > filterVal;
    case "is greater than or equal to":
      return value >= filterVal;
    case "is less than":
      return value < filterVal;
    case "is less than or equal to":
      return value <= filterVal;
    case "is between":
      if (filterValue.values.length < 2) {
        return true;
      }
      return value >= filterValue.values[0] && value <= filterValue.values[1];
    case "is not between":
      if (filterValue.values.length < 2) {
        return true;
      }
      return value < filterValue.values[0] || value > filterValue.values[1];
    default:
      return true;
  }
}

export function dateFilterFn(
  inputData: Date,
  filterValue: FilterModel<"date">
): boolean {
  if (!filterValue || filterValue.values.length === 0) {
    return true;
  }

  if (
    dateFilterOperators[filterValue.operator].target === "single" &&
    filterValue.values.length > 1
  ) {
    throw new Error("Singular operators require at most one filter value");
  }

  const [d1, d2] = filterValue.values;
  const value = inputData;

  switch (filterValue.operator) {
    case "is":
      return isSameDay(value, d1);
    case "is not":
      return !isSameDay(value, d1);
    case "is before":
      return isBefore(value, startOfDay(d1));
    case "is after":
      return isAfter(value, endOfDay(d1));
    case "is between": {
      if (filterValue.values.length < 2) {
        return true;
      }
      return isWithinInterval(value, {
        start: startOfDay(d1),
        end: endOfDay(d2),
      });
    }
    case "is not between": {
      if (filterValue.values.length < 2) {
        return true;
      }
      return !isWithinInterval(value, {
        start: startOfDay(d1),
        end: endOfDay(d2),
      });
    }
    default:
      throw new Error(`Unsupported operator: ${filterValue.operator}`);
  }
}

export function optionFilterFn(
  inputData: string,
  filterValue: FilterModel<"option">
): boolean {
  if (!inputData) {
    return false;
  }
  if (filterValue.values.length === 0) {
    return true;
  }

  const value = inputData.toString().toLowerCase();
  const found = filterValue.values.some((v) => v.toLowerCase() === value);

  switch (filterValue.operator) {
    case "is":
    case "is any of":
      return found;
    case "is not":
    case "is none of":
      return !found;
    default:
      throw new Error(`Unsupported operator: ${filterValue.operator}`);
  }
}

export function multiOptionFilterFn(
  inputData: Array<string> | null | undefined,
  filterValue: FilterModel<"multiOption">
): boolean {
  if (!inputData) {
    return false;
  }
  if (
    filterValue.values.length === 0 ||
    !filterValue.values[0] ||
    (filterValue.values[0] as unknown as Array<string>).length === 0
  ) {
    return true;
  }

  const values = inputData;
  const filterValues = filterValue.values;

  switch (filterValue.operator) {
    case "include":
    case "include any of":
      return intersection(values, filterValues).length > 0;
    case "exclude":
      return intersection(values, filterValues).length === 0;
    case "exclude if any of":
      return !(intersection(values, filterValues).length > 0);
    case "include all of":
      return intersection(values, filterValues).length === filterValues.length;
    case "exclude if all":
      return !(
        intersection(values, filterValues).length === filterValues.length
      );
    default:
      throw new Error(`Unsupported operator: ${filterValue.operator}`);
  }
}
