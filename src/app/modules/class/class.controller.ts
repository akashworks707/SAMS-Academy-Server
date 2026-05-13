import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { ClassService } from "./class.service";

const createClass = async (req: Request, res: Response) => {
    const result = await ClassService.createClass(req.body);

    res.status(httpStatus.CREATED).json({
        success: true,
        message: "Class created successfully",
        data: result.data,
    });
};

const getAllClasses = async (req: Request, res: Response) => {
    const result = await ClassService.getAllClasses();

    res.status(httpStatus.OK).json({
        success: true,
        message: "All Classes Retrieved Successfully",
        data: result.data,
    });
};

const getAllTrashClasses = async (req: Request, res: Response) => {
    const result = await ClassService.getAllClasses();

    res.status(httpStatus.OK).json({
        success: true,
        message: "All Trash Classes Retrieved Successfully",
        data: result.data
    });
};

const getSingleClass = async (req: Request, res: Response) => {
    const result = await ClassService.getSingleClass(req.params.id as string);

    res.status(httpStatus.OK).json({
        success: true,
        message: "Class Retrieved Successfully",
        data: result.data,
    });
};

const updateClass = async (req: Request, res: Response) => {
    const result = await ClassService.updateClass(req.params.id as string, req.body);

    res.status(httpStatus.OK).json({
        success: true,
        message: "Class Updated Successfully",
        data: result.data,
    });
};

const softDeleteClass = async (req: Request, res: Response) => {
    const result = await ClassService.softDeleteClass(req.params.id as string);

    res.status(httpStatus.OK).json({
        success: true,
        message: "Class deleted (soft delete)",
        data: result.data,
    });
};

const deleteClass = async (req: Request, res: Response) => {
    const result = await ClassService.deleteClass(req.params.id as string);

    res.status(httpStatus.OK).json({
        success: true,
        message: "Class deleted (hard delete)",
        data: result.data,
    });
};

export const ClassController = {
    createClass,
    getAllClasses,
    getSingleClass,
    updateClass,
    softDeleteClass,
    deleteClass,
    getAllTrashClasses
};