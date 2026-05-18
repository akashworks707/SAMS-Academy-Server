import { Schema, model, Types } from "mongoose";
import {
  IStudentProfile,
  ITeacherProfile,
  IUser,
  Role,
} from "./user.interface";

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      default: null,
    },
    picture: {
      type: String,
    },
    role: {
      type: String,
      enum: Object.values(Role),
      default: Role.STUDENT,
    },
    phone: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

export const User = model("User", userSchema);

const addressSchema = new Schema({
  division: {
    type: String,
    trim: true,
  },
  district: {
    type: String,
    trim: true,
  },
  thana: {
    type: String,
    trim: true,
  },
  union: {
    type: String,
    trim: true,
  },
},
{
  _id: false,
  timestamps: false
}
);

const TeacherProfileSchema = new Schema<ITeacherProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    address: {
      type: addressSchema,
      required: true,
    },

    dateOfBirth: {
      type: Date,
    },

    qualification: {
      type: String,
      required: true,
      trim: true,
    },

    experience: {
      type: Number,
      default: 0,
    },

    designation: {
      type: String,
      default: "Teacher",
    },

    salary: {
      type: Number,
      default: 0,
    },

    bio: {
      type: String,
    },

    assignedSubjects: [
      {
        type: Schema.Types.ObjectId,
        ref: "Subject",
      },
    ],

    assignedCourses: [
      {
        type: Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
  },
  {
    timestamps: true,
  },
);

export const TeacherProfile = model<ITeacherProfile>(
  "TeacherProfile",
  TeacherProfileSchema,
);

const StudentProfileSchema = new Schema<IStudentProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    dateOfBirth: {
      type: Date,
    },

    address: {
      type: addressSchema,
      required: true,
    },

    studentId: {
      type: String,
      required: true,
      unique: true,
    },

    section: {
      type: String,
    },

    roll: {
      type: Number,
    },

    guardianName: {
      type: String,
      required: true,
      trim: true,
    },

    guardianPhone: {
      type: String,
      required: true,
      trim: true,
    },

    // enrolledCourses: [
    //   {
    //     type: Schema.Types.ObjectId,
    //     ref: "Course",
    //   },
    // ],
  },
  {
    timestamps: true,
  },
);

export const StudentProfile = model<IStudentProfile>(
  "StudentProfile",
  StudentProfileSchema,
);
