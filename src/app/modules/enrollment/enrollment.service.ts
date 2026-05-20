import AppError from "../../errorHelpers/appError";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { CourseModel } from "../course/course.model";
import httpStatus from "http-status-codes";
import { PaymentModel } from "../payment/payment.model";
import { enrollmentSearchableFields } from "./enrollment.constant";
import { EnrollmentStatus } from "./enrollment.interface";
import { EnrollmentModel } from "./enrollment.model";
import { PaymentService } from "../payment/payment.service";
import mongoose from "mongoose";

const createEnrollment = async (payload: any) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const existing = await EnrollmentModel.findOne({
            student: payload.student,
            course: payload.course,
        }).session(session);

        if (existing) {
            throw new AppError(
                httpStatus.BAD_REQUEST,
                "Student already enrolled"
            );
        }

       const course = await CourseModel.findById(payload.course).session(session);

        if (!course) {
            throw new AppError(
                httpStatus.NOT_FOUND,
                "Course not found"
            );
        }

        const amount =
            course.discountPrice || course.regularPrice;

        if (!amount) {
            throw new AppError(
                httpStatus.BAD_REQUEST,
                "Course price not found"
            );
        }

        // generate transaction id
        const transactionId = `TXN-${Date.now()}`;

        // create enrollment
        const enrollment = await EnrollmentModel.create(
            [
                {
                    student: payload.student,
                    course: payload.course,
                    transactionId,
                    status: EnrollmentStatus.PENDING,
                    createdBy: payload.student,
                },
            ],
            { session }
        );

        // create payment
        await PaymentModel.create(
            [
                {
                    enrollment: enrollment[0]._id,
                    transactionId,
                    amount,
                },
            ],
            { session }
        );

        await session.commitTransaction();
        session.endSession();

        // payment init after successful db transaction
        const paymentInitRes =
            await PaymentService.initPayment(
                enrollment[0]._id
            );


        return {
            data: {
                enrollment: enrollment[0],
                paymentUrl: paymentInitRes.paymentUrl,
            },
        };

    } catch (error) {
        // rollback
        await session.abortTransaction();
        session.endSession();

        throw error;
    }
};

const getAllEnrollments = async (query: Record<string, string>) => {

    const baseQuery = EnrollmentModel.find({ isDeleted: false });

    const queryBuilder = new QueryBuilder(baseQuery, query);


    const data = await queryBuilder
        .filter()
        .search(enrollmentSearchableFields)
        .sort()
        .fields()
        .paginate()
        .build()
        .populate("student")
        .populate("course")
        .populate("referredBy")

    const meta = await queryBuilder.getMeta();

    return {
        data, meta
    };
};

const getAllTrashEnrollments = async (query: Record<string, string>) => {

    const baseQuery = EnrollmentModel.find({ isDeleted: true });

    const queryBuilder = new QueryBuilder(baseQuery, query);


    const data = await queryBuilder
        .filter()
        .search(enrollmentSearchableFields)
        .sort()
        .fields()
        .paginate()
        .build()
        .populate("student")
        .populate("course")
        .populate("referredBy")

    const meta = await queryBuilder.getMeta();

    return {
        data, meta
    };
};

const getSingleEnrollment = async (id: string) => {
    const result = await EnrollmentModel.findById(id)
        .populate("student")
        .populate("course")
        .populate("referredBy");

    if (!result) {
        throw new AppError(404, "Enrollment not found");
    }

    return { data: result };
};

const updateEnrollment = async (id: string, payload: any) => {
    const result = await EnrollmentModel.findByIdAndUpdate(
        id,
        payload,
        { new: true, runValidators: true }
    );

    if (!result) {
        throw new AppError(404, "Enrollment not found");
    }

    return { data: result };
};

const softDeleteEnrollment = async (id: string) => {
    const result = await EnrollmentModel.findByIdAndUpdate(
        id,
        { isDeleted: true, isActive: false },
        { new: true }
    );

    return { data: result };
};

const deleteEnrollment = async (id: string) => {
    const result = await EnrollmentModel.findByIdAndDelete(id);

    return { data: result };
};

export const EnrollmentService = {
    createEnrollment,
    getAllEnrollments,
    getAllTrashEnrollments,
    getSingleEnrollment,
    updateEnrollment,
    softDeleteEnrollment,
    deleteEnrollment,
};