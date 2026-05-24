import AppError from "../../errorHelpers/appError";
import { User } from "./user.model";
import httpStatus from "http-status-codes"
import bcryptjs from "bcryptjs";
import { Role } from "./user.interface";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { userSearchableFields } from "./user.constants";
import { JwtPayload } from "jsonwebtoken";
import { _null } from "zod/v4/core";


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

const getAllTeachers = async (query: Record<string, string>) => {
    const baseQuery = User.find({ role: Role.TEACHER });

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

const getAllStudents = async (query: Record<string, string>) => {
    const baseQuery = User.find({ role: Role.STUDENT, isDeleted: false });

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