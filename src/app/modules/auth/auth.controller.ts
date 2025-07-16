/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { AuthServices } from "./auth.service";
const credentialsLogin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    console.log(req.body, "api was here!");
    const loginInfo = await AuthServices.credentialsLogin(req.body);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: "Login Successful!",
      data: loginInfo,
      success: true,
    });
  }
);

const getNewAccessToken = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies.refreshToken;
    const tokenInfo = await AuthServices.getNewAccessToken(refreshToken);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: "Access Token created successfully!",
      data: tokenInfo,
      success: true,
    });
  }
);
export const authControllers = {
  credentialsLogin,
  getNewAccessToken,
};
