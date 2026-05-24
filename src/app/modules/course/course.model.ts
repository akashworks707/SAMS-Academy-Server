import { Schema, model } from "mongoose";
import { ICourse } from "./course.interface";

const reviewSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },

        comment: {
            type: String,
            trim: true,
        },

        date: {
            type: Date,
            default: Date.now,
        },
    },
    {
        _id: false,
    }
);

const courseSchema = new Schema<ICourse>(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },

        slug: {
            type: String,
            unique: true,
        },

        description: {
            type: String,
            trim: true,
        },

        thumbnail: {
            type: String,
        },

        class: {
            type: Schema.Types.ObjectId,
            ref: "Class",
            required: true,
        },

        batch: {
            type: String,
            trim: true,
            unique: true,
        },

        assignSubWithTeacher: [
            {
                subject: {
                    type: Schema.Types.ObjectId,
                    ref: "Subject",
                    required: true,
                },
                teacher: {
                    type: Schema.Types.ObjectId,
                    ref: "User",
                    required: true,
                }
            }
        ],

        regularPrice: {
            type: Number,
            default: 0,
        },

        discountPrice: {
            type: Number,
            default: 0,
        },

        enrollmentStartDate: Date,

        enrollmentEndDate: Date,

        courseStartDate: Date,

        courseEndDate: Date,

        duration: String,

        totalClasses: {
            type: Number,
            default: 0,
        },

        certificate: {
            type: Boolean,
            default: false,
        },

        status: {
            type: String,
            enum: ["upcoming", "running", "completed"],
            default: "upcoming",
        },

        ratings: {
            type: Number,
            default: 0,
        },

        reviews: [reviewSchema],

        isFeatured: {
            type: Boolean,
            default: false,
        },

        isDeleted: {
            type: Boolean,
            default: false,
        },

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true
    }
);

// slug generate on save
courseSchema.pre("save", async function () {
    if (this.isModified("title")) {
        const baseSlug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");

        let slug = baseSlug;

        let counter = 1;

        while (await CourseModel.exists({ slug })) {
            slug = `${baseSlug}-${counter++}`;
        }

        this.slug = slug;
    }
});

// slug generate on update
courseSchema.pre("findOneAndUpdate", async function () {
    const update = this.getUpdate() as Partial<ICourse>;

    if (update.title) {
        const baseSlug = update.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");

        let slug = baseSlug;

        let counter = 1;

        while (await CourseModel.exists({ slug })) {
            slug = `${baseSlug}-${counter++}`;
        }

        update.slug = slug;

        this.setUpdate(update);
    }
});

export const CourseModel = model<ICourse>(
    "Course",
    courseSchema
);