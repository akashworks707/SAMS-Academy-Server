import express from "express";
import { CourseController } from "./course.controller";
import { validateRequest } from "../../middleware/validateRequest";
import {
  createCourseZodSchema,
  updateCourseZodSchema,
} from "./course.validation";
import { multerUpload } from "../../config/multer.config";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../user/user.interface";

const router = express.Router();

router.post(
  "/create-course",
  checkAuth(Role.ADMIN),
  multerUpload.single("thumbnail"),
  validateRequest(createCourseZodSchema),
  CourseController.createCourse
);

router.get(
  "/all-courses",
  CourseController.getAllCourses
);

router.get(
  "/all-trash-courses",
  CourseController.getAllTrashCourses
);

router.get(
  "/:slug",
  CourseController.getSingleCourse
);

router.patch(
  "/:id",
  checkAuth(Role.ADMIN),
  multerUpload.single("thumbnail"),
  validateRequest(updateCourseZodSchema),
  CourseController.updateCourse
);

router.delete(
  "/:id",
  checkAuth(Role.ADMIN),
  CourseController.deleteCourse
);

router.patch(
  "/soft-delete/:id",
  checkAuth(Role.ADMIN),
  CourseController.softDeleteCourse
);

export const courseRoutes = router;