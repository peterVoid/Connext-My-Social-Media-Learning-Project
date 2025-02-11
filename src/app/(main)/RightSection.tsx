import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserDataServerType } from "@/lib/types";
import { formatNumber } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import avatarPlaceholder from "@/assets/avatar-placeholder.png";
import FollowButton from "@/components/follow/FollowButton";
import { useSession } from "next-auth/react";

export default function RightSection() {
  const { data } = useSession();

  if (!data?.user) {
    return null;
  }

  return (
    <div className="sticky top-0 flex flex-col gap-20 px-3 py-7">
      <WhoToFollow />
      <TrendingHashtags />
    </div>
  );
}

function WhoToFollow() {
  const { data: usersData, isLoading } = useQuery({
    queryKey: ["f_userWhoToFollow"],
    queryFn: async () => {
      const response = await axios.get("/api/getUsers/whoToFollow");
      return response.data as UserDataServerType[];
    },
    staleTime: Infinity,
  });

  return (
    <div>
      <Card className="rounded-lg border border-white/20 bg-transparent text-white">
        <CardHeader>
          <CardTitle>
            <h1 className="text-xl font-bold">Who to follow?</h1>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {usersData?.map((data) => (
              <div
                key={data.id}
                className="flex items-center justify-between gap-3"
              >
                <div className="flex gap-1">
                  <Image
                    src={data.image || avatarPlaceholder}
                    alt="Avatar user"
                    width={10}
                    height={10}
                    className="size-10 rounded-full"
                  />
                  <div className="space-y-0.5">
                    <h4 className="text-md font-semibold">{data.firstname}</h4>
                    <p className="text-muted-foreground">@{data.username}</p>
                  </div>
                </div>
                <FollowButton userId={data.id} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function TrendingHashtags() {
  const { data: trendingHashtagsData } = useQuery({
    queryKey: ["f_trendingHashtags"],
    queryFn: async () => {
      const response = await axios.get("/api/getTrendingHashtag");
      return response.data as { hashtag: string; count: number }[];
    },
    staleTime: 3500,
  });

  return (
    <div>
      <Card className="rounded-lg border border-white/20 bg-transparent text-white">
        <CardHeader>
          <CardTitle>
            <h1 className="text-xl font-bold">Trending Topics</h1>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(trendingHashtagsData || []).map((data) => (
              <div key={data.hashtag}>
                <Link href="/hashtag" className="text-blue-500">
                  {data.hashtag}
                </Link>
                <div>
                  <span className="text-sm text-muted-foreground">
                    {formatNumber(data.count)}{" "}
                    {data.count > 1 ? "posts" : "post"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
