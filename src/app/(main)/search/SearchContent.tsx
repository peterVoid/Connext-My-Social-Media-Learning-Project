"use client";

import PostCard from "@/components/posts/PostCard";
import { InfinitePostType } from "@/lib/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";

interface SearchContentProps {
  q: string;
}

export default function SearchContent({ q }: SearchContentProps) {
  const { ref, inView } = useInView();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteQuery<InfinitePostType>({
      queryKey: ["f_feed", "search", q],
      queryFn: async ({ pageParam }) => {
        const response = await axios.get(
          `/api/search?cursor=${pageParam}&limit=10&q=${q}`,
        );
        return response.data;
      },
      initialPageParam: null,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      gcTime: 0,
    });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  const posts = data?.pages.flatMap((p) => p.posts) || [];

  if (status === "pending") {
    return (
      <div>
        <Loader2 className="mx-auto mt-3 animate-spin" />
      </div>
    );
  }

  if (!posts.length && status === "success") {
    return (
      <p className="text-center text-muted-foreground">
        Belum ada postingan untuk pencarian ini
      </p>
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
