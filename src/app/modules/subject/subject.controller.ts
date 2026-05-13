import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { SubjectService } from "./subject.service";

const createSubject = async (
  req: Request,
  res: Response
) => {
  const result = await SubjectService.createSubject(
    req.body
  );

  res.status(httpStatus.CREATED).json({
    success: true,
    message: "Subject created successfully",
    data: result.data,
  });
};

const getAllSubjects = async (
  req: Request,
  res: Response
) => {
  const result =
    await SubjectService.getAllSubjects();

  res.status(httpStatus.OK).json({
    success: true,
    message: "All Subjects Retrieved Successfully",
    data: result.data,
  });
};

const getAllTrashSubjects = async (
  req: Request,
  res: Response
) => {
  const result =
    await SubjectService.getAllTrashSubjects();

  res.status(httpStatus.OK).json({
    success: true,
    message:
      "All Trash Subjects Retrieved Successfully",
    data: result.data,
  });
};

const getSingleSubject = async (
  req: Request,
  res: Response
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
};

const updateSubject = async (
  req: Request,
  res: Response
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
};

const softDeleteSubject = async (
  req: Request,
  res: Response
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
};

const deleteSubject = async (
  req: Request,
  res: Response
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
};

export const SubjectController = {
  createSubject,
  getAllSubjects,
  getAllTrashSubjects,
  getSingleSubject,
  updateSubject,
  softDeleteSubject,
  deleteSubject,
};