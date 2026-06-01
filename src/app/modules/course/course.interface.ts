import { Model, Types } from "mongoose";

export interface IReview {
  user: Types.ObjectId;

  rating: number;

  comment: string;

  date: Date;
}

export interface ICourse {
  title: string;

  slug?: string;

  description?: string;

  thumbnail?: string;

  class: Types.ObjectId;

  batch?: string;

  assignSubWithTeacher: {
    subject: Types.ObjectId;
    teacher: Types.ObjectId;
  }[];

  regularPrice?: number;

  discountPrice?: number;

  enrollmentStartDate?: Date;

  enrollmentEndDate?: Date;

  courseStartDate?: Date;

  courseEndDate?: Date;

  duration?: string;

  totalClasses?: number;

  certificate?: boolean;

  status?: "upcoming" | "running" | "completed";

  ratings?: number;

  reviews?: IReview[];

  isFeatured?: boolean;

  isDeleted?: boolean;

  isActive?: boolean;
}
