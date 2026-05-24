import { Schema, model } from "mongoose";
import { IUser, Role } from "./user.interface";

const addressSchema = new Schema(
  {
    division: String,
    district: String,
    thana: String,
    union: String,
  },
  { _id: false }
);

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, default: null },
    picture: String,
    phone: { type: String, default: "" },
    role: {
      type: String,
      enum: Object.values(Role),
      default: Role.STUDENT,
    },

    address: addressSchema,
    isActive: {
      type: Boolean,
      default: true
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    // teacher
    qualification: String,
    experience: Number,
    designation: String,
    salary: Number,
    perClassSalary: Number,
    bio: String,
    assignedSubjects: [{ type: Schema.Types.ObjectId, ref: "Subject" }],
    assignedCourses: [{ type: Schema.Types.ObjectId, ref: "Course" }],

    // student
    studentId: String,
    section: String,
    roll: Number,
    guardianName: String,
    guardianPhone: String,
    dateOfBirth: Date,
  },
  { timestamps: true }
);

export const User = model<IUser>("User", userSchema);