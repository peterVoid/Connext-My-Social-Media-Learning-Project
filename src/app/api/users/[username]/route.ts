import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "../../auth/[...nextauth]/route";
import { db } from "@/server/db";
import { userDataInclude } from "@/lib/types";

interface Props {
  params: Promise<{ username: string }>;
}

export async function GET(req: NextRequest, { params }: Props) {
  try {
    const session = await getAuthSession();

    if (!session) {
      return NextResponse.json("Unauthorize", { status: 401 });
    }

    const { username } = await params;

    const user = await db.user.findUnique({
      where: { username },
      include: userDataInclude(session.user.id),
    });

    if (!user) {
      return NextResponse.json("User not found", { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json("Internal server error", { status: 500 });
  }
}
