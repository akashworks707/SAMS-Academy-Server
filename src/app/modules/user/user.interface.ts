import { Types } from "mongoose";

export enum Role {
    ADMIN = "ADMIN",
    TEACHER = "TEACHER",
    STUDENT = "STUDENT",
}

export interface IUser {
    _id?: Types.ObjectId;
    name: string;
    email: string;
    password: string;
    picture?: string;
    phone: string;
    role: Role;
}

export interface ITeacherProfile {
    userId: Types.ObjectId;

    address: string;

    qualification: string;

    experience: number;

    designation?: string;

    salary: number;

    bio?: string;

    assignedSubjects?: Types.ObjectId[];

    assignedCourses?: Types.ObjectId[];

}

export interface IStudentProfile {
  userId: Types.ObjectId;

  studentId: string;

  address: string;

  section?: string;

  roll?: number;

  guardianName: string;

  guardianPhone: string;

  enrolledCourses?: Types.ObjectId[];

}