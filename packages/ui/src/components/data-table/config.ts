import type {
  ColumnDataType,
  FilterDetails,
  FilterOperatorDetailsBase,
  FilterOperators,
  FilterOperatorTarget,
  FilterTypeOperatorDetails,
  FilterValues,
} from "./types";

// ─── Default operators per type and target ───

export const DEFAULT_OPERATORS: Record<
  ColumnDataType,
  Record<FilterOperatorTarget, FilterOperators[ColumnDataType]>
> = {
  text: { single: "contains", multiple: "contains" },
  number: { single: "is", multiple: "is between" },
  date: { single: "is", multiple: "is between" },
  option: { single: "is", multiple: "is any of" },
  multiOption: { single: "include", multiple: "include any of" },
};

// ─── Operator details per type ───

export const textFilterOperators = {
  contains: {
    value: "contains",
    label: "Contains",
    target: "single",
    relativeOf: [
      "does not contain",
      "is",
      "is not",
      "is empty",
      "is not empty",
    ],
    isNegated: false,
    negation: "does not contain",
  },
  "does not contain": {
    value: "does not contain",
    label: "Does not contain",
    target: "single",
    relativeOf: ["contains", "is", "is not", "is empty", "is not empty"],
    isNegated: true,
    negationOf: "contains",
  },
  is: {
    value: "is",
    label: "Is",
    target: "single",
    relativeOf: [
      "is not",
      "contains",
      "does not contain",
      "is empty",
      "is not empty",
    ],
    isNegated: false,
    negation: "is not",
  },
  "is not": {
    value: "is not",
    label: "Is not",
    target: "single",
    relativeOf: [
      "is",
      "contains",
      "does not contain",
      "is empty",
      "is not empty",
    ],
    isNegated: true,
    negationOf: "is",
  },
  "is empty": {
    value: "is empty",
    label: "Is empty",
    target: "single",
    relativeOf: [
      "is not empty",
      "contains",
      "does not contain",
      "is",
      "is not",
    ],
    isNegated: false,
    negation: "is not empty",
  },
  "is not empty": {
    value: "is not empty",
    label: "Is not empty",
    target: "single",
    relativeOf: ["is empty", "contains", "does not contain", "is", "is not"],
    isNegated: true,
    negationOf: "is empty",
  },
} as const satisfies FilterDetails<"text">;

export const numberFilterOperators = {
  is: {
    value: "is",
    label: "Is",
    target: "single",
    singularOf: "is between",
    relativeOf: [
      "is not",
      "is greater than",
      "is less than or equal to",
      "is less than",
      "is greater than or equal to",
    ],
    isNegated: false,
    negation: "is not",
  },
  "is not": {
    value: "is not",
    label: "Is not",
    target: "single",
    singularOf: "is not between",
    relativeOf: [
      "is",
      "is greater than",
      "is less than or equal to",
      "is less than",
      "is greater than or equal to",
    ],
    isNegated: true,
    negationOf: "is",
  },
  "is greater than": {
    value: "is greater than",
    label: "Greater than",
    target: "single",
    singularOf: "is between",
    relativeOf: [
      "is",
      "is not",
      "is less than or equal to",
      "is less than",
      "is greater than or equal to",
    ],
    isNegated: false,
    negation: "is less than or equal to",
  },
  "is greater than or equal to": {
    value: "is greater than or equal to",
    label: "Greater than or equal to",
    target: "single",
    singularOf: "is between",
    relativeOf: [
      "is",
      "is not",
      "is greater than",
      "is less than or equal to",
      "is less than",
    ],
    isNegated: false,
    negation: "is less than or equal to",
  },
  "is less than": {
    value: "is less than",
    label: "Less than",
    target: "single",
    singularOf: "is between",
    relativeOf: [
      "is",
      "is not",
      "is greater than",
      "is less than or equal to",
      "is greater than or equal to",
    ],
    isNegated: false,
    negation: "is greater than",
  },
  "is less than or equal to": {
    value: "is less than or equal to",
    label: "Less than or equal to",
    target: "single",
    singularOf: "is between",
    relativeOf: [
      "is",
      "is not",
      "is greater than",
      "is less than",
      "is greater than or equal to",
    ],
    isNegated: false,
    negation: "is greater than or equal to",
  },
  "is between": {
    value: "is between",
    label: "Between",
    target: "multiple",
    pluralOf: "is",
    relativeOf: "is not between",
    isNegated: false,
    negation: "is not between",
  },
  "is not between": {
    value: "is not between",
    label: "Not between",
    target: "multiple",
    pluralOf: "is not",
    relativeOf: "is between",
    isNegated: true,
    negationOf: "is between",
  },
} as const satisfies FilterDetails<"number">;

export const dateFilterOperators = {
  is: {
    value: "is",
    label: "Is",
    target: "single",
    singularOf: "is between",
    relativeOf: [
      "is not",
      "is after",
      "is before",
      "is between",
      "is not between",
    ],
    isNegated: false,
    negation: "is not",
  },
  "is not": {
    value: "is not",
    label: "Is not",
    target: "single",
    singularOf: "is not between",
    relativeOf: ["is", "is after", "is before", "is between", "is not between"],
    isNegated: true,
    negationOf: "is",
  },
  "is after": {
    value: "is after",
    label: "After",
    target: "single",
    singularOf: "is between",
    relativeOf: ["is", "is not", "is before", "is between", "is not between"],
    isNegated: false,
    negation: "is before",
  },
  "is before": {
    value: "is before",
    label: "Before",
    target: "single",
    singularOf: "is between",
    relativeOf: ["is", "is not", "is after", "is between", "is not between"],
    isNegated: false,
    negation: "is after",
  },
  "is between": {
    value: "is between",
    label: "Between",
    target: "multiple",
    pluralOf: "is",
    relativeOf: ["is not between", "is", "is not", "is after", "is before"],
    isNegated: false,
    negation: "is not between",
  },
  "is not between": {
    value: "is not between",
    label: "Not between",
    target: "multiple",
    pluralOf: "is not",
    relativeOf: ["is between", "is", "is not", "is after", "is before"],
    isNegated: true,
    negationOf: "is between",
  },
} as const satisfies FilterDetails<"date">;

export const optionFilterOperators = {
  is: {
    value: "is",
    label: "Is",
    target: "single",
    singularOf: "is any of",
    relativeOf: "is not",
    isNegated: false,
    negation: "is not",
  },
  "is not": {
    value: "is not",
    label: "Is not",
    target: "single",
    singularOf: "is none of",
    relativeOf: "is",
    isNegated: true,
    negationOf: "is",
  },
  "is any of": {
    value: "is any of",
    label: "Is any of",
    target: "multiple",
    pluralOf: "is",
    relativeOf: "is none of",
    isNegated: false,
    negation: "is none of",
  },
  "is none of": {
    value: "is none of",
    label: "Is none of",
    target: "multiple",
    pluralOf: "is not",
    relativeOf: "is any of",
    isNegated: true,
    negationOf: "is any of",
  },
} as const satisfies FilterDetails<"option">;

export const multiOptionFilterOperators = {
  include: {
    value: "include",
    label: "Include",
    target: "single",
    singularOf: "include any of",
    relativeOf: "exclude",
    isNegated: false,
    negation: "exclude",
  },
  exclude: {
    value: "exclude",
    label: "Exclude",
    target: "single",
    singularOf: "exclude if any of",
    relativeOf: "include",
    isNegated: true,
    negationOf: "include",
  },
  "include any of": {
    value: "include any of",
    label: "Include any of",
    target: "multiple",
    pluralOf: "include",
    relativeOf: ["exclude if all", "include all of", "exclude if any of"],
    isNegated: false,
    negation: "exclude if all",
  },
  "exclude if all": {
    value: "exclude if all",
    label: "Exclude if all",
    target: "multiple",
    pluralOf: "exclude",
    relativeOf: ["include any of", "include all of", "exclude if any of"],
    isNegated: true,
    negationOf: "include any of",
  },
  "include all of": {
    value: "include all of",
    label: "Include all of",
    target: "multiple",
    pluralOf: "include",
    relativeOf: ["include any of", "exclude if all", "exclude if any of"],
    isNegated: false,
    negation: "exclude if any of",
  },
  "exclude if any of": {
    value: "exclude if any of",
    label: "Exclude if any of",
    target: "multiple",
    pluralOf: "exclude",
    relativeOf: ["include any of", "exclude if all", "include all of"],
    isNegated: true,
    negationOf: "include all of",
  },
} as const satisfies FilterDetails<"multiOption">;

export const filterTypeOperatorDetails: FilterTypeOperatorDetails = {
  text: textFilterOperators,
  number: numberFilterOperators,
  date: dateFilterOperators,
  option: optionFilterOperators,
  multiOption: multiOptionFilterOperators,
};

// ─── Operator utilities ───

export function getOperatorsForType<T extends ColumnDataType>(type: T) {
  return filterTypeOperatorDetails[type];
}

/**
 * Looks up a single operator's detail by type and operator key.
 * Centralizes the single `as` cast needed for dynamic string lookups.
 */
export function getOperatorDetail<T extends ColumnDataType>(
  type: T,
  operator: string
): FilterOperatorDetailsBase<string, T> | undefined {
  const details = filterTypeOperatorDetails[type] as Record<
    string,
    FilterOperatorDetailsBase<string, T>
  >;
  return details[operator];
}

/**
 * Returns all operator details for a type as an array.
 * Centralizes the cast needed for Object.values() on mapped types.
 */
export function getOperatorDetailsList<T extends ColumnDataType>(
  type: T
): Array<FilterOperatorDetailsBase<string, T>> {
  return Object.values(filterTypeOperatorDetails[type]) as Array<
    FilterOperatorDetailsBase<string, T>
  >;
}

export function getDefaultOperator<T extends ColumnDataType>(
  type: T,
  target: FilterOperatorTarget = "single"
): FilterOperators[T] {
  return DEFAULT_OPERATORS[type][target] as FilterOperators[T];
}

export function determineNewOperator<TType extends ColumnDataType>(
  type: TType,
  oldVals: FilterValues<TType>,
  nextVals: FilterValues<TType>,
  currentOperator: FilterOperators[TType]
): FilterOperators[TType] {
  const a =
    Array.isArray(oldVals) && Array.isArray(oldVals[0])
      ? (oldVals[0] as Array<unknown>).length
      : oldVals.length;
  const b =
    Array.isArray(nextVals) && Array.isArray(nextVals[0])
      ? (nextVals[0] as Array<unknown>).length
      : nextVals.length;

  if (a === b || (a >= 2 && b >= 2) || (a <= 1 && b <= 1)) {
    return currentOperator;
  }

  const opDetails = filterTypeOperatorDetails[type][currentOperator];

  if (a < b && b >= 2) {
    return opDetails?.singularOf ?? currentOperator;
  }

  if (a > b && b <= 1) {
    return opDetails?.pluralOf ?? currentOperator;
  }

  return currentOperator;
}
