import avatarPlaceholder from "@/assets/avatar-placeholder.png";
import { replyPostMutate } from "@/components/posts/mutations";
import { Separator } from "@/components/ui/separator";
import { InfiniteReplyType } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { useInfiniteQuery } from "@tanstack/react-query";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";

interface PostRepliesProps {
  postId: string;
}

export default function PostReplies({ postId }: PostRepliesProps) {
  const { data } = useSession();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bold: false,
        italic: false,
      }),
      Placeholder.configure({
        placeholder: "Reply to this post...",
      }),
    ],
  });

  const editorValue = editor && editor.getText({ blockSeparator: "\n" }).trim();

  const { ref, inView } = useInView();

  const {
    data: repliesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["f_feed", postId, "replies-data"],
    queryFn: async ({ pageParam }) => {
      const response = await axios.get(
        `/api/feeds/reply/${postId}/get-replies-data?cursor=${pageParam}`,
      );
      return response.data as InfiniteReplyType;
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  const { mutate, isPending } = replyPostMutate(
    postId,
    editorValue as string,
    postId,
    () => editor?.commands.clearContent(),
  );

  const handleReplyButtonClick = () => {
    mutate();
  };

  if (status === "pending") {
    return (
      <div>
        <Loader2 className="mx-auto mt-3 animate-spin" />
      </div>
    );
  }

  if (status === "error" || !data?.user) {
    return <div>Error</div>;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-2">
        <div className="relative size-10">
          <Image
            src={data.user.image || avatarPlaceholder}
            alt="Profile User"
            fill
            className="rounded-full object-cover"
          />
        </div>
        <EditorContent
          editor={editor}
          className="w-full border-b border-white/20 focus:border-none"
        />
        <button
          className="rounded-md bg-white p-1 text-black disabled:bg-opacity-30"
          disabled={
            (editorValue || "").length > 5000 || !editorValue || isPending
          }
          onClick={() => handleReplyButtonClick()}
        >
          Reply
        </button>
      </div>
      <Separator className="bg-muted-foreground" />
      <div>
        {repliesData.pages.map((page, index) => (
          <div key={index}>
            {page.replies.map((reply) => (
              <div
                key={reply.id}
                className="flex items-start gap-1 border-b border-white/20 py-2"
              >
                <div className="relative size-12">
                  <Image
                    src={reply.user.image || avatarPlaceholder}
                    alt="User Profile"
                    fill
                    className="rounded-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <p>
                      {reply.user.surname
                        ? `${reply.user.username} ${reply.user.surname}`
                        : reply.user.firstname}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      @{reply.user.username}
                    </p>
                    <p className="text-muted-foreground">·</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(reply.createdAt)}
                    </p>
                  </div>
                  <div>{reply.replyText}</div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div ref={ref}>{isFetchingNextPage && "Loading more..."}</div>
    </div>
  );
}
