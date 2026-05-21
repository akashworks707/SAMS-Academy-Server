import { model, Schema } from "mongoose";
import { ICourseRecordedVideo, RecordedVideoStatus } from "./courseRecordedVideo.interface";

const courseRecordedVideoSchema = new Schema<ICourseRecordedVideo>(
  {
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true
    },
    subject: {
      type: Schema.Types.ObjectId,
      ref: "Subject",
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    videoUrl: {
      type: String,
      required: true,
    },
    thumbnailUrl: {
      type: String,
    },
    status: {
      type: String,
      enum: Object.values(RecordedVideoStatus),
      default: RecordedVideoStatus.ACTIVE,
    },
    createdBy: {
      type: String,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const CourseRecordedVideoModel = model<ICourseRecordedVideo>("CourseRecordedVideo", courseRecordedVideoSchema);