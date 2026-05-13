import { SubjectModel } from "./subject.model";

const createSubject = async (payload: any) => {
  const result = await SubjectModel.create(payload);

  return { data: result };
};

const getAllSubjects = async () => {
  const result = await SubjectModel.find({
    isDeleted: false,
  });

  return { data: result };
};

const getAllTrashSubjects = async () => {
  const result = await SubjectModel.find({
    isDeleted: true,
  });

  return { data: result };
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