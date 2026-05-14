import { z } from "zod";

const reviewZodSchema = z.object({
  user: z.string(),

  rating: z.number().min(1).max(5),

  comment: z.string().optional(),

  date: z.coerce.date().optional(),
});

export const createCourseZodSchema = z.object({
  title: z.string(),

  description: z.string().optional(),

  thumbnail: z.string().optional(),

  class: z.string(),

  // subject: z.array(z.string()),
  // assignedTeachers: z.array(z.string()).optional(),

  assignSubWithTeacher: z.array(
    z.object({
      subject: z.string(),
      teacher: z.string(),
    })
  ),

  regularPrice: z.number().optional(),

  discountPrice: z.number().optional(),

  enrollmentStartDate: z.coerce.date().optional(),

  enrollmentEndDate: z.coerce.date().optional(),

  courseStartDate: z.coerce.date().optional(),

  courseEndDate: z.coerce.date().optional(),

  duration: z.string().optional(),

  totalClasses: z.number().optional(),

  liveClassLinks: z.array(z.string()).optional(),

  recordedClassLinks: z.array(z.string()).optional(),

  certificate: z.boolean().optional(),

  status: z
    .enum(["upcoming", "running", "completed"])
    .optional(),

  ratings: z.number().optional(),

  reviews: z.array(reviewZodSchema).optional(),

  isFeatured: z.boolean().optional(),

  isDeleted: z.boolean().optional(),

  isActive: z.boolean().optional(),
});

export const updateCourseZodSchema =
  createCourseZodSchema.partial();