// recordedVideo.controller.ts

import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import { CourseRecordedVideoService } from "./courseRecordedVideo.service";
import { create } from "axios";
import { CourseRecordedVideoModel } from "./courseRecordedVideo.model";
import AppError from "../../errorHelpers/appError";
import { deleteImageFromCloudinary } from "../../config/cloudinary.config";
import { catchAsync } from "../../utils/catchAsync";

const createCourseRecordedVideo = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const file = req.file;
    if (file) {
        payload.thumbnailUrl = file.path;
    }
    const result = await CourseRecordedVideoService.createRecordedVideo(payload);

    res.status(httpStatus.CREATED).json({
        success: true,
        message: "Recorded video created successfully",
        data: result.data,
    });
});

const getAllRecordedVideos = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await CourseRecordedVideoService.getAllRecordedVideos(
        req.query as Record<string, string>
    );

    res.status(httpStatus.OK).json({
        success: true,
        message: "All Recorded Videos Retrieved Successfully",
        data: result.data,
        meta: result.meta,
    });
});

const getAllTrashRecordedVideos = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await CourseRecordedVideoService.getAllTrashRecordedVideos(
        req.query as Record<string, string>
    );

    res.status(httpStatus.OK).json({
        success: true,
        message: "All Trash Recorded Videos Retrieved Successfully",
        data: result.data,
        meta: result.meta,
    });
});

const getSingleRecordedVideo = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await CourseRecordedVideoService.getSingleRecordedVideo(req.params.id as string);

    res.status(httpStatus.OK).json({
        success: true,
        message: "Recorded Video Retrieved Successfully",
        data: result.data,
    });
});

const updateRecordedVideo = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const file = req.file;
    const courseId = req.params.id as string;
    const existingCourse = await CourseRecordedVideoModel.findById(courseId);
    if (!existingCourse) {
        throw new AppError(httpStatus.NOT_FOUND, "Course not found");
    }

    if (file) {
        if (existingCourse?.thumbnailUrl) {
            await deleteImageFromCloudinary(existingCourse.thumbnailUrl);
        }

        payload.thumbnailUrl = file.path;
    }

    const result = await CourseRecordedVideoService.updateRecordedVideo(
        courseId,
        payload
    );

    res.status(httpStatus.OK).json({
        success: true,
        message: "Recorded Video Updated Successfully",
        data: result.data,
    });
});

const softDeleteRecordedVideo = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await CourseRecordedVideoService.softDeleteRecordedVideo(req.params.id as string);

    res.status(httpStatus.OK).json({
        success: true,
        message: "Recorded Video Soft Deleted",
        data: result.data,
    });
});

const deleteRecordedVideo = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await CourseRecordedVideoService.deleteRecordedVideo(req.params.id as string);

    res.status(httpStatus.OK).json({
        success: true,
        message: "Recorded Video Hard Deleted",
        data: result.data,
    });
});

export const CourseRecordedVideoController = {
    createCourseRecordedVideo,
    getAllRecordedVideos,
    getSingleRecordedVideo,
    updateRecordedVideo,
    softDeleteRecordedVideo,
    deleteRecordedVideo,
    getAllTrashRecordedVideos,
};