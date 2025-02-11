"use server";

import { signInSchema, signInValues } from "@/lib/validations";
import { db } from "@/server/db";
import bcrypt from "bcrypt";

export const signInAction = async (
  values: signInValues,
): Promise<{ success: boolean; message?: string }> => {
  const { emailAddress, password } = signInSchema.parse(values);

  const findUser = await db.user.findUnique({
    where: { email: emailAddress },
  });

  if (!findUser) {
    return {
      success: false,
      message: "email or password is invalid. Please try again",
    };
  }

  const matchPassword = await bcrypt.compare(
    password,
    findUser.hashedPassword!,
  );

  if (!matchPassword) {
    return {
      success: false,
      message: "email or password is invalid. Please try again",
    };
  }

  return {
    success: true,
    message: "Sui",
  };
};
