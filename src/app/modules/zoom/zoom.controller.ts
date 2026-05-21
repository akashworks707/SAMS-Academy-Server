import { Request, Response } from "express";

import {
  generateSignature,
} from "../../utils/zoomUtils";
import { ZoomMeeting } from "./zoom.model";
import { createZoomMeeting, ZoomMeetingService } from "./zoom.service";
import { catchAsync } from "../../utils/catchAsync";
import httpStatus from "http-status-codes"
import { sendResponse } from "../../utils/sendResponse";

// export const createMeetingController = async (req: Request, res: Response) => {

//   try {
//     const meeting = await createZoomMeeting(req.body);

//     return res.status(200).json({
//       success: true,
//       data: meeting,
//     });
//   } catch (error: any) {
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };


// export const getSignatureController = async (
//   req: Request,
//   res: Response
// ) => {
//   try {
//     const { meetingNumber, role } = req.query;

//     const signature = generateSignature(
//       meetingNumber as string,
//       Number(role)
//     );

//     res.status(200).json({
//       success: true,
//       signature,
//     });
//   } catch (error: any) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };


// export const getMeetingsController = async (req: Request, res: Response) => {
//   try {
//     const meetings = await ZoomMeeting.find().sort({ createdAt: -1 });
//     res.status(200).json({ success: true, data: meetings });
//   } catch (error: any) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

const createMeetingController = catchAsync(async (
  req: Request,
  res: Response
) => {

  const meeting = await ZoomMeetingService.createZoomMeeting(req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Meeting Created successfully",
    data: meeting.data
  })
})


const getSignatureController = catchAsync(async (
  req: Request,
  res: Response
) => {

  const { meetingNumber, role } = req.query;

  const result = await ZoomMeetingService.getSignatureService(meetingNumber as string, role as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Signature retrieve successfully",
    data: result.signature,
  })
})



const getMeetingsController = catchAsync(
  async (req: Request, res: Response) => {
    const result = await ZoomMeetingService.getMeetingsService(
      req.query as Record<string, string>
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Meetings retrieved successfully",
      data: result.data,
      meta: result.meta,
    });
  }
);


export const ZoomMeetingController = {
  getSignatureController,
  createMeetingController,
  getMeetingsController
}
