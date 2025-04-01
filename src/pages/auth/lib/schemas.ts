import { z } from "zod";

export const registerSchema = z
  .object({
    fullName: z.string().min(1, "Required Field"),
    email: z.string().min(1, "Required Field").email("Invalid Email"),
    password: z
      .string()
      .min(1, "Required Field")
      .min(6, "Password too short (min 6)"),
    repeatPassword: z.string().min(1, "Required Field"),
  })
  .refine((data) => data.password === data.repeatPassword, {
    message: "Passwords do not match",
    path: ["repeatPassword"],
  });

export const loginSchema = z.object({
  email: z.string().min(1, "Required Field"),
  password: z.string().min(1, "Required Field"),
});
