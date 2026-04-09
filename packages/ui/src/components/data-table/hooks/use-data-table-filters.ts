import { useMemo, useState } from "react";
import {
  DEFAULT_OPERATORS,
  determineNewOperator,
  getOperatorDetail,
} from "../config";
import { createColumns } from "../core/filters";
import type {
  Column,
  ColumnConfig,
  ColumnDataType,
  ColumnOption,
  DataTableFilterActions,
  DataTableSearchState,
  FilterModel,
  FilterStrategy,
  FiltersState,
  JoinOperator,
  NumberColumnIds,
  OptionBasedColumnDataType,
  OptionColumnIds,
} from "../types";
import {
  addUniq,
  createDateFilterValue,
  createNumberFilterValue,
  generateFilterId,
  isColumnOptionArray,
  isColumnOptionMap,
  isMinMaxTuple,
  removeUniq,
  uniq,
} from "../utils/helpers";
import type { SearchStateAdapter } from "../utils/search-state";

export interface UseDataTableFiltersOptions<
  TData,
  // biome-ignore lint/suspicious/noExplicitAny: generic config
  TColumns extends ReadonlyArray<ColumnConfig<TData, any, any, any>>,
  TStrategy extends FilterStrategy,
> {
  adapter?: SearchStateAdapter<DataTableSearchState>;
  columnsConfig: TColumns;
  data: Array<TData>;
  faceted?: Partial<
    | Record<OptionColumnIds<TColumns>, Map<string, number> | undefined>
    | Record<NumberColumnIds<TColumns>, [number, number] | undefined>
  >;
  options?: Partial<
    Record<OptionColumnIds<TColumns>, Array<ColumnOption> | undefined>
  >;
  strategy: TStrategy;
}

function enhanceColumnConfig<
  TData,
  // biome-ignore lint/suspicious/noExplicitAny: generic config
  TColumns extends ReadonlyArray<ColumnConfig<TData, any, any, any>>,
>(
  // biome-ignore lint/suspicious/noExplicitAny: generic config
  config: ColumnConfig<TData, any, any, any>,
  options: UseDataTableFiltersOptions<
    TData,
    TColumns,
    FilterStrategy
  >["options"],
  faceted: UseDataTableFiltersOptions<
    TData,
    TColumns,
    FilterStrategy
  >["faceted"]
  // biome-ignore lint/suspicious/noExplicitAny: generic config
): ColumnConfig<TData, any, any, any> {
  let final = config;

  if (options && (config.type === "option" || config.type === "multiOption")) {
    const optionsInput = options[config.id as OptionColumnIds<TColumns>];
    if (!(optionsInput && isColumnOptionArray(optionsInput))) {
      return config;
    }
    final = { ...final, options: optionsInput };
  }

  if (faceted && (config.type === "option" || config.type === "multiOption")) {
    const facetedInput = faceted[config.id as OptionColumnIds<TColumns>];
    if (!(facetedInput && isColumnOptionMap(facetedInput))) {
      return config;
    }
    final = { ...final, facetedOptions: facetedInput };
  }

  if (config.type === "number" && faceted) {
    const minMaxTuple = faceted[config.id as NumberColumnIds<TColumns>];
    if (!(minMaxTuple && isMinMaxTuple(minMaxTuple))) {
      return config;
    }
    final = { ...final, min: minMaxTuple[0], max: minMaxTuple[1] };
  }

  return final;
}

function normalizeFilterValues<TType extends ColumnDataType>(
  type: TType,
  values: FilterModel<TType>["values"]
): FilterModel<TType>["values"] {
  if (type === "number") {
    return createNumberFilterValue(
      values as Array<number>
    ) as FilterModel<TType>["values"];
  }
  if (type === "date") {
    return createDateFilterValue(
      values as [Date, Date] | [Date] | [] | undefined
    ) as FilterModel<TType>["values"];
  }
  return uniq(values) as FilterModel<TType>["values"];
}

function createNewFilterModel<TData, TType extends ColumnDataType>(
  column: Column<TData, TType>,
  values: FilterModel<TType>["values"],
  newValues: FilterModel<TType>["values"]
): FilterModel<TType> {
  return {
    filterId: generateFilterId(),
    columnId: column.id,
    type: column.type,
    operator:
      values.length > 1
        ? DEFAULT_OPERATORS[column.type].multiple
        : DEFAULT_OPERATORS[column.type].single,
    values: newValues,
  } as FilterModel<TType>;
}

function transformFilterForOperator<TType extends ColumnDataType>(
  filter: FiltersState[number],
  operator: FilterModel<TType>["operator"]
): FiltersState[number] {
  const oldDetails = getOperatorDetail(filter.type, filter.operator);
  const newDetails = getOperatorDetail(filter.type, operator);

  if (!(oldDetails && newDetails) || oldDetails.target === newDetails.target) {
    return { ...filter, operator };
  }

  // multiple → single: keep first value
  if (oldDetails.target === "multiple" && newDetails.target === "single") {
    return {
      ...filter,
      operator,
      values: filter.values.length > 0 ? [filter.values[0]] : filter.values,
    };
  }

  // single → multiple: duplicate the single value as [start, end]
  if (oldDetails.target === "single" && newDetails.target === "multiple") {
    return {
      ...filter,
      operator,
      values:
        filter.values.length > 0
          ? [filter.values[0], filter.values[0]]
          : filter.values,
    };
  }

  return { ...filter, operator };
}

function updateOptionFilter<TData, TType extends OptionBasedColumnDataType>(
  prev: FiltersState,
  column: Column<TData, TType>,
  transformValues: (
    existing: FilterModel<TType>["values"]
  ) => FilterModel<TType>["values"]
): FiltersState {
  const filter = prev.find((f) => f.columnId === column.id);
  if (!filter || filter.values.length === 0) {
    return prev;
  }

  const oldValues = filter.values;
  const newValues = transformValues(oldValues as FilterModel<TType>["values"]);
  const newOperator = determineNewOperator(
    column.type,
    oldValues,
    newValues,
    filter.operator
  );

  if (newValues.length === 0) {
    return prev.filter((f) => f.columnId !== column.id);
  }

  return prev.map((f) =>
    f.columnId === column.id
      ? { ...f, operator: newOperator, values: newValues }
      : f
  );
}

export function useDataTableFilters<
  TData,
  // biome-ignore lint/suspicious/noExplicitAny: generic config
  TColumns extends ReadonlyArray<ColumnConfig<TData, any, any, any>>,
  TStrategy extends FilterStrategy,
>({
  strategy,
  data,
  columnsConfig,
  adapter,
  options,
  faceted,
}: UseDataTableFiltersOptions<TData, TColumns, TStrategy>) {
  const [localFilters, setLocalFilters] = useState<FiltersState>([]);
  const [localJoinOperator, setLocalJoinOperator] =
    useState<JoinOperator>("and");

  const filters = adapter ? adapter.read().filters : localFilters;
  const joinOperator = adapter
    ? adapter.read().joinOperator
    : localJoinOperator;

  const setFilters = useMemo(() => {
    if (adapter) {
      return (updater: (prev: FiltersState) => FiltersState) => {
        adapter.write((prev) => ({
          ...prev,
          filters: updater(prev.filters),
        }));
      };
    }
    return (updater: (prev: FiltersState) => FiltersState) => {
      setLocalFilters((prev) => updater(prev));
    };
  }, [adapter]);

  const setJoinOp = useMemo(() => {
    if (adapter) {
      return (op: JoinOperator) => {
        adapter.write((prev) => ({ ...prev, joinOperator: op }));
      };
    }
    return setLocalJoinOperator;
  }, [adapter]);

  const columns = useMemo(() => {
    const enhancedConfigs = columnsConfig.map((config) =>
      enhanceColumnConfig(config, options, faceted)
    );

    return createColumns(data, enhancedConfigs, strategy);
  }, [data, columnsConfig, options, faceted, strategy]);

  const actions: DataTableFilterActions = useMemo(
    () => ({
      addFilterValue<TData, TType extends OptionBasedColumnDataType>(
        column: Column<TData, TType>,
        values: FilterModel<TType>["values"]
      ) {
        setFilters((prev) => {
          const filter = prev.find((f) => f.columnId === column.id);
          const isColumnFiltered = filter && filter.values.length > 0;

          if (!isColumnFiltered) {
            return [
              ...prev,
              {
                filterId: generateFilterId(),
                columnId: column.id,
                type: column.type,
                operator:
                  values.length > 1
                    ? DEFAULT_OPERATORS[column.type].multiple
                    : DEFAULT_OPERATORS[column.type].single,
                values,
              },
            ];
          }

          return updateOptionFilter(prev, column, (existing) =>
            addUniq(existing, values)
          );
        });
      },

      removeFilterValue<TData, TType extends OptionBasedColumnDataType>(
        column: Column<TData, TType>,
        value: FilterModel<TType>["values"]
      ) {
        setFilters((prev) =>
          updateOptionFilter(prev, column, (existing) =>
            removeUniq(existing, value)
          )
        );
      },

      setFilterValue<TData, TType extends ColumnDataType>(
        column: Column<TData, TType>,
        values: FilterModel<TType>["values"]
      ) {
        setFilters((prev) => {
          const newValues = normalizeFilterValues(column.type, values);
          if (newValues.length === 0) {
            return prev;
          }

          const filter = prev.find((f) => f.columnId === column.id);
          const isColumnFiltered = filter && filter.values.length > 0;

          if (!isColumnFiltered) {
            return [...prev, createNewFilterModel(column, values, newValues)];
          }

          const newOperator = determineNewOperator(
            column.type,
            filter.values,
            newValues,
            filter.operator
          );

          return prev.map((f) =>
            f.columnId === column.id
              ? ({
                  ...f,
                  operator: newOperator,
                  values: newValues,
                } as FilterModel<TType>)
              : f
          );
        });
      },

      setFilterOperator<TType extends ColumnDataType>(
        columnId: string,
        operator: FilterModel<TType>["operator"]
      ) {
        setFilters((prev) =>
          prev.map((f) =>
            f.columnId === columnId
              ? transformFilterForOperator(f, operator)
              : f
          )
        );
      },

      removeFilter(columnId: string) {
        setFilters((prev) => prev.filter((f) => f.columnId !== columnId));
      },

      removeAllFilters() {
        setFilters(() => []);
      },

      setJoinOperator(operator: JoinOperator) {
        setJoinOp(operator);
      },
    }),
    [setFilters, setJoinOp]
  );

  return { columns, filters, joinOperator, actions, strategy };
}
