import express from "express";

import {
    createMeetingController,
    // deleteMeetingController,
    getMeetingsController,
    getSignatureController,
} from "./zoom.controller";

const router = express.Router();

router.post(
    "/create-meeting",
    createMeetingController
);

router.get(
    "/signature",
    getSignatureController
);

router.get("/meetings", getMeetingsController);
// router.delete("/meetings/:meetingId", deleteMeetingController);

export const ZoomRoutes = router;