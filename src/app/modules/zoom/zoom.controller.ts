// import { createZoomMeetingService } from "./zoom.service";
import { Request, Response } from "express";

import {
  generateSignature,
} from "../../utils/zoomUtils";
import { ZoomMeeting } from "./zoom.model";
import { createZoomMeeting } from "./zoom.service";

export const createMeetingController = async (req: Request, res: Response) => {

  try {
    const meeting = await createZoomMeeting(req.body);

    return res.status(200).json({
      success: true,
      data: meeting,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getSignatureController = async (
  req: Request,
  res: Response
) => {
  try {
    const { meetingNumber, role } = req.query;

    const signature = generateSignature(
      meetingNumber as string,
      Number(role)
    );

    res.status(200).json({
      success: true,
      signature,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMeetingsController = async (req: Request, res: Response) => {
  try {
    const meetings = await ZoomMeeting.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: meetings });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
