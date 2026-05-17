import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import { EnrollmentService } from "./enrollment.service";
import { catchAsync } from "../../utils/catchAsync";

const createEnrollment = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await EnrollmentService.createEnrollment(req.body);

    res.status(httpStatus.CREATED).json({
        success: true,
        message: "Enrollment created successfully",
        data: result.data,
    });
});

const getAllEnrollments = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;
    const result = await EnrollmentService.getAllEnrollments(query as Record<string, string>);

    res.status(httpStatus.OK).json({
        success: true,
        message: "All enrollments retrieved successfully",
        data: result.data,
        meta: result.meta
    });
});

const getAllTrashEnrollments = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;
    const result = await EnrollmentService.getAllTrashEnrollments(query as Record<string, string>);

    res.status(httpStatus.OK).json({
        success: true,
        message: "All trash enrollments retrieved successfully",
        data: result.data,
        meta: result.meta
    });
});

const getSingleEnrollment = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const courseId = req.params.id as string;
    const result = await EnrollmentService.getSingleEnrollment(
        courseId
    );

    res.status(httpStatus.OK).json({
        success: true,
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

    res.status(httpStatus.OK).json({
        success: true,
        message: "Enrollment updated successfully",
        data: result.data,
    });
});

const softDeleteEnrollment = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const courseId = req.params.id as string;
    const result = await EnrollmentService.softDeleteEnrollment(
        courseId
    );

    res.status(httpStatus.OK).json({
        success: true,
        message: "Enrollment soft deleted",
        data: result.data,
    });
});

const deleteEnrollment = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const courseId = req.params.id as string;
    const result = await EnrollmentService.deleteEnrollment(
        courseId
    );

    res.status(httpStatus.OK).json({
        success: true,
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