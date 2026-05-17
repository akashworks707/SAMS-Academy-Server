import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import { SubjectService } from "./subject.service";
import { catchAsync } from "../../utils/catchAsync";

const createSubject = catchAsync(async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const result = await SubjectService.createSubject(
    req.body
  );

  res.status(httpStatus.CREATED).json({
    success: true,
    message: "Subject created successfully",
    data: result.data,
  });
});

const getAllSubjects = catchAsync(async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const query = req.query;
  const result =
    await SubjectService.getAllSubjects(query as Record<string, string>);

  res.status(httpStatus.OK).json({
    success: true,
    message: "All Subjects Retrieved Successfully",
    data: result.data,
    meta: result.meta
  });
});

const getAllTrashSubjects = catchAsync(async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const query = req.query;
  const result =
    await SubjectService.getAllTrashSubjects(query as Record<string, string>);

  res.status(httpStatus.OK).json({
    success: true,
    message:
      "All Trash Subjects Retrieved Successfully",
    data: result.data,
    meta: result.meta
  });
});

const getSingleSubject = catchAsync(async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const result =
    await SubjectService.getSingleSubject(
      req.params.id as string
    );

  res.status(httpStatus.OK).json({
    success: true,
    message: "Subject Retrieved Successfully",
    data: result.data,
  });
});

const updateSubject = catchAsync(async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const result =
    await SubjectService.updateSubject(
      req.params.id as string,
      req.body
    );

  res.status(httpStatus.OK).json({
    success: true,
    message: "Subject Updated Successfully",
    data: result.data,
  });
});

const softDeleteSubject = catchAsync(async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const result =
    await SubjectService.softDeleteSubject(
      req.params.id as string
    );

  res.status(httpStatus.OK).json({
    success: true,
    message: "Subject deleted (soft delete)",
    data: result.data,
  });
});

const deleteSubject = catchAsync(async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const result =
    await SubjectService.deleteSubject(
      req.params.id as string
    );

  res.status(httpStatus.OK).json({
    success: true,
    message: "Subject deleted (hard delete)",
    data: result.data,
  });
});

export const SubjectController = {
  createSubject,
  getAllSubjects,
  getAllTrashSubjects,
  getSingleSubject,
  updateSubject,
  softDeleteSubject,
  deleteSubject,
};