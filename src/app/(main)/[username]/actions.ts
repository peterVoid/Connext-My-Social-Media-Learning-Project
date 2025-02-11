"use server";

import { getAuthSession } from "@/app/api/auth/[...nextauth]/route";
import { updateProfileSchema, updateProfileValues } from "@/lib/validations";
import { db } from "@/server/db";

export async function updateProfile(values: updateProfileValues) {
  const { firstname, image, bio, surname } = updateProfileSchema.parse(values);

  const session = await getAuthSession();

  if (!session) {
    throw new Error("Unauthorize");
  }

  const newUser = await db.user.update({
    where: {
      id: session.user.id,
    },
    data: {
      image,
      firstname,
      bio,
      surname,
    },
  });

  return newUser;
}
