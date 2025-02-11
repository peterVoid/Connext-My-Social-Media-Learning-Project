import { getAuthSession } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/server/db";
import { NextRequest, NextResponse } from "next/server";

interface Props {
  params: Promise<{ postId: string }>;
}

export async function GET(req: NextRequest, { params }: Props) {
  try {
    const session = await getAuthSession();

    if (!session) {
      return NextResponse.json("Unauthorize", { status: 401 });
    }

    const { postId } = await params;

    const reposts = await db.repost.findMany({
      where: {
        postId,
        user: {
          followers: {
            some: {
              followerId: session.user.id,
            },
          },
        },
      },
      select: {
        user: {
          select: {
            id: true,
            username: true,
            image: true,
          },
        },
      },
      take: 5,
    });

    return NextResponse.json(reposts);
  } catch (error) {
    console.error(error);
    return NextResponse.json("Internal server error", { status: 500 });
  }
}
