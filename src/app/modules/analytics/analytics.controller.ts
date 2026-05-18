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

export const AnalyticsController = {
  getCourseRevenue,
  getTotalRevenue,
  getMyRevenue,
  getTeacherRevenueAdmin,
};