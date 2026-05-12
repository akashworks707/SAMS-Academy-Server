import { Request, Response } from "express";
// import { createZoomMeetingService } from "./zoom.service";

import {
  generateSignature,
} from "./zoom.utils";
import { ZoomMeeting } from "./zoom.model";
import { createZoomMeeting } from "./zoom.service";

export const createMeetingController = async (
  req: Request,
  res: Response
) => {
  try {
    const meeting = await createZoomMeeting();

    res.status(200).json({
      success: true,
      data: meeting,
    });
  } catch (error: any) {
    res.status(500).json({
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

// -----------------------------

// import { Request, Response } from "express";
// import { generateSignature } from "./zoom.utils";
// import {
//   createZoomMeetingService,
//   getMeetingsService,
//   deleteMeetingService,
// } from "./zoom.service";
// import { catchAsync } from "../../utils/catchAsync";
// import httpStatus from 'http-status-codes';
// import { sendResponse } from "../../utils/sendResponse";



// export const createMeetingController = catchAsync(
//   async (req: Request, res: Response) => {
//     const meeting = await createZoomMeetingService();

//     sendResponse(res, {
//       statusCode: httpStatus.CREATED,
//       success: true,
//       message: "Meeting Created Successfully",
//       data: meeting,
//     });
//   }
// );

// export const getMeetingsController = catchAsync(
//   async (req: Request, res: Response) => {
//     const meetings = await getMeetingsService();

//     sendResponse(res, {
//       statusCode: httpStatus.OK,
//       success: true,
//       message: "Meetings Retrieved Successfully",
//       data: meetings,
//     });
//   }
// );

// export const getSignatureController = catchAsync(
//   async (req: Request, res: Response) => {
//     const { meetingNumber, role } = req.query;

//     const signature = generateSignature(
//       meetingNumber as string,
//       Number(role)
//     );

//     sendResponse(res, {
//       statusCode: httpStatus.OK,
//       success: true,
//       message: "Signature Generated Successfully",
//       data: { signature },
//     });
//   }
// );

// export const deleteMeetingController = catchAsync(
//   async (req: Request, res: Response) => {
//     const { meetingId } = req.params;

//     const meeting = await deleteMeetingService(meetingId as string);

//     sendResponse(res, {
//       statusCode: httpStatus.OK,
//       success: true,
//       message: "Meeting Deleted Successfully",
//       data: meeting,
//     });
//   }
// );