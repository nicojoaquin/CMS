import { z } from "zod";
import { loginSchema, registerSchema } from "./schemas";

export type RegisterFormValues = z.infer<typeof registerSchema>;
export type LoginFormValues = z.infer<typeof loginSchema>;
