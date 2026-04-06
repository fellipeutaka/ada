import { Toolbar } from "@base-ui/react/toolbar";
import { useHotkey } from "@tanstack/react-hotkeys";
import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "../../lib/cva";
import { buttonVariants } from "./button";

interface ActionBarProps extends Toolbar.Root.Props {
  align?: "start" | "center" | "end";
  alignOffset?: number;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  portalContainer?: Element | DocumentFragment | null;
  side?: "top" | "bottom";
  sideOffset?: number;
}

function ActionBar(props: ActionBarProps) {
  const {
    open = false,
    onOpenChange,
    side = "bottom",
    alignOffset = 0,
    align = "center",
    sideOffset = 16,
    portalContainer: portalContainerProp,
    orientation = "horizontal",
    className,
    style,
    children,
    ...rootProps
  } = props;

  const [mounted, setMounted] = useState(false);

  const onOpenChangeRef = useRef(onOpenChange);
  useLayoutEffect(() => {
    onOpenChangeRef.current = onOpenChange;
  });

  useLayoutEffect(() => {
    setMounted(true);
  }, []);

  useHotkey(
    "Escape",
    () => {
      onOpenChangeRef.current?.(false);
    },
    {
      enabled: open,
    }
  );

  const portalContainer =
    portalContainerProp ?? (mounted ? globalThis.document?.body : null);

  if (!(portalContainer && open)) {
    return null;
  }

  return createPortal(
    <Toolbar.Root
      data-align={align}
      data-side={side}
      data-slot="action-bar"
      {...rootProps}
      className={cn(
        "fixed z-50 rounded-lg border bg-card shadow-lg outline-none",
        "fade-in-0 zoom-in-95 animate-in duration-250 [animation-timing-function:cubic-bezier(0.16,1,0.3,1)]",
        "data-[side=bottom]:slide-in-from-bottom-4 data-[side=top]:slide-in-from-top-4",
        "motion-reduce:animate-none motion-reduce:transition-none",
        orientation === "horizontal"
          ? "flex flex-row items-center gap-2 px-2 py-1.5"
          : "flex flex-col items-start gap-2 px-1.5 py-2",
        className
      )}
      style={{
        [side]: `${sideOffset}px`,
        ...(align === "center" && { left: "50%", translate: "-50% 0" }),
        ...(align === "start" && { left: `${alignOffset}px` }),
        ...(align === "end" && { right: `${alignOffset}px` }),
        ...style,
      }}
    >
      {children}
    </Toolbar.Root>,
    portalContainer
  );
}

function ActionBarGroup({
  className,
  ...props
}: React.ComponentProps<typeof Toolbar.Group>) {
  return (
    <Toolbar.Group
      data-slot="action-bar-group"
      {...props}
      className={cn("flex items-center gap-2", className)}
    />
  );
}

type ActionBarItemProps = React.ComponentProps<typeof Toolbar.Button> & {
  variant?: "default" | "secondary" | "outline" | "ghost" | "destructive";
};

function ActionBarItem({
  className,
  variant = "secondary",
  ...props
}: ActionBarItemProps) {
  return (
    <Toolbar.Button
      data-slot="action-bar-item"
      {...props}
      className={cn(buttonVariants({ variant, size: "sm" }), className)}
    />
  );
}

function ActionBarSeparator({
  className,
  ...props
}: React.ComponentProps<typeof Toolbar.Separator>) {
  return (
    <Toolbar.Separator
      data-slot="action-bar-separator"
      {...props}
      className={cn("h-6 w-px bg-border", className)}
    />
  );
}

export {
  ActionBar,
  ActionBarGroup,
  ActionBarItem,
  type ActionBarProps,
  ActionBarSeparator,
};
