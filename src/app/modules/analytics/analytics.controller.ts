import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";

import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { AnalyticsService } from "./analytics.service";

const getCourseRevenue = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { startDate, endDate } = req.query;

    const result = await AnalyticsService.getCourseRevenue(
      startDate as string,
      endDate as string
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Course revenue retrieved successfully",
      data: result,
    });
  }
);

const getTotalRevenue = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { startDate, endDate } = req.query;

    const result = await AnalyticsService.getTotalRevenue(
      startDate as string,
      endDate as string
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Total revenue retrieved successfully",
      data: result,
    });
  }
);

const getMyRevenue = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user as JwtPayload;

    const { startDate, endDate } = req.query;

    const result = await AnalyticsService.getTeacherRevenue(
      decodedToken.userId,
      startDate as string,
      endDate as string
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Your revenue retrieved successfully",
      data: result,
    });
  }
);

const getTeacherRevenueAdmin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { startDate, endDate } = req.query;

    const result = await AnalyticsService.getTeacherRevenue(
      undefined,
      startDate as string,
      endDate as string
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Teacher revenue retrieved successfully",
      data: result,
    });
  }
);

// const getAllRevenue = catchAsync(async (req, res) => {
//   const { startDate, endDate, sortBy, sortOrder } = req.query;

//   const teacherRevenue = await AnalyticsService.getTeacherRevenue(
//     undefined,
//     startDate as string,
//     endDate as string,
//     sortBy as string,
//     sortOrder as "asc" | "desc"
//   );

//   const courseRevenue = await AnalyticsService.getCourseRevenue(
//     startDate as string,
//     endDate as string,
//     sortBy as string,        // ← added
//     sortOrder as "asc" | "desc"  // ← added
//   );

//   const totalRevenue = await AnalyticsService.getTotalRevenue(
//     startDate as string,
//     endDate as string
//   );

//   sendResponse(res, {
//     success: true,
//     statusCode: httpStatus.OK,
//     message: "All revenue data retrieved successfully",
//     data: { courseRevenue, teacherRevenue, totalRevenue },
//   });
// });



// ─── All Analytics (single combined endpoint for admin dashboard) ─────────────

const getAllAnalytics = catchAsync(async (req: Request, res: Response) => {
  const { startDate, endDate, sortBy, sortOrder, granularity } = req.query;

  const [
    stats,
    teacherRevenue,
    courseRevenue,
    totalRevenue,
    paymentAnalytics,
    enrollmentAnalytics,
    studentAnalytics,
    dashboardChartData,
    enrollmentStudentChartData,
  ] = await Promise.all([
    AnalyticsService.getDashboardStats(
      startDate as string,
      endDate as string
    ),
    AnalyticsService.getTeacherRevenue(
      undefined,
      startDate as string,
      endDate as string,
      sortBy as string,
      sortOrder as "asc" | "desc"
    ),
    AnalyticsService.getCourseRevenue(
      startDate as string,
      endDate as string,
      sortBy as string,
      sortOrder as "asc" | "desc"
    ),
    AnalyticsService.getTotalRevenue(
      startDate as string,
      endDate as string
    ),
    AnalyticsService.getPaymentAnalytics(
      startDate as string,
      endDate as string,
      sortBy as string,
      sortOrder as "asc" | "desc"
    ),
    AnalyticsService.getEnrollmentAnalytics(
      startDate as string,
      endDate as string,
      sortBy as string,
      sortOrder as "asc" | "desc"
    ),
    AnalyticsService.getStudentAnalytics(
      startDate as string,
      endDate as string,
      sortBy as string,
      sortOrder as "asc" | "desc"
    ),
    AnalyticsService.getDashboardChartData(
      startDate as string,
      endDate as string,
      granularity as "day" | "week" | "month" | "year"
    ),
    AnalyticsService.getEnrollmentStudentChartData(
      startDate as string,
      endDate as string,
      granularity as "day" | "week" | "month" | "year"
    ),
  ]);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "All analytics data retrieved successfully",
    data: {
      stats,
      revenue: { courseRevenue, teacherRevenue, totalRevenue },
      payments: paymentAnalytics,
      enrollments: enrollmentAnalytics,
      students: studentAnalytics,
      charts: {
        dashboard: dashboardChartData,
        enrollmentStudent: enrollmentStudentChartData,
      },
    },
  });
});

export const AnalyticsController = {
  getCourseRevenue,
  getTotalRevenue,
  getMyRevenue,
  getTeacherRevenueAdmin,
  getAllAnalytics
};