import { ICourse } from "./course.interface";
import { CourseModel } from "./course.model";

const createCourse = async (
    payload: Partial<ICourse>
) => {

    console.log("course payload", payload)
    const result = await CourseModel.create(payload);

    return { data: result };
};

const getAllCourses = async () => {
    const result = await CourseModel.find({
        isDeleted: false,
    })
        .populate("class")
        // .populate("subject")
        // .populate("assignedTeachers");
        .populate({
            path: "assignSubWithTeacher.subject",
            model: "Subject",
        })
        .populate({
            path: "assignSubWithTeacher.teacher",
            model: "TeacherProfile",
        });
    return { data: result };
};

const getAllTrashCourses = async () => {
    const result = await CourseModel.find({
        isDeleted: true,
    });

    return { data: result };
};

const getSingleCourse = async (slug: string) => {
    const result = await CourseModel.findOne({
        slug: slug,
        isDeleted: false,
    })
        .populate("class")
        // .populate("subject")
        // .populate("assignedTeachers");
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
    // .populate({
    //     path: "assignSubWithTeacher.teacher",
    //     model: "TeacherProfile",
    //     populate: {
    //         path: "userId",
    //         model: "User",
    //     },
    // });

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