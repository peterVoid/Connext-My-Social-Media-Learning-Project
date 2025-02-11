import { Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { DropdownMenuItem } from "../ui/dropdown-menu";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteStatus } from "./actions.";
import { useState } from "react";

interface DeletePostDropdownProps {
  postId: string;
  userId: string;
}

export default function DeletePostDropdown({
  postId,
  userId,
}: DeletePostDropdownProps) {
  const [openDialog, setOpenDialog] = useState(false);

  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const data = await deleteStatus(postId);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["f_feed", "user", "post", userId],
      });

      setOpenDialog(false);
    },
    onError: (error) => {
      console.error(error);
    },
  });

  return (
    <DropdownMenuItem className="cursor-pointer" asChild>
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogTrigger asChild>
          <div className="flex cursor-pointer items-center gap-2 text-red-500">
            <Trash2 />
            <span>Delete</span>
          </div>
        </DialogTrigger>
        <DialogContent className="bg-black text-white">
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogFooter>
            <button
              className="rounded-md bg-red-500 p-2 text-white disabled:bg-white/50"
              onClick={() => mutate()}
              disabled={isPending}
            >
              Delete
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DropdownMenuItem>
  );
}
