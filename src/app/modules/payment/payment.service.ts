
import { EnrollmentModel } from "../enrollment/enrollment.model";
import { PaymentModel } from "./payment.model";
import { PaymentStatus } from "./payment.interface";
import { SSLCommerzService } from "../sslCommerz/sslCommerz.service";
import { StudentProfile } from "../user/user.model";
import AppError from "../../errorHelpers/appError";
import httpStatus from "http-status-codes"
import { EnrollmentStatus } from "../enrollment/enrollment.interface";
import mongoose from "mongoose";


const initPayment = async (
    enrollmentId: any
) => {

    const payment = await PaymentModel
        .findOne({ enrollment: enrollmentId });

    if (!payment) {
        throw new AppError( httpStatus.NOT_FOUND,"Payment not found");
    }

    const enrollment = await EnrollmentModel
        .findById(enrollmentId)

    const student = await StudentProfile.findOne({ userId: enrollment?.student }).populate("userId")

    if (!student) {
        throw new AppError(httpStatus.BAD_REQUEST, "Student not found")
    }

    const studentName = (student?.userId as any)?.name
    const studentEmail = (student?.userId as any)?.email
    const studentPhone = (student?.userId as any)?.phone

    const sslPayload = {
        amount: payment.amount,
        transactionId: payment.transactionId,
        name: studentName,
        email: studentEmail,
        phoneNumber: studentPhone,
        address: student.address.thana || "Tetulia",
        city: student.address.district || "Panchangrh"
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
                { new: true, session }
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
                { new: true, session }
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
                { new: true, session }
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

export const PaymentService = {
    initPayment,
    successPayment,
    failPayment,
    cancelPayment,
};