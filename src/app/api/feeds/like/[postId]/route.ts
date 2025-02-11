import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "../../../auth/[...nextauth]/route";
import { db } from "@/server/db";
import { PostLikeDataServer } from "@/lib/types";

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

    const post = await db.post.findUnique({
      where: { id: postId },
      include: {
        likes: {
          where: {
            userId: session.user.id,
          },
        },
        _count: {
          select: {
            likes: true,
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json("Post not found", { status: 404 });
    }

    const result: PostLikeDataServer = {
      isFollowedByMe: !!post.likes.length,
      likeCount: post._count.likes,
    };

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json("Internal server error", { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: Props) {
  try {
    const session = await getAuthSession();

    if (!session) {
      return NextResponse.json("Unauthorize", { status: 401 });
    }

    const { postId } = await params;

    const post = await db.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json("Post not found", { status: 404 });
    }

    await db.$transaction([
      db.like.create({
        data: {
          postId,
          userId: session.user.id,
        },
      }),
      ...(post.userId !== session.user.id
        ? [
            db.notification.create({
              data: {
                postId: post.id,
                senderId: session.user.id,
                recipientId: post.userId,
                type: "LIKE",
              },
            }),
          ]
        : []),
    ]);

    return NextResponse.json("Success");
  } catch (error) {
    console.error(error);
    return NextResponse.json("Internal server error", { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Props) {
  try {
    const session = await getAuthSession();

    if (!session) {
      return NextResponse.json("Unauthorize", { status: 401 });
    }

    const { postId } = await params;

    const post = await db.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json("Post not found", { status: 404 });
    }

    await db.like.deleteMany({
      where: { postId, userId: session.user.id },
    });

    return NextResponse.json("Success");
  } catch (error) {
    console.error(error);
    return NextResponse.json("Internal server error", { status: 500 });
  }
}
