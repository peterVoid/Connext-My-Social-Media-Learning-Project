import { PostRepostDataServer } from "@/lib/types";
import { cn } from "@/lib/utils";
import { QueryKey, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { BiRepost } from "react-icons/bi";

interface RepostButtonProps {
  postId: string;
  initialData: PostRepostDataServer;
}

export default function RepostButton({
  initialData,
  postId,
}: RepostButtonProps) {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const response = !initialData.isRepostedByMe
        ? await axios.post(`/api/feeds/repost/${postId}`)
        : await axios.delete(`/api/feeds/repost/${postId}`);
      return response;
    },
    onSuccess: () => {
      const queryKey: QueryKey = ["f_feed", postId, "repost"];

      queryClient.cancelQueries({ queryKey });

      const previousData = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (oldData: PostRepostDataServer) => ({
        isRepostedByMe: !oldData.isRepostedByMe,
        repostCount: oldData.isRepostedByMe
          ? oldData.repostCount - 1
          : oldData.repostCount + 1,
      }));
      return { previousData };
    },
    onError: (error, prevData, context) => {
      console.error(error);
      // queryClient.setQueryData(["f_feed", postId], context?.);
    },
  });

  if (isPending) {
    return <Loader2 className="size-4 animate-spin" />;
  }

  return (
    <button
      className="flex cursor-pointer items-center gap-1 text-sm hover:text-green-500"
      title="Repost"
      onClick={(e) => {
        e.stopPropagation();
        mutate();
      }}
    >
      <BiRepost
        size={16}
        className={cn(
          "hover:text-green-500",
          initialData.isRepostedByMe && "fill-green-600",
        )}
      />
      <span>{initialData.repostCount}</span>
    </button>
  );
}
