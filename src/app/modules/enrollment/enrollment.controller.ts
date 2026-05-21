import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import { EnrollmentService } from "./enrollment.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";

const createEnrollment = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await EnrollmentService.createEnrollment(req.body);

     sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Enrollment created successfully",
      data: result.data,
    });
});

const getAllEnrollments = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;
    const result = await EnrollmentService.getAllEnrollments(query as Record<string, string>);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "All enrollments retrieved successfully",
      data: result.data,
      meta: result.meta,
    });
});

const getAllTrashEnrollments = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;
    const result = await EnrollmentService.getAllTrashEnrollments(query as Record<string, string>);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "All trash enrollments retrieved successfully",
      data: result.data,
      meta: result.meta,
    });
});

const getSingleEnrollment = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const courseId = req.params.id as string;
    const result = await EnrollmentService.getSingleEnrollment(
        courseId
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Enrollment retrieved successfully",
      data: result.data,
    });
});

const updateEnrollment = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const courseId = req.params.id as string;
    const result = await EnrollmentService.updateEnrollment(
        courseId,
        req.body
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Enrollment updated successfully",
      data: result.data,
    });
});

const softDeleteEnrollment = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const courseId = req.params.id as string;
    const result = await EnrollmentService.softDeleteEnrollment(
        courseId
    );

     sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Enrollment soft deleted",
      data: result.data,
    });
});

const deleteEnrollment = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const courseId = req.params.id as string;
    const result = await EnrollmentService.deleteEnrollment(
        courseId
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Enrollment deleted",
      data: result.data,
    });
});

export const EnrollmentController = {
    createEnrollment,
    getAllEnrollments,
    getAllTrashEnrollments,
    getSingleEnrollment,
    updateEnrollment,
    softDeleteEnrollment,
    deleteEnrollment,
};