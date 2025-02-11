"use client";

import avatarPlaceholder from "@/assets/avatar-placeholder.png";
import FollowButton from "@/components/follow/FollowButton";
import PostCard from "@/components/posts/PostCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFollowInfo } from "@/hooks/useFollowInfo";
import { InfinitePostType, UserDataServerType } from "@/lib/types";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { formatDate } from "date-fns";
import { Calendar, ChevronLeft, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import EditProfileButton from "./EditProfileButton";

interface UserDetailsProps {
  username: string;
}

export default function UserDetails({ username }: UserDetailsProps) {
  const session = useSession();

  const { data, isLoading } = useQuery({
    queryKey: ["user", username],
    queryFn: async () => {
      const response = await axios.get(`/api/users/${username}`);
      return response.data as UserDataServerType;
    },
  });

  const { data: isFollowInfoData } = useFollowInfo(data?.id!);

  const handleBackButton = () => {
    window.history.back();
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="mx-auto animate-spin" />
      </div>
    );
  }

  return (
    data && (
      <div>
        <div className="sticky inset-x-0 top-0 z-50 flex h-14 items-center gap-5 bg-black px-5 py-2">
          <button onClick={handleBackButton}>
            <ChevronLeft />
          </button>
          <div>
            <h1 className="line-clamp-1 text-xl font-bold">
              {data.firstname + " " + data.surname}
            </h1>
            <span className="text-sm text-muted-foreground">
              {data.posts.length} Posts
            </span>
          </div>
        </div>
        {/* Header */}
        <div className="relative">
          <div className="aspect-video max-h-[200px] w-full bg-muted-foreground" />
          <div className="space-y-4 p-3">
            <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
              <div className="relative h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 lg:h-20 lg:w-20">
                <Image
                  src={data.image || avatarPlaceholder}
                  alt="User Profile"
                  fill
                  objectFit="cover"
                  className="rounded-full"
                />
              </div>
              {data.id === session.data?.user.id ? (
                <EditProfileButton userData={data} />
              ) : (
                <FollowButton userId={data.id} />
              )}
            </div>
            <div className="space-y-0.5">
              <h1 className="text-2xl font-bold">
                {data.firstname + " " + data.surname}
              </h1>
              <p className="text-muted-foreground">@{data.username}</p>
            </div>
            <p className="text-md">{data.bio || "No bio yet"}</p>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar size={18} />
              Join {formatDate(data.createdAt, "MMMM y")}
            </div>
            <div className="flex items-center gap-5">
              <div className="flex gap-1 text-sm">
                <span className="font-bold">
                  {isFollowInfoData?.followersCount}
                </span>
                <span className="text-muted-foreground">Followers</span>
              </div>
              <div className="flex gap-1">
                <span className="font-bold">{data.followings.length}</span>
                <span className="text-muted-foreground">Following</span>
              </div>
            </div>
          </div>
        </div>
        {/* Tabs */}
        <UserTabs userId={data.id} />
      </div>
    )
  );
}

interface UserTabsProps {
  userId: string;
}

function UserTabs({ userId }: UserTabsProps) {
  const { data } = useSession();

  if (!data) {
    return null;
  }

  return (
    <Tabs defaultValue="post">
      <TabsList className="grid w-full grid-cols-3 bg-black">
        <TabsTrigger value="post">Post</TabsTrigger>
        <TabsTrigger value="reply">Reply</TabsTrigger>
        {userId === data.user.id && (
          <TabsTrigger value="like">Like</TabsTrigger>
        )}
      </TabsList>
      <TabsContent value="post">
        <UserPostTabsContent userId={userId} />
      </TabsContent>
      <TabsContent value="reply">
        <UserReplyTabsContent userId={userId} />
      </TabsContent>
      {userId === data.user.id && (
        <TabsContent value="like">
          <UserPostLikeTabsContent userId={userId} />
        </TabsContent>
      )}
    </Tabs>
  );
}

function UserPostTabsContent({ userId }: UserTabsProps) {
  const { ref, inView } = useInView();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteQuery<InfinitePostType>({
      queryKey: ["f_feed", "user", "post", userId],
      queryFn: async ({ pageParam }) => {
        const response = await axios.get(
          `/api/feeds/user/${userId}/post?cursor=${pageParam}&limit=10`,
        );
        return response.data;
      },
      initialPageParam: null,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  if (status === "pending") {
    return (
      <div>
        <Loader2 className="mx-auto mt-3 animate-spin" />
      </div>
    );
  }

  if (status === "error") {
    return <div>Error</div>;
  }

  return (
    <div>
      <div className="space-y-2">
        {data.pages.map((page, pageIndex) => (
          <div key={pageIndex} className="space-y-3">
            {page.posts.map((post) => (
              <div key={post.id}>
                <PostCard
                  post={post}
                  initialLikeData={{
                    isFollowedByMe: post.likes.length > 0,
                    likeCount: post._count.likes,
                  }}
                  initialBookmarkData={{
                    isBookmarkedByMe: post.bookmarks.length > 0,
                    bookmarkCount: post._count.bookmarks,
                  }}
                  initialRepostData={{
                    isRepostedByMe: post.reposts.length > 0,
                    repostCount: post._count.reposts,
                  }}
                  initialReplyData={{
                    replyCount: post._count.replies,
                    postReplies: post.replies,
                  }}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
      <div ref={ref}>{isFetchingNextPage && "Loading more..."}</div>
    </div>
  );
}

function UserReplyTabsContent({ userId }: UserTabsProps) {
  const { ref, inView } = useInView();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteQuery<InfinitePostType>({
      queryKey: ["f_feed", "user", "reply", userId],
      queryFn: async ({ pageParam }) => {
        const response = await axios.get(
          `/api/feeds/user/${userId}/reply?cursor=${pageParam}&limit=10`,
        );
        return response.data;
      },
      initialPageParam: null,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  if (status === "pending") {
    return (
      <div>
        <Loader2 className="mx-auto mt-3 animate-spin" />
      </div>
    );
  }

  if (status === "error") {
    return <div>Error</div>;
  }

  return (
    <div>
      <div className="space-y-2">
        {data.pages.map((page, pageIndex) => (
          <div key={pageIndex} className="space-y-3">
            {page.posts.map((post) => (
              <div key={post.id}>
                <PostCard
                  post={post}
                  initialLikeData={{
                    isFollowedByMe: post.likes.length > 0,
                    likeCount: post._count.likes,
                  }}
                  initialBookmarkData={{
                    isBookmarkedByMe: post.bookmarks.length > 0,
                    bookmarkCount: post._count.bookmarks,
                  }}
                  initialRepostData={{
                    isRepostedByMe: post.reposts.length > 0,
                    repostCount: post._count.reposts,
                  }}
                  initialReplyData={{
                    replyCount: post._count.replies,
                    postReplies: post.replies,
                  }}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
      <div ref={ref}>{isFetchingNextPage && "Loading more..."}</div>
    </div>
  );
}

function UserPostLikeTabsContent({ userId }: UserTabsProps) {
  const { ref, inView } = useInView();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteQuery<InfinitePostType>({
      queryKey: ["f_feed", "user", "like", userId],
      queryFn: async ({ pageParam }) => {
        const response = await axios.get(
          `/api/feeds/user/${userId}/like?cursor=${pageParam}&limit=10`,
        );
        return response.data;
      },
      initialPageParam: null,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  if (status === "pending") {
    return (
      <div>
        <Loader2 className="mx-auto mt-3 animate-spin" />
      </div>
    );
  }

  if (status === "error") {
    return <div>Error</div>;
  }

  return (
    <div>
      <div className="space-y-2">
        {data.pages.map((page, pageIndex) => (
          <div key={pageIndex} className="space-y-3">
            {page.posts.map((post) => (
              <div key={post.id}>
                <PostCard
                  post={post}
                  initialLikeData={{
                    isFollowedByMe: post.likes.length > 0,
                    likeCount: post._count.likes,
                  }}
                  initialBookmarkData={{
                    isBookmarkedByMe: post.bookmarks.length > 0,
                    bookmarkCount: post._count.bookmarks,
                  }}
                  initialRepostData={{
                    isRepostedByMe: post.reposts.length > 0,
                    repostCount: post._count.reposts,
                  }}
                  initialReplyData={{
                    replyCount: post._count.replies,
                    postReplies: post.replies,
                  }}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
      <div ref={ref}>{isFetchingNextPage && "Loading more..."}</div>
    </div>
  );
}
