"use client";

import PostCard from "@/components/posts/PostCard";
import { InfinitePostType } from "@/lib/types";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Loader2 } from "lucide-react";
import React, { useEffect } from "react";
import { useInView } from "react-intersection-observer";

export default function FollowingFeed() {
  const { ref, inView } = useInView();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteQuery<InfinitePostType>({
      queryKey: ["f_feed", "following"],
      queryFn: async ({ pageParam }) => {
        const response = await axios.get(
          `/api/feeds/following-feed?cursor=${pageParam}&limit=10`,
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

  if (status === "success" && !data.pages[0].posts.length) {
    return (
      <h1 className="mx-auto flex w-full items-center justify-center text-xl font-bold">
        No one has posted yet.
      </h1>
    );
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
