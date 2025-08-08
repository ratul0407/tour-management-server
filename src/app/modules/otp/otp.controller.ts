/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { OTPService } from "./otp.service";

const sendOTP = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await OTPService.sendOTP();
  }
);
const verifyOTP = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await OTPService.verifyOTP();
  }
);
export const OTPController = {
  sendOTP,
  verifyOTP,
};
