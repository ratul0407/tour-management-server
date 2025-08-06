/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import { userServices } from "./user.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { JwtPayload } from "jsonwebtoken";

const createUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    console.log(req.body, "api was here!");
    const user = await userServices.createUser(req.body);
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      message: "User created successfully!",
      data: user,
      success: true,
    });
  }
);

const getAllUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;
    const result = await userServices.getAllUsers(
      query as Record<string, string>
    );

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      message: "All users retrieved successfully!",
      data: result.data,
      success: true,
      meta: result.meta,
    });
  }
);

const updateUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id;
    // const token = req.headers.authorization;
    // const verifiedToken = verifyToken(
    //   token as string,
    //   envVars.JWT_ACCESS_SECRET
    // ) as JwtPayload;
    const verifiedToken = req.user;
    const payload = req.body;
    console.log("I was here!");
    const user = await userServices.updateUser(
      userId,
      payload,
      verifiedToken as JwtPayload
    );
    console.log(user);
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      message: "User updated successfully!",
      success: true,
      data: user,
    });
  }
);

const getMe = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.user as JwtPayload;
    const result = await userServices.getMe(userId);
    sendResponse(res, {
      success: true,
      statusCode: 201,
      message: "User retrieved successfully!",
      data: result,
    });
  }
);
export const userControllers = {
  createUser,
  getAllUsers,
  updateUser,
  getMe,
};
