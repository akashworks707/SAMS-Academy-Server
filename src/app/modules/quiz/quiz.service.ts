import AppError from "../../errorHelpers/appError";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { quizSearchableFields } from "./quiz.constant";
import { QuizModel, QuizSubmissionModel } from "./quiz.model";
import httpStatus from "http-status-codes"

const createQuiz = async (payload: any) => {
    const result = await QuizModel.create(payload);
    return result;
};


const getAllQuiz = async (query: Record<string, string>) => {
  const baseQuery = QuizModel.find();

  const queryBuilder = new QueryBuilder(baseQuery, query);

  const quizQuery = queryBuilder
    .filter()
    .search(quizSearchableFields)
    .sort()
    .fields()
    .paginate();

  const [data, meta] = await Promise.all([
    quizQuery
      .build()
      .populate("courseId")
      .populate("subjectId")
      .populate("teacherId"),
    queryBuilder.getMeta(),
  ]);

  return {
    data,
    meta,
  };
};

const submitQuiz = async (
    quizId: string,
    studentId: string,
    answers: {
        questionIndex: number;
        selectedAnswer: string;
    }[]
) => {
    const quiz = await QuizModel.findById(quizId);

    if (!quiz) throw new AppError(httpStatus.NOT_FOUND, "Quiz not found");

    let totalObtainedMarks = 0;
    let totalCorrectAnswers = 0;
    let totalWrongAnswers = 0;

    const evaluatedAnswers = answers.map((ans) => {
        const question = quiz.questions[ans.questionIndex];

        const isCorrect =
            question.correctAnswer === ans.selectedAnswer;

        const obtainedMarks = isCorrect ? question.marks : 0;

        if (isCorrect) {
            totalCorrectAnswers++;
            totalObtainedMarks += question.marks;
        } else {
            totalWrongAnswers++;
        }

        return {
            ...ans,
            isCorrect,
            obtainedMarks,
        };
    });

    const isPassed =
        totalObtainedMarks >= quiz.passingMarks;

    const submission = await QuizSubmissionModel.create({
        quizId,
        studentId,
        submittedAnswers: evaluatedAnswers,
        totalObtainedMarks,
        totalCorrectAnswers,
        totalWrongAnswers,
        isPassed,
        totalQuestions: quiz.questions.length,
    });

    return submission;

};

const updateQuiz = async (quizId: string, payload: any) => {

    const quiz = await QuizModel.findById(quizId)

    if (!quiz) {
        throw new AppError(httpStatus.BAD_REQUEST, "Quiz not found");
    }

    const result = await QuizModel.findByIdAndUpdate(
        quizId,
        {
            $set: payload,
        },
        {
            returnDocument: "after",
            runValidators: true,
        }
    );

    return result;
};


const getQuizReview = async (
    quizId: string,
    studentId: string
) => {
    const submission = await QuizSubmissionModel.findOne({
        quizId,
        studentId,
    })
        .populate({
            path: "studentId",
            select: "studentId section roll userId",
            populate: {
                path: "userId",
                select: "name email",
            }
        })
        .populate({
            path: "quizId",
            select: "title questions",
        });

    if (!submission || !submission.quizId) {
        throw new AppError(httpStatus.NOT_FOUND,"Submission not found");
    }

    const quiz: any = submission.quizId;

    const review = quiz.questions.map((q: any, index: number) => {
        const submitted = submission.submittedAnswers.find(
            (a: any) => a.questionIndex === index
        );

        return {
            question: q.question,
            options: q.options,

            correctAnswer: q.correctAnswer,

            selectedAnswer: submitted?.selectedAnswer || null,

            isCorrect: submitted?.isCorrect || false,

            obtainedMarks: submitted?.obtainedMarks || 0,
        };
    });

    return {
        student: submission.studentId,
        quiz: {
            _id: quiz._id,
            title: quiz.title,
        },

        totalObtainedMarks: submission.totalObtainedMarks,
        totalCorrectAnswers: submission.totalCorrectAnswers,
        totalWrongAnswers: submission.totalWrongAnswers,
        isPassed: submission.isPassed,

        review,
    };
};

const getAllQuizSubmissions = async (
  query: Record<string, string>
) => {
  const baseQuery = QuizSubmissionModel.find();

  const queryBuilder = new QueryBuilder(baseQuery, query);

  const submissionsQuery = queryBuilder
    .filter()
    .sort()
    .fields()
    .paginate();

  const [data, meta] = await Promise.all([
    submissionsQuery.build(),
    queryBuilder.getMeta(),
  ]);

  return {
    data,
    meta,
  };
};

export const QuizServices = {
    createQuiz,
    getAllQuiz,
    submitQuiz,
    updateQuiz,
    getQuizReview,
    getAllQuizSubmissions
}