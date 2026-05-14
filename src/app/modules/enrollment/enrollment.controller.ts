import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { EnrollmentService } from "./enrollment.service";

const createEnrollment = async (req: Request, res: Response) => {
    const result = await EnrollmentService.createEnrollment(req.body);

    res.status(httpStatus.CREATED).json({
        success: true,
        message: "Enrollment created successfully",
        data: result.data,
    });
};

const getAllEnrollments = async (req: Request, res: Response) => {
    const query = req.query;
    const result = await EnrollmentService.getAllEnrollments(query as Record<string, string>);

    res.status(httpStatus.OK).json({
        success: true,
        message: "All enrollments retrieved successfully",
        data: result.data,
        meta: result.meta
    });
};

const getAllTrashEnrollments = async (req: Request, res: Response) => {
    const query = req.query;
    const result = await EnrollmentService.getAllTrashEnrollments(query as Record<string, string>);

    res.status(httpStatus.OK).json({
        success: true,
        message: "All trash enrollments retrieved successfully",
        data: result.data,
        meta: result.meta
    });
};

const getSingleEnrollment = async (req: Request, res: Response) => {
    const courseId = req.params.id as string;
    const result = await EnrollmentService.getSingleEnrollment(
        courseId
    );

    res.status(httpStatus.OK).json({
        success: true,
        message: "Enrollment retrieved successfully",
        data: result.data,
    });
};

const updateEnrollment = async (req: Request, res: Response) => {
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
};

const softDeleteEnrollment = async (req: Request, res: Response) => {
    const courseId = req.params.id as string;
    const result = await EnrollmentService.softDeleteEnrollment(
        courseId
    );

    res.status(httpStatus.OK).json({
        success: true,
        message: "Enrollment soft deleted",
        data: result.data,
    });
};

const deleteEnrollment = async (req: Request, res: Response) => {
    const courseId = req.params.id as string;
    const result = await EnrollmentService.deleteEnrollment(
        courseId
    );

    res.status(httpStatus.OK).json({
        success: true,
        message: "Enrollment deleted",
        data: result.data,
    });
};

export const EnrollmentController = {
    createEnrollment,
    getAllEnrollments,
    getAllTrashEnrollments,
    getSingleEnrollment,
    updateEnrollment,
    softDeleteEnrollment,
    deleteEnrollment,
};