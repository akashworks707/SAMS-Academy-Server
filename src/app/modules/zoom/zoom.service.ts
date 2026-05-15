
import axios from "axios";
import { getZoomAccessToken } from "../../utils/zoomUtils";
import { ZoomMeeting } from "./zoom.model";
import { liveMeetingStatus } from "./zoom.interface";

export const createZoomMeeting = async (payload: any) => {
  try {
    const token = await getZoomAccessToken();

    const response = await axios.post(
      "https://api.zoom.us/v2/users/me/meetings",
      {
        topic: payload.topic,
        type: 2,
        start_time: payload.startTime,
        duration: payload.duration,
        timezone: payload.timezone,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const meeting = response.data;

    return await ZoomMeeting.create({
      courseId: payload.courseId,
      classTitle: payload.classTitle,
      topic: meeting.topic,
      meetingId: String(meeting.id),
      status: liveMeetingStatus.SCHEDULED,
      startTime: new Date(meeting.start_time),
      duration: meeting.duration,
      timezone: meeting.timezone,
      password: meeting.password,
      joinUrl: meeting.join_url,
      startUrl: meeting.start_url,
      hostId: meeting.host_id,
      hostEmail: meeting.host_email,
    });

  } catch (err) {
    console.log("❌ Zoom Service Error:", err);
    throw err;
  }
};
