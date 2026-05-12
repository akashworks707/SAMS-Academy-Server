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

// const createUserService = async (payload: Partial<IUser>, session?: mongoose.ClientSession) => {
//     const { email, password, ...rest } = payload;

//     const query = User.findOne({ email });
//     const isExistUser = await query;

//     if (isExistUser) {
//         throw new AppError(httpStatus.CONFLICT, "User already exist");
//     }

//     const hashPassword = await bcryptjs.hash(password as string, 10);
//     const userRole = rest.role || Role.STUDENT;

//     const user = await User.create({
//         email,
//         password: hashPassword,
//         role: userRole,
//         ...rest
//     });

//     const { password: hashedPass, ...userWithoutPassword } = user.toObject();
//     return userWithoutPassword;
// }


// const createUserService = async (
//     payload: Partial<IUser>,
//     session?: mongoose.ClientSession
// ) => {
//     const { email, password, role, ...rest } = payload;

//     // 1. Check user exist
//     const isExistUser = await User.findOne({ email });

//     if (isExistUser) {
//         throw new AppError(httpStatus.CONFLICT, "User already exist");
//     }

//     // 2. Hash password
//     const hashPassword = await bcryptjs.hash(password as string, 10);

//     // 3. Create user
//     const user = await User.create(
//         [
//             {
//                 email,
//                 password: hashPassword,
//                 role: role || Role.STUDENT,
//                 ...rest,
//             },
//         ],
//         { session }
//     );

//     const createdUser = user[0];

//     // 4. Create profile based on role
//     if (createdUser.role === Role.TEACHER) {
//         await TeacherProfile.create(
//             [
//                 {
//                     userId: createdUser._id,
//                     qualification: "",
//                     experience: 0,
//                     salary: 0,
//                 },
//             ],
//             { session }
//         );
//     }

//     if (createdUser.role === Role.STUDENT) {
//         await StudentProfile.create(
//             [
//                 {
//                     userId: createdUser._id,
//                     studentId: `ST-${Date.now()}`,
//                     classId: undefined,
//                     guardianName: "",
//                     guardianPhone: "",
//                 },
//             ],
//             { session }
//         );
//     }

//     // 5. Return safe response
//     const { password: _, ...userWithoutPassword } = createdUser.toObject();

//     return userWithoutPassword;
// };


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

    // 2. Hash password
    const hashedPassword = password
        ? await bcryptjs.hash(password, 10)
        : undefined;

    // 3. Create user
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

    // 4. ROLE BASED PROFILE CREATION

    // ---------------- TEACHER ----------------
    if (user.role === Role.TEACHER) {
        await TeacherProfile.create(
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
        await StudentProfile.create(
            [
                {
                    userId: user._id,

                    address: address || "Not provided",

                    studentId:`ST-${Date.now()}`,

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

    return result;
};

const getMe = async (userId: string) => {
    const user = await User.findById(userId).select("-password");
    return {
        data: user
    }
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

const getSingleUser = async (id: string) => {
    const user = await User.findById(id);
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User Not Found")
    }
    return {
        data: user
    }
};

const deleteUser = async (id: string) => {
    const user = await User.findById(id);
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User Not Found")
    }

    await User.findByIdAndDelete(id);

    return {
        data: null
    }
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

    if (decodedToken.role !== Role.ADMIN) {
        if (userId !== decodedToken.userId) {
            throw new AppError(httpStatus.UNAUTHORIZED, "You are not authorized to update this user.");
        }

        if (payload.role) {
            throw new AppError(httpStatus.FORBIDDEN, "You are not authorized to modify these fields.");
        }
    }

    if (payload.password) {
        const hashedPassword = await bcryptjs.hash(payload.password, Number(envVars.BCRYPT_SALT_ROUND))
        payload.password = hashedPassword;
    }

    // No restrictions for Admin — directly update
    const updatedUser = await User.findByIdAndUpdate(userId, payload, {
        returnDocument: "after",
        runValidators: true,
    });

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

    const updatedUser = await User.findByIdAndUpdate(decodedToken.userId, payload, {
        returnDocument: "after",
        runValidators: true,
    });
    return {
        data: updatedUser
    }
}

export const UserServices = {
    createUserService,
    getMe,
    getAllUsers,
    getSingleUser,
    deleteUser,
    updateUser,
    updateProfile
}
