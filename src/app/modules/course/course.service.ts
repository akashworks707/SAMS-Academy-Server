import AppError from "../../errorHelpers/appError";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { CourseRecordedVideoModel } from "../courseRecordedVideo/courseRecordedVideo.model";
import { EnrollmentModel } from "../enrollment/enrollment.model";
import { QuizModel } from "../quiz/quiz.model";
import { Role } from "../user/user.interface";
import { User } from "../user/user.model";
import { ZoomMeeting } from "../zoom/zoom.model";
import { courseSearchableFields } from "./course.constants";
import { ICourse } from "./course.interface";
import { CourseModel } from "./course.model";
import httpStatus from "http-status-codes"

const createCourse = async (
    payload: Partial<ICourse>
) => {

    const isExistingCourse = await CourseModel.findOne({
        name: payload.title,
        class: payload.class
    });

    if (isExistingCourse) {
        throw new AppError(400, "Course already exists");
    }

    const result = await CourseModel.create(payload);

    return { data: result };
};

const getAllCourses = async (query: Record<string, string>) => {

    const baseQuery = CourseModel.find({ isDeleted: false });

    const queryBuilder = new QueryBuilder(baseQuery, query);

    const data = await queryBuilder
        .filter()
        .search(courseSearchableFields)
        .sort()
        .fields()
        .paginate()
        .build()
        .populate("class")
        .populate({
            path: "assignSubWithTeacher.subject",
            model: "Subject",
        })
        .populate({
            path: "assignSubWithTeacher.teacher",
            model: "User",
        })

    const meta = await queryBuilder.getMeta();

    return {
        data,
        meta,
    };
};

const getAllTrashCourses = async (query: Record<string, string>) => {

    const baseQuery = CourseModel.find({ isDeleted: true });

    const queryBuilder = new QueryBuilder(baseQuery, query);

    const data = await queryBuilder
        .filter()
        .search(courseSearchableFields)
        .sort()
        .fields()
        .paginate()
        .build()
        .populate("class")
        .populate({
            path: "assignSubWithTeacher.subject",
            model: "Subject",
        })
        .populate({
            path: "assignSubWithTeacher.teacher",
            model: "TeacherProfile",
        });

    const meta = await queryBuilder.getMeta();

    return {
        data,
        meta,
    };
};

const getSingleCourse = async (slug: string) => {
    const result = await CourseModel.findOne({
        slug: slug,
        isDeleted: false,
    })
        .populate("class")
        .populate({
            path: "assignSubWithTeacher",
            populate: [
                { path: "subject", model: "Subject" },
                {path: "teacher", model: "User"}
            ],
        })


    const courseRecordedVideos = await CourseRecordedVideoModel.find({ course: result?._id })
    const liveClasses = await ZoomMeeting.find({ courseId: result?._id })
    const quiz = await QuizModel.find({ courseId: result?._id })

    return {
        data: {
            result,
            courseRecordedVideos,
            liveClasses,
            quiz
        }

    };
};

const getMyCourses = async (userId: string) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    let result: any[] = [];

    if (user?.role === Role.STUDENT) {
        result = await EnrollmentModel.find({ student: userId }).populate("course")
    }

    if (user?.role === Role.TEACHER) {

        result = await CourseModel.find({
            "assignSubWithTeacher.teacher": user._id
        });
    }

    return { data: result }
}

const updateCourse = async (
    id: string,
    payload: Partial<ICourse>
) => {
    const result = await CourseModel.findByIdAndUpdate(
        id,
        payload,
        {
             returnDocument: "after",
            runValidators: true,
        }
    );

    return { data: result };
};

const softDeleteCourse = async (id: string) => {
    const result = await CourseModel.findByIdAndUpdate(
        id,
        {
            isDeleted: true,
            isActive: false,
        },
        {
           returnDocument: "after",
        }
    );

    return { data: result };
};

const deleteCourse = async (id: string) => {
    const result = await CourseModel.findByIdAndDelete(
        id
    );

    return { data: result };
};

export const CourseService = {
    createCourse,
    getAllCourses,
    getAllTrashCourses,
    getSingleCourse,
    updateCourse,
    softDeleteCourse,
    deleteCourse,
    getMyCourses
};