import type { RowData, TableFeatures } from "@tanstack/react-table";

// ─── Column data types ───

export type ColumnDataType =
  | "text"
  | "number"
  | "date"
  | "option"
  | "multiOption";

export type OptionBasedColumnDataType = Extract<
  ColumnDataType,
  "option" | "multiOption"
>;

// ─── Primitive type mapping ───

export interface ColumnDataNativeMap {
  date: Date;
  multiOption: Array<string>;
  number: number;
  option: string;
  text: string;
}

export type ElementType<T> = T extends Array<infer U> ? U : T;
export type Nullable<T> = T | null | undefined;

// ─── Filter values ───

export type FilterValues<T extends ColumnDataType> = Array<
  ElementType<ColumnDataNativeMap[T]>
>;

// ─── Filter operators (per type) ───

export type TextFilterOperator =
  | "contains"
  | "does not contain"
  | "is"
  | "is not"
  | "is empty"
  | "is not empty";

export type NumberFilterOperator =
  | "is"
  | "is not"
  | "is less than"
  | "is greater than or equal to"
  | "is greater than"
  | "is less than or equal to"
  | "is between"
  | "is not between";

export type DateFilterOperator =
  | "is"
  | "is not"
  | "is after"
  | "is before"
  | "is between"
  | "is not between";

export type OptionFilterOperator = "is" | "is not" | "is any of" | "is none of";

export type MultiOptionFilterOperator =
  | "include"
  | "exclude"
  | "include any of"
  | "include all of"
  | "exclude if any of"
  | "exclude if all";

export interface FilterOperators {
  date: DateFilterOperator;
  multiOption: MultiOptionFilterOperator;
  number: NumberFilterOperator;
  option: OptionFilterOperator;
  text: TextFilterOperator;
}

// ─── Filter model ───

export interface FilterModel<TType extends ColumnDataType = ColumnDataType> {
  columnId: string;
  filterId: string;
  operator: FilterOperators[TType];
  type: TType;
  values: FilterValues<TType>;
}

export type FiltersState = Array<FilterModel>;

export type JoinOperator = "and" | "or";

// ─── Operator details (metadata for UI) ───

export type FilterOperatorTarget = "single" | "multiple";

export interface FilterOperatorDetailsBase<
  OperatorValue,
  T extends ColumnDataType,
> {
  isNegated: boolean;
  label: string;
  negation?: FilterOperators[T];
  negationOf?: FilterOperators[T];
  pluralOf?: FilterOperators[T];
  relativeOf: FilterOperators[T] | Array<FilterOperators[T]>;
  singularOf?: FilterOperators[T];
  target: FilterOperatorTarget;
  value: OperatorValue;
}

export type FilterOperatorDetails<
  OperatorValue,
  T extends ColumnDataType,
> = FilterOperatorDetailsBase<OperatorValue, T> &
  (
    | { singularOf?: never; pluralOf?: never }
    | { target: "single"; singularOf: FilterOperators[T]; pluralOf?: never }
    | { target: "multiple"; singularOf?: never; pluralOf: FilterOperators[T] }
  ) &
  (
    | { isNegated: false; negation: FilterOperators[T]; negationOf?: never }
    | { isNegated: true; negation?: never; negationOf: FilterOperators[T] }
  );

export type FilterDetails<T extends ColumnDataType> = {
  [key in FilterOperators[T]]: FilterOperatorDetails<key, T>;
};

export type FilterTypeOperatorDetails = {
  [key in ColumnDataType]: FilterDetails<key>;
};

// ─── Column option ───

export interface ColumnOption {
  icon?: React.ReactElement | React.ElementType;
  label: string;
  value: string;
}

export interface ColumnOptionExtended extends ColumnOption {
  count?: number;
  selected?: boolean;
}

// ─── Column config ───

export type TAccessorFn<TData, TVal = unknown> = (data: TData) => TVal;

export type TTransformOptionFn<TVal = unknown> = (
  value: ElementType<NonNullable<TVal>>
) => ColumnOption;

export type TOrderFn<TVal = unknown> = (
  a: ElementType<NonNullable<TVal>>,
  b: ElementType<NonNullable<TVal>>
) => number;

export interface ColumnConfig<
  TData,
  TType extends ColumnDataType = ColumnDataType,
  TVal = unknown,
  TId extends string = string,
> {
  accessor: TAccessorFn<TData, TVal>;
  displayName: string;
  facetedOptions?: TType extends OptionBasedColumnDataType
    ? Map<string, number>
    : never;
  icon: React.ComponentType<{ className?: string }>;
  id: TId;
  max?: TType extends "number" ? number : never;
  min?: TType extends "number" ? number : never;
  options?: TType extends OptionBasedColumnDataType
    ? Array<ColumnOption>
    : never;
  orderFn?: TType extends OptionBasedColumnDataType ? TOrderFn<TVal> : never;
  transformOptionFn?: TType extends OptionBasedColumnDataType
    ? TTransformOptionFn<TVal>
    : never;
  type: TType;
}

export type OptionColumnId<T> =
  T extends ColumnConfig<
    // biome-ignore lint/suspicious/noExplicitAny: type extraction
    any,
    "option" | "multiOption",
    // biome-ignore lint/suspicious/noExplicitAny: type extraction
    any,
    infer TId
  >
    ? TId
    : never;

export type OptionColumnIds<
  // biome-ignore lint/suspicious/noExplicitAny: type extraction
  T extends ReadonlyArray<ColumnConfig<any, any, any, any>>,
> = {
  [K in keyof T]: OptionColumnId<T[K]>;
}[number];

export type NumberColumnId<T> =
  T extends ColumnConfig<
    // biome-ignore lint/suspicious/noExplicitAny: type extraction
    any,
    "number",
    // biome-ignore lint/suspicious/noExplicitAny: type extraction
    any,
    infer TId
  >
    ? TId
    : never;

export type NumberColumnIds<
  // biome-ignore lint/suspicious/noExplicitAny: type extraction
  T extends ReadonlyArray<ColumnConfig<any, any, any, any>>,
> = {
  [K in keyof T]: NumberColumnId<T[K]>;
}[number];

// ─── Column (runtime, with computed properties) ───

export interface ColumnProperties<TVal> {
  getFacetedMinMaxValues: () => [number, number] | undefined;
  getFacetedUniqueValues: () => Map<string, number> | undefined;
  getOptions: () => Array<ColumnOption>;
  getValues: () => Array<ElementType<NonNullable<TVal>>>;
}

export type Column<
  TData,
  TType extends ColumnDataType = ColumnDataType,
  TVal = unknown,
> = ColumnConfig<TData, TType, TVal> & ColumnProperties<TVal>;

// ─── Filter actions ───

export interface DataTableFilterActions {
  addFilterValue: <TData, TType extends OptionBasedColumnDataType>(
    column: Column<TData, TType>,
    values: FilterModel<TType>["values"]
  ) => void;

  removeAllFilters: () => void;

  removeFilter: (columnId: string) => void;

  removeFilterValue: <TData, TType extends OptionBasedColumnDataType>(
    column: Column<TData, TType>,
    value: FilterModel<TType>["values"]
  ) => void;

  setFilterOperator: <TType extends ColumnDataType>(
    columnId: string,
    operator: FilterModel<TType>["operator"]
  ) => void;

  setFilterValue: <TData, TType extends ColumnDataType>(
    column: Column<TData, TType>,
    values: FilterModel<TType>["values"]
  ) => void;

  setJoinOperator: (operator: JoinOperator) => void;
}

export type FilterStrategy = "client" | "server";

// ─── Search state ───

export interface DataTableSearchState {
  filters: FiltersState;
  joinOperator: JoinOperator;
  page: number;
  perPage: number;
  sort: Array<{ id: string; desc: boolean }>;
}

// ─── TanStack Table module augmentation ───

declare module "@tanstack/react-table" {
  interface ColumnMeta<
    TFeatures extends TableFeatures,
    TData extends RowData,
    TValue,
  > {
    filterConfig?: ColumnConfig<TData>;
    icon?: React.ComponentType<{ className?: string }>;
    label?: string;
    placeholder?: string;
  }
}
