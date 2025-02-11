import { getAuthSession } from "@/app/api/auth/[...nextauth]/route";
import { InfiniteReplyType, postReplyDataInclude } from "@/lib/types";
import { db } from "@/server/db";
import { NextRequest, NextResponse } from "next/server";

interface Props {
  params: Promise<{ postId: string }>;
}

export async function GET(req: NextRequest, { params }: Props) {
  try {
    const session = await getAuthSession();

    if (!session) {
      return NextResponse.json("Unauthorize", { status: 500 });
    }

    const { postId } = await params;

    const { searchParams } = new URL(req.url);

    const cursor = searchParams.get("cursor");
    const finalCursor = cursor && cursor !== "null" ? cursor : null;
    const limit = parseInt(searchParams.get("limit") || "10");

    const post = await db.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json("Post not found", { status: 404 });
    }

    const replyData = await db.reply.findMany({
      where: { postId },
      take: limit + 1,
      cursor: finalCursor ? { id: finalCursor } : undefined,
      orderBy: { createdAt: "desc" },
      include: postReplyDataInclude,
    });

    const hasNextCursor = replyData.length > limit;

    const result: InfiniteReplyType = {
      nextCursor: hasNextCursor ? replyData[limit].id : null,
      replies: replyData.slice(0, limit),
    };

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" });
  }
}
