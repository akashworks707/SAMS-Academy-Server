import httpStatus from "http-status-codes";
import { IUser, Role } from "../user/user.interface";
import { User } from "../user/user.model";
import AppError from "../../errorHelpers/appError";
import bcryptjs from "bcryptjs";
import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../../config/env";
import {
  createNewAccessTokenWithRefreshToken,
  createUserTokens,
} from "../../utils/userTokens";
import { OAuth2Client } from "google-auth-library";

const credentialsLogin = async (payload: Partial<IUser>) => {
  const { email, password } = payload;

  const isUserExist = await User.findOne({ email });

  if (!isUserExist) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "User does not exist! Please register.",
    );
  }

  const isPasswordMatched = await bcryptjs.compare(
    password as string,
    isUserExist.password as string,
  );

  if (!isPasswordMatched) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Incorrect password!");
  }

  const userTokens = createUserTokens(isUserExist);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: pass, ...rest } = isUserExist.toObject();

  return {
    email: isUserExist.email,
    accessToken: userTokens.accessToken,
    refreshToken: userTokens.refreshToken,
    user: rest,
  };
};

const googleClient: any = new OAuth2Client(envVars.GOOGLE_CLIENT_ID);

const googleLogin = async (googleToken: string) => {
  const ticket = await googleClient.verifyIdToken({
    idToken: googleToken,
    audience: envVars.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();

  if (!payload || !payload.email) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid Google token");
  }

  const { email, name, picture, email_verified } = payload;

  if (!email_verified) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Google email not verified");
  }

  let user = await User.findOne({ email });

  // First login -> create account
  if (!user) {
    user = await User.create({
      name: name || "Google User",
      email,
      picture: picture || "",
      role: Role.STUDENT,
      phone: "",
      password: "",
    });
  }

  const userTokens = createUserTokens(user);

  const { password: pass, ...rest } = user.toObject();

  return {
    email: user.email,
    accessToken: userTokens.accessToken,
    refreshToken: userTokens.refreshToken,
    user: rest,
    isProfileIncomplete: !user.phone || user.phone === "",
  };
};

const getNewAccessToken = async (refreshToken: string) => {
  const newAccessToken =
    await createNewAccessTokenWithRefreshToken(refreshToken);
  return {
    accessToken: newAccessToken,
  };
};

const changePassword = async (
  oldPassword: string,
  newPassword: string,
  decodedToken: JwtPayload,
) => {
  const user = await User.findById(decodedToken.userId);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const isOldPasswordMatch = await bcryptjs.compare(
    oldPassword,
    user.password as string,
  );
  if (!isOldPasswordMatch) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Old Password does not match");
  }

  user.password = await bcryptjs.hash(
    newPassword,
    Number(envVars.BCRYPT_SALT_ROUND),
  );

  user.save();
};

export const AuthServices = {
  credentialsLogin,
  getNewAccessToken,
  googleLogin,
  changePassword,
};
