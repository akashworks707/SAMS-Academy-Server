import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import { ClassService } from "./class.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";

const createClass = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await ClassService.createClass(req.body);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Class created successfully",
        data: result.data,
    })
});

const getAllClasses = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;
    const result = await ClassService.getAllClasses(query as Record<string, string>);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "All Classes Retrieved Successfully",
        data: result.data,
        meta: result.meta
    })
});

const getAllTrashClasses = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;
    const result = await ClassService.getAllTrashClasses(query as Record<string, string>);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "All Trash Classes Retrieved Successfully",
        data: result.data,
        meta: result.meta
    })
});

const getSingleClass = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await ClassService.getSingleClass(req.params.id as string);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Class Retrieved Successfully",
        data: result.data
    })
});

const updateClass = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await ClassService.updateClass(req.params.id as string, req.body);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Class Updated Successfully",
        data: result.data
    })
});

const softDeleteClass = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await ClassService.softDeleteClass(req.params.id as string);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Class deleted (soft delete)",
        data: result.data
    })
});

const deleteClass = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await ClassService.deleteClass(req.params.id as string);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Class deleted (hard delete)",
        data: result.data
    })
});

export const ClassController = {
    createClass,
    getAllClasses,
    getSingleClass,
    updateClass,
    softDeleteClass,
    deleteClass,
    getAllTrashClasses
};