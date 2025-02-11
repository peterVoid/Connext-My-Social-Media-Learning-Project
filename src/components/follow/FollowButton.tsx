import { useFollowInfo } from "@/hooks/useFollowInfo";
import { QueryKey, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { followUser } from "./action";
import { FollowInfo } from "@/lib/types";

interface FollowButtonProps {
  userId: string;
}

export default function FollowButton({ userId }: FollowButtonProps) {
  const queryClient = useQueryClient();

  const { data: followInfo, isLoading } = useFollowInfo(userId);

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const data = await followUser(
        userId,
        followInfo?.hasFollowUser as boolean,
      );
      return data;
    },
    onSuccess: async () => {
      const queryKey: QueryKey = ["f_userFollowInfo", userId];

      await queryClient.cancelQueries({ queryKey });

      const previousData = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (oldData: FollowInfo) => ({
        hasFollowUser: !oldData.hasFollowUser,
        followersCount: oldData.hasFollowUser
          ? oldData.followersCount - 1
          : oldData.followersCount + 1,
      }));
    },
    onError: (error) => {
      console.error(error);
    },
  });

  if (isLoading) {
    return <Loader2 className="animate-spin" />;
  }

  return (
    <button
      className="rounded-full bg-white p-2 font-semibold text-black"
      onClick={() => mutate()}
    >
      {followInfo?.hasFollowUser ? "Unfollow" : "Follow"}
    </button>
  );
}
