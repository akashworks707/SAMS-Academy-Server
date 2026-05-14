import { QueryBuilder } from "../../utils/QueryBuilder";
import { ClassService } from "../class/class.service";
import { subjectSearchableFields } from "./subject.constants";
import { SubjectModel } from "./subject.model";

const createSubject = async (payload: any) => {
  const result = await SubjectModel.create(payload);

  return { data: result };
};

const getAllSubjects = async (query: Record<string, string>) => {

  const baseQuery = SubjectModel.find({ isDeleted: false });

  const queryBuilder = new QueryBuilder(baseQuery, query);

  const subjectsData = queryBuilder
    .filter()
    .search(subjectSearchableFields)
    .sort()
    .fields()
    .paginate();

  const [data, meta] = await Promise.all([
    subjectsData.build(),
    queryBuilder.getMeta()
  ])

  return {
    data,
    meta
  }
};

const getAllTrashSubjects = async (query: Record<string, string>) => {
  const baseQuery = SubjectModel.find({ isDeleted: true });

  const queryBuilder = new QueryBuilder(baseQuery, query);

  const subjectsData = queryBuilder
    .filter()
    .search(subjectSearchableFields)
    .sort()
    .fields()
    .paginate();

  const [data, meta] = await Promise.all([
    subjectsData.build(),
    queryBuilder.getMeta()
  ])

  return {
    data,
    meta
  }
};


const getSingleSubject = async (id: string) => {
  const result = await SubjectModel.findById(id);

  return { data: result };
};

const updateSubject = async (
  id: string,
  payload: any
) => {
  const result = await SubjectModel.findByIdAndUpdate(
    id,
    payload,
    {
      new: true,
      runValidators: true,
    }
  );

  return { data: result };
};

const softDeleteSubject = async (id: string) => {
  const result = await SubjectModel.findByIdAndUpdate(
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

const deleteSubject = async (id: string) => {
  const result = await SubjectModel.findByIdAndDelete(id);

  return { data: result };
};

export const SubjectService = {
  createSubject,
  getAllSubjects,
  getAllTrashSubjects,
  getSingleSubject,
  updateSubject,
  softDeleteSubject,
  deleteSubject,
};