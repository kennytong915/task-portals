import { useState } from "react";
import { Row } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/resuable/confirm-dialog";
import { TaskType } from "@/types/api.type";
import { deleteTaskMutationFn } from "@/lib/api";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { toast } from "@/hooks/use-toast";

interface DataTableRowActionsProps {
  row: Row<TaskType>;
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const [openDeleteDialog, setOpenDialog] = useState(false);
  const workspaceId = useWorkspaceId();
  const queryClient = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationFn: deleteTaskMutationFn,
  });

  const taskId = row.original._id as string;
  const taskCode = row.original.taskCode;
  const projectId = row.original.project?._id as string | undefined;

  const handleConfirm = () => {
    if (!workspaceId || !taskId || isPending) return;
    mutate(
      { workspaceId, taskId },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["all-tasks", workspaceId] });
          if (projectId) {
            queryClient.invalidateQueries({
              queryKey: ["project-analytics", projectId],
            });
          }
          toast({
            title: "Success",
            description: "Task deleted successfully",
            variant: "success",
          });
          setOpenDialog(false);
        },
        onError: (error: any) => {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
          >
            <MoreHorizontal />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          {/* <DropdownMenuItem className="cursor-pointer">
            Edit Task
          </DropdownMenuItem>
          <DropdownMenuSeparator /> */}
          <DropdownMenuItem
            className={`!text-destructive cursor-pointer ${taskId}`}
            onClick={() => setOpenDialog(true)}
          >
            Delete Task
            <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        isOpen={openDeleteDialog}
        isLoading={isPending}
        onClose={() => setOpenDialog(false)}
        onConfirm={handleConfirm}
        title="Delete Task"
        description={`Are you sure you want to delete ${taskCode}`}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>
  );
}
