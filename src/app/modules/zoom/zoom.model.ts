import mongoose, { Schema, Document } from "mongoose";
import { IZoomMeeting } from "./zoom.interface";

const ZoomMeetingSchema = new Schema<IZoomMeeting>(
  {
    meetingId: { type: String, required: true, unique: true },
    topic: { type: String, required: true },
    status: { type: String, default: "waiting" },
    startTime: { type: String },
    duration: { type: Number, default: 60 },
    timezone: { type: String },
    password: { type: String },
    joinUrl: { type: String },
    startUrl: { type: String },
    hostId: { type: String },
    hostEmail: { type: String },
  },
  { timestamps: true }
);

export const ZoomMeeting = mongoose.model<IZoomMeeting>(
  "ZoomMeeting",
  ZoomMeetingSchema
);