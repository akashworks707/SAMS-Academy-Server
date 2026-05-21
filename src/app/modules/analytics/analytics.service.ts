import { Types } from "mongoose";
import { PaymentModel } from "../payment/payment.model";
import { ZoomMeeting } from "../zoom/zoom.model";

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

  const result = await ZoomMeeting.aggregate([
    // 1. filter completed live classes
    {
      $match: {
        status: "COMPLETED",
        ...dateMatch,
      },
    },

    // 2. course join
    {
      $lookup: {
        from: "courses",
        localField: "courseId",
        foreignField: "_id",
        as: "course",
      },
    },
    { $unwind: "$course" },

    // 3. resolve teacher from subject mapping
    {
      $addFields: {
        teacher: {
          $arrayElemAt: [
            {
              $filter: {
                input: "$course.assignSubWithTeacher",
                as: "item",
                cond: {
                  $eq: ["$$item.subject", "$subjectId"],
                },
              },
            },
            0,
          ],
        },
      },
    },

    // 4. extract teacherId
    {
      $addFields: {
        teacherId: "$teacher.teacher",
      },
    },

    // 5. optional filter
    ...(teacherId
      ? [
          {
            $match: {
              teacherId: new Types.ObjectId(teacherId),
            },
          },
        ]
      : []),

    // 6. lookup teacher salary
    {
      $lookup: {
        from: "teacherprofiles",
        localField: "teacherId",
        foreignField: "_id",
        as: "teacherProfile",
      },
    },
    { $unwind: "$teacherProfile" },

    // 7. calculate revenue per class
    {
      $addFields: {
        perClassEarning: "$teacherProfile.perClassSalary",
      },
    },

    // 8. group result
    {
      $group: {
        _id: "$teacherId",
        totalRevenue: {
          $sum: "$perClassEarning",
        },
        totalClasses: {
          $sum: 1,
        },
      },
    },

    // 9. final projection
    {
      $project: {
        teacherId: "$_id",
        totalRevenue: 1,
        totalClasses: 1,
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