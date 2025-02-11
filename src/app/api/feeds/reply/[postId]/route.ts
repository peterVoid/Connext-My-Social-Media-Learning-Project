import {
  postDataInclude,
  postReplyDataInclude,
  PostReplyDataServer,
} from "@/lib/types";
import { db } from "@/server/db";
import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "../../../auth/[...nextauth]/route";

interface Params {
  params: Promise<{ postId: string }>;
}

export async function GET(req: NextRequest, { params }: Params) {
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

    const repliesPostData = await db.reply.findMany({
      where: { postId },
      include: postReplyDataInclude,
    });

    const result: PostReplyDataServer = {
      replyCount: repliesPostData.length,
      postReplies: repliesPostData,
    };

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json("Internal server error", { status: 500 });
  }
}
