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

export interface IAddress {
    division: string;
    district: string;
    thana: string;
    union: string;
}

export interface ITeacherProfile {
    userId: Types.ObjectId;

    address?: IAddress;

    qualification: string;
    
    dateOfBirth?: Date;
    
    experience?: number;

    designation?: string;

    salary?: number;

    bio?: string;

    assignedSubjects?: Types.ObjectId[];

    assignedCourses?: Types.ObjectId[];

}

// export interface IStudentProfile {
//   userId: Types.ObjectId;

//   studentId: string;

//   address: string;

//   section?: string;

//   roll?: number;

//   guardianName: string;

//   guardianPhone: string;

//   enrolledCourses?: Types.ObjectId[];

// }



export interface IStudentProfile {
    userId: Types.ObjectId;

    studentId: string;
    dateOfBirth?: Date;

    address: IAddress;

    section?: string;

    roll?: number;

    guardianName: string;

    guardianPhone: string;

    enrolledCourses?: Types.ObjectId[];

}