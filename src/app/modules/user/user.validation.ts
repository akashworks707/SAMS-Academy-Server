import { z } from "zod";
import { Role } from "./user.interface";

// Create User Schema
// export const createUserZodSchema = z.object({
//   name: z
//     .string({ invalid_type_error: "Name must be a string" })
//     .min(1, { message: "Name is required" }),
//   email: z
//     .string({ invalid_type_error: "Email must be a string" })
//     .email({ message: "Invalid email address" }),
//   password: z
//     .string({ invalid_type_error: "Password must be a string" })
//     .min(6, { message: "Password must be at least 6 characters long" })
//     .optional(),
//   picture: z.string({ invalid_type_error: "Picture must be a string" }).optional(),
//   role: z.enum([Role.STUDENT, Role.TEACHER, Role.ADMIN], {
//     invalid_type_error: "Role must be either ADMIN or TEACHER or STUDENT",
//   }).optional(),
//   phone: z
//     .string({ invalid_type_error: "Phone number must be a string" })
//     .min(1, { message: "Phone number is required" })
// });


export const createUserZodSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6).optional(),
  picture: z.string().optional(),
  phone: z.string().min(1, "Phone is required"),

  role: z.enum([Role.STUDENT, Role.TEACHER, Role.ADMIN]).optional(),

  // ---------------- TEACHER PROFILE ----------------
  address: z.string().optional(),
  qualification: z.string().optional(),
  experience: z.number().optional(),
  designation: z.string().optional(),
  salary: z.number().optional(),
  bio: z.string().optional(),

  assignedSubjects: z.array(z.string()).optional(),
  assignedCourses: z.array(z.string()).optional(),

  // ---------------- STUDENT PROFILE ----------------
  studentId: z.string().optional(),
  classId: z.string().optional(),
  section: z.string().optional(),
  roll: z.number().optional(),
  guardianName: z.string().optional(),
  guardianPhone: z.string().optional(),
  enrolledCourses: z.array(z.string()).optional(),
});


// Update User Schema
export const updateUserZodSchema = z.object({
  name: z.string({ invalid_type_error: "Name must be a string" }).optional(),
  email: z
    .string({ invalid_type_error: "Email must be a string" })
    .email({ message: "Invalid email address" })
    .optional(),
  password: z
    .string({ invalid_type_error: "Password must be a string" })
    .min(6, { message: "Password must be at least 6 characters long" })
    .optional(),
  picture: z.string({ invalid_type_error: "Picture must be a string" }).optional(),
  role: z.enum([Role.STUDENT, Role.TEACHER, Role.ADMIN], {
    invalid_type_error: "Role must be either ADMIN or TEACHER or STUDENT",
  }).optional(),
  phone: z
    .string({ invalid_type_error: "Phone number must be a string" }).optional()
});
