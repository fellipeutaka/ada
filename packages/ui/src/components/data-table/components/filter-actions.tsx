import { Button } from "@ada/ui/components/ui/button";
import { XIcon } from "@phosphor-icons/react";
import type { DataTableFilterActions, FiltersState } from "../types";

interface FilterActionsProps {
  actions: DataTableFilterActions;
  filters: FiltersState;
}

export function FilterActions({ filters, actions }: FilterActionsProps) {
  if (filters.length === 0) {
    return null;
  }

  return (
    <Button
      onClick={() => actions.removeAllFilters()}
      size="xs"
      variant="ghost"
    >
      <XIcon data-icon="inline-start" />
      Clear all
    </Button>
  );
}
