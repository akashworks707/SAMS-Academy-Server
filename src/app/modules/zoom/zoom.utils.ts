import axios from "axios";
import jwt from "jsonwebtoken";

export const getZoomAccessToken = async () => {
  const response = await axios.post(
    `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${process.env.ZOOM_ACCOUNT_ID}`,
    {},
    {
      auth: {
        username: process.env.ZOOM_CLIENT_ID!,
        password: process.env.ZOOM_CLIENT_SECRET!,
      },
    }
  );

  return response.data.access_token;
};

export const generateSignature = (
  meetingNumber: string,
  role: number
) => {
  const iat = Math.floor(Date.now() / 1000);

  const payload = {
    sdkKey: process.env.ZOOM_SDK_KEY,
    mn: meetingNumber,
    role,
    iat,
    exp: iat + 60 * 60,
    tokenExp: iat + 60 * 60,
  };

  return jwt.sign(payload, process.env.ZOOM_SDK_SECRET!);
};