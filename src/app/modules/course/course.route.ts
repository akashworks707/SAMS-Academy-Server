import express from "express";
import { CourseController } from "./course.controller";
import { validateRequest } from "../../middleware/validateRequest";
import {
  createCourseZodSchema,
  updateCourseZodSchema,
} from "./course.validation";
import { multerUpload } from "../../config/multer.config";

const router = express.Router();

router.post(
  "/create-course",
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
  multerUpload.single("thumbnail"),
  validateRequest(updateCourseZodSchema),
  CourseController.updateCourse
);

router.delete(
  "/:id",
  CourseController.deleteCourse
);

router.patch(
  "/soft-delete/:id",
  CourseController.softDeleteCourse
);

export const courseRoutes = router;