// import AppError from "../../errorHelpers/appError";
// import { QueryBuilder } from "../../utils/QueryBuilder";
// import { CourseModel } from "../course/course.model";
// import httpStatus from "http-status-codes";
// import { PaymentModel } from "../payment/payment.model";
// import { enrollmentSearchableFields } from "./enrollment.constant";
// import { EnrollmentStatus } from "./enrollment.interface";
// import { EnrollmentModel } from "./enrollment.model";
// import { PaymentService } from "../payment/payment.service";
// import mongoose from "mongoose";

// const createEnrollment = async (payload: any) => {
//     const session = await mongoose.startSession();

//     try {
//         session.startTransaction();

//         const existing = await EnrollmentModel.findOne({
//             student: payload.student,
//             course: payload.course,
//         }).session(session);

//         if (existing) {
//             throw new AppError(
//                 httpStatus.BAD_REQUEST,
//                 "Student already enrolled"
//             );
//         }

//        const course = await CourseModel.findById(payload.course).session(session);

//         if (!course) {
//             throw new AppError(
//                 httpStatus.NOT_FOUND,
//                 "Course not found"
//             );
//         }

//         const amount =
//             course.discountPrice || course.regularPrice;

//         if (!amount) {
//             throw new AppError(
//                 httpStatus.BAD_REQUEST,
//                 "Course price not found"
//             );
//         }

//         // generate transaction id
//         const transactionId = `TXN-${Date.now()}`;

//         // create enrollment
//         const enrollment = await EnrollmentModel.create(
//             [
//                 {
//                     student: payload.student,
//                     course: payload.course,
//                     transactionId,
//                     status: EnrollmentStatus.PENDING,
//                     createdBy: payload.student,
//                 },
//             ],
//             { session }
//         );

//         // create payment
//         await PaymentModel.create(
//             [
//                 {
//                     enrollment: enrollment[0]._id,
//                     transactionId,
//                     amount,
//                 },
//             ],
//             { session }
//         );

//         await session.commitTransaction();
//         session.endSession();

//         // payment init after successful db transaction
//         const paymentInitRes =
//             await PaymentService.initPayment(
//                 enrollment[0]._id
//             );


//         return {
//             data: {
//                 enrollment: enrollment[0],
//                 paymentUrl: paymentInitRes.paymentUrl,
//             },
//         };

//     } catch (error) {
//         // rollback
//         await session.abortTransaction();
//         session.endSession();

//         throw error;
//     }
// };

// const getAllEnrollments = async (query: Record<string, string>) => {

//     const baseQuery = EnrollmentModel.find({ isDeleted: false });

//     const queryBuilder = new QueryBuilder(baseQuery, query);


//     const data = await queryBuilder
//         .filter()
//         .search(enrollmentSearchableFields)
//         .sort()
//         .fields()
//         .paginate()
//         .build()
//         .populate("student")
//         .populate("course")
//         .populate("referredBy")

//     const meta = await queryBuilder.getMeta();

//     return {
//         data, meta
//     };
// };

// const getAllTrashEnrollments = async (query: Record<string, string>) => {

//     const baseQuery = EnrollmentModel.find({ isDeleted: true });

//     const queryBuilder = new QueryBuilder(baseQuery, query);


//     const data = await queryBuilder
//         .filter()
//         .search(enrollmentSearchableFields)
//         .sort()
//         .fields()
//         .paginate()
//         .build()
//         .populate("student")
//         .populate("course")
//         .populate("referredBy")

//     const meta = await queryBuilder.getMeta();

//     return {
//         data, meta
//     };
// };

// const getSingleEnrollment = async (id: string) => {
//     const result = await EnrollmentModel.findById(id)
//         .populate("student")
//         .populate("course")
//         .populate("referredBy");

//     if (!result) {
//         throw new AppError(404, "Enrollment not found");
//     }

//     return { data: result };
// };

// const updateEnrollment = async (id: string, payload: any) => {
//     const result = await EnrollmentModel.findByIdAndUpdate(
//         id,
//         payload,
//         {  returnDocument: "after", runValidators: true }
//     );

//     if (!result) {
//         throw new AppError(404, "Enrollment not found");
//     }

//     return { data: result };
// };

// const softDeleteEnrollment = async (id: string) => {
//     const result = await EnrollmentModel.findByIdAndUpdate(
//         id,
//         { isDeleted: true, isActive: false },
//         {  returnDocument: "after" }
//     );

//     return { data: result };
// };

// const deleteEnrollment = async (id: string) => {
//     const result = await EnrollmentModel.findByIdAndDelete(id);

//     return { data: result };
// };

// export const EnrollmentService = {
//     createEnrollment,
//     getAllEnrollments,
//     getAllTrashEnrollments,
//     getSingleEnrollment,
//     updateEnrollment,
//     softDeleteEnrollment,
//     deleteEnrollment,
// };



import AppError from "../../errorHelpers/appError";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { CourseModel } from "../course/course.model";
import httpStatus from "http-status-codes";
import { PaymentModel } from "../payment/payment.model";
import { enrollmentSearchableFields } from "./enrollment.constant";
import { EnrollmentStatus } from "./enrollment.interface";
import { EnrollmentModel } from "./enrollment.model";
import { PaymentService } from "../payment/payment.service";
import mongoose, { Types } from "mongoose";
import { User } from "../user/user.model";
import { Role } from "../user/user.interface";

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

        const amount = course.discountPrice || course.regularPrice;

        if (!amount) {
            throw new AppError(
                httpStatus.BAD_REQUEST,
                "Course price not found"
            );
        }

        const transactionId = `TXN-${Date.now()}`;

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

        const paymentInitRes = await PaymentService.initPayment(enrollment[0]._id);

        return {
            data: {
                enrollment: enrollment[0],
                paymentUrl: paymentInitRes.paymentUrl,
            },
        };

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};

const getAllEnrollments = async (query: Record<string, string>) => {
    const searchTerm = query.searchTerm?.trim();

    // ── Build extra filter for referenced fields ──────────────────────────────
    const extraFilter: Record<string, any> = {};

    if (searchTerm) {
        const studentIds = await User.find({
            role: Role.STUDENT,
            $or: [
                { name: { $regex: searchTerm, $options: "i" } },
                { email: { $regex: searchTerm, $options: "i" } },
                { studentId: { $regex: searchTerm, $options: "i" } },
            ],
        }).distinct("_id");

        const courseIds = await CourseModel.find({
            title: { $regex: searchTerm, $options: "i" },
        }).distinct("_id");

        const orConditions: any[] = [
            // transactionId direct match
            { transactionId: { $regex: searchTerm, $options: "i" } },
        ];

        if (studentIds.length > 0) {
            orConditions.push({ student: { $in: studentIds } });
        }

        if (courseIds.length > 0) {
            orConditions.push({ course: { $in: courseIds } });
        }

        extraFilter.$or = orConditions;
    }

    // ── Base query: not deleted + extraFilter ─────────────────────────────────
    const baseQuery = EnrollmentModel.find({
        isDeleted: false,
        ...extraFilter,
    });

    // ── QueryBuilder handles: filter, sort, paginate (skip searchTerm so it
    //    doesn't try to match student.name on ObjectId field) ──────────────────
    const { searchTerm: _removed, ...queryWithoutSearch } = query;

    const queryBuilder = new QueryBuilder(baseQuery, queryWithoutSearch);

    const data = await queryBuilder
        .filter()
        .sort()
        .fields()
        .paginate()
        .build()
        .populate("student")
        .populate("course")
        .populate("referredBy");

    const meta = await queryBuilder.getMeta();

    return { data, meta };
};

const getAllTrashEnrollments = async (query: Record<string, string>) => {
    const searchTerm = query.searchTerm?.trim();

    const extraFilter: Record<string, any> = {};

    if (searchTerm) {
        const studentIds = await User.find({
            role: Role.STUDENT,
            $or: [
                { name: { $regex: searchTerm, $options: "i" } },
                { email: { $regex: searchTerm, $options: "i" } },
            ],
        }).distinct("_id");

        const courseIds = await CourseModel.find({
            title: { $regex: searchTerm, $options: "i" },
        }).distinct("_id");

        const orConditions: any[] = [
            { transactionId: { $regex: searchTerm, $options: "i" } },
        ];

        if (studentIds.length > 0) orConditions.push({ student: { $in: studentIds } });
        if (courseIds.length > 0) orConditions.push({ course: { $in: courseIds } });

        extraFilter.$or = orConditions;
    }

    const baseQuery = EnrollmentModel.find({
        isDeleted: true,
        ...extraFilter,
    });

    const { searchTerm: _removed, ...queryWithoutSearch } = query;

    const queryBuilder = new QueryBuilder(baseQuery, queryWithoutSearch);

    const data = await queryBuilder
        .filter()
        .sort()
        .fields()
        .paginate()
        .build()
        .populate("student")
        .populate("course")
        .populate("referredBy");

    const meta = await queryBuilder.getMeta();

    return { data, meta };
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
        { returnDocument: "after", runValidators: true }
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
        { returnDocument: "after" }
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