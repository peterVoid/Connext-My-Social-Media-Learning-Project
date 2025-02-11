import { db } from "@/server/db";
import { unstable_cache } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const queryHashtags = unstable_cache(
      async () => {
        const result = await db.$queryRaw<{ hashtag: string; count: bigint }[]>`
          SELECT LOWER(unnest(regexp_matches(COALESCE("statusDescription", ''), '#[[:alnum:]_]+', 'g'))) AS hashtag, 
                 COUNT(*) AS count
          FROM posts
          WHERE "statusDescription" IS NOT NULL
          GROUP BY hashtag
          ORDER BY count DESC, hashtag ASC
          LIMIT 5
        `;

        return result.map((row) => ({
          hashtag: row.hashtag,
          count: Number(row.count),
        }));
      },
      ["trending_hashtag"],
      { revalidate: 3600, tags: ["trending_hashtag"] },
    );

    const hashtags = await queryHashtags();

    return NextResponse.json(hashtags);
  } catch (error) {
    console.error("Error fetching trending hashtags:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
