import express from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../user/user.interface";
import { AnalyticsController } from "./analytics.controller";
import { getTeacherAnalytics } from "./teacherAnalytics.controller";

const router = express.Router();

router.get(
  "/all-analytics",
  checkAuth(Role.ADMIN),
  AnalyticsController.getAllAnalytics
);

router.get(
  "/course-revenue",
  checkAuth(Role.ADMIN),
  AnalyticsController.getCourseRevenue
);

router.get(
  "/total-revenue",
  checkAuth(Role.ADMIN),
  AnalyticsController.getTotalRevenue
);

router.get(
  "/my-revenue",
  checkAuth(...Object.values(Role)),
  AnalyticsController.getMyRevenue
);

router.get(
  "/teacher-revenue",
  checkAuth(Role.ADMIN),
  AnalyticsController.getTeacherRevenueAdmin
);

router.get(
  "/teacher",
  checkAuth(Role.ADMIN, Role.TEACHER),
  getTeacherAnalytics
);

export const analyticsRoutes = router;