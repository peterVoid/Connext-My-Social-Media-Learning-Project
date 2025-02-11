"use server";

import { getAuthSession } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/server/db";

export async function followUser(userId: string, hasFollow: boolean) {
  const session = await getAuthSession();

  if (!session) {
    throw new Error("Unauthorize");
  }

  if (!hasFollow) {
    await db.following.upsert({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: userId,
        },
      },
      create: {
        followerId: session.user.id,
        followingId: userId,
      },
      update: {},
    });
  } else {
    await db.following.deleteMany({
      where: {
        followerId: session.user.id,
        followingId: userId,
      },
    });
  }

  return {
    success: true,
  };
}
