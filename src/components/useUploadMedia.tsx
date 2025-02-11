import { useToast } from "@/hooks/use-toast";
import { useUploadThing } from "@/lib/uploadthing";
import { useState } from "react";

export interface Media {
  file: File;
  mediaIds?: string;
  isUpload: boolean;
}

export default function useUploadMedia() {
  const [medias, setMedias] = useState<Media[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  const { toast } = useToast();

  const { startUpload, isUploading } = useUploadThing("media", {
    onBeforeUploadBegin(files) {
      const renamedFiles = files.map((file) => {
        const extension = file.name.split(".")[1];

        const fileReplacer = new File(
          [file],
          `media_${crypto.randomUUID()}.${extension}`,
          { type: file.type },
        );

        setMedias((prev) => [...prev, { isUpload: true, file: fileReplacer }]);

        return fileReplacer;
      });

      return renamedFiles;
    },
    onUploadProgress: setUploadProgress,
    onClientUploadComplete(res) {
      setMedias((prev) =>
        prev.map((m) => {
          const filterData = res.find((file) => file.name === m.file.name);

          if (!filterData) return m;

          return {
            ...m,
            isUpload: false,
            mediaIds: filterData.serverData.mediaId,
          };
        }),
      );
    },
  });

  function start(files: File[]) {
    if (medias.length + files.length > 5) {
      toast({
        variant: "destructive",
        title: "You cannot upload files more than 5",
      });
    }

    startUpload(files);
  }

  function remove(fileName: string) {
    setMedias((media) => media.filter((m) => m.file.name !== fileName));
  }

  function clear() {
    setMedias([]);
  }

  return {
    start,
    remove,
    clear,
    isUploading,
    medias,
    uploadProgress,
  };
}
