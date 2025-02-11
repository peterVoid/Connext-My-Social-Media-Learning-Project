import z from "zod";

const requiredString = z.string().trim().min(1, { message: "Required" });

export const signUpSchema = z.object({
  firstname: requiredString,
  surname: z.string().trim().optional(),
  gender: z.enum(["MALE", "FEMALE"]),
  emailAddress: requiredString.email({ message: "Invalid email address." }),
  password: requiredString
    .min(5, {
      message: "Password must be at least 5 characters.",
    })
    .regex(/[A-Z]/, {
      message: "Password must contain at least one uppercase letter.",
    })
    .regex(/[0-9]/, { message: "Password must contain at least one number." })
    .regex(/[a-z]/, {
      message: "Password must contain at least one lowercase letter.",
    }),
});

export type signUpValues = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  emailAddress: requiredString.email({ message: "Invalid email address." }),
  password: requiredString,
});

export type signInValues = z.infer<typeof signInSchema>;

export const updateProfileSchema = z.object({
  image: z.string().optional(),
  firstname: requiredString,
  surname: z.string().optional(),
  bio: z.string().max(160, { message: "Max 160 latters" }).optional(),
});

export type updateProfileValues = z.infer<typeof updateProfileSchema>;
