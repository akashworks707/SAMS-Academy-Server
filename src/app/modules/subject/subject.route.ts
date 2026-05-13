import express from "express";
import { SubjectController } from "./subject.controller";
import { validateRequest } from "../../middleware/validateRequest";
import {
  createSubjectZodSchema,
  updateSubjectZodSchema,
} from "./subject.validation";

const router = express.Router();

router.post(
  "/create-subject",
  validateRequest(createSubjectZodSchema),
  SubjectController.createSubject
);

router.get(
  "/all-subjects",
  SubjectController.getAllSubjects
);

router.get(
  "/all-trash-subjects",
  SubjectController.getAllTrashSubjects
);

router.get(
  "/:id",
  SubjectController.getSingleSubject
);

router.patch(
  "/:id",
  validateRequest(updateSubjectZodSchema),
  SubjectController.updateSubject
);

router.delete(
  "/:id",
  SubjectController.deleteSubject
);

router.patch(
  "/soft-delete/:id",
  SubjectController.softDeleteSubject
);

export const subjectRoutes = router;