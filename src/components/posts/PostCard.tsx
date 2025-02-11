import avatarPlaceholder from "@/assets/avatar-placeholder.png";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type {
  PostBookmarkedDataServer,
  PostDataServerType,
  PostLikeDataServer,
  PostReplyDataServer,
  PostRepostDataServer,
} from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { MoreHorizontal } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import LinkifyIt from "../linkify-it";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import BookmarkButton from "./BookmarkButton";
import FriendWhoRepost from "./FriendWhoRepost";
import LikeButton from "./LikeButton";
import ReplyButton from "./ReplyButton";
import RepostButton from "./RepostButton";
import DeletePostDropdown from "./DeletePostDropdown";

interface PostCardProps {
  post: PostDataServerType;
  initialLikeData: PostLikeDataServer;
  initialBookmarkData: PostBookmarkedDataServer;
  initialRepostData: PostRepostDataServer;
  initialReplyData: PostReplyDataServer;
}

export default function PostCard({
  post,
  initialLikeData,
  initialBookmarkData,
  initialRepostData,
  initialReplyData,
}: PostCardProps) {
  const router = useRouter();

  const { data: likeData, isLoading: likePending } = useQuery({
    queryKey: ["f_feed", post.id, "like"],
    queryFn: async () => {
      const response = await axios.get(`/api/feeds/like/${post.id}`);
      return response.data as PostLikeDataServer;
    },
    staleTime: Infinity,
    initialData: initialLikeData,
  });

  const { data: bookmarkData, isLoading: bookmarkPending } = useQuery({
    queryKey: ["f_feed", post.id, "bookmark"],
    queryFn: async () => {
      const response = await axios.get(`/api/feeds/bookmark/${post.id}`);
      return response.data as PostBookmarkedDataServer;
    },
    staleTime: Infinity,
    initialData: initialBookmarkData,
  });

  const { data: repostData, isLoading: repostPending } = useQuery({
    queryKey: ["f_feed", post.id, "repost"],
    queryFn: async () => {
      const response = await axios.get(`/api/feeds/repost/${post.id}`);
      return response.data as PostRepostDataServer;
    },
    staleTime: Infinity,
    initialData: initialRepostData,
  });

  const { data: replyData, isLoading: replyPending } = useQuery({
    queryKey: ["f_feed", post.id, "reply"],
    queryFn: async () => {
      const response = await axios.get(`/api/feeds/reply/${post.id}`);
      return response.data as PostReplyDataServer;
    },
    staleTime: Infinity,
    initialData: initialReplyData,
  });

  const { data: userWhoRespost, isLoading: userWhoRepostPending } = useQuery({
    queryKey: ["f_feed", post.id, "repostByFollowing"],
    queryFn: async () => {
      const response = await axios.get(
        `/api/feeds/repost/${post.id}/getFollowingRepost`,
      );
      return response.data as any[];
    },
    staleTime: Infinity,
  });

  const session = useSession();

  return (
    <Card className="flex-1 cursor-pointer border-b border-white/20 bg-black text-white shadow-md">
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
              <Link href={`/${post.user.username}`} className="hover:underline">
                @{post.user.username}
              </Link>
              <span>·</span>
              <span>{formatDate(post.createdAt)}</span>
            </div>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">More options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-black text-white" align="end">
            <DropdownMenuItem className="cursor-pointer" asChild>
              <Link href={`/${post.user.username}/status/${post.id}`}>
                Go to post details
              </Link>
            </DropdownMenuItem>
            {post.user.id === session.data?.user.id && (
              <DeletePostDropdown
                postId={post.id}
                userId={session.data.user.id}
              />
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="p-4">
        <LinkifyIt>
          <p className="mb-3 whitespace-pre-line text-sm leading-relaxed">
            {post.statusDescription}
          </p>
        </LinkifyIt>
        {!userWhoRepostPending && !!userWhoRespost?.length && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <div className="flex items-center rounded-full px-4 py-0">
                <p className="text-sm">Reposted by</p>
                <div className="flex gap-0">
                  {userWhoRespost.map((user, index) => (
                    <React.Fragment key={index}>
                      <FriendWhoRepost userData={user.user} />
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-black text-white">
              <AlertDialogTitle>Reposted By</AlertDialogTitle>
              <div>
                {userWhoRespost.map((data, index) => (
                  <div key={index} className="flex size-fit items-center gap-2">
                    <div className="relative size-16">
                      <Image
                        src={
                          typeof data.user.image === "string"
                            ? data.user.image
                            : avatarPlaceholder
                        }
                        alt=""
                        fill
                        className="rounded-full object-contain"
                      />
                    </div>
                    <h3>@{data.user.username}</h3>
                  </div>
                ))}
              </div>
            </AlertDialogContent>
          </AlertDialog>
        )}
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
                  <video src={url} controls></video>
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
          <RepostButton postId={post.id} initialData={repostData!} />
        )}
        {!likePending && (
          <LikeButton postId={post.id} initialData={likeData!} />
        )}
        {!bookmarkPending && (
          <BookmarkButton postId={post.id} initialData={bookmarkData!} />
        )}
      </CardFooter>
    </Card>
  );
}
