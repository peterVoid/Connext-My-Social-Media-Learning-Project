import { Prisma } from "@prisma/client";

export function userDataInclude(userId: string) {
  return {
    followers: true,
    followings: true,
    posts: true,
  } satisfies Prisma.UserInclude;
}

export type UserDataServerType = Prisma.UserGetPayload<{
  include: ReturnType<typeof userDataInclude>;
}>;

export function postDataInclude(userId: string) {
  return {
    user: {
      select: {
        id: true,
        username: true,
        firstname: true,
        surname: true,
        image: true,
      },
    },
    postMedia: {
      select: {
        url: true,
        type: true,
      },
    },
    likes: {
      where: {
        userId,
      },
    },
    bookmarks: {
      where: {
        userId,
      },
    },
    reposts: {
      where: {
        userId,
      },
    },
    replies: {
      select: {
        user: true,
        id: true,
        createdAt: true,
        post: true,
        postId: true,
        replyText: true,
        updatedAt: true,
        userId: true,
        parentPostId: true,
      },
    },
    _count: {
      select: {
        likes: true,
        bookmarks: true,
        reposts: true,
        replies: true,
      },
    },
  } satisfies Prisma.PostInclude;
}

export type PostDataServerType = Prisma.PostGetPayload<{
  include: ReturnType<typeof postDataInclude>;
}>;

export function notificationsDataInclude(userId: string) {
  return {
    sender: {
      select: {
        image: true,
        username: true,
      },
    },
  } satisfies Prisma.NotificationInclude;
}

export type NotificationsDataServerType = Prisma.NotificationGetPayload<{
  include: ReturnType<typeof notificationsDataInclude>;
}>;

export interface InfinitePostType {
  nextCursor: string | null;
  posts: PostDataServerType[];
}

export interface PostLikeDataServer {
  isFollowedByMe: boolean;
  likeCount: number;
}

export interface PostBookmarkedDataServer {
  isBookmarkedByMe: boolean;
  bookmarkCount: number;
}

export interface PostRepostDataServer {
  isRepostedByMe: boolean;
  repostCount: number;
}

export const postReplyDataInclude = {
  user: true,
} satisfies Prisma.ReplyInclude;

export type PostReplyDataIncludeType = Prisma.ReplyGetPayload<{
  include: typeof postReplyDataInclude;
}>;

export interface PostReplyDataServer {
  replyCount: number;
  postReplies: PostReplyDataIncludeType[];
}

export interface InfiniteReplyType {
  nextCursor: string | null;
  replies: PostReplyDataIncludeType[];
}

export interface FollowInfo {
  hasFollowUser: boolean;
  followersCount: number;
}

export interface InfiniteNotificationsType {
  nextCursor: string | null;
  notifications: NotificationsDataServerType[];
}
