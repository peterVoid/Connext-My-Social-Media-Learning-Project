"use client";

import LinkifyIt from "@/components/linkify-it";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  PostBookmarkedDataServer,
  PostDataServerType,
  PostLikeDataServer,
  PostReplyDataServer,
  PostRepostDataServer,
} from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import avatarPlaceholder from "@/assets/avatar-placeholder.png";
import { formatDate } from "@/lib/utils";
import ReplyButton from "@/components/posts/ReplyButton";
import RepostButton from "@/components/posts/RepostButton";
import LikeButton from "@/components/posts/LikeButton";
import BookmarkButton from "@/components/posts/BookmarkButton";
import PostReplies from "./PostReplies";

interface PostDetailsProps {
  postId: string;
}

export default function PostDetails({ postId }: PostDetailsProps) {
  const { data: post, isLoading: postLoading } = useQuery({
    queryKey: ["f_feed", postId, "details"],
    queryFn: async () => {
      const response = await axios.get(`/api/feeds/details/${postId}`);
      return response.data as PostDataServerType;
    },
  });

  const { data: likeData, isLoading: likePending } = useQuery({
    queryKey: ["f_feed", postId, "like"],
    queryFn: async () => {
      const response = await axios.get(`/api/feeds/like/${postId}`);
      return response.data as PostLikeDataServer;
    },
    staleTime: Infinity,
  });

  const { data: bookmarkData, isLoading: bookmarkPending } = useQuery({
    queryKey: ["f_feed", postId, "bookmark"],
    queryFn: async () => {
      const response = await axios.get(`/api/feeds/bookmark/${postId}`);
      return response.data as PostBookmarkedDataServer;
    },
    staleTime: Infinity,
  });

  const { data: repostData, isLoading: repostPending } = useQuery({
    queryKey: ["f_feed", postId, "repost"],
    queryFn: async () => {
      const response = await axios.get(`/api/feeds/repost/${postId}`);
      return response.data as PostRepostDataServer;
    },
    staleTime: Infinity,
  });

  const { data: replyData, isLoading: replyPending } = useQuery({
    queryKey: ["f_feed", postId, "reply"],
    queryFn: async () => {
      const response = await axios.get(`/api/feeds/reply/${postId}`);
      return response.data as PostReplyDataServer;
    },
    staleTime: Infinity,
  });

  if (!post) {
    return null;
  }

  return (
    <>
      <Card className="w-full cursor-pointer border-b border-white/20 bg-black text-white shadow-md">
        <CardHeader className="flex flex-row items-center gap-4 p-4">
          <Image
            src={post.user.image || avatarPlaceholder}
            alt={`${post.user.firstname}'s avatar`}
            width={40}
            height={40}
            className="rounded-full border border-gray-700 object-cover"
          />
          <div className="flex-1">
            <div className="flex flex-col">
              <Link
                href={`/${post.user.username}`}
                className="text-md font-semibold hover:underline"
              >
                {post.user.surname
                  ? `${post.user.firstname} ${post.user.surname}`
                  : post.user.firstname}
              </Link>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Link
                  href={`/${post.user.username}`}
                  className="hover:underline"
                >
                  @{post.user.username}
                </Link>
                <span>·</span>
                <span>{formatDate(post.createdAt)}</span>
              </div>
            </div>
          </div>
          {/* <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">More options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Report</DropdownMenuItem>
            <DropdownMenuItem>Share</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu> */}
        </CardHeader>
        <CardContent className="p-4">
          <LinkifyIt>
            <p className="mb-3 whitespace-pre-line text-sm leading-relaxed">
              {post.statusDescription}
            </p>
          </LinkifyIt>
          {!!post.postMedia.length && (
            <div className="grid grid-cols-1 gap-3 overflow-hidden rounded-lg sm:grid-cols-2">
              {post.postMedia.map(({ url, type }) => (
                <div key={url} className="w-full overflow-hidden rounded-lg">
                  {type === "IMAGE" ? (
                    <Image
                      src={url}
                      alt="Post image"
                      width={500}
                      height={500}
                      className="rounded-lg object-cover"
                    />
                  ) : (
                    <video
                      src={url}
                      controls
                      className="w-full rounded-lg border border-gray-700"
                    ></video>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex items-center justify-evenly gap-4 p-4 text-gray-400">
          {!replyPending && replyData && (
            <ReplyButton
              postData={post}
              replyCount={replyData.replyCount as number}
            />
          )}
          {!repostPending && (
            <RepostButton postId={postId} initialData={repostData!} />
          )}
          {!likePending && (
            <LikeButton postId={postId} initialData={likeData!} />
          )}
          {!bookmarkPending && (
            <BookmarkButton postId={postId} initialData={bookmarkData!} />
          )}
        </CardFooter>
      </Card>
      <div>
        <PostReplies postId={postId} />
      </div>
    </>
  );
}
