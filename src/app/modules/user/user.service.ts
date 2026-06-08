import AppError from "../../errorHelpers/appError";
import { User } from "./user.model";
import httpStatus from "http-status-codes"
import bcryptjs from "bcryptjs";
import { Role } from "./user.interface";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { userSearchableFields } from "./user.constants";
import { JwtPayload } from "jsonwebtoken";
import { _null } from "zod/v4/core";
import { EnrollmentModel } from "../enrollment/enrollment.model";
import { Types } from "mongoose";
import { CourseModel } from "../course/course.model";


const createUserService = async (payload: any, session?: any) => {
    const isExist = await User.findOne({ email: payload.email });

    if (isExist) {
        throw new AppError(httpStatus.CONFLICT, "User already exists");
    }

    const hashedPassword = payload.password
        ? await bcryptjs.hash(payload.password, 10)
        : undefined;

    const result = await User.create(
        [
            {
                ...payload,
                password: hashedPassword,
                role: payload.role || Role.STUDENT,
                studentId:
                    payload.role === Role.STUDENT
                        ? `ST-${Date.now()}`
                        : undefined,
            },
        ],
        { session }
    );


    return { data: result };
};

const getMe = async (userId: string) => {
    const user = await User.findById(userId).select("-password");

    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User Not Found");
    }

    return { data: user };
};

// const getAllTeachers = async (query: Record<string, string>) => {
//     const baseQuery = User.find({ role: Role.TEACHER });

//     const queryBuilder = new QueryBuilder(baseQuery, query);

//     const data = await queryBuilder
//         .filter()
//         .search(userSearchableFields)
//         .sort()
//         .fields()
//         .paginate()
//         .build();

//     const meta = await queryBuilder.getMeta();

//     return { data, meta };
// };

// const getAllStudents = async (query: Record<string, string>) => {
//     const baseQuery = User.find({ role: Role.STUDENT, isDeleted: false });

//     const queryBuilder = new QueryBuilder(baseQuery, query);

//     const data = await queryBuilder
//         .filter()
//         .search(userSearchableFields)
//         .sort()
//         .fields()
//         .paginate()
//         .build();

//     const meta = await queryBuilder.getMeta();

//     return { data, meta };
// };



// const getAllStudents = async (query: Record<string, string>) => {

//     let filter: any = {
//         role: Role.STUDENT,
//         // isDeleted: false,
//     };

//     console.log("Query:", query);

//     // Course filter
//     if (query.course) {
//         const enrollments = await EnrollmentModel.find({
//             course: query.course,
//             // isDeleted: false,
//             // isActive: true,
//         })
// console.log("Enrollments for course filter:", enrollments);
//         const studentIds = enrollments.map(
//             (enrollment) => enrollment.student
//         );

//         filter._id = { $in: studentIds };
//     }

//     console.log("Final filter for students:", filter);

//     const baseQuery = User.find(filter);

//     const queryBuilder = new QueryBuilder(baseQuery, query);

//     const data = await queryBuilder
//         .filter()
//         .search(userSearchableFields)
//         .sort()
//         .fields()
//         .paginate()
//         .build();

//     const meta = await queryBuilder.getMeta();

//     return { data, meta };
// };


const getAllTeachers = async (query: Record<string, string>) => {

    let teacherIds: Types.ObjectId[] | undefined;

    // 🔥 course filter
    if (query.course) {
        const course = await CourseModel.findById(query.course);

        if (course?.assignSubWithTeacher?.length) {
            teacherIds = course.assignSubWithTeacher.map(
                (item) => item.teacher
            );
        }
    }

    const filter: any = {
        role: Role.TEACHER,
        isDeleted: false,
    };

    if (teacherIds) {
        filter._id = { $in: teacherIds };
    }

    const baseQuery = User.find(filter);

    const { course, ...restQuery } = query;

    const queryBuilder = new QueryBuilder(baseQuery, restQuery);

    const data = await queryBuilder
        .search(userSearchableFields)
        .sort()
        .fields()
        .paginate()
        .build();

    const meta = await queryBuilder.getMeta();

    return { data, meta };
};

const getAllStudents = async (query: Record<string, string>) => {

    let studentIds: Types.ObjectId[] | undefined;

    if (query.course) {
        const enrollments = await EnrollmentModel.find({
            course: query.course,
            isDeleted: false,
            isActive: true,
        });

        studentIds = enrollments.map(e => e.student);
    }

    const filter: any = {
        role: Role.STUDENT,
        isDeleted: false,
    };

    if (studentIds) {
        filter._id = { $in: studentIds };
    }

    const baseQuery = User.find(filter);

    const { course, ...restQuery } = query;

    const queryBuilder = new QueryBuilder(baseQuery, restQuery);

    const data = await queryBuilder
        .search(userSearchableFields)
        .sort()
        .fields()
        .paginate()
        .build();

    const meta = await queryBuilder.getMeta();

    return { data, meta };
};



const getAllUsers = async (query: Record<string, string>) => {
    const baseQuery = User.find({ isDeleted: false });

    const queryBuilder = new QueryBuilder(baseQuery, query);

    const data = await queryBuilder
        .filter()
        .search(userSearchableFields)
        .sort()
        .fields()
        .paginate()
        .build();

    const meta = await queryBuilder.getMeta();

    return { data, meta };
};

const getSingleUser = async (id: string) => {
    const user = await User.findById(id).select("-password");

    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User Not Found");
    }

    return { data: user };
};

const updateUser = async (userId: string, payload: any, decoded: JwtPayload) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    if (decoded.role !== Role.ADMIN && decoded.userId !== userId) {
        throw new AppError(httpStatus.UNAUTHORIZED, "Not allowed");
    }

    if (payload.password) {
        payload.password = await bcryptjs.hash(payload.password, 10);
    }

    const updated = await User.findByIdAndUpdate(
        userId,
        { $set: payload },
        { returnDocument: "after", runValidators: true }
    ).select("-password");

    return { data: updated };
};

const deleteUser = async (id: string) => {

    const user = await User.findByIdAndDelete(id);

    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User Not Found");
    }

    return { data: _null };
};

export const UserServices = {
    createUserService,
    getSingleUser,
    getAllUsers,
    getAllStudents,
    getAllTeachers,
    getMe,
    updateUser,
    deleteUser
}