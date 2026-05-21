import express from "express";
import { createQuizValidation, updateQuizValidation } from "./quiz.validation";
import { validateRequest } from "../../middleware/validateRequest";
import { QuizControllers } from "./quiz.controller";

const router = express.Router();

router.post(
    "/create-quiz",
    validateRequest(createQuizValidation),
    QuizControllers.createQuiz
);

router.post("/submit-quiz", QuizControllers.submitQuiz);
router.patch("/:quizId", validateRequest(updateQuizValidation), QuizControllers.updateQuiz);

router.get("/get-all-quiz", QuizControllers.getAllQuiz);
router.get("/review/:quizId/:studentId", QuizControllers.getQuizReview);
router.get(
    "/submissions",
    QuizControllers.getAllQuizSubmissions
);

export const QuizRoutes = router;