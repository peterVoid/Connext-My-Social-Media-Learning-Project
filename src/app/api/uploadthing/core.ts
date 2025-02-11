import { createUploadthing, FileRouter } from "uploadthing/next";
import { getAuthSession } from "../auth/[...nextauth]/route";
import { UploadThingError } from "uploadthing/server";
import { db } from "@/server/db";

const f = createUploadthing();

export const ourFileRouter = {
  media: f({
    image: { maxFileSize: "4MB", maxFileCount: 5 },
    video: { maxFileSize: "64MB", maxFileCount: 5 },
  })
    .middleware(async () => {
      const user = await getAuthSession();

      if (!user) throw new UploadThingError("Unauthorize");

      return {};
    })
    .onUploadComplete(async ({ file }) => {
      const media = await db.media.create({
        data: {
          url: file.url,
          type: file.type.startsWith("image") ? "IMAGE" : "VIDEO",
        },
      });

      return { mediaId: media.id };
    }),
  profileImage: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      const user = await getAuthSession();

      if (!user) throw new UploadThingError("Unauthorize");

      return {};
    })
    .onUploadComplete(async ({ file }) => {
      return {
        url: file.url,
        type: file.type,
        name: file.name,
        size: file.size,
        lastModified: file.lastModified,
        customId: file.customId,
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
