// recordedVideo.routes.ts

import express from "express";
import { validateRequest } from "../../middleware/validateRequest";
import { createCourseRecordedVideoValidation, updateCourseRecordedVideoValidation } from "./courseRecordedVideo.validation";
import { CourseRecordedVideoController } from "./courseRecordedVideo.controller";
import { multerUpload } from "../../config/multer.config";

const router = express.Router();

router.post(
  "/create-recorded-video",
  multerUpload.single("thumbnailUrl"),
  validateRequest(createCourseRecordedVideoValidation),
  CourseRecordedVideoController.createCourseRecordedVideo
);

router.get("/all-recorded-videos", CourseRecordedVideoController.getAllRecordedVideos);

router.get(
  "/all-trash-recorded-videos",
  CourseRecordedVideoController.getAllTrashRecordedVideos
);

router.get("/:id", CourseRecordedVideoController.getSingleRecordedVideo);

router.patch(
  "/:id",
  multerUpload.single("thumbnailUrl"),
  validateRequest(updateCourseRecordedVideoValidation),
  CourseRecordedVideoController.updateRecordedVideo
);

router.patch(
  "/soft-delete/:id",
  CourseRecordedVideoController.softDeleteRecordedVideo
);

router.delete("/:id", CourseRecordedVideoController.deleteRecordedVideo);

export const recordedVideoRoutes = router;