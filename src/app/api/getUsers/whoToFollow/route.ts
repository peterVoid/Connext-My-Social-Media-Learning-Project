import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "../../auth/[...nextauth]/route";
import { db } from "@/server/db";
import { userDataInclude } from "@/lib/types";
import { shufftleArray } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();

    if (!session) {
      return NextResponse.json("Unauthorize", { status: 401 });
    }

    const getUsers = await db.user.findMany({
      where: {
        id: {
          not: session.user.id,
        },
        followers: {
          none: {
            followerId: session.user.id,
          },
        },
      },
      include: userDataInclude(session.user.id),
      take: 20,
    });

    const randomUsers = !!getUsers.length
      ? shufftleArray(getUsers).slice(0, 5)
      : [];

    return NextResponse.json(randomUsers, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json("Internal server error", { status: 500 });
  }
}
