import { Types } from "mongoose";

export enum EnrollmentStatus {
    ACTIVE = "ACTIVE",
    COMPLETED = "COMPLETED",
    PENDING = "PENDING",
    CANCELLED = "CANCELLED",
}

export interface IEnrollment {
    student: Types.ObjectId;

    course: Types.ObjectId;

    transactionId?: string;

    status: EnrollmentStatus;

    referredBy?: Types.ObjectId;

    progress?: number;

    createdBy?: Types.ObjectId;

    isActive?: boolean;

    isDeleted?: boolean;
}