import AppError from "../../errorHelpers/appError";
import { IAuthProvider, IUser, Role } from "./user.interface";
import { User } from "./user.model";
import httpStatus from "http-status-codes";
import bcryptjs from "bcryptjs";
import { envVars } from "../../config/env";
import { JwtPayload } from "jsonwebtoken";

const createUser = async (payload: Partial<IUser>) => {
  const { email, password, ...rest } = payload;
  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new AppError(httpStatus.BAD_REQUEST, "User Already Exists");
  }

  const hashedPassword = await bcryptjs.hash(
    password as string,
    Number(envVars.BCRYPT_SALT_ROUND)
  );
  const authProvider: IAuthProvider = {
    provider: "credentials",
    providerId: email as string,
  };
  const user = await User.create({
    email,
    password: hashedPassword,
    auths: [authProvider],
    ...rest,
  });
  return {
    user,
  };
};

const getAllUsers = async () => {
  const users = await User.find({});
  const totalUsers = await User.countDocuments();
  return {
    data: users,
    meta: {
      total: totalUsers,
    },
  };
};

const updateUser = async (
  userId: string,
  payload: Partial<IUser>,
  decoded: JwtPayload
) => {
  const isUserExists = await User.findById(userId);
  console.log(payload);
  if (!isUserExists) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }
  if (payload.role) {
    if (decoded.role === Role.USER || decoded.role === Role.GUIDE) {
      throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
    }

    if (payload.role === Role.SUPER_ADMIN && decoded.role === Role.ADMIN) {
      throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
    }
  }

  if (payload.isActive || payload.isDeleted || payload.isVerified) {
    if (decoded.role === Role.USER || decoded.role === Role.GUIDE) {
      throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
    }
  }

  if (payload.password) {
    payload.password = await bcryptjs.hash(
      payload.password,
      envVars.BCRYPT_SALT_ROUND
    );
  }
  const updatedUser = await User.findByIdAndUpdate(userId, payload, {
    new: true,
    runValidators: true,
  });

  return updatedUser;
};
export const userServices = {
  createUser,
  getAllUsers,
  updateUser,
};
