import { z } from "zod";

export const createSubjectZodSchema = z.object({
  title: z.string({
    invalid_type_error: "Title must be a string",
  }),

  description: z.string().optional(),

  isDeleted: z.boolean().optional(),

  isActive: z.boolean().optional(),
});

export const updateSubjectZodSchema =
  createSubjectZodSchema.partial();