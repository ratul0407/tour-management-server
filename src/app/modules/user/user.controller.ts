/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import { userServices } from "./user.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { verifyToken } from "../../utils/jwt";
import { envVars } from "../../config/env";
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
    const result = await userServices.getAllUsers();

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
    const token = req.headers.authorization;
    const verifiedToken = verifyToken(
      token as string,
      envVars.JWT_ACCESS_SECRET
    ) as JwtPayload;

    const payload = req.body;
    console.log("I was here!");
    const user = await userServices.updateUser(userId, payload, verifiedToken);
    console.log(user);
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      message: "User updated successfully!",
      success: true,
      data: user,
    });
  }
);
export const userControllers = {
  createUser,
  getAllUsers,
  updateUser,
};
