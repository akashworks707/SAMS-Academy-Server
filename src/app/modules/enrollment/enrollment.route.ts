import express from "express";
import { EnrollmentController } from "./enrollment.controller";

const router = express.Router();

router.post("/create-enrollment", EnrollmentController.createEnrollment);

router.get("/all-enrollments", EnrollmentController.getAllEnrollments);

router.get("/all-trash-enrollments", EnrollmentController.getAllTrashEnrollments);

router.get("/:id", EnrollmentController.getSingleEnrollment);

router.patch("/:id", EnrollmentController.updateEnrollment);

router.delete("/soft/:id", EnrollmentController.softDeleteEnrollment);

router.delete("/:id", EnrollmentController.deleteEnrollment);

export const EnrollmentRoutes = router;