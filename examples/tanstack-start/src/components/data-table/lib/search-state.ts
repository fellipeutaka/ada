/**
 * Abstract interface for reading/writing search state.
 * UI components depend on this — never on router internals.
 */
export interface SearchStateAdapter<T> {
  read(): T;
  write(updater: (prev: T) => T): void;
}
