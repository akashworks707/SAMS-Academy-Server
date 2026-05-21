import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { QuizServices } from "./quiz.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes"


export const createQuiz = catchAsync(async (req: Request, res: Response) => {
    const result = await QuizServices.createQuiz(req.body);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Quiz Created Successfully",
        data: result
    })

});

 const getAllQuiz = catchAsync(async (req: Request, res: Response) => {

    const result = await QuizServices.getAllQuiz(req.query as Record<string, string>);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "All Quiz Retrieved Successfully",
        data: result
    })
});

 const submitQuiz = catchAsync(async (req: Request, res: Response) => {
    const { quizId, studentId, answers } = req.body;

    const result = await QuizServices.submitQuiz(
        quizId,
        studentId,
        answers
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Quiz Submission and Result Retrieve Successfully",
        data: result
    })
});


const updateQuiz = catchAsync(async (req: Request, res: Response) => {
    const { quizId } = req.params;

    const result = await QuizServices.updateQuiz(quizId as string, req.body);

    res.status(200).json({
        success: true,
        message: "Quiz updated successfully",
        data: result,
    });

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Quiz Updated Successfully",
        data: result
    })
});


 const getQuizReview = catchAsync(async (req: Request, res: Response) => {
    const { quizId, studentId } = req.params;

    const result = await QuizServices.getQuizReview(
        quizId as string,
        studentId as string
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Submitted Quiz Retrieved Successfully",
        data: result
    })
});

const getAllQuizSubmissions = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await QuizServices.getAllQuizSubmissions(req.query as Record<string, string>);

    res.status(200).json({
      success: true,
      message: "All Quiz Submissions Retrieved Successfully",
      data: result,
    });
  }
);

export const QuizControllers = {
    createQuiz,
    submitQuiz,
    getAllQuiz,
    updateQuiz,
    getQuizReview,
    getAllQuizSubmissions
}