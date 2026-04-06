import { ButtonGroupText } from "@ada/ui/components/ui/button-group";
import type { Column } from "../types";

interface FilterSubjectProps<TData> {
  column: Column<TData>;
}

export function FilterSubject<TData>({ column }: FilterSubjectProps<TData>) {
  const Icon = column.icon;

  return (
    <ButtonGroupText className="gap-1 bg-transparent px-1.5 text-muted-foreground text-xs">
      {Icon && <Icon className="size-3.5" />}
      {column.displayName}
    </ButtonGroupText>
  );
}
