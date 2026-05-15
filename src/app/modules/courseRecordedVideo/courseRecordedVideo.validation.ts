import z from "zod";

export const createCourseRecordedVideoValidation = z.object({
  course: z.string().min(1, "Course is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  videoUrl: z.string().min(1, "Video URL is required"),
  thumbnailUrl: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "DELETED"], {
    invalid_type_error: "Status must be either ACTIVE, INACTIVE, or DELETED",
  }),
  createdBy: z.string().optional(),
  isDeleted: z.boolean().optional(),
});

export const updateCourseRecordedVideoValidation =   createCourseRecordedVideoValidation.partial();