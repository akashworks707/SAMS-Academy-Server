import express from "express";
import { ZoomMeetingController } from "./zoom.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../user/user.interface";

const router = express.Router();

router.post(
    "/create-meeting",
    checkAuth(Role.ADMIN, Role.TEACHER),
    ZoomMeetingController.createMeetingController
);

router.get(
    "/signature",
    ZoomMeetingController.getSignatureController
);

router.patch(
    "/:id",
    checkAuth(Role.ADMIN, Role.TEACHER),
    ZoomMeetingController.updateMeetingController
);

router.get("/meetings",
    checkAuth(...Object.values(Role)),
    ZoomMeetingController.getMeetingsController);


router.delete(
    "/:id",
    checkAuth(Role.ADMIN, Role.TEACHER),
    ZoomMeetingController.deleteMeetingController
);

router.patch(
    "/soft-delete/:id",
    checkAuth(Role.ADMIN, Role.TEACHER),
    ZoomMeetingController.softDeleteMeetingController
);
export const ZoomRoutes = router;