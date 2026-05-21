import { z } from "zod";

const quizQuestionValidation = z.object({
  question: z.string(),
  options: z.array(z.string()).min(2),
  correctAnswer: z.string(),
  marks: z.number(),
  explanation: z.string().optional(),
});

export const createQuizValidation = z.object({
    title: z.string(),
    description: z.string().optional(),

    courseId: z.string(),
    subjectId: z.string(),
    teacherId: z.string(),

    questions: z.array(quizQuestionValidation),

    totalMarks: z.number(),
    duration: z.number(),
    passingMarks: z.number(),

    startTime: z.string().optional(),
    endTime: z.string().optional(),

    isPublished: z.boolean().optional(),
  })

export const updateQuizValidation = createQuizValidation.partial(); 