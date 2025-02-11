import { getAuthSession } from "@/app/api/auth/[...nextauth]/route";
import { postDataInclude } from "@/lib/types";
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

    const post = await db.post.findUnique({
      where: { id: postId },
      include: postDataInclude(session.user.id),
    });

    if (!post) {
      return NextResponse.json("Post not found", { status: 404 });
    }

    return NextResponse.json(post, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json("Internal server error", { status: 500 });
  }
}
