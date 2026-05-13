import express from "express";
import { ClassController } from "./class.controller";
import { validateRequest } from "../../middleware/validateRequest";
import {
  createClassZodSchema,
  updateClassZodSchema,
} from "./class.validation";

const router = express.Router();

router.post("/create-class", validateRequest(createClassZodSchema), ClassController.createClass);

router.get("/all-classes", ClassController.getAllClasses);
router.get("/all-trash-classes", ClassController.getAllTrashClasses);
router.get("/:id", ClassController.getSingleClass);

router.patch("/:id", validateRequest(updateClassZodSchema), ClassController.updateClass);

router.delete("/:id", ClassController.deleteClass);
router.patch("/soft-delete/:id", ClassController.softDeleteClass);

export const classRoutes = router;