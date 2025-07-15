import AppError from "../../errorHelpers/appError";
import { IUser } from "../user/user.interface";
import { User } from "../user/user.model";
import httpStatus from "http-status-codes";
import bcryptjs from "bcryptjs";
import { generateToken } from "../../utils/jwt";
import { envVars } from "../../config/env";
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
};
