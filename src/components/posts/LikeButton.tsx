import { PostLikeDataServer } from "@/lib/types";
import { cn } from "@/lib/utils";
import { QueryKey, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Heart, Loader2 } from "lucide-react";

interface LikeButtonProps {
  postId: string;
  initialData: PostLikeDataServer;
}

export default function LikeButton({ postId, initialData }: LikeButtonProps) {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const response = !initialData.isFollowedByMe
        ? await axios.post(`/api/feeds/like/${postId}`)
        : await axios.delete(`/api/feeds/like/${postId}`);
      return response;
    },
    onSuccess: () => {
      const queryKey: QueryKey = ["f_feed", postId, "like"];

      queryClient.cancelQueries({ queryKey });

      const previousData = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (oldData: PostLikeDataServer) => ({
        isFollowedByMe: !oldData.isFollowedByMe,
        likeCount: oldData.isFollowedByMe
          ? oldData.likeCount - 1
          : oldData.likeCount + 1,
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
      className="flex cursor-pointer items-center gap-1 text-sm hover:text-pink-500"
      title="Like"
      onClick={(e) => {
        e.stopPropagation();
        mutate();
      }}
    >
      <Heart
        size={16}
        className={cn(
          "hover:text-pink-500",
          initialData.isFollowedByMe && "fill-pink-600",
        )}
      />
      <span>{initialData.likeCount}</span>
    </button>
  );
}
