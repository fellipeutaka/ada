import { TrashIcon, XIcon } from "@phosphor-icons/react";
import { ExportIcon } from "@phosphor-icons/react/dist/ssr";
import { useMutation } from "@tanstack/react-query";
import type { Table } from "@tanstack/react-table";
import * as React from "react";
import { toast } from "sonner";
import type { Task } from "../../shared/tasks";
import {
  ActionBar,
  ActionBarGroup,
  ActionBarItem,
  ActionBarSeparator,
} from "../ui/action-bar";
import { Button } from "../ui/button";
import { ButtonGroup, ButtonGroupText } from "../ui/button-group";
import { Kbd } from "../ui/kbd";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

interface TasksTableActionBarProps {
  table: Table<Task>;
}

export function TasksTableActionBar({ table }: TasksTableActionBarProps) {
  const rows = table.getFilteredSelectedRowModel().rows;

  const onOpenChange = React.useCallback(
    (open: boolean) => {
      if (!open) {
        table.toggleAllRowsSelected(false);
      }
    },
    [table]
  );

  const deleteTasksMutation = useMutation({
    mutationFn: async (_taskIds: Array<string>) => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    },
    onMutate(taskIds) {
      const toastId = toast.loading(`Deleting ${taskIds.length} task(s)...`);

      return { toastId };
    },
    onSuccess: (_data, deletedTaskIds, { toastId }) => {
      toast.success(`${deletedTaskIds.length} task(s) deleted`, {
        id: toastId,
      });
      table.toggleAllRowsSelected(false);
    },
    onError: (_, __, result) => {
      toast.error("Failed to delete tasks", { id: result?.toastId });
    },
  });

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
          disabled={deleteTasksMutation.isPending}
          onClick={() =>
            deleteTasksMutation.mutate(rows.map((row) => row.original.id))
          }
          variant="destructive"
        >
          <TrashIcon />
          Delete
        </ActionBarItem>
      </ActionBarGroup>
    </ActionBar>
  );
}
