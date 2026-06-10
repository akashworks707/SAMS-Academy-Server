import { Types } from "mongoose";
import { ZoomMeeting } from "../zoom/zoom.model";
import { EnrollmentModel } from "../enrollment/enrollment.model";
import { CourseModel } from "../course/course.model";
import { PaymentModel } from "../payment/payment.model";

const buildDateMatch = (startDate?: string, endDate?: string) => {
  const match: any = {};
  if (startDate || endDate) {
    match.createdAt = {};
    if (startDate) match.createdAt.$gte = new Date(startDate);
    if (endDate) match.createdAt.$lte = new Date(endDate);
  }
  return match;
};

const buildGroupByDate = (granularity: "day" | "week" | "month" | "year" = "month") => {
  const formats: Record<string, string> = {
    day: "%Y-%m-%d",
    week: "%Y-%U",
    month: "%Y-%m",
    year: "%Y",
  };
  return { $dateToString: { format: formats[granularity] ?? formats.month, date: "$createdAt" } };
};

// ─── 1. Teacher Summary Stats ──────────────────────────────────────────────────
// totalRevenue (salary earned), totalClasses, perClassSalary,
// assignedCourses count, totalStudents across those courses

const getTeacherStats = async (
  teacherId: string,
  startDate?: string,
  endDate?: string
) => {
  const dateMatch = buildDateMatch(startDate, endDate);
  const tid = new Types.ObjectId(teacherId);

  // classes completed by this teacher
  const classResult = await ZoomMeeting.aggregate([
    { $match: { status: "COMPLETED", ...dateMatch } },
    { $lookup: { from: "courses", localField: "courseId", foreignField: "_id", as: "course" } },
    { $unwind: "$course" },
    {
      $addFields: {
        matchedTeacher: {
          $arrayElemAt: [
            {
              $filter: {
                input: "$course.assignSubWithTeacher",
                as: "item",
                cond: { $eq: ["$$item.teacher", tid] },
              },
            },
            0,
          ],
        },
      },
    },
    { $match: { "matchedTeacher.teacher": tid } },
    { $lookup: { from: "users", localField: "matchedTeacher.teacher", foreignField: "_id", as: "teacherInfo" } },
    { $unwind: "$teacherInfo" },
    {
      $group: {
        _id: null,
        totalClasses: { $sum: 1 },
        totalRevenue: { $sum: "$teacherInfo.perClassSalary" },
        perClassSalary: { $first: "$teacherInfo.perClassSalary" },
      },
    },
  ]);

  // courses assigned to teacher
  const assignedCourses = await CourseModel.find({
    "assignSubWithTeacher.teacher": tid,
    isActive: true,
  }).select("_id title status").lean();

  const courseIds = assignedCourses.map((c) => c._id);

  // total students enrolled in teacher's courses
  const studentCountResult = await EnrollmentModel.aggregate([
    { $match: { course: { $in: courseIds }, ...dateMatch } },
    { $group: { _id: "$student" } },
    { $count: "total" },
  ]);

  return {
    totalClasses: classResult[0]?.totalClasses ?? 0,
    totalRevenue: classResult[0]?.totalRevenue ?? 0,
    perClassSalary: classResult[0]?.perClassSalary ?? 0,
    assignedCoursesCount: assignedCourses.length,
    totalStudents: studentCountResult[0]?.total ?? 0,
  };
};

// ─── 2. Teacher Revenue Over Time (chart) ─────────────────────────────────────
// Groups completed zoom classes by period → salary earned per period

const getTeacherRevenueChart = async (
  teacherId: string,
  startDate?: string,
  endDate?: string,
  granularity: "day" | "week" | "month" | "year" = "month"
) => {
  const dateMatch = buildDateMatch(startDate, endDate);
  const tid = new Types.ObjectId(teacherId);
  const groupByDate = buildGroupByDate(granularity);

  const data = await ZoomMeeting.aggregate([
    { $match: { status: "COMPLETED", ...dateMatch } },
    { $lookup: { from: "courses", localField: "courseId", foreignField: "_id", as: "course" } },
    { $unwind: "$course" },
    {
      $addFields: {
        matchedTeacher: {
          $arrayElemAt: [
            {
              $filter: {
                input: "$course.assignSubWithTeacher",
                as: "item",
                cond: { $eq: ["$$item.teacher", tid] },
              },
            },
            0,
          ],
        },
      },
    },
    { $match: { "matchedTeacher.teacher": tid } },
    { $lookup: { from: "users", localField: "matchedTeacher.teacher", foreignField: "_id", as: "teacherInfo" } },
    { $unwind: "$teacherInfo" },
    {
      $group: {
        _id: groupByDate,
        revenue: { $sum: "$teacherInfo.perClassSalary" },
        classes: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    { $project: { _id: 0, period: "$_id", revenue: 1, classes: 1 } },
  ]);

  return { granularity, chartData: data };
};

// ─── 3. Per-Course Revenue (bar chart) ────────────────────────────────────────
// For each course the teacher is assigned to → total payment revenue collected

const getTeacherCourseRevenue = async (
  teacherId: string,
  startDate?: string,
  endDate?: string
) => {
  const dateMatch = buildDateMatch(startDate, endDate);
  const tid = new Types.ObjectId(teacherId);

  const assignedCourses = await CourseModel.find({
    "assignSubWithTeacher.teacher": tid,
  }).select("_id title status").lean();

  const courseIds = assignedCourses.map((c) => c._id);

  const revenueResult = await PaymentModel.aggregate([
    { $match: { status: "COMPLETED", ...dateMatch } },
    { $lookup: { from: "enrollments", localField: "enrollment", foreignField: "_id", as: "enrollment" } },
    { $unwind: "$enrollment" },
    { $match: { "enrollment.course": { $in: courseIds } } },
    { $lookup: { from: "courses", localField: "enrollment.course", foreignField: "_id", as: "course" } },
    { $unwind: "$course" },
    {
      $group: {
        _id: "$course._id",
        courseTitle: { $first: "$course.title" },
        courseStatus: { $first: "$course.status" },
        totalRevenue: { $sum: "$amount" },
        totalStudents: { $sum: 1 },
      },
    },
    { $project: { _id: 0, courseId: "$_id", courseTitle: 1, courseStatus: 1, totalRevenue: 1, totalStudents: 1 } },
    { $sort: { totalRevenue: -1 } },
  ]);

  // merge courses that have 0 revenue too
  const revenueMap = new Map(revenueResult.map((r: any) => [String(r.courseId), r]));
  const courses = assignedCourses.map((c) => {
    const rev = revenueMap.get(String(c._id));
    return {
      courseId: String(c._id),
      courseTitle: (c as any).title,
      courseStatus: (c as any).status,
      totalRevenue: rev ? (rev as any).totalRevenue : 0,
      totalStudents: rev ? (rev as any).totalStudents : 0,
    };
  });

  const summary = {
    totalCourses: courses.length,
    totalRevenue: courses.reduce((s, c) => s + c.totalRevenue, 0),
    totalStudents: courses.reduce((s, c) => s + c.totalStudents, 0),
  };

  return { courses, summary };
};

// ─── 4. Enrollment trend for teacher's courses ────────────────────────────────

const getTeacherEnrollmentChart = async (
  teacherId: string,
  startDate?: string,
  endDate?: string,
  granularity: "day" | "week" | "month" | "year" = "month"
) => {
  const dateMatch = buildDateMatch(startDate, endDate);
  const tid = new Types.ObjectId(teacherId);
  const groupByDate = buildGroupByDate(granularity);

  const assignedCourses = await CourseModel.find({
    "assignSubWithTeacher.teacher": tid,
  }).select("_id").lean();

  const courseIds = assignedCourses.map((c) => c._id);

  const data = await EnrollmentModel.aggregate([
    { $match: { course: { $in: courseIds }, ...dateMatch } },
    {
      $group: {
        _id: groupByDate,
        totalEnrollments: { $sum: 1 },
        completedEnrollments: { $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0] } },
      },
    },
    { $sort: { _id: 1 } },
    { $project: { _id: 0, period: "$_id", totalEnrollments: 1, completedEnrollments: 1 } },
  ]);

  return { granularity, chartData: data };
};

export const TeacherAnalyticsService = {
  getTeacherStats,
  getTeacherRevenueChart,
  getTeacherCourseRevenue,
  getTeacherEnrollmentChart,
};