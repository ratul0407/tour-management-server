/* eslint-disable @typescript-eslint/no-non-null-assertion */
import AppError from "../../errorHelpers/appError";
import { IAuthProvider, IsActive, IUser } from "../user/user.interface";
import { User } from "../user/user.model";
import httpStatus from "http-status-codes";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

import {
  createNewAccessTokenWithRefreshToken,
  createUserTokens,
} from "../../utils/userTokens";
import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../../config/env";
import { sendEmail } from "../../utils/sendEmail";

const credentialsLogin = async (payload: Partial<IUser>) => {
  const { email, password: pass } = payload;
  const isUserExists = await User.findOne({ email });

  if (!isUserExists) {
    throw new AppError(httpStatus.BAD_REQUEST, "Email does not exist");
  }

  const isPasswordMatched = await bcryptjs.compare(
    pass as string,
    isUserExists.password as string
  );
  if (!isPasswordMatched) {
    throw new AppError(httpStatus.BAD_REQUEST, "Incorrect Password");
  }

  const userTokens = createUserTokens(isUserExists);

  return {
    accessToken: userTokens.accessToken,
    refreshToken: userTokens.refreshToken,
  };
};

const getNewAccessToken = async (refreshToken: string) => {
  const newAccessToken = await createNewAccessTokenWithRefreshToken(
    refreshToken
  );
  return { accessToken: newAccessToken };
};

const changePassword = async (
  oldPassword: string,
  newPassword: string,
  decodedToken: JwtPayload
) => {
  const user = await User.findById(decodedToken.userId);

  const isOldPasswordMatch = await bcryptjs.compare(
    oldPassword as string,
    user?.password as string
  );
  if (!isOldPasswordMatch) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Old password does not match");
  }

  user!.password = await bcryptjs.hash(
    newPassword,
    Number(envVars.BCRYPT_SALT_ROUND)
  );

  user?.save();
};

const setPassword = async (userId: string, plainPassword: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, "User does not exist");
  }
  if (
    user.password &&
    user.auths.some((providerObj) => providerObj.provider === "google")
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You have already set your password, now you can change your password from your profile"
    );
  }

  const hashedPassword = await bcryptjs.hash(
    plainPassword,
    Number(envVars.BCRYPT_SALT_ROUND)
  );

  const auths: IAuthProvider[] = [
    ...user.auths,
    { provider: "credentials", providerId: user.email },
  ];
  user.password = hashedPassword;
  user.auths = auths;

  await user.save();
};

const forgetPassword = async (email: string) => {
  const isUserExists = await User.findOne({ email });

  if (!isUserExists) {
    throw new AppError(httpStatus.BAD_REQUEST, "User does not exist");
  }
  if (!isUserExists.isVerified) {
    throw new AppError(401, "User is not verified");
  }
  if (isUserExists.isDeleted) {
    throw new AppError(401, "User is deleted");
  }
  if (
    isUserExists.isActive === IsActive.BLOCKED ||
    isUserExists.isActive === IsActive.INACTIVE
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `User is ${isUserExists.isActive}`
    );
  }

  const JwtPayload = {
    userId: isUserExists._id,
    email: isUserExists.email,
    role: isUserExists.role,
  };

  const resetToken = jwt.sign(JwtPayload, envVars.JWT_ACCESS_SECRET, {
    expiresIn: "10m",
  });

  const resetUILink = `${envVars.FRONTEND_URL}/reset-password?id=${isUserExists._id}&token=${resetToken}`;

  sendEmail({
    to: isUserExists.email,
    subject: "Password reset",
    templateName: "forgetPassword",
    templateData: {
      name: isUserExists.name,
      resetUILink,
    },
  });
};

const resetPassword = async (
  newPassword: string,
  id: string,
  token: JwtPayload
) => {
  if (id !== token.userId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You cannot reset your password"
    );
  }
  const isUserExists = await User.findById(token.userId);

  if (!isUserExists) {
    throw new AppError(httpStatus.BAD_REQUEST, "Your does not exist");
  }

  const hashedPassword = await bcryptjs.hash(
    newPassword,
    Number(envVars.BCRYPT_SALT_ROUND)
  );
  isUserExists.password = hashedPassword;
  await isUserExists.save();
};
export const AuthServices = {
  credentialsLogin,
  getNewAccessToken,
  changePassword,
  setPassword,
  forgetPassword,
  resetPassword,
};

//http://localhost:5173/reset-password?id=6878b55167ccccc419d02fd0&token=
