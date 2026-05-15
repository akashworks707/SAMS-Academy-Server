import express from "express";

import {
    createMeetingController,
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

export const ZoomRoutes = router;