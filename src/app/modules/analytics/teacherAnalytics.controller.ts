import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { TeacherAnalyticsService } from "./teacherAnalytics.service";
import { sendResponse } from "../../utils/sendResponse";


// GET /api/analytics/teacher/:teacherId
// query: startDate, endDate, granularity

export const getTeacherAnalytics = catchAsync(async (req: Request, res: Response) => {

    const decodedToken = req.user;
    const teacherId = decodedToken.userId;
    const { startDate, endDate, granularity } = req.query;

    const [stats, revenueChart, courseRevenue, enrollmentChart] = await Promise.all([
        TeacherAnalyticsService.getTeacherStats(
            teacherId,
            startDate as string,
            endDate as string
        ),
        TeacherAnalyticsService.getTeacherRevenueChart(
            teacherId,
            startDate as string,
            endDate as string,
            granularity as "day" | "week" | "month" | "year"
        ),
        TeacherAnalyticsService.getTeacherCourseRevenue(
            teacherId,
            startDate as string,
            endDate as string
        ),
        TeacherAnalyticsService.getTeacherEnrollmentChart(
            teacherId,
            startDate as string,
            endDate as string,
            granularity as "day" | "week" | "month" | "year"
        ),
    ]);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Teacher analytics retrieved successfully",
        data: {
            stats,
            revenueChart,
            courseRevenue,
            enrollmentChart,
        },
    });
});