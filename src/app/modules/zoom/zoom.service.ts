
import axios from "axios";
import { generateSignature, getZoomAccessToken } from "../../utils/zoomUtils";
import { ZoomMeeting } from "./zoom.model";
import { IZoomMeeting, liveMeetingStatus } from "./zoom.interface";
import { CourseModel } from "../course/course.model";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { zoomMeetingSearchableFields } from "./zoom.constants";
import { SubjectModel } from "../subject/subject.model";
import AppError from "../../errorHelpers/appError";
import httpStatus from "http-status-codes"

export const createZoomMeeting = async (payload: any) => {
  try {
    const token = await getZoomAccessToken();
    const course = await CourseModel.findById(payload.courseId);
    const subject = await SubjectModel.findById(payload.subjectId);

    if (!course) {
      throw new AppError(httpStatus.NOT_FOUND, "Course not found");
    }

    if (!subject) {
      throw new AppError(httpStatus.NOT_FOUND, "Subject not found");
    }

    const response = await axios.post(
      "https://api.zoom.us/v2/users/me/meetings",
      {
        topic: payload.topic,
        type: 2,
        start_time: payload.startTime,
        duration: payload.duration,
        timezone: payload.timezone,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const meeting = response.data;
    const result = await ZoomMeeting.create({
      courseId: payload.courseId,
      subjectId: payload.subjectId,
      classTitle: payload.classTitle,
      topic: meeting.topic,
      meetingId: String(meeting.id),
      status: liveMeetingStatus.SCHEDULED,
      startTime: new Date(payload.startTime),
      duration: meeting.duration,
      timezone: meeting.timezone,
      password: meeting.password,
      joinUrl: meeting.join_url,
      startUrl: meeting.start_url,
      hostId: meeting.host_id,
      hostEmail: meeting.host_email,
    });

    return {
      data: result
    }

  } catch (err) {
    console.log("❌ Zoom Service Error:", err);
    throw err;
  }
};

const updateZoomMeetingService = async (meetingId: string, payload: Partial<IZoomMeeting>) => {

  const meeting = await ZoomMeeting.findById(meetingId)
  if (!meeting) {
    throw new AppError(httpStatus.NOT_FOUND, "Meeting not found")
  }

  let updatePayload: Partial<IZoomMeeting> = {}

  if (payload.status) {
    updatePayload.status = payload.status
  }
  if (payload.classTitle) {
    updatePayload.classTitle = payload.classTitle
  }
  if (payload.courseId) {
    updatePayload.courseId = payload.courseId
  }
  if (payload.subjectId) {
    updatePayload.subjectId = payload.subjectId
  }
  if (payload.duration) {
    updatePayload.duration = payload.duration
  }
  if (payload.startTime) {
    updatePayload.startTime = new Date(payload.startTime)
  }

  const updatedMeeting = await ZoomMeeting.findByIdAndUpdate(meetingId,
    { $set: updatePayload },
    {
      returnDocument: "after",
      runValidators: true,
    })

  return updatedMeeting;

}

const getSignatureService = async (meetingNumber: string, role: string) => {
  
  const signature = generateSignature(
    meetingNumber as string,
    Number(role)
  );

  return {
    signature
  };
}

const getMeetingsService = async (query: Record<string, string>) => {
  const baseQuery = ZoomMeeting.find().sort({ createdAt: -1 });

  const queryBuilder = new QueryBuilder(baseQuery, query);

  const meetingData = queryBuilder
    .filter()
    .search(zoomMeetingSearchableFields)
    .sort()
    .fields()
    .paginate();

  const [data, meta] = await Promise.all([
    meetingData.build(),
    queryBuilder.getMeta(),
  ]);

  return {
    data,
    meta,
  };
};

const softDeleteZoomMeeting = async (id: string) => {
  const result = await ZoomMeeting.findByIdAndUpdate(
    id,
    {
      isDeleted: true,
      isActive: false,
    },
    {
      returnDocument: "after",
    }
  );

  return { data: result };
};

const deleteZoomMeeting = async (id: string) => {
  const result = await ZoomMeeting.findByIdAndDelete(id);

  return { data: result };
};


export const ZoomMeetingService = {
  getSignatureService,
  createZoomMeeting,
  getMeetingsService,
  updateZoomMeetingService,
  softDeleteZoomMeeting,
  deleteZoomMeeting
}