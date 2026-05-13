import { Schema, model } from "mongoose";
import { ISubject } from "./subject.interface";

const subjectSchema = new Schema<ISubject>(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const SubjectModel = model<ISubject>(
  "Subject",
  subjectSchema
);