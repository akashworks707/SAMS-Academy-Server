import { Types } from "mongoose";

export enum Role {
    ADMIN = "ADMIN",
    TEACHER = "TEACHER",
    STUDENT = "STUDENT",
}

export interface IAddress {
    division?: string;
    district?: string;
    thana?: string;
    union?: string;
}

export interface IUser {
    _id?: Types.ObjectId;

    // common
    name: string;
    email: string;
    password: string;
    picture?: string;
    phone: string;
    role: Role;
    isDeleted: boolean;
    isActive: boolean;

    // address
    address?: IAddress;

    // teacher fields
    qualification?: string;
    experience?: number;
    designation?: string;
    salary?: number;
    perClassSalary?: number;
    bio?: string;
    assignedSubjects?: Types.ObjectId[];
    assignedCourses?: Types.ObjectId[];

    // student fields
    studentId?: string;
    section?: string;
    roll?: number;
    guardianName?: string;
    guardianPhone?: string;
    dateOfBirth?: Date;
}