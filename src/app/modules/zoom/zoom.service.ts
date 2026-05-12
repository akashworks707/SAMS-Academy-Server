
import axios from "axios";
import { getZoomAccessToken } from "./zoom.utils";
import { ZoomMeeting } from "./zoom.model";

export const createZoomMeeting = async () => {
  const token = await getZoomAccessToken();

  const response = await axios.post(
    "https://api.zoom.us/v2/users/me/meetings",
    {
      topic: "Live Class",
      type: 2,
      duration: 60,
      settings: {
        join_before_host: true,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const meeting = response.data;

  await ZoomMeeting.create({
    meetingId: String(meeting.id),
    topic: meeting.topic,
    status: meeting.status,
    startTime: meeting.start_time,
    duration: meeting.duration,
    timezone: meeting.timezone,
    password: meeting.password,
    joinUrl: meeting.join_url,
    startUrl: meeting.start_url,
    hostId: meeting.host_id,
    hostEmail: meeting.host_email,
  });

  return meeting;
};




// import axios from "axios";
// import { getZoomAccessToken } from "./zoom.utils";
// import { ZoomMeeting } from "./zoom.model";

// export const createZoomMeetingService = async () => {
//   const token = await getZoomAccessToken();

//   const response = await axios.post(
//     "https://api.zoom.us/v2/users/me/meetings",
//     {
//       topic: "Live Class",
//       type: 2,
//       duration: 60,
//       settings: {
//         join_before_host: true,
//       },
//     },
//     {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     }
//   );

//   const meeting = response.data;

//   await ZoomMeeting.create({
//     meetingId: String(meeting.id),
//     topic: meeting.topic,
//     status: meeting.status,
//     startTime: meeting.start_time,
//     duration: meeting.duration,
//     timezone: meeting.timezone,
//     password: meeting.password,
//     joinUrl: meeting.join_url,
//     startUrl: meeting.start_url,
//     hostId: meeting.host_id,
//     hostEmail: meeting.host_email,
//   });

//   return meeting;
// };

// export const getMeetingsService = async () => {
//   const meetings = await ZoomMeeting.find().sort({ createdAt: -1 });
//   return meetings;
// };

// export const deleteMeetingService = async (meetingId: string) => {
//   const meeting = await ZoomMeeting.findOne({ meetingId });
//   if (!meeting) {
//     throw new Error("Meeting not found");
//   }

//   // Zoom API থেকেও delete করো
//   try {
//     const token = await getZoomAccessToken();
//     await axios.delete(`https://api.zoom.us/v2/meetings/${meetingId}`, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });
//   } catch (error) {
//     console.error("Zoom API delete error:", error);
//   }

//   await ZoomMeeting.findOneAndDelete({ meetingId });
//   return meeting;
// };