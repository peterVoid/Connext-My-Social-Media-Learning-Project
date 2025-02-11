import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import PostDetails from "./PostDetails";
import { db } from "@/server/db";
import TopbarPostDetails from "./TopbarPostDetails";

interface PageProps {
  params: Promise<{ postId: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { postId } = await params;

  const post = await db.post.findUnique({
    where: { id: postId },
    include: {
      user: {
        select: {
          username: true,
        },
      },
      postMedia: true,
    },
  });

  if (!post) {
    return null;
  }

  return {
    title: `${post.user.username} on Connext: "${post.statusDescription?.slice(0, 25) || post.postMedia[0].url}"`,
  };
}

export default async function Page({ params }: PageProps) {
  const { postId } = await params;

  if (!postId) {
    return null;
  }

  return (
    <div className="space-y-4 p-3">
      <div className="flex items-center gap-8">
        <TopbarPostDetails />
        <h1 className="text-xl font-bold">Post</h1>
      </div>
      <PostDetails postId={postId} />
    </div>
  );
}
