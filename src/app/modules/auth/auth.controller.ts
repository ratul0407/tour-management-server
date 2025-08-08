/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { AuthServices } from "./auth.service";
import AppError from "../../errorHelpers/appError";
import { setAuthCookie } from "../../utils/setCookie";
import { createUserTokens } from "../../utils/userTokens";
import { envVars } from "../../config/env";
import { JwtPayload } from "jsonwebtoken";
import passport from "passport";

const credentialsLogin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // const loginInfo = await AuthServices.credentialsLogin(req.body);

    passport.authenticate("local", async (error: any, user: any, info: any) => {
      if (error) {
        console.log("from errs");
        return next(new AppError(401, error));
      }

      if (!user) {
        console.log("from not user");
        return next(new AppError(401, info.message));
      }
      const userTokens = createUserTokens(user);

      delete user.toObject().password;
      setAuthCookie(res, userTokens);
      sendResponse(res, {
        statusCode: httpStatus.OK,
        message: "Login Successful!",
        data: {
          accessToken: userTokens.accessToken,
          refreshToken: userTokens.refreshToken,
          user,
        },
        success: true,
      });
    })(req, res, next);
  }
);

const getNewAccessToken = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "No refresh token received from the cookies"
      );
    }
    const tokenInfo = await AuthServices.getNewAccessToken(refreshToken);
    setAuthCookie(res, tokenInfo);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: "Access Token created successfully!",
      data: tokenInfo,
      success: true,
    });
  }
);

const logOut = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: "User logged Out successfully!",
      data: null,
      success: true,
    });
  }
);

const changePassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user;
    const newPassword = req.body.password;
    const oldPassword = req.body.oldPassword;
    await AuthServices.changePassword(
      oldPassword,
      newPassword,
      decodedToken as JwtPayload
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Password changed successfully!",
      data: null,
    });
  }
);

const googleCallBack = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    let redirectTo = req.query.state ? (req.query.state as string) : "";
    if (redirectTo.startsWith("/")) {
      redirectTo = redirectTo.slice(1);
    }
    console.log(user);
    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }
    const tokenInfo = createUserTokens(user);
    setAuthCookie(res, tokenInfo);

    res.redirect(`${envVars.FRONTEND_URL}/${redirectTo}`);
  }
);

const setPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.user as JwtPayload;
    const { password } = req.body;
    const result = await AuthServices.setPassword(userId, password);
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "User's password updated successfully!",
      data: result,
    });
  }
);

const forgetPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;
    await AuthServices.forgetPassword(email);
    sendResponse(res, {
      success: true,
      statusCode: 201,
      message: "Email sent successfully",
      data: null,
    });
  }
);

const resetPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const token = req.user as JwtPayload;
    const { newPassword, id } = req.body;

    const result = await AuthServices.resetPassword(newPassword, id, token);
    sendResponse(res, {
      success: true,
      statusCode: 201,
      message: "Password changed successfully!",
      data: result,
    });
  }
);
export const authControllers = {
  credentialsLogin,
  getNewAccessToken,
  logOut,
  changePassword,
  googleCallBack,
  setPassword,
  forgetPassword,
  resetPassword,
};
