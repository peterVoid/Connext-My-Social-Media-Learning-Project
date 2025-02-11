import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "../../auth/[...nextauth]/route";
import { db } from "@/server/db";
import { postDataInclude } from "@/lib/types";

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();

    if (!session) {
      return Response.json({ error: "Unauthorize" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get("cursor");

    const finalCursor = cursor && cursor !== "null" ? cursor : null;

    const limit = parseInt(searchParams.get("limit") || "10");

    const posts = await db.post.findMany({
      take: limit + 1,
      cursor: finalCursor ? { id: finalCursor } : undefined,
      orderBy: { createdAt: "desc" },
      include: postDataInclude(session.user.id),
    });

    const hasNextPage = posts.length > limit;

    return NextResponse.json({
      posts: posts.slice(0, limit),
      nextCursor: hasNextPage ? posts[limit].id : null,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json("Internal server error", { status: 500 });
  }
}
