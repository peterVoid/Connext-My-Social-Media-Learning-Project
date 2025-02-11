import { useMutation, useQueryClient } from "@tanstack/react-query";
import { replyStatus } from "./actions.";
import { useState } from "react";

export function replyPostMutate(
  postId: string,
  editorValue: string,
  replyParentPostId: string,
  afterSuccess: () => void,
) {
  const queryClient = useQueryClient();
  const [isSuccess, setIsSuccess] = useState(false);

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const data = await replyStatus(
        postId,
        editorValue as string,
        replyParentPostId as string,
      );
      return data;
    },
    onSuccess: () => {
      afterSuccess();
      setIsSuccess(true);
      queryClient.invalidateQueries({
        queryKey: ["f_feed", postId, "replies-data"],
      });
      queryClient.invalidateQueries({
        queryKey: ["f_feed", postId, "reply"],
      });
    },
    onError: (error) => {
      console.error(error);
    },
  });

  return {
    mutate,
    isPending,
    isSuccess,
  };
}
