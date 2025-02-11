"use client";

import avatarPlaceholder from "@/assets/avatar-placeholder.png";
import LoadingButton from "@/components/LoadingButton";
import { useToast } from "@/hooks/use-toast";
import { InfinitePostType } from "@/lib/types";
import {
  InfiniteData,
  QueryFilters,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { ImageDown, Loader2, Trash } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { postStatus } from "../../components/posts/actions.";
import useUploadMedia, { Media } from "@/components/useUploadMedia";
import { useRef } from "react";
import { cn } from "@/lib/utils";

export default function PostEditor() {
  const { data } = useSession();

  const { toast } = useToast();

  const { start, remove, clear, isUploading, medias, uploadProgress } =
    useUploadMedia();

  const queryClient = useQueryClient();

  const queryFilters: QueryFilters = { queryKey: ["f_feed", "for-you"] };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        italic: false,
        bold: false,
        history: false,
      }),
      Placeholder.configure({
        placeholder: "Write something...",
      }),
    ],
  });

  const statusDescription =
    editor && editor.getText({ blockSeparator: "\n\n" });

  const { isPending, mutate } = useMutation({
    mutationFn: async () => {
      const data = await postStatus({
        statusDescription,
        mediaIds: medias.map((m) => m.mediaIds as string),
      });
      return data;
    },
    onSuccess: async (data) => {
      await queryClient.cancelQueries(queryFilters);

      queryClient.setQueriesData(
        queryFilters,
        (oldData: InfiniteData<InfinitePostType> | undefined) => {
          if (!oldData || !data) return;

          const firstPage = oldData.pages[0];

          if (firstPage) {
            return {
              pageParams: oldData.pageParams,
              pages: [
                {
                  nextCursor: firstPage.nextCursor,
                  posts: [data, ...firstPage.posts],
                },
                ...oldData.pages.slice(1),
              ],
            };
          }
        },
      );

      editor?.commands.clearContent();
      clear();

      queryClient.invalidateQueries({
        queryKey: queryFilters.queryKey,
        predicate(query) {
          return !query.state.data;
        },
      });
    },
    onError: (error) => {
      console.error(error);
      if (error instanceof Error) {
        toast({
          variant: "destructive",
          title: error.message,
        });
      }
    },
  });

  if (!data?.user) {
    return null;
  }

  return (
    <div className="w-full border-b border-white/20 px-2 py-3">
      <div className="flex items-start">
        <div className="relative size-10">
          <Image
            src={data?.user.image ?? avatarPlaceholder}
            alt="User image"
            fill
            className="rounded-full object-cover"
          />
        </div>
        <div className="flex w-full flex-col gap-3">
          <div>
            <EditorContent
              editor={editor}
              className="rounded border-b border-white/20"
              autoFocus
            />
            {!!medias.length && (
              <MediasPreview medias={medias} remove={remove} />
            )}
            {isUploading && (
              <div className="">
                <span className="text-sm">{uploadProgress ?? 0}%</span>
                <Loader2 className="animate-spin" />
              </div>
            )}
          </div>
          <div className="flex w-full items-center justify-between">
            <div className="flex gap-2">
              <UploadFileButton start={start} />
            </div>
            <LoadingButton
              isLoading={isPending}
              disabled={isUploading && uploadProgress < 100}
              buttonText="Posting"
              className="w-fit rounded-full px-2 py-1 text-xs font-semibold disabled:bg-white/70"
              onClick={() => mutate()}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

interface UploadFileButtonProps {
  start: (file: File[]) => void;
}

function UploadFileButton({ start }: UploadFileButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <input
        type="file"
        accept="image/*, video/*"
        multiple
        className="sr-only hidden"
        ref={inputRef}
        onChange={(e) => start(Array.from(e.target.files as FileList))}
      />
      <ImageDown
        className="cursor-pointer fill-blue-600"
        onClick={() => inputRef.current?.click()}
      />
    </>
  );
}

interface MediasPreviewProps {
  medias: Media[];
  remove: (fileName: string) => void;
}

function MediasPreview({ medias, remove }: MediasPreviewProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        medias.length > 2 && "sm:grid sm:grid-cols-2",
      )}
    >
      {medias.map((media, mediaIndex) => (
        <div
          key={mediaIndex}
          className={cn(
            "relative mx-auto size-fit",
            media.isUpload && "opacity-50",
          )}
        >
          {media.file.type.startsWith("image") ? (
            <Image
              src={URL.createObjectURL(media.file)}
              alt="Media"
              width={500}
              height={500}
              className="size-fit max-h-[30rem] rounded-2xl"
            />
          ) : (
            <video controls className="size-fit max-h-[30rem] rounded-2xl">
              <source
                src={URL.createObjectURL(media.file)}
                type={media.file.type}
              />
            </video>
          )}
          {!media.isUpload && (
            <button
              className="absolute right-2 top-2 text-red-500"
              onClick={() => remove(media.file.name)}
            >
              <Trash />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
