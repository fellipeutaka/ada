import { cn } from "@ada/ui/lib/utils";
import { Autocomplete as AutocompletePrimitive } from "@base-ui/react/autocomplete";
import { CheckIcon } from "@phosphor-icons/react";

const Autocomplete = AutocompletePrimitive.Root;

function AutocompleteInput({
  className,
  ...props
}: AutocompletePrimitive.Input.Props) {
  return (
    <AutocompletePrimitive.Input
      className={cn(
        "placeholder:text-muted-foreground w-full bg-transparent text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      data-slot="autocomplete-input"
      {...props}
    />
  );
}

function AutocompleteList({
  className,
  ...props
}: AutocompletePrimitive.List.Props) {
  return (
    <AutocompletePrimitive.List
      className={cn(
        "max-h-72 scroll-py-1 overflow-y-auto overscroll-contain p-1 outline-none",
        className
      )}
      data-slot="autocomplete-list"
      {...props}
    />
  );
}

function AutocompleteItem({
  className,
  ...props
}: AutocompletePrimitive.Item.Props) {
  return (
    <AutocompletePrimitive.Item
      className={cn(
        "data-highlighted:bg-accent data-highlighted:text-accent-foreground relative flex w-full cursor-default items-center gap-2 rounded-md py-1.5 pr-2 pl-2 text-sm outline-hidden select-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      data-slot="autocomplete-item"
      {...props}
    />
  );
}

function AutocompleteCheckboxItem({
  className,
  children,
  checked,
  ...props
}: AutocompletePrimitive.Item.Props & {
  checked?: boolean;
}) {
  return (
    <AutocompletePrimitive.Item
      className={cn(
        "data-highlighted:bg-accent data-highlighted:text-accent-foreground relative flex w-full cursor-default items-center gap-2 rounded-md py-1.5 pr-8 pl-2 text-sm outline-hidden select-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      data-slot="autocomplete-checkbox-item"
      {...props}
    >
      {children}
      <span
        className="pointer-events-none absolute right-2 flex size-4 items-center justify-center"
        data-slot="autocomplete-checkbox-item-indicator"
      >
        {!!checked && <CheckIcon />}
      </span>
    </AutocompletePrimitive.Item>
  );
}

function AutocompleteEmpty({
  className,
  ...props
}: AutocompletePrimitive.Empty.Props) {
  return (
    <AutocompletePrimitive.Empty
      className={cn(
        "text-muted-foreground flex items-center justify-center py-4 text-center text-sm empty:hidden",
        className
      )}
      data-slot="autocomplete-empty"
      {...props}
    />
  );
}

function AutocompleteGroup({
  className,
  ...props
}: AutocompletePrimitive.Group.Props) {
  return (
    <AutocompletePrimitive.Group
      className={cn("not-last:mb-1", className)}
      data-slot="autocomplete-group"
      {...props}
    />
  );
}

function AutocompleteGroupLabel({
  className,
  ...props
}: AutocompletePrimitive.GroupLabel.Props) {
  return (
    <AutocompletePrimitive.GroupLabel
      className={cn(
        "text-muted-foreground flex h-7 items-center px-2 text-xs select-none",
        className
      )}
      data-slot="autocomplete-group-label"
      {...props}
    />
  );
}

function AutocompleteCollection({
  ...props
}: AutocompletePrimitive.Collection.Props) {
  return (
    <AutocompletePrimitive.Collection
      data-slot="autocomplete-collection"
      {...props}
    />
  );
}

function AutocompleteSeparator({
  className,
  ...props
}: AutocompletePrimitive.Separator.Props) {
  return (
    <AutocompletePrimitive.Separator
      className={cn("bg-border -mx-1 my-1 h-px", className)}
      data-slot="autocomplete-separator"
      {...props}
    />
  );
}

function AutocompletePopup({
  className,
  ...props
}: AutocompletePrimitive.Popup.Props) {
  return (
    <AutocompletePrimitive.Popup
      className={cn(
        "bg-popover text-popover-foreground ring-foreground/10 max-h-(--available-height) w-(--anchor-width) max-w-(--available-width) overflow-hidden rounded-lg shadow-md ring-1",
        className
      )}
      data-slot="autocomplete-popup"
      {...props}
    />
  );
}

function AutocompletePositioner({
  className,
  sideOffset = 4,
  ...props
}: AutocompletePrimitive.Positioner.Props) {
  return (
    <AutocompletePrimitive.Positioner
      className={cn("isolate z-50 outline-hidden", className)}
      data-slot="autocomplete-positioner"
      sideOffset={sideOffset}
      {...props}
    />
  );
}

const AutocompletePortal = AutocompletePrimitive.Portal;
const AutocompleteStatus = AutocompletePrimitive.Status;

export {
  Autocomplete,
  AutocompleteCheckboxItem,
  AutocompleteCollection,
  AutocompleteEmpty,
  AutocompleteGroup,
  AutocompleteGroupLabel,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
  AutocompletePopup,
  AutocompletePortal,
  AutocompletePositioner,
  AutocompleteSeparator,
  AutocompleteStatus,
};
