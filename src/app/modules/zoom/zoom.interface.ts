export interface IZoomMeeting {
  meetingId: string;
  topic: string;
  status: string;
  startTime: string;
  duration: number;
  timezone: string;
  password: string;
  joinUrl: string;
  startUrl: string;
  hostId: string;
  hostEmail: string;
  createdAt: Date;
}