import { Types } from "mongoose";
import { PaymentModel } from "../payment/payment.model";

const buildDateMatch = (startDate?: string, endDate?: string) => {
  const match: any = {};

  if (startDate || endDate) {
    match.createdAt = {};

    if (startDate) {
      match.createdAt.$gte = new Date(startDate);
    }

    if (endDate) {
      match.createdAt.$lte = new Date(endDate);
    }
  }

  return match;
};

const getCourseRevenue = async (startDate?: string, endDate?: string) => {
  const dateMatch = buildDateMatch(startDate, endDate);

  const result = await PaymentModel.aggregate([
    {
      $match: {
        status: "COMPLETED",
        ...dateMatch,
      },
    },

    {
      $lookup: {
        from: "enrollments",
        localField: "enrollment",
        foreignField: "_id",
        as: "enrollment",
      },
    },
    { $unwind: "$enrollment" },

    {
      $lookup: {
        from: "courses",
        localField: "enrollment.course",
        foreignField: "_id",
        as: "course",
      },
    },
    { $unwind: "$course" },

    {
      $group: {
        _id: "$course._id",
        courseTitle: { $first: "$course.title" },
        totalRevenue: { $sum: "$amount" },
        totalStudents: { $sum: 1 },
      },
    },

    {
      $sort: { totalRevenue: -1 },
    },
  ]);

  return result;
};

const getTotalRevenue = async (startDate?: string, endDate?: string) => {
  const dateMatch = buildDateMatch(startDate, endDate);

  const result = await PaymentModel.aggregate([
    {
      $match: {
        status: "COMPLETED",
        ...dateMatch,
      },
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$amount" },
        totalTransactions: { $sum: 1 },
      },
    },
  ]);

  return result[0] || { totalRevenue: 0, totalTransactions: 0 };
};


const getTeacherRevenue = async (
  teacherId?: string,
  startDate?: string,
  endDate?: string
) => {
  const dateMatch = buildDateMatch(startDate, endDate);

  const result = await PaymentModel.aggregate([
    {
      $match: {
        status: "COMPLETED",
        ...dateMatch,
      },
    },

    {
      $lookup: {
        from: "enrollments",
        localField: "enrollment",
        foreignField: "_id",
        as: "enrollment",
      },
    },
    { $unwind: "$enrollment" },

    {
      $lookup: {
        from: "courses",
        localField: "enrollment.course",
        foreignField: "_id",
        as: "course",
      },
    },
    { $unwind: "$course" },

    {
      $addFields: {
        teachers: "$course.assignSubWithTeacher.teacher",
      },
    },

    {
      $unwind: "$teachers",
    },

    ...(teacherId
      ? [
          {
            $match: {
              teachers: new Types.ObjectId(teacherId),
            },
          },
        ]
      : []),

    {
      $group: {
        _id: "$teachers",
        totalRevenue: { $sum: "$amount" },
        totalCourses: { $addToSet: "$course._id" },
        totalStudents: { $sum: 1 },
      },
    },

    {
      $project: {
        teacherId: "$_id",
        totalRevenue: 1,
        totalStudents: 1,
        totalCourses: { $size: "$totalCourses" },
      },
    },

    {
      $sort: { totalRevenue: -1 },
    },
  ]);

  return result;
};

export const AnalyticsService = {
  getCourseRevenue,
  getTotalRevenue,
  getTeacherRevenue,
};