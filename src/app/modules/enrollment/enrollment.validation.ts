import { z } from "zod";

export const createEnrollmentZodSchema = z.object({
    student: z.string(),
    course: z.string(),
    transactionId: z.string().optional(),
    status: z
        .enum(["FAILED", "COMPLETED", "PENDING", "CANCELLED"])
        .optional(),
    referredBy: z.string().optional(),
    progress: z.number().min(0).max(100).optional(),
    createdBy: z.string().optional(),
    isActive: z.boolean().optional(),
    isDeleted: z.boolean().optional(),
});

export const updateEnrollmentZodSchema =
    createEnrollmentZodSchema.partial();