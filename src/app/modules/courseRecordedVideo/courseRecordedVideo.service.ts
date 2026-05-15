// recordedVideo.service.ts

import { QueryBuilder } from "../../utils/QueryBuilder";
import { recordedVideoSearchableFields } from "./courseRecordedVideo.constants";
import { ICourseRecordedVideo } from "./courseRecordedVideo.interface";
import { CourseRecordedVideoModel } from "./courseRecordedVideo.model";

// create
const createRecordedVideo = async (payload: ICourseRecordedVideo) => {
  const result = await CourseRecordedVideoModel.create(payload);

  return { data: result };
};

// get all
const getAllRecordedVideos = async (query: Record<string, string>) => {
  const baseQuery = CourseRecordedVideoModel.find({ isDeleted: false });

  const queryBuilder = new QueryBuilder(baseQuery, query);

  const videoData = queryBuilder
    .filter()
    .search(recordedVideoSearchableFields)
    .sort()
    .fields()
    .paginate();

  const [data, meta] = await Promise.all([
    videoData.build(),
    queryBuilder.getMeta(),
  ]);

  return {
    data,
    meta,
  };
};

// trash
const getAllTrashRecordedVideos = async (query: Record<string, string>) => {
  const baseQuery = CourseRecordedVideoModel.find({ isDeleted: true });

  const queryBuilder = new QueryBuilder(baseQuery, query);

  const videoData = queryBuilder
    .filter()
    .search(recordedVideoSearchableFields)
    .sort()
    .fields()
    .paginate();

  const [data, meta] = await Promise.all([
    videoData.build(),
    queryBuilder.getMeta(),
  ]);

  return {
    data,
    meta,
  };
};

// single
const getSingleRecordedVideo = async (id: string) => {
  const result = await CourseRecordedVideoModel.findById(id);

  return { data: result };
};

// update
const updateRecordedVideo = async (id: string, payload: Partial<ICourseRecordedVideo>) => {
  const result = await CourseRecordedVideoModel.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  return { data: result };
};

// soft delete
const softDeleteRecordedVideo = async (id: string) => {
  const result = await CourseRecordedVideoModel.findByIdAndUpdate(
    id,
    { isDeleted: true, status: "DELETED" },
    { new: true }
  );

  return { data: result };
};

// hard delete
const deleteRecordedVideo = async (id: string) => {
  const result = await CourseRecordedVideoModel.findByIdAndDelete(id);

  return { data: result };
};

export const CourseRecordedVideoService = {
  createRecordedVideo,
  getAllRecordedVideos,
  getSingleRecordedVideo,
  updateRecordedVideo,
  softDeleteRecordedVideo,
  deleteRecordedVideo,
  getAllTrashRecordedVideos,
};