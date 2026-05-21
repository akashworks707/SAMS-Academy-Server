import express from "express";

import { ZoomMeetingController } from "./zoom.controller";

const router = express.Router();

router.post(
    "/create-meeting",
    ZoomMeetingController.createMeetingController
);

router.get(
    "/signature",
    ZoomMeetingController.getSignatureController
);

router.get("/meetings",
    ZoomMeetingController.getMeetingsController);

export const ZoomRoutes = router;