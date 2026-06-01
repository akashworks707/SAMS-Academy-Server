
import mongoose, { Schema } from "mongoose";
import { IZoomMeeting, liveMeetingStatus } from "./zoom.interface";

const ZoomMeetingSchema = new Schema<IZoomMeeting>(
  {
    courseId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Course"
    },

    subjectId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Subject"
    },

    classTitle: { type: String, required: true },
    topic: { type: String, required: true },

    meetingId: { type: String, required: true, unique: true },

    status: {
      type: String,
      enum: Object.values(liveMeetingStatus),
      default: liveMeetingStatus.SCHEDULED
    },

    startTime: { type: Date },

    duration: { type: Number, default: 60 },

    timezone: { type: String },

    password: { type: String },

    joinUrl: { type: String, required: true },
    startUrl: { type: String, required: true },

    hostId: { type: String },
    hostEmail: { type: String },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const ZoomMeeting = mongoose.model<IZoomMeeting>(
  "ZoomMeeting",
  ZoomMeetingSchema
);