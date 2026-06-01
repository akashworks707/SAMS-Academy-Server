import { NextFunction, Request, Response } from "express";

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

  console.log("Request Body:", req.body); // Debug log to check the request body


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

const updateMeetingController = catchAsync(async (req: Request, res: Response) => {
    const meetingId = req.params.id as string;
    const payload = req.body;

    const meeting = await ZoomMeetingService.updateZoomMeetingService(meetingId, payload, )
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Meeting Updated Successfully",
        data: meeting
    })
})


const softDeleteMeetingController = catchAsync(async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const result =
    await ZoomMeetingService.softDeleteZoomMeeting(
      req.params.id as string
    );


  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Meeting deleted (soft delete)",
    data: result.data,
  });
});

const deleteMeetingController = catchAsync(async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const result =
    await ZoomMeetingService.deleteZoomMeeting(
      req.params.id as string
    );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Meeting deleted (hard delete)",
    data: result.data,
  });
});


export const ZoomMeetingController = {
  getSignatureController,
  createMeetingController,
  getMeetingsController,
  updateMeetingController,
  deleteMeetingController,
  softDeleteMeetingController,
}
