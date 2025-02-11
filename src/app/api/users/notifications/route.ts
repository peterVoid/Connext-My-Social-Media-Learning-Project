import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "../../auth/[...nextauth]/route";
import { db } from "@/server/db";
import {
  InfiniteNotificationsType,
  notificationsDataInclude,
} from "@/lib/types";

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();

    if (!session) {
      return NextResponse.json("Unauthorize", { status: 401 });
    }

    const { searchParams } = new URL(req.url);

    const cursor = searchParams.get("pageParams");
    const finalCursor = cursor && cursor !== "null" ? cursor : null;

    const limit = Number(searchParams.get("limit") || "10");

    const notificationsData = await db.notification.findMany({
      where: {
        recipientId: session.user.id,
      },
      take: limit + 1,
      cursor: finalCursor ? { id: finalCursor } : undefined,
      orderBy: { createdAt: "desc" },
      include: notificationsDataInclude(session.user.id),
    });

    const hasNextCursor = notificationsData.length > limit;

    const result: InfiniteNotificationsType = {
      nextCursor: hasNextCursor ? notificationsData[limit].id : null,
      notifications: notificationsData.slice(0, limit),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json("Internal server error", { status: 500 });
  }
}
