import { QueryBuilder } from "../../utils/QueryBuilder";
import { classSearchableFields } from "./class.constants";
import { ClassModel } from "./class.model";

const createClass = async (payload: any) => {
  const result = await ClassModel.create(payload);

  return { data: result };
};

const getAllClasses = async (query: Record<string, string>) => {

    const baseQuery = ClassModel.find({isDeleted: false});

    const queryBuilder = new QueryBuilder(baseQuery, query);
    const classesData = queryBuilder
        .filter()
        .search(classSearchableFields)
        .sort()
        .fields()
        .paginate();

    const [data, meta] = await Promise.all([
        classesData.build(),
        queryBuilder.getMeta()
    ])

    return {
        data,
        meta
    }

};

const getAllTrashClasses = async (query: Record<string, string>) => {
    const baseQuery = ClassModel.find({ isDeleted: true });

    const queryBuilder = new QueryBuilder(baseQuery, query);
    const classesData = queryBuilder
        .filter()
        .search(classSearchableFields)
        .sort()
        .fields()
        .paginate();

    const [data, meta] = await Promise.all([
        classesData.build(),
        queryBuilder.getMeta()
    ])

    return {
        data,
        meta
    }
};


const getSingleClass = async (id: string) => {
  const result = await ClassModel.findById(id);

  return { data: result };
};

const updateClass = async (id: string, payload: any) => {
  const result = await ClassModel.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  return { data: result };
};

// soft delete
const softDeleteClass = async (id: string) => {
  const result = await ClassModel.findByIdAndUpdate(
    id,
    { isDeleted: true, isActive: false },
    { new: true }
  );

  return { data: result };
};

const deleteClass = async (id: string) => {
  const result = await ClassModel.findByIdAndDelete(
    id
  );

  return { data: result };
};
export const ClassService = {
  createClass,
  getAllClasses,
  getSingleClass,
  updateClass,
  softDeleteClass,
  deleteClass,
  getAllTrashClasses
};