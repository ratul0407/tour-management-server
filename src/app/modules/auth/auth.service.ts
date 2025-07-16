import AppError from "../../errorHelpers/appError";
import { IsActive, IUser } from "../user/user.interface";
import { User } from "../user/user.model";
import httpStatus from "http-status-codes";
import bcryptjs from "bcryptjs";

import { createUserTokens } from "../../utils/userTokens";
import { generateToken, verifyToken } from "../../utils/jwt";
import { envVars } from "../../config/env";
import { JwtPayload } from "jsonwebtoken";
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

  // const jwtPayload = {
  //   userId: isUserExists._id,
  //   email: isUserExists.email,
  //   role: isUserExists.role,
  // };
  // const accessToken = generateToken(
  //   jwtPayload,
  //   envVars.JWT_ACCESS_SECRET,
  //   envVars.JWT_ACCESS_EXPIRES
  // );

  // const refreshToken = generateToken(
  //   jwtPayload,
  //   envVars.JWT_REFRESH_SECRET,
  //   envVars.JWT_REFRESH_EXPIRES
  // );

  const userTokens = createUserTokens(isUserExists);

  return {
    accessToken: userTokens.accessToken,
    refreshToken: userTokens.refreshToken,
  };
};

const getNewAccessToken = async (refreshToken: string) => {
  const verifiedRefreshToken = verifyToken(
    refreshToken,
    envVars.JWT_REFRESH_SECRET
  ) as JwtPayload;

  const isUserExists = await User.findOne({
    email: verifiedRefreshToken.email,
  });

  if (!isUserExists) {
    throw new AppError(httpStatus.BAD_REQUEST, "User does not exist");
  }
  if (
    isUserExists?.isActive === IsActive.BLOCKED ||
    isUserExists?.isActive === IsActive.INACTIVE
  ) {
    throw new AppError(httpStatus.BAD_REQUEST, "User is blocked");
  }

  if (isUserExists.isDeleted) {
    throw new AppError(httpStatus.BAD_REQUEST, "User is deleted");
  }

  const jwtPayload = {
    userId: isUserExists._id,
    email: isUserExists.email,
    role: isUserExists.role,
  };

  const accessToken = generateToken(
    jwtPayload,
    envVars.JWT_ACCESS_SECRET,
    envVars.JWT_ACCESS_EXPIRES
  );

  return {
    accessToken,
  };
};
export const AuthServices = {
  credentialsLogin,
  getNewAccessToken,
};
