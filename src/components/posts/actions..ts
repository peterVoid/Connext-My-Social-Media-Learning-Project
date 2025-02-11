"use server";

import { postDataInclude, postReplyDataInclude } from "@/lib/types";
import { db } from "@/server/db";
import { getAuthSession } from "../../app/api/auth/[...nextauth]/route";

interface postStatusProps {
  statusDescription: string | null;
  mediaIds: string[];
}

export const postStatus = async ({
  mediaIds,
  statusDescription,
}: postStatusProps) => {
  const session = await getAuthSession();

  if (!session) {
    throw new Error("Unauthorize");
  }

  // if (!postData) {
  //   throw new Error("No Post Data");
  // }

  const newPost = await db.post.create({
    data: {
      statusDescription,
      userId: session.user.id,
      postMedia: {
        connect: mediaIds.map((m) => ({
          id: m,
        })),
      },
    },
    include: postDataInclude(session.user.id),
  });

  return newPost;
};

export const replyStatus = async (
  postId: string,
  replyText: string,
  replyParentPostId: string,
) => {
  const session = await getAuthSession();

  if (!session) {
    throw new Error("Unauthorize");
  }

  if (!replyText) {
    throw new Error("Youre not reply anything btch.");
  }

  const searchPost = await db.post.findUnique({
    where: { id: postId },
  });

  if (!searchPost) {
    throw new Error("Post not found");
  }

  const newReply = await db.reply.create({
    data: {
      postId,
      userId: session.user.id,
      replyText,
      parentPostId: replyParentPostId,
    },
    include: postReplyDataInclude,
  });
  if (session.user.id !== searchPost.userId) {
    await db.notification.create({
      data: {
        postId,
        senderId: session.user.id,
        recipientId: searchPost.userId,
        type: "COMMENT",
      },
    });
  }

  return newReply;
};

export const deleteStatus = async (postId: string) => {
  const session = await getAuthSession();

  if (!session) {
    throw new Error("Unauthorize");
  }

  const post = await db.post.findUnique({
    where: {
      id: postId,
    },
  });

  if (post?.userId !== session.user.id) {
    throw new Error("You can only delete your own post");
  }

  await db.post.deleteMany({
    where: {
      id: postId,
      userId: session.user.id,
    },
  });

  return {
    success: true,
  };
};
