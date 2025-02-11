import { PostBookmarkedDataServer, PostLikeDataServer } from "@/lib/types";
import { cn } from "@/lib/utils";
import { QueryKey, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { BookmarkIcon, Heart, Loader2 } from "lucide-react";

interface BookmarkButtonProps {
  postId: string;
  initialData: PostBookmarkedDataServer;
}

export default function BookmarkButton({
  postId,
  initialData,
}: BookmarkButtonProps) {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const response = !initialData.isBookmarkedByMe
        ? await axios.post(`/api/feeds/bookmark/${postId}`)
        : await axios.delete(`/api/feeds/bookmark/${postId}`);
      return response;
    },
    onSuccess: () => {
      const queryKey: QueryKey = ["f_feed", postId, "bookmark"];

      queryClient.cancelQueries({ queryKey });

      const previousData = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(
        queryKey,
        (oldData: PostBookmarkedDataServer) => ({
          isBookmarkedByMe: !oldData.isBookmarkedByMe,
          bookmarkCount: oldData.isBookmarkedByMe
            ? oldData.bookmarkCount - 1
            : oldData.bookmarkCount + 1,
        }),
      );
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
      className="flex cursor-pointer items-center gap-1 text-sm hover:text-yellow-500"
      title="Like"
      onClick={(e) => {
        e.stopPropagation();
        mutate();
      }}
    >
      <BookmarkIcon
        size={16}
        className={cn(
          "hover:text-yellow-500",
          initialData.isBookmarkedByMe && "fill-yellow-600",
        )}
      />
      <span>{initialData.bookmarkCount}</span>
    </button>
  );
}
