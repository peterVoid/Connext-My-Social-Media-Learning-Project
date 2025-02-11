import { FollowInfo } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export function useFollowInfo(userId: string) {
  const { data, isLoading } = useQuery({
    queryKey: ["f_userFollowInfo", userId],
    queryFn: async () => {
      const response = await axios.get(`/api/users/follow/${userId}`);
      return response.data as FollowInfo;
    },
  });

  return {
    data,
    isLoading,
  };
}
