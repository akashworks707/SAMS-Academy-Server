import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { CourseService } from "./course.service";
import { CourseModel } from "./course.model";
import { deleteImageFromCloudinary } from "../../config/cloudinary.config";
import AppError from "../../errorHelpers/appError";

const createCourse = async (
    req: Request,
    res: Response
) => {
    const file = req.file;

    console.log("File in controller ", file)
    const payload = {
        ...req.body,
        thumbnail: file?.path,
    };

    console.log("Payload in controller ", payload)
    const result = await CourseService.createCourse(
        payload
    );

    res.status(httpStatus.CREATED).json({
        success: true,
        message: "Course created successfully",
        data: result.data,
    });
};

const getAllCourses = async (
    req: Request,
    res: Response
) => {
    const result =
        await CourseService.getAllCourses();

    res.status(httpStatus.OK).json({
        success: true,
        message: "All Courses Retrieved Successfully",
        data: result.data,
    });
};

const getAllTrashCourses = async (
    req: Request,
    res: Response
) => {
    const result =
        await CourseService.getAllTrashCourses();

    res.status(httpStatus.OK).json({
        success: true,
        message:
            "All Trash Courses Retrieved Successfully",
        data: result.data,
    });
};

const getSingleCourse = async (
    req: Request,
    res: Response
) => {
    const slug = req.params.slug as string;
    const result =
        await CourseService.getSingleCourse(
            slug
        );

    res.status(httpStatus.OK).json({
        success: true,
        message: "Course Retrieved Successfully",
        data: result.data,
    });
};

const updateCourse = async (
    req: Request,
    res: Response
) => {

    const courseId = req.params.id as string;

    const payload = req.body;

    const existingCourse = await CourseModel.findById(courseId);
    if (!existingCourse) {
        throw new AppError(httpStatus.NOT_FOUND, "Course not found");
    }

    if (req.file) {
        if (existingCourse?.thumbnail) {
            await deleteImageFromCloudinary(existingCourse.thumbnail);
        }

        payload.thumbnail = req.file.path;
    }

    const result = await CourseService.updateCourse(courseId, payload);
    res.status(httpStatus.OK).json({
        success: true,
        message: "Course Updated Successfully",
        data: result.data,
    });
};

const softDeleteCourse = async (
    req: Request,
    res: Response
) => {
    const result =
        await CourseService.softDeleteCourse(
            req.params.id as string
        );

    res.status(httpStatus.OK).json({
        success: true,
        message: "Course deleted (soft delete)",
        data: result.data,
    });
};

const deleteCourse = async (
    req: Request,
    res: Response
) => {
    const result =
        await CourseService.deleteCourse(
            req.params.id as string
        );

    res.status(httpStatus.OK).json({
        success: true,
        message: "Course deleted (hard delete)",
        data: result.data,
    });
};

export const CourseController = {
    createCourse,
    getAllCourses,
    getAllTrashCourses,
    getSingleCourse,
    updateCourse,
    softDeleteCourse,
    deleteCourse,
};