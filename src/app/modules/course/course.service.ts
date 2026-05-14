import AppError from "../../errorHelpers/appError";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { TeacherProfile } from "../user/user.model";
import { courseSearchableFields } from "./course.constants";
import { ICourse } from "./course.interface";
import { CourseModel } from "./course.model";

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

    await Promise.all(
        payload.assignSubWithTeacher?.map(async (item) => {
            const teacher = item.teacher.toString();
            const subject = item.subject.toString();

            await TeacherProfile.findByIdAndUpdate(
                teacher,
                {
                    $addToSet: {
                        assignedSubjects: subject,
                        assignedCourses: result._id.toString(),
                    },
                },
                { new: true }
            );
        }) || []


    );

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
            model: "TeacherProfile",
        });

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
                {
                    path: "teacher",
                    model: "TeacherProfile",
                    populate: {
                        path: "userId",
                        model: "User",
                    },
                },
            ],
        });

    return { data: result };
};

const updateCourse = async (
    id: string,
    payload: Partial<ICourse>
) => {
    const result = await CourseModel.findByIdAndUpdate(
        id,
        payload,
        {
            new: true,
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
            new: true,
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
};