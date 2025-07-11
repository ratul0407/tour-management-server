/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import { userServices } from "./user.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";

const createUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await userServices.createUser(req.body);

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      message: "User created successfully!",
      data: user,
      success: true,
    });
    // res.status(httpStatus.CREATED).json({
    //   message: "User created successfully",
    //   user,
    // });
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
    // res.status(httpStatus.OK).json({
    //   success: true,
    //   message: "All users retrieved",
    //   users,
    // });
  }
);
export const userControllers = {
  createUser,

  getAllUsers,
};
