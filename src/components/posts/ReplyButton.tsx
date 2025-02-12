import avatarPlaceholder from "@/assets/avatar-placeholder.png";
import { PostDataServerType } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import Image from "next/image";
import { useState } from "react";
import { HiOutlineChatBubbleOvalLeft } from "react-icons/hi2";
import LinkifyIt from "../linkify-it";
import LoadingButton from "../LoadingButton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { replyPostMutate } from "./mutations";
import { useSession } from "next-auth/react";

interface ReplyButtonProps {
  postData: PostDataServerType;
  replyCount: number;
}

export default function ReplyButton({
  postData,
  replyCount,
}: ReplyButtonProps) {
  const [openCommentDialog, setOpenCommentDialog] = useState(false);

  return (
    <>
      <button
        className="flex cursor-pointer items-center gap-1 text-sm hover:text-blue-500"
        title="Comment"
        onClick={(e) => {
          e.stopPropagation();
          setOpenCommentDialog(true);
        }}
      >
        <HiOutlineChatBubbleOvalLeft size={16} />
        <span>{replyCount}</span>
      </button>
      <ReplyDialog
        postData={postData}
        open={openCommentDialog}
        onOpenChange={setOpenCommentDialog}
      />
    </>
  );
}

interface ReplyDialogProps {
  postData: PostDataServerType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function ReplyDialog({ open, onOpenChange, postData }: ReplyDialogProps) {
  const { data } = useSession();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bold: false,
        italic: false,
      }),
      Placeholder.configure({
        placeholder: "Type a something...",
      }),
    ],
  });

  const editorValue = editor && editor.getText({ blockSeparator: "\n" });

  const { isPending, isSuccess, mutate } = replyPostMutate(
    postData.id,
    editorValue as string,
    postData.id,
    () => {
      onOpenChange(false);
      editor?.commands.clearContent();
    },
  );

  const handleReplyButton = async () => {
    mutate();
  };

  if (!data?.user) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[70vh] overflow-auto bg-black text-white">
        <DialogHeader>
          <DialogTitle>Reply</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <Image
              src={postData.user.image || avatarPlaceholder}
              alt="User Profile"
              width={50}
              height={50}
              className="rounded-full"
            />
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold">
                  {postData.user.surname
                    ? `${postData.user.firstname} ${postData.user.surname}`
                    : postData.user.firstname}
                </h2>
                <p className="text-sm text-muted-foreground">
                  @{postData.user.username}
                </p>
                <p>·</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(postData.createdAt)}
                </p>
              </div>
              <div className="max-w-[400px]">
                {postData.statusDescription && (
                  <LinkifyIt>
                    <span className="whitespace-pre-line">
                      {postData.statusDescription}
                    </span>
                  </LinkifyIt>
                )}
                {!!postData.postMedia.length && (
                  <span className="line-clamp-2 break-words text-sm">
                    {postData.postMedia[0].url}
                  </span>
                )}
              </div>
            </div>
          </div>
          {/* <Separator className="bg-muted-foreground" /> */}
          <div className="flex items-start gap-2">
            <Image
              src={data.user.image || avatarPlaceholder}
              alt="User Profile"
              width={50}
              height={50}
              className="rounded-full"
            />
            <EditorContent
              editor={editor}
              className="w-full max-w-[400px] rounded border-b border-white/20 placeholder:text-white"
            />
          </div>
          <LoadingButton
            isLoading={isPending}
            buttonText="Reply"
            onClick={handleReplyButton}
            className="mt-3 rounded-full bg-white px-2 py-1 font-semibold text-black disabled:bg-white/50"
            disabled={!editorValue || editorValue.length > 100}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
