import { Types } from "mongoose";

export enum RecordedVideoStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    DELETED = "DELETED",
}

export interface ICourseRecordedVideo {
    course: Types.ObjectId; 
    title: string;
    description?: string;
    videoUrl: string;
    thumbnailUrl?: string;
    status: RecordedVideoStatus;
    createdBy?: string; 
    isDeleted?: boolean;
}