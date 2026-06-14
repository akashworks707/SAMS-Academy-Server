
import { EnrollmentModel } from "../enrollment/enrollment.model";
import { PaymentModel } from "./payment.model";
import { PaymentStatus } from "./payment.interface";
import { SSLCommerzService } from "../sslCommerz/sslCommerz.service";
import AppError from "../../errorHelpers/appError";
import httpStatus from "http-status-codes"
import { EnrollmentStatus } from "../enrollment/enrollment.interface";
import mongoose from "mongoose";
import { User } from "../user/user.model";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { paymentSearchableFields } from "./payment.constants";


const initPayment = async (
    enrollmentId: any
) => {

    const payment = await PaymentModel
        .findOne({ enrollment: enrollmentId });

    if (!payment) {
        throw new AppError(httpStatus.NOT_FOUND, "Payment not found");
    }

    const enrollment = await EnrollmentModel
        .findById(enrollmentId)

    const student = await User.findById(enrollment?.student)

    if (!student) {
        throw new AppError(httpStatus.BAD_REQUEST, "Student not found")
    }


    const sslPayload = {
        amount: payment.amount,
        transactionId: payment.transactionId,
        name: student.name,
        email: student.email,
        phoneNumber: student.phone,
        address: student?.address?.thana || "N/A",
        city: student?.address?.district || "N/A"
    };

    const sslPayment = await SSLCommerzService.sslPaymentInit(
        sslPayload
    );

    return {
        paymentUrl:
            sslPayment.GatewayPageURL,
    };
};

const successPayment = async (query: Record<string, string>) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const transactionId =
            query.tran_id || query.transactionId;

        const updatedPayment =
            await PaymentModel.findOneAndUpdate(
                { transactionId },
                { status: PaymentStatus.COMPLETED },
                { returnDocument: "after", runValidators: true, session }
            );

        if (!updatedPayment) {
            throw new AppError(
                httpStatus.NOT_FOUND,
                "Payment not found"
            );
        }

        await EnrollmentModel.findByIdAndUpdate(
            updatedPayment.enrollment,
            {
                status: EnrollmentStatus.COMPLETED,
            },
            { session }
        );

        await session.commitTransaction();

        return {
            success: true,
            message: "Payment and Enrollment success",
        };
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};

const failPayment = async (query: Record<string, string>) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const transactionId =
            query.tran_id || query.transactionId;

        const updatedPayment =
            await PaymentModel.findOneAndUpdate(
                { transactionId },
                { status: PaymentStatus.FAILED },
                { returnDocument: "after", runValidators: true, session }
            );

        if (!updatedPayment) {
            throw new AppError(
                httpStatus.NOT_FOUND,
                "Payment not found"
            );
        }

        await EnrollmentModel.findByIdAndUpdate(
            updatedPayment.enrollment,
            { status: EnrollmentStatus.FAILED },
            { session }
        );

        await session.commitTransaction();

        return {
            success: false,
            message: "Payment Failed",
        };
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};

const cancelPayment = async (query: Record<string, string>) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const transactionId =
            query.tran_id || query.transactionId;

        const updatedPayment =
            await PaymentModel.findOneAndUpdate(
                { transactionId },
                { status: PaymentStatus.CANCELLED },
                { returnDocument: "after", runValidators: true, session }
            );

        if (!updatedPayment) {
            throw new AppError(
                httpStatus.NOT_FOUND,
                "Payment not found"
            );
        }

        await EnrollmentModel.findByIdAndUpdate(
            updatedPayment.enrollment,
            {
                status: EnrollmentStatus.CANCELLED,
            },
            { session }
        );

        await session.commitTransaction();

        return {
            success: false,
            message: "Payment Cancelled",
        };
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};

const updatePayment = async (id: string, payload: any) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const updatedPayment = await PaymentModel.findByIdAndUpdate(
            id,
            payload,
            { returnDocument: "after", runValidators: true, session }
        );
        if (!updatedPayment) {
            throw new AppError(httpStatus.NOT_FOUND, "Payment not found");
        }

        if (payload.status) {
            const statusMap: Record<string, string> = {
                [PaymentStatus.COMPLETED]: EnrollmentStatus.COMPLETED,
                [PaymentStatus.FAILED]: EnrollmentStatus.FAILED,
                [PaymentStatus.CANCELLED]: EnrollmentStatus.CANCELLED,
            };

            const enrollmentStatus = statusMap[payload.status];

            if (enrollmentStatus) {
                await EnrollmentModel.findByIdAndUpdate(
                    updatedPayment.enrollment,
                    { status: enrollmentStatus },
                    { session }
                );
            }
        }

        await session.commitTransaction();
        return { data: updatedPayment };

    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};

const getAllPayments = async (query: Record<string, string>) => {
    const queryBuilder = new QueryBuilder(
        PaymentModel.find().populate("enrollment"),
        query
    );

    const data = await queryBuilder
        .search(paymentSearchableFields)
        .filter()
        .sort()
        .fields()
        .paginate()
        .build();

    const meta = await queryBuilder.getMeta();

    return { data, meta };
};

const getSinglePayment = async (id: string) => {
    const result = await PaymentModel.findById(id).populate("enrollment");

    if (!result) {
        throw new AppError(httpStatus.NOT_FOUND, "Payment not found");
    }

    return { data: result };
};

const deletePayment = async (id: string) => {
    const result = await PaymentModel.findByIdAndDelete(id);
    return { data: result };
};


export const PaymentService = {
    initPayment,
    successPayment,
    failPayment,
    cancelPayment,
    updatePayment,
    getAllPayments,
    getSinglePayment,
    deletePayment,
};