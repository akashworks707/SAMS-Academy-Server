import { Role } from "../modules/user/user.interface";
import { StudentProfile, TeacherProfile } from "../modules/user/user.model";

export const getProfileByRole = async (user: any) => {
    if (user.role === Role.TEACHER) {
        return await TeacherProfile.findOne({ userId: user._id })
            .populate("subjects")
            .populate("assignedCourses")
            .lean();
    }

    if (user.role === Role.STUDENT) {
        return await StudentProfile.findOne({ userId: user._id })
            // .populate("enrolledCourses")
            .lean();
    }

    return null;
};