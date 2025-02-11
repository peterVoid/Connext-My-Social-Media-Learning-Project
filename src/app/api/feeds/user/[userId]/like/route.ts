import { getAuthSession } from "@/app/api/auth/[...nextauth]/route";
import { InfinitePostType, postDataInclude } from "@/lib/types";
import { db } from "@/server/db";
import { NextRequest, NextResponse } from "next/server";

interface Props {
  params: Promise<{ userId: string }>;
}

export async function GET(req: NextRequest, { params }: Props) {
  try {
    const session = await getAuthSession();

    if (!session) {
      return NextResponse.json("Unauthorize", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get("cursor");

    const finalCursor = cursor && cursor !== "null" ? cursor : null;

    const limit = parseInt(searchParams.get("limit") || "10");

    const { userId } = await params;

    const posts = await db.post.findMany({
      where: {
        likes: {
          some: {
            userId,
          },
        },
      },
      take: limit + 1,
      cursor: finalCursor ? { id: finalCursor } : undefined,
      orderBy: { createdAt: "desc" },
      include: postDataInclude(session.user.id),
    });

    const hasNextCursor = posts.length > limit;

    const result: InfinitePostType = {
      nextCursor: hasNextCursor ? posts[limit].id : null,
      posts: posts.slice(0, limit),
    };

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json("Internal server error", { status: 500 });
  }
}
