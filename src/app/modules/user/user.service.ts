import httpStatus from 'http-status-codes';
import { IUser, Role } from "./user.interface";
import bcryptjs from "bcryptjs";
import mongoose from 'mongoose';
import { JwtPayload } from 'jsonwebtoken';
import { StudentProfile, TeacherProfile, User } from './user.model';
import { userSearchableFields } from './user.constants';
import AppError from '../../errorHelpers/appError';
import { QueryBuilder } from '../../utils/QueryBuilder';
import { envVars } from '../../config/env';
import { getProfileByRole } from '../../utils/getProfileByRole';

const createUserService = async (
    payload: any,
    session?: mongoose.ClientSession
) => {
    const {
        name,
        email,
        password,
        phone,
        picture,
        role,
        address,
        qualification,
        experience,
        designation,
        salary,
        bio,
        studentId,
        section,
        roll,
        guardianName,
        guardianPhone,
    } = payload;

    // 1. Check user exists
    const isExist = await User.findOne({ email });

    if (isExist) {
        throw new Error("User already exists");
    }

    const hashedPassword = password
        ? await bcryptjs.hash(password, 10)
        : undefined;

    const userArr = await User.create(
        [
            {
                name,
                email,
                password: hashedPassword,
                phone,
                picture,
                role: role || Role.STUDENT,
            },
        ],
        { session }
    );

    const user = userArr[0];

    let profile = null;

    // ---------------- TEACHER ----------------
    if (user.role === Role.TEACHER) {
        profile = await TeacherProfile.create(
            [
                {
                    userId: user._id,

                    address: address || "Not provided",

                    qualification: qualification || "Not set",

                    experience: experience ?? 0,

                    designation: designation || "Teacher",

                    salary: salary ?? 0,

                    bio: bio || "",

                    assignedSubjects: [],

                    assignedCourses: [],
                },
            ],
            { session }
        );
    }

    // ---------------- STUDENT ----------------
    if (user.role === Role.STUDENT) {
        profile = await StudentProfile.create(
            [
                {
                    userId: user._id,

                    address: address || "Not provided",

                    studentId: `ST-${Date.now()}`,

                    section: section || "",

                    roll: roll ?? null,

                    guardianName: guardianName || "Not provided",

                    guardianPhone: guardianPhone || "Not provided",

                    enrolledCourses: []
                },
            ],
            { session }
        );
    }

    // 5. Safe return
    const { password: _, ...result } = user.toObject();

    return {
        data: { ...user.toObject(), profile },
    }
};

// const getMe = async (userId: string) => {
//     const user = await User.findById(userId).select("-password");
//     let profile = null;
//     const userRole = user?.role;
//     if (!user) {
//         throw new AppError(httpStatus.NOT_FOUND, "User Not Found")
//     }

//     if (userRole === Role.TEACHER) {
//         profile = await TeacherProfile.findOne({ userId: user._id });
//     }

//     if (userRole === Role.STUDENT) {
//         profile = await StudentProfile.findOne({ userId: user._id });
//     }

//     return {
//         data: { ...user.toObject(), profile },
//     }
// };


const getMe = async (userId: string) => {
    const user = await User.findById(userId).select("-password");

    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User Not Found");
    }

    const profile = await getProfileByRole(user);

    return {
        data: { ...user.toObject(), profile },
    };
};


const getAllUsers = async (query: Record<string, string>) => {

    const queryBuilder = new QueryBuilder(User.find(), query)
    const usersData = queryBuilder
        .filter()
        .search(userSearchableFields)
        .sort()
        .fields()
        .paginate();

    const [data, meta] = await Promise.all([
        usersData.build(),
        queryBuilder.getMeta()
    ])

    return {
        data,
        meta
    }
};

const getAllStudents = async (query: Record<string, string>) => {

    const queryBuilder = new QueryBuilder(User.find({role: Role.STUDENT}), query)
    const usersData = queryBuilder
        .filter()
        .search(userSearchableFields)
        .sort()
        .fields()
        .paginate();

    const [data, meta] = await Promise.all([
        usersData.build(),
        queryBuilder.getMeta()
    ])

    return {
        data,
        meta
    }
};

const getAllTeachers = async (query: Record<string, string>) => {

    const queryBuilder = new QueryBuilder(User.find({role: Role.TEACHER}), query)
    const usersData = queryBuilder
        .filter()
        .search(userSearchableFields)
        .sort()
        .fields()
        .paginate();

    const [data, meta] = await Promise.all([
        usersData.build(),
        queryBuilder.getMeta()
    ])

    return {
        data,
        meta
    }
};

const getSingleUser = async (id: string) => {
    const user = await User.findById(id);
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User Not Found")
    }

    let profile = null;

    if (user.role === Role.TEACHER) {
        profile = await TeacherProfile.findOne({ userId: id });
    }

    if (user.role === Role.STUDENT) {
        profile = await StudentProfile.findOne({ userId: id });
    }

    return {
        data: { ...user.toObject(), profile },
    }
};


// const getSingleUser = async (id: string) => {
//     const user = await User.findById(id);

//     if (!user) {
//         throw new AppError(httpStatus.NOT_FOUND, "User Not Found");
//     }

//     const profile = await getProfileByRole(user);

//     return {
//         data: { ...user.toObject(), profile },
//     };
// };


// const deleteUser = async (id: string) => {
//     const user = await User.findById(id);
//     if (!user) {
//         throw new AppError(httpStatus.NOT_FOUND, "User Not Found")
//     }
//     if(user.role === Role.TEACHER) {
//         await TeacherProfile.findOneAndDelete({ userId: id });
//     }
//     if(user.role === Role.STUDENT) {
//         await StudentProfile.findOneAndDelete({ userId: id });
//     }
//     await User.findByIdAndDelete(id);

//     return {
//         data: null
//     }
// };


const deleteUser = async (id: string) => {
    const user = await User.findById(id);

    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User Not Found");
    }

    const profile = await getProfileByRole(user);

    if (profile) {
        if (user.role === Role.TEACHER) {
            await TeacherProfile.findOneAndDelete({ userId: id });
        }

        if (user.role === Role.STUDENT) {
            await StudentProfile.findOneAndDelete({ userId: id });
        }
    }

    await User.findByIdAndDelete(id);

    return { data: null };
};
const updateUser = async (
    userId: string,
    payload: Partial<IUser>,
    decodedToken: JwtPayload
) => {
    const existingUser = await User.findById(userId);

    if (!existingUser) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    // Non-admin restrictions
    if (decodedToken.role !== Role.ADMIN) {
        if (userId !== decodedToken.userId) {
            throw new AppError(
                httpStatus.UNAUTHORIZED,
                "You are not authorized to update this user."
            );
        }

        if (payload.role) {
            throw new AppError(
                httpStatus.FORBIDDEN,
                "You are not authorized to modify role."
            );
        }
    }

    if (payload.password) {
        payload.password = await bcryptjs.hash(
            payload.password,
            Number(envVars.BCRYPT_SALT_ROUND)
        );
    }

    // Allowed fields only
    const updatePayload: Partial<IUser> = {};

    if (payload.name) updatePayload.name = payload.name;

    if (payload.email) updatePayload.email = payload.email;

    if (payload.phone) updatePayload.phone = payload.phone;

    if (payload.picture) updatePayload.picture = payload.picture;

    if (payload.password) updatePayload.password = payload.password;

    // Only admin can update role
    if (
        decodedToken.role === Role.ADMIN &&
        payload.role
    ) {
        updatePayload.role = payload.role;
    }

    const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: updatePayload },
        {
            new: true,
            runValidators: true,
        }
    );

    return updatedUser;
};


const updateProfile = async (payload: Partial<IUser>, decodedToken: JwtPayload) => {
    const user = await User.findById(decodedToken.userId);
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    if (payload.password) {
        throw new AppError(httpStatus.FORBIDDEN, "You can't change your password here");
    }

    let updatedProfile;

    if (user.role === Role.TEACHER) {
        updatedProfile = await TeacherProfile.findOneAndUpdate(
            { userId: decodedToken.userId },
            payload,
            { returnDocument: "after", runValidators: true }
        );
    }

    if (user.role === Role.STUDENT) {
        updatedProfile = await StudentProfile.findOneAndUpdate(
            { userId: decodedToken.userId },
            payload,
            { returnDocument: "after", runValidators: true }
        );
    }

    return {
        data: updatedProfile
    }
}

export const UserServices = {
    createUserService,
    getMe,
    getAllUsers,
    getAllStudents,
    getAllTeachers,
    getSingleUser,
    deleteUser,
    updateUser,
    updateProfile
}
