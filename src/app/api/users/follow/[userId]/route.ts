import { getAuthSession } from "@/app/api/auth/[...nextauth]/route";
import { FollowInfo } from "@/lib/types";
import { db } from "@/server/db";
import { NextRequest, NextResponse } from "next/server";

interface Props {
  params: Promise<{ userId: string }>;
}

export async function GET(req: NextRequest, { params }: Props) {
  try {
    const session = await getAuthSession();

    if (!session) {
      return NextRequest;
    }

    const { userId } = await params;

    const user = await db.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        followers: {
          where: {
            followerId: session.user.id,
          },
        },
        _count: {
          select: {
            followers: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json("User not found", { status: 404 });
    }

    const result: FollowInfo = {
      followersCount: user._count.followers,
      hasFollowUser: !!user.followers.length,
    };

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json("Internal server error", { status: 500 });
  }
}
