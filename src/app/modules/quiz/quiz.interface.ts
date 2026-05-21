import { Types } from "mongoose";

export interface IQuizQuestion {
  question: string;

  options: string[];

  correctAnswer: string;

  marks: number;

  explanation?: string;
}

export interface IQuiz {
  title: string;

  description?: string;

  courseId: Types.ObjectId;

  subjectId: Types.ObjectId;

  teacherId: Types.ObjectId;

  questions: IQuizQuestion[];

  totalMarks: number;

  duration: number;

  passingMarks: number;

  startTime?: Date;

  endTime?: Date;

  isPublished: boolean;

  isActive: boolean;

  createdAt?: Date;

  updatedAt?: Date;
}

export interface ISubmittedAnswer {
  questionIndex: number;

  selectedAnswer: string;

  isCorrect?: boolean;

  obtainedMarks?: number;
}

export interface IQuizSubmission {
  quizId: Types.ObjectId;

  studentId: Types.ObjectId;

  submittedAnswers: ISubmittedAnswer[];

  totalObtainedMarks: number;

  totalCorrectAnswers: number;

  totalWrongAnswers: number;

  isPassed: boolean;

  submittedAt?: Date;
}