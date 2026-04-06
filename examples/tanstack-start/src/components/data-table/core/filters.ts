import { isAnyOf, isColumnOptionArray, uniq } from "../lib/helpers";
import type {
  Column,
  ColumnConfig,
  ColumnDataType,
  ColumnOption,
  ElementType,
  FilterStrategy,
  Nullable,
  TAccessorFn,
  TOrderFn,
  TTransformOptionFn,
} from "../types";

// ─── Column Config Builder ───

class ColumnConfigBuilder<
  TData,
  TType extends ColumnDataType = ColumnDataType,
  TVal = unknown,
  TId extends string = string,
> {
  private config: Partial<ColumnConfig<TData, TType, TVal, TId>>;

  constructor(type: TType) {
    this.config = { type } as Partial<ColumnConfig<TData, TType, TVal, TId>>;
  }

  private clone(): ColumnConfigBuilder<TData, TType, TVal, TId> {
    const newInstance = new ColumnConfigBuilder<TData, TType, TVal, TId>(
      this.config.type as TType
    );
    newInstance.config = { ...this.config };
    return newInstance;
  }

  id<TNewId extends Extract<keyof TData, string> | (string & {})>(
    value: TNewId
  ): ColumnConfigBuilder<TData, TType, TVal, TNewId> {
    const newInstance = this.clone();
    (newInstance.config as Record<string, unknown>).id = value;
    return newInstance as unknown as ColumnConfigBuilder<
      TData,
      TType,
      TVal,
      TNewId
    >;
  }

  accessor<TNewVal>(
    accessor: TAccessorFn<TData, TNewVal>
  ): ColumnConfigBuilder<TData, TType, TNewVal, TId> {
    const newInstance = this.clone();
    (newInstance.config as Record<string, unknown>).accessor = accessor;
    return newInstance as unknown as ColumnConfigBuilder<
      TData,
      TType,
      TNewVal,
      TId
    >;
  }

  displayName(value: string): ColumnConfigBuilder<TData, TType, TVal, TId> {
    const newInstance = this.clone();
    newInstance.config.displayName = value;
    return newInstance;
  }

  icon(
    value: React.ComponentType<{ className?: string }>
  ): ColumnConfigBuilder<TData, TType, TVal, TId> {
    const newInstance = this.clone();
    newInstance.config.icon = value;
    return newInstance;
  }

  min(value: number): ColumnConfigBuilder<TData, TType, TVal, TId> {
    if (this.config.type !== "number") {
      throw new Error("min() is only applicable to number columns");
    }
    const newInstance = this.clone();
    (newInstance.config as Record<string, unknown>).min = value;
    return newInstance;
  }

  max(value: number): ColumnConfigBuilder<TData, TType, TVal, TId> {
    if (this.config.type !== "number") {
      throw new Error("max() is only applicable to number columns");
    }
    const newInstance = this.clone();
    (newInstance.config as Record<string, unknown>).max = value;
    return newInstance;
  }

  options(
    value: Array<ColumnOption>
  ): ColumnConfigBuilder<TData, TType, TVal, TId> {
    if (!isAnyOf(this.config.type, ["option", "multiOption"])) {
      throw new Error(
        "options() is only applicable to option or multiOption columns"
      );
    }
    const newInstance = this.clone();
    (newInstance.config as Record<string, unknown>).options = value;
    return newInstance;
  }

  transformOptionFn(
    fn: TTransformOptionFn<TVal>
  ): ColumnConfigBuilder<TData, TType, TVal, TId> {
    if (!isAnyOf(this.config.type, ["option", "multiOption"])) {
      throw new Error(
        "transformOptionFn() is only applicable to option or multiOption columns"
      );
    }
    const newInstance = this.clone();
    (newInstance.config as Record<string, unknown>).transformOptionFn = fn;
    return newInstance;
  }

  orderFn(fn: TOrderFn<TVal>): ColumnConfigBuilder<TData, TType, TVal, TId> {
    if (!isAnyOf(this.config.type, ["option", "multiOption"])) {
      throw new Error(
        "orderFn() is only applicable to option or multiOption columns"
      );
    }
    const newInstance = this.clone();
    (newInstance.config as Record<string, unknown>).orderFn = fn;
    return newInstance;
  }

  build(): ColumnConfig<TData, TType, TVal, TId> {
    if (!this.config.id) {
      throw new Error("id is required");
    }
    if (!this.config.accessor) {
      throw new Error("accessor is required");
    }
    if (!this.config.displayName) {
      throw new Error("displayName is required");
    }
    if (!this.config.icon) {
      throw new Error("icon is required");
    }
    return this.config as ColumnConfig<TData, TType, TVal, TId>;
  }
}

// ─── Factory ───

interface FluentColumnConfigHelper<TData> {
  date: () => ColumnConfigBuilder<TData, "date", Date>;
  multiOption: () => ColumnConfigBuilder<TData, "multiOption", Array<string>>;
  number: () => ColumnConfigBuilder<TData, "number", number>;
  option: () => ColumnConfigBuilder<TData, "option", string>;
  text: () => ColumnConfigBuilder<TData, "text", string>;
}

export function createColumnConfigHelper<
  TData,
>(): FluentColumnConfigHelper<TData> {
  return {
    text: () => new ColumnConfigBuilder<TData, "text", string>("text"),
    number: () => new ColumnConfigBuilder<TData, "number", number>("number"),
    date: () => new ColumnConfigBuilder<TData, "date", Date>("date"),
    option: () => new ColumnConfigBuilder<TData, "option", string>("option"),
    multiOption: () =>
      new ColumnConfigBuilder<TData, "multiOption", Array<string>>(
        "multiOption"
      ),
  };
}

// ─── Column options/values computation ───

export function getColumnOptions<TData, TType extends ColumnDataType, TVal>(
  column: ColumnConfig<TData, TType, TVal>,
  data: Array<TData>,
  strategy: FilterStrategy
): Array<ColumnOption> {
  if (!isAnyOf(column.type, ["option", "multiOption"])) {
    return [];
  }

  if (strategy === "server" && !column.options) {
    throw new Error("column options are required for server-side filtering");
  }

  if (column.options) {
    return column.options;
  }

  const filtered = data
    .flatMap(column.accessor)
    .filter((v): v is NonNullable<TVal> => v !== undefined && v !== null);

  let models = uniq(filtered);

  if (column.orderFn) {
    models = models.sort((m1, m2) =>
      column.orderFn!(
        m1 as ElementType<NonNullable<TVal>>,
        m2 as ElementType<NonNullable<TVal>>
      )
    );
  }

  if (column.transformOptionFn) {
    return models.map((m) =>
      column.transformOptionFn!(m as ElementType<NonNullable<TVal>>)
    );
  }

  if (isColumnOptionArray(models)) {
    return models;
  }

  throw new Error(
    `[data-table-filter] [${column.id}] Either provide static options, a transformOptionFn, or ensure column data conforms to ColumnOption type`
  );
}

export function getColumnValues<TData, TType extends ColumnDataType, TVal>(
  column: ColumnConfig<TData, TType, TVal>,
  data: Array<TData>
) {
  const raw = data
    .flatMap(column.accessor)
    .filter(
      (v): v is NonNullable<TVal> => v !== undefined && v !== null
    ) as Array<ElementType<NonNullable<TVal>>>;

  if (!isAnyOf(column.type, ["option", "multiOption"])) {
    return raw;
  }

  if (column.options) {
    return raw
      .map((v) => column.options?.find((o) => o.value === v)?.value)
      .filter((v) => v !== undefined && v !== null);
  }

  if (column.transformOptionFn) {
    return raw.map(
      (v) => column.transformOptionFn!(v) as ElementType<NonNullable<TVal>>
    );
  }

  if (isColumnOptionArray(raw)) {
    return raw;
  }

  throw new Error(
    `[data-table-filter] [${column.id}] Either provide static options, a transformOptionFn, or ensure column data conforms to ColumnOption type`
  );
}

export function getFacetedUniqueValues<
  TData,
  TType extends ColumnDataType,
  TVal,
>(
  column: ColumnConfig<TData, TType, TVal>,
  values: Array<string> | Array<ColumnOption>,
  strategy: FilterStrategy
): Map<string, number> | undefined {
  if (!isAnyOf(column.type, ["option", "multiOption"])) {
    return new Map<string, number>();
  }

  if (strategy === "server") {
    return column.facetedOptions;
  }

  const acc = new Map<string, number>();

  if (isColumnOptionArray(values)) {
    for (const option of values) {
      acc.set(option.value, (acc.get(option.value) ?? 0) + 1);
    }
  } else {
    for (const option of values) {
      acc.set(option as string, (acc.get(option as string) ?? 0) + 1);
    }
  }

  return acc;
}

export function getFacetedMinMaxValues<
  TData,
  TType extends ColumnDataType,
  TVal,
>(
  column: ColumnConfig<TData, TType, TVal>,
  data: Array<TData>,
  strategy: FilterStrategy
): [number, number] | undefined {
  if (column.type !== "number") {
    return undefined;
  }

  if (typeof column.min === "number" && typeof column.max === "number") {
    return [column.min, column.max];
  }

  if (strategy === "server") {
    return undefined;
  }

  const values = data
    .flatMap((row) => column.accessor(row) as Nullable<number>)
    .filter((v): v is number => typeof v === "number" && !Number.isNaN(v));

  if (values.length === 0) {
    return [0, 0];
  }

  return [Math.min(...values), Math.max(...values)];
}

// ─── Create runtime columns ───

export function createColumns<TData>(
  data: Array<TData>,
  // biome-ignore lint/suspicious/noExplicitAny: generic column config
  columnConfigs: ReadonlyArray<ColumnConfig<TData, any, any, any>>,
  strategy: FilterStrategy
): Array<Column<TData>> {
  return columnConfigs.map((columnConfig) => {
    return {
      ...columnConfig,
      getOptions: () => getColumnOptions(columnConfig, data, strategy),
      getValues: () =>
        strategy === "client" ? getColumnValues(columnConfig, data) : [],
      getFacetedUniqueValues: () => {
        const values =
          strategy === "client" ? getColumnValues(columnConfig, data) : [];
        // biome-ignore lint/suspicious/noExplicitAny: generic values
        return getFacetedUniqueValues(columnConfig, values as any, strategy);
      },
      getFacetedMinMaxValues: () =>
        getFacetedMinMaxValues(columnConfig, data, strategy),
    } as Column<TData>;
  });
}
