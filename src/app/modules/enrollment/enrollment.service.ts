import AppError from "../../errorHelpers/appError";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { StudentProfile } from "../user/user.model";
import { enrollmentSearchableFields } from "./enrollment.constant";
import { EnrollmentModel } from "./enrollment.model";

const createEnrollment = async (payload: any) => {
    const existing = await EnrollmentModel.findOne({
        student: payload.student,
        course: payload.course,
    });

    if (existing) {
        throw new AppError(400, "Student already enrolled in this course");
    }

    const result = await EnrollmentModel.create(payload);

    await StudentProfile.findByIdAndUpdate(payload.student, {
        $push: { enrolledCourses: payload.course }
    });

    return { data: result };
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