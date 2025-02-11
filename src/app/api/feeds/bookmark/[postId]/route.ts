import { PostBookmarkedDataServer } from "@/lib/types";
import { db } from "@/server/db";
import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "../../../auth/[...nextauth]/route";

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
        bookmarks: {
          where: {
            userId: session.user.id,
          },
        },
        _count: {
          select: {
            bookmarks: true,
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json("Post not found", { status: 404 });
    }

    const result: PostBookmarkedDataServer = {
      isBookmarkedByMe: !!post.bookmarks.length,
      bookmarkCount: post._count.bookmarks,
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

    await db.bookmark.create({
      data: {
        postId,
        userId: session.user.id,
      },
    });

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

    await db.bookmark.deleteMany({
      where: { postId, userId: session.user.id },
    });

    return NextResponse.json("Success");
  } catch (error) {
    console.error(error);
    return NextResponse.json("Internal server error", { status: 500 });
  }
}
