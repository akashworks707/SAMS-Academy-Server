import express from "express";
import { UserControllers } from "./user.controller";
import { Role } from "./user.interface";
import { validateRequest } from "../../middleware/validateRequest";
import { createUserZodSchema, updateUserZodSchema } from "./user.validation";
import { checkAuth } from "../../middleware/checkAuth";
import { multerUpload } from "../../config/multer.config";

const router = express.Router();

router.post(
  "/create-user",
  multerUpload.single("picture"),
  validateRequest(createUserZodSchema),
  UserControllers.createUser
);

router.get('/me', checkAuth(...Object.values(Role)), UserControllers.getMe)
router.get("/all-users", checkAuth(Role.ADMIN), UserControllers.getAllUsers)
router.get("/all-students", checkAuth(...Object.values(Role)), UserControllers.getAllStudents)
router.get("/all-teachers", checkAuth(Role.ADMIN), UserControllers.getAllTeachers)
router.get("/:id", checkAuth(...Object.values(Role)), UserControllers.getSingleUser)
router.delete("/:id", checkAuth(Role.ADMIN), UserControllers.deleteUser)
// router.patch("/update-profile", checkAuth(...Object.values(Role)), validateRequest(updateUserZodSchema), UserControllers.updateProfile)
router.patch(
  "/:id",
  checkAuth(Role.ADMIN),
  multerUpload.single("picture"),
  validateRequest(updateUserZodSchema),
  UserControllers.updateUser
);
export const userRoutes = router;

