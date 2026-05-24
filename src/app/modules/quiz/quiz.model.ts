import { Schema, model } from "mongoose";
import { IQuiz, IQuizQuestion } from "./quiz.interface";

const questionSchema = new Schema<IQuizQuestion>(
    {
        question: { type: String, required: true },

        options: { type: [String], required: true },

        correctAnswer: { type: String, required: true },

        marks: { type: Number, required: true },

        explanation: { type: String },
    },
    { _id: false }
);

const quizSchema = new Schema<IQuiz>(
    {
        title: { type: String, required: true },

        description: { type: String },

        courseId: {
            type: Schema.Types.ObjectId,
            ref: "Course",
            required: true,
        },

        subjectId: {
            type: Schema.Types.ObjectId,
            ref: "Subject",
            required: true,
        },

        teacherId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        questions: {
            type: [questionSchema],
            required: true,
        },

        totalMarks: { type: Number, required: true },

        duration: { type: Number, required: true },

        passingMarks: { type: Number, required: true },

        startTime: { type: Date },

        endTime: { type: Date },

        isPublished: { type: Boolean, default: false },

        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export const QuizModel = model<IQuiz>("Quiz", quizSchema);

const submittedAnswerSchema = new Schema(
    {
        questionIndex: Number,
        selectedAnswer: String,
        isCorrect: Boolean,
        obtainedMarks: Number,
    },
    { _id: false }
);

const quizSubmissionSchema = new Schema(
    {
        quizId: {
            type: Schema.Types.ObjectId,
            ref: "Quiz",
            required: true,
        },

        studentId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        submittedAnswers: [submittedAnswerSchema],

        totalObtainedMarks: {
            type: Number,
            default: 0,
        },

        totalCorrectAnswers: {
            type: Number,
            default: 0,
        },

        totalWrongAnswers: {
            type: Number,
            default: 0,
        },

        isPassed: {
            type: Boolean,
            default: false,
        },

        totalQuestions: {
            type: Number,
        },

        submittedAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

export const QuizSubmissionModel = model(
    "QuizSubmission",
    quizSubmissionSchema
);