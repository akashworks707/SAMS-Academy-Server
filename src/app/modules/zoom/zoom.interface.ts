

import { Types } from "mongoose";

export enum liveMeetingStatus {
  SCHEDULED = "SCHEDULED",
  LIVE = "LIVE",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED"
}

export interface IZoomMeeting {
  courseId: Types.ObjectId;

  subjectId: Types.ObjectId;

  classTitle: string;
  topic: string;

  meetingId: string;

  status: liveMeetingStatus;

  startTime: Date;

  duration: number;

  timezone: string;

  password?: string;

  joinUrl: string;
  startUrl: string;

  hostId: string;
  hostEmail: string;

  isDeleted?: boolean;
}