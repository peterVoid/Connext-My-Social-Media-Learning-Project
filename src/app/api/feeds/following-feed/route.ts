import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "../../auth/[...nextauth]/route";
import { db } from "@/server/db";
import { InfinitePostType, postDataInclude } from "@/lib/types";

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();

    if (!session) {
      return NextResponse.json("Unauthorize");
    }

    const { searchParams } = new URL(req.url);

    const cursor = searchParams.get("pageParams");
    const finalCursor = cursor && cursor !== "null" ? cursor : null;

    const limit = Number(searchParams.get("limit") || "10");

    const posts = await db.post.findMany({
      where: {
        user: {
          followers: {
            some: {
              followerId: session.user.id,
            },
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
