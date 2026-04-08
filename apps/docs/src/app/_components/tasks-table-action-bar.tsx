"use client";

import {
  ActionBar,
  ActionBarGroup,
  ActionBarItem,
  ActionBarSeparator,
} from "@ada/ui/components/ui/action-bar";
import { Button } from "@ada/ui/components/ui/button";
import {
  ButtonGroup,
  ButtonGroupText,
} from "@ada/ui/components/ui/button-group";
import { Kbd } from "@ada/ui/components/ui/kbd";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@ada/ui/components/ui/tooltip";
import { ExportIcon, TrashIcon, XIcon } from "@phosphor-icons/react";
import type { Table } from "@tanstack/react-table";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import type { Task } from "./tasks";

interface TasksTableActionBarProps {
  table: Table<Task>;
}

export function TasksTableActionBar({ table }: TasksTableActionBarProps) {
  const rows = table.getFilteredSelectedRowModel().rows;
  const [isPending, setIsPending] = useState(false);

  const onOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        table.toggleAllRowsSelected(false);
      }
    },
    [table]
  );

  async function handleDelete() {
    const taskIds = rows.map((row) => row.original.id);
    const toastId = toast.loading(`Deleting ${taskIds.length} task(s)...`);
    setIsPending(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      toast.success(`${taskIds.length} task(s) deleted`, { id: toastId });
      table.toggleAllRowsSelected(false);
    } catch {
      toast.error("Failed to delete tasks", { id: toastId });
    } finally {
      setIsPending(false);
    }
  }

  return (
    <ActionBar onOpenChange={onOpenChange} open={rows.length > 0}>
      <ButtonGroup>
        <ButtonGroupText className="text-xs tabular-nums">
          {rows.length} selected
        </ButtonGroupText>

        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                onClick={() => onOpenChange(false)}
                size="icon-sm"
                variant="outline"
              >
                <XIcon />
                <span className="sr-only">Clear selection</span>
              </Button>
            }
          />
          <TooltipContent>
            Clear selection <Kbd>Esc</Kbd>
          </TooltipContent>
        </Tooltip>
      </ButtonGroup>

      <ActionBarSeparator />

      <ActionBarGroup>
        <ActionBarItem>
          <ExportIcon />
          Export
        </ActionBarItem>

        <ActionBarItem
          disabled={isPending}
          onClick={handleDelete}
          variant="destructive"
        >
          <TrashIcon />
          Delete
        </ActionBarItem>
      </ActionBarGroup>
    </ActionBar>
  );
}
