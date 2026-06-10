
import { Types } from "mongoose";
import { PaymentModel } from "../payment/payment.model";
import { ZoomMeeting } from "../zoom/zoom.model";
import { EnrollmentModel } from "../enrollment/enrollment.model";
import { User } from "../user/user.model";
import { CourseModel } from "../course/course.model";
import { Role } from "../user/user.interface";
import { ClassModel } from "../class/class.model";
import { SubjectModel } from "../subject/subject.model";


// Helpers


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


// 1. Dashboard Stats (6 summary cards)

/**
 * - totalRevenue
 * - totalCourses / totalActiveCourses
 * - totalEnrollments
 * - totalTeachers  → users with role "TEACHER"
 * - totalStudents  → users with role "STUDENT"
 */
const getDashboardStats = async (startDate?: string, endDate?: string) => {
  const dateMatch = buildDateMatch(startDate, endDate);

  const [
    revenueResult,
    courseResult,
    enrollmentResult,
    teacherCount,
    studentCount,
    classCount,
    subjectCount,
  ] = await Promise.all([
    // total revenue from completed payments
    PaymentModel.aggregate([
      { $match: { status: "COMPLETED", ...dateMatch } },
      { $group: { _id: null, totalRevenue: { $sum: "$amount" }, totalTransactions: { $sum: 1 } } },
    ]),

    // course breakdown by status
    CourseModel.aggregate([
      {
        $group: {
          _id: null,
          totalCourses: { $sum: 1 },
          totalActiveCourses: { $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] } },
          runningCourses: { $sum: { $cond: [{ $eq: ["$status", "running"] }, 1, 0] } },
          upcomingCourses: { $sum: { $cond: [{ $eq: ["$status", "upcoming"] }, 1, 0] } },
          completedCourses: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
        },
      },
    ]),

    // enrollments within date range
    EnrollmentModel.aggregate([
      { $match: { ...dateMatch } },
      {
        $group: {
          _id: null,
          totalEnrollments: { $sum: 1 },
          completedEnrollments: { $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0] } },
        },
      },
    ]),

    // total teachers = all users with role TEACHER (not date-filtered — it's a head-count)
    User.countDocuments({ role: Role.TEACHER }),

    // total students = all users with role STUDENT
    User.countDocuments({ role: Role.STUDENT }),

    // total completed zoom classes within date range
    ClassModel.countDocuments(),

    // total distinct subjects across all courses
    // (subjects live inside course.assignSubWithTeacher[].subject)
    SubjectModel.countDocuments(),
  ]);

  return {
    totalRevenue: revenueResult[0]?.totalRevenue ?? 0,
    totalTransactions: revenueResult[0]?.totalTransactions ?? 0,
    totalCourses: courseResult[0]?.totalCourses ?? 0,
    totalActiveCourses: courseResult[0]?.totalActiveCourses ?? 0,
    runningCourses: courseResult[0]?.runningCourses ?? 0,
    upcomingCourses: courseResult[0]?.upcomingCourses ?? 0,
    completedCourses: courseResult[0]?.completedCourses ?? 0,
    totalEnrollments: enrollmentResult[0]?.totalEnrollments ?? 0,
    completedEnrollments: enrollmentResult[0]?.completedEnrollments ?? 0,
    totalTeachers: teacherCount,
    totalStudents: studentCount,
    totalClasses: classCount,
    totalSubjects: subjectCount,
  };
};

// 2. Course Revenue

const getCourseRevenue = async (
  startDate?: string,
  endDate?: string,
  sortBy?: string,
  sortOrder?: "asc" | "desc"
) => {
  const dateMatch = buildDateMatch(startDate, endDate);
  const allowedSortFields: Record<string, string> = {
    totalRevenue: "totalRevenue",
    totalStudents: "totalStudents",
    courseTitle: "courseTitle",
  };
  const resolvedSortField = allowedSortFields[sortBy ?? ""] ?? "totalRevenue";
  const resolvedSortOrder = sortOrder === "asc" ? 1 : -1;

  const result = await PaymentModel.aggregate([
    { $match: { status: "COMPLETED", ...dateMatch } },
    { $lookup: { from: "enrollments", localField: "enrollment", foreignField: "_id", as: "enrollment" } },
    { $unwind: "$enrollment" },
    { $lookup: { from: "courses", localField: "enrollment.course", foreignField: "_id", as: "course" } },
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
      $facet: {
        courses: [
          { $project: { _id: 0, courseId: "$_id", courseTitle: 1, totalRevenue: 1, totalStudents: 1 } },
          { $sort: { [resolvedSortField]: resolvedSortOrder } },
        ],
        summary: [
          { $group: { _id: null, totalCourses: { $sum: 1 }, totalRevenue: { $sum: "$totalRevenue" }, totalStudents: { $sum: "$totalStudents" } } },
          { $project: { _id: 0, totalCourses: 1, totalRevenue: 1, totalStudents: 1 } },
        ],
      },
    },
  ]);

  return {
    courses: result[0]?.courses || [],
    summary: result[0]?.summary?.[0] || { totalCourses: 0, totalRevenue: 0, totalStudents: 0 },
  };
};


// 3. Total Revenue


const getTotalRevenue = async (startDate?: string, endDate?: string) => {
  const dateMatch = buildDateMatch(startDate, endDate);
  const result = await PaymentModel.aggregate([
    { $match: { status: "COMPLETED", ...dateMatch } },
    { $group: { _id: null, totalRevenue: { $sum: "$amount" }, totalTransactions: { $sum: 1 } } },
  ]);
  return result[0] || { totalRevenue: 0, totalTransactions: 0 };
};


// 4. Teacher Revenue


const getTeacherRevenue = async (
  teacherId?: string,
  startDate?: string,
  endDate?: string,
  sortBy?: string,
  sortOrder?: "asc" | "desc"
) => {
  const dateMatch = buildDateMatch(startDate, endDate);
  const allowedSortFields: Record<string, string> = {
    totalRevenue: "totalRevenue",
    totalClasses: "totalClasses",
    perClassSalary: "perClassSalary",
    teacherName: "teacherName",
  };
  const resolvedSortField = allowedSortFields[sortBy ?? ""] ?? "totalRevenue";
  const resolvedSortOrder = sortOrder === "asc" ? 1 : -1;

  const result = await ZoomMeeting.aggregate([
    { $match: { status: "COMPLETED", ...dateMatch } },
    { $lookup: { from: "courses", localField: "courseId", foreignField: "_id", as: "course" } },
    { $unwind: "$course" },
    {
      $addFields: {
        teacher: {
          $arrayElemAt: [
            { $filter: { input: "$course.assignSubWithTeacher", as: "item", cond: { $eq: ["$$item.subject", "$subjectId"] } } },
            0,
          ],
        },
      },
    },
    { $addFields: { teacherId: "$teacher.teacher" } },
    ...(teacherId ? [{ $match: { teacherId: new Types.ObjectId(teacherId) } }] : []),
    { $lookup: { from: "users", localField: "teacherId", foreignField: "_id", as: "teacherInfo" } },
    { $unwind: "$teacherInfo" },
    {
      $group: {
        _id: "$teacherId",
        teacherName: { $first: "$teacherInfo.name" },
        teacherEmail: { $first: "$teacherInfo.email" },
        perClassSalary: { $first: "$teacherInfo.perClassSalary" },
        totalClasses: { $sum: 1 },
        totalRevenue: { $sum: "$teacherInfo.perClassSalary" },
      },
    },
    {
      $facet: {
        teachers: [
          { $project: { _id: 0, teacherId: "$_id", teacherName: 1, teacherEmail: 1, perClassSalary: 1, totalClasses: 1, totalRevenue: 1 } },
          { $sort: { [resolvedSortField]: resolvedSortOrder } },
        ],
        summary: [
          { $group: { _id: null, totalTeachers: { $sum: 1 }, totalClasses: { $sum: "$totalClasses" }, totalRevenue: { $sum: "$totalRevenue" } } },
          { $project: { _id: 0, totalTeachers: 1, totalClasses: 1, totalRevenue: 1 } },
        ],
      },
    },
  ]);

  return result;
};


// 5. Payment Analytics


const getPaymentAnalytics = async (
  startDate?: string,
  endDate?: string,
  sortBy?: string,
  sortOrder?: "asc" | "desc"
) => {
  const dateMatch = buildDateMatch(startDate, endDate);
  const allowedSortFields: Record<string, string> = { totalAmount: "totalAmount", count: "count", status: "status" };
  const resolvedSortField = allowedSortFields[sortBy ?? ""] ?? "totalAmount";
  const resolvedSortOrder = sortOrder === "asc" ? 1 : -1;

  const result = await PaymentModel.aggregate([
    { $match: { ...dateMatch } },
    {
      $facet: {
        byStatus: [
          { $group: { _id: "$status", count: { $sum: 1 }, totalAmount: { $sum: "$amount" } } },
          { $project: { _id: 0, status: "$_id", count: 1, totalAmount: 1 } },
          { $sort: { [resolvedSortField]: resolvedSortOrder } },
        ],
        byMethod: [
          { $group: { _id: "$paymentMethod", count: { $sum: 1 }, totalAmount: { $sum: "$amount" } } },
          { $project: { _id: 0, method: "$_id", count: 1, totalAmount: 1 } },
          { $sort: { totalAmount: -1 } },
        ],
        summary: [
          {
            $group: {
              _id: null,
              totalTransactions: { $sum: 1 },
              totalRevenue: { $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, "$amount", 0] } },
              totalRefunded: { $sum: { $cond: [{ $eq: ["$status", "REFUNDED"] }, "$amount", 0] } },
              totalPending: { $sum: { $cond: [{ $eq: ["$status", "PENDING"] }, "$amount", 0] } },
              averageOrderValue: { $avg: "$amount" },
            },
          },
          { $project: { _id: 0, totalTransactions: 1, totalRevenue: 1, totalRefunded: 1, totalPending: 1, averageOrderValue: { $round: ["$averageOrderValue", 2] } } },
        ],
      },
    },
  ]);

  return {
    byStatus: result[0]?.byStatus || [],
    byMethod: result[0]?.byMethod || [],
    summary: result[0]?.summary?.[0] || { totalTransactions: 0, totalRevenue: 0, totalRefunded: 0, totalPending: 0, averageOrderValue: 0 },
  };
};


// 6. Enrollment Analytics


const getEnrollmentAnalytics = async (
  startDate?: string,
  endDate?: string,
  sortBy?: string,
  sortOrder?: "asc" | "desc"
) => {
  const dateMatch = buildDateMatch(startDate, endDate);
  const allowedSortFields: Record<string, string> = { totalEnrollments: "totalEnrollments", courseTitle: "courseTitle", completionRate: "completionRate" };
  const resolvedSortField = allowedSortFields[sortBy ?? ""] ?? "totalEnrollments";
  const resolvedSortOrder = sortOrder === "asc" ? 1 : -1;

  const result = await EnrollmentModel.aggregate([
    { $match: { ...dateMatch } },
    { $lookup: { from: "courses", localField: "course", foreignField: "_id", as: "course" } },
    { $unwind: "$course" },
    {
      $facet: {
        byCourse: [
          {
            $group: {
              _id: "$course._id",
              courseTitle: { $first: "$course.title" },
              totalEnrollments: { $sum: 1 },
              completedCount: { $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0] } },
              activeCount: { $sum: { $cond: [{ $eq: ["$status", "ACTIVE"] }, 1, 0] } },
              cancelledCount: { $sum: { $cond: [{ $eq: ["$status", "CANCELLED"] }, 1, 0] } },
            },
          },
          {
            $addFields: {
              completionRate: {
                $cond: [
                  { $eq: ["$totalEnrollments", 0] },
                  0,
                  { $round: [{ $multiply: [{ $divide: ["$completedCount", "$totalEnrollments"] }, 100] }, 2] },
                ],
              },
            },
          },
          { $project: { _id: 0, courseId: "$_id", courseTitle: 1, totalEnrollments: 1, completedCount: 1, activeCount: 1, cancelledCount: 1, completionRate: 1 } },
          { $sort: { [resolvedSortField]: resolvedSortOrder } },
        ],
        byStatus: [
          { $group: { _id: "$status", count: { $sum: 1 } } },
          { $project: { _id: 0, status: "$_id", count: 1 } },
        ],
        summary: [
          {
            $group: {
              _id: null,
              totalEnrollments: { $sum: 1 },
              totalCompleted: { $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0] } },
              totalActive: { $sum: { $cond: [{ $eq: ["$status", "ACTIVE"] }, 1, 0] } },
              totalCancelled: { $sum: { $cond: [{ $eq: ["$status", "CANCELLED"] }, 1, 0] } },
            },
          },
          {
            $addFields: {
              overallCompletionRate: {
                $cond: [
                  { $eq: ["$totalEnrollments", 0] },
                  0,
                  { $round: [{ $multiply: [{ $divide: ["$totalCompleted", "$totalEnrollments"] }, 100] }, 2] },
                ],
              },
            },
          },
          { $project: { _id: 0, totalEnrollments: 1, totalCompleted: 1, totalActive: 1, totalCancelled: 1, overallCompletionRate: 1 } },
        ],
      },
    },
  ]);

  return {
    byCourse: result[0]?.byCourse || [],
    byStatus: result[0]?.byStatus || [],
    summary: result[0]?.summary?.[0] || { totalEnrollments: 0, totalCompleted: 0, totalActive: 0, totalCancelled: 0, overallCompletionRate: 0 },
  };
};


// 7. Student Analytics — role: "STUDENT" only


const getStudentAnalytics = async (
  startDate?: string,
  endDate?: string,
  sortBy?: string,
  sortOrder?: "asc" | "desc"
) => {
  const dateMatch = buildDateMatch(startDate, endDate);
  const allowedSortFields: Record<string, string> = { totalCourses: "totalCourses", totalSpent: "totalSpent", studentName: "studentName" };
  const resolvedSortField = allowedSortFields[sortBy ?? ""] ?? "totalCourses";
  const resolvedSortOrder = sortOrder === "asc" ? 1 : -1;

  const topStudents = await EnrollmentModel.aggregate([
    { $match: { ...dateMatch } },
    { $lookup: { from: "payments", let: { enrollmentId: "$_id" }, pipeline: [{ $match: { $expr: { $and: [{ $eq: ["$enrollment", "$$enrollmentId"] }, { $eq: ["$status", "COMPLETED"] }] } } }], as: "payment" } },
    { $lookup: { from: "users", localField: "student", foreignField: "_id", as: "studentInfo" } },
    { $unwind: "$studentInfo" },
    { $match: { "studentInfo.role": "STUDENT" } },
    {
      $group: {
        _id: "$student",
        studentName: { $first: "$studentInfo.name" },
        studentEmail: { $first: "$studentInfo.email" },
        totalCourses: { $sum: 1 },
        totalSpent: { $sum: { $arrayElemAt: ["$payment.amount", 0] } },
        completedCourses: { $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0] } },
      },
    },
    { $project: { _id: 0, studentId: "$_id", studentName: 1, studentEmail: 1, totalCourses: 1, completedCourses: 1, totalSpent: { $ifNull: ["$totalSpent", 0] } } },
    { $sort: { [resolvedSortField]: resolvedSortOrder } },
    { $limit: 20 },
  ]);

  const totalStudents = await User.countDocuments({ role: Role.STUDENT });
  const activeStudents = await User.countDocuments({ role: Role.STUDENT, isActive: true });

  return {
    topStudents,
    summary: { totalStudents, activeStudents, inactiveStudents: totalStudents - activeStudents },
  };
};


// 8. Dashboard Chart Data


const getDashboardChartData = async (
  startDate?: string,
  endDate?: string,
  granularity: "day" | "week" | "month" | "year" = "month"
) => {
  const dateMatch = buildDateMatch(startDate, endDate);
  const groupByDate = buildGroupByDate(granularity);

  const revenueData = await PaymentModel.aggregate([
    { $match: { status: "COMPLETED", ...dateMatch } },
    { $group: { _id: groupByDate, revenue: { $sum: "$amount" }, transactions: { $sum: 1 } } },
    { $sort: { _id: 1 } },
    { $project: { _id: 0, period: "$_id", revenue: 1, transactions: 1 } },
  ]);

  const enrollmentData = await EnrollmentModel.aggregate([
    { $match: { ...dateMatch } },
    {
      $group: {
        _id: groupByDate,
        totalEnrollments: { $sum: 1 },
        newEnrollments: { $sum: { $cond: [{ $eq: ["$status", "ACTIVE"] }, 1, 0] } },
        completedEnrollments: { $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0] } },
      },
    },
    { $sort: { _id: 1 } },
    { $project: { _id: 0, period: "$_id", totalEnrollments: 1, newEnrollments: 1, completedEnrollments: 1 } },
  ]);

  // role: "STUDENT" only
  const studentData = await User.aggregate([
    { $match: { role: "STUDENT", ...dateMatch } },
    { $group: { _id: groupByDate, newStudents: { $sum: 1 } } },
    { $sort: { _id: 1 } },
    { $project: { _id: 0, period: "$_id", newStudents: 1 } },
  ]);

  const periodMap: Record<string, any> = {};
  const defaultEntry = (period: string) => ({ period, revenue: 0, transactions: 0, totalEnrollments: 0, newEnrollments: 0, completedEnrollments: 0, newStudents: 0 });

  for (const row of revenueData) periodMap[row.period] = { ...defaultEntry(row.period), ...row };
  for (const row of enrollmentData) periodMap[row.period] = { ...(periodMap[row.period] ?? defaultEntry(row.period)), ...row };
  for (const row of studentData) periodMap[row.period] = { ...(periodMap[row.period] ?? defaultEntry(row.period)), ...row };

  const chartData = Object.values(periodMap).sort((a, b) => a.period.localeCompare(b.period));

  return { granularity, chartData, series: { revenue: revenueData, enrollments: enrollmentData, students: studentData } };
};


// 9. Enrollment & Student Chart Data


const getEnrollmentStudentChartData = async (
  startDate?: string,
  endDate?: string,
  granularity: "day" | "week" | "month" | "year" = "month",
  courseId?: string
) => {
  const dateMatch = buildDateMatch(startDate, endDate);
  const groupByDate = buildGroupByDate(granularity);
  const enrollmentMatch: any = { ...dateMatch };
  if (courseId) enrollmentMatch.course = new Types.ObjectId(courseId);

  const enrollmentTrend = await EnrollmentModel.aggregate([
    { $match: enrollmentMatch },
    {
      $group: {
        _id: groupByDate,
        total: { $sum: 1 },
        active: { $sum: { $cond: [{ $eq: ["$status", "ACTIVE"] }, 1, 0] } },
        completed: { $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0] } },
        cancelled: { $sum: { $cond: [{ $eq: ["$status", "CANCELLED"] }, 1, 0] } },
      },
    },
    { $sort: { _id: 1 } },
    { $project: { _id: 0, period: "$_id", total: 1, active: 1, completed: 1, cancelled: 1 } },
  ]);

  // role: "STUDENT" only
  const studentGrowthTrend = await User.aggregate([
    { $match: { role: "STUDENT", ...dateMatch } },
    { $group: { _id: groupByDate, newStudents: { $sum: 1 } } },
    { $sort: { _id: 1 } },
    { $project: { _id: 0, period: "$_id", newStudents: 1 } },
  ]);

  let cumulative = 0;
  const cumulativeStudents = studentGrowthTrend.map((row: any) => {
    cumulative += row.newStudents;
    return { period: row.period, cumulativeStudents: cumulative };
  });

  const topCoursesByEnrollment = await EnrollmentModel.aggregate([
    { $match: enrollmentMatch },
    { $lookup: { from: "courses", localField: "course", foreignField: "_id", as: "course" } },
    { $unwind: "$course" },
    {
      $group: {
        _id: "$course._id",
        courseTitle: { $first: "$course.title" },
        totalEnrollments: { $sum: 1 },
        completedCount: { $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0] } },
      },
    },
    { $sort: { totalEnrollments: -1 } },
    { $limit: 5 },
    {
      $project: {
        _id: 0,
        courseId: "$_id",
        courseTitle: 1,
        totalEnrollments: 1,
        completedCount: 1,
        completionRate: { $round: [{ $multiply: [{ $divide: ["$completedCount", "$totalEnrollments"] }, 100] }, 2] },
      },
    },
  ]);

  return { granularity, enrollmentTrend, studentGrowthTrend, cumulativeStudents, topCoursesByEnrollment };
};


// Export


export const AnalyticsService = {
  getCourseRevenue,
  getTotalRevenue,
  getTeacherRevenue,
  getDashboardStats,
  getPaymentAnalytics,
  getEnrollmentAnalytics,
  getStudentAnalytics,
  getDashboardChartData,
  getEnrollmentStudentChartData,
};