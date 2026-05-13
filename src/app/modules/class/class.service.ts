import { ClassModel } from "./class.model";

const createClass = async (payload: any) => {
  const result = await ClassModel.create(payload);

  return { data: result };
};

const getAllClasses = async () => {
  const result = await ClassModel.find({ isDeleted: false });

  return { data: result };
};

const getAllTrashClasses = async () => {
  const result = await ClassModel.find({ isDeleted: true });

  return { data: result };
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