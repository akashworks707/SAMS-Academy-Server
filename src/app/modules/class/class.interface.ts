import { Types } from "mongoose";

export interface IClass {
  _id?: Types.ObjectId;

  title: string;
  description?: string;

  isActive: boolean;
  isDeleted: boolean;
}