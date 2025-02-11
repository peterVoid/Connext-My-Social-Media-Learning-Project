"use server";

import { signUpSchema, signUpValues } from "@/lib/validations";
import { db } from "@/server/db";
import * as bcrypt from "bcrypt";
import { generateFromEmail } from "unique-username-generator";

export const signUp = async (values: signUpValues) => {
  const { emailAddress, firstname, gender, surname, password } =
    signUpSchema.parse(values);

  const findUserByEmail = await db.user.findUnique({
    where: {
      email: emailAddress,
    },
  });

  if (findUserByEmail) {
    return {
      success: false,
      message: "User already exist",
    };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const uniqueUsername = generateFromEmail(emailAddress);

  await db.user.create({
    data: {
      firstname,
      surname,
      email: emailAddress,
      username: uniqueUsername,
      hashedPassword,
      gender,
    },
  });

  return {
    success: true,
    message: "User registered seccessfully",
  };
};
