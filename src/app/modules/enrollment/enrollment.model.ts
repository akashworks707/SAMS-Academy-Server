import { Schema, model, Types } from "mongoose";
import { EnrollmentStatus, IEnrollment } from "./enrollment.interface";

const enrollmentSchema = new Schema(
    {
        student: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        course: {
            type: Schema.Types.ObjectId,
            ref: "Course",
            required: true,
        },

        transactionId: {
            type: String
        },

        status: {
            type: String,
            enum: Object.values(EnrollmentStatus),
            default: EnrollmentStatus.PENDING,
        },

        referredBy: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },

        progress: {
            type: Number,
            default: 0,
        },

        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },

        isActive: {
            type: Boolean,
            default: true,
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

// prevent duplicate enrollment
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

export const EnrollmentModel = model<IEnrollment>(
    "Enrollment",
    enrollmentSchema
);