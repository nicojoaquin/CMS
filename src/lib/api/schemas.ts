import { z } from "zod";

export const createArticleSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  content: z
    .string()
    .min(10, { message: "Content must be at least 10 characters" }),
  coverImage: z.string().min(1, { message: "Cover image is required" }),
});

export const updateArticleSchema = z.object({
  title: z
    .string()
    .min(3, { message: "Title must be at least 3 characters" })
    .optional(),
  content: z
    .string()
    .min(10, { message: "Content must be at least 10 characters" })
    .optional(),
  coverImage: z
    .string()
    .min(1, { message: "Cover image is required" })
    .optional(),
});
