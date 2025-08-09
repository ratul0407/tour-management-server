/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { StatsService } from "./stats.service";
import { sendResponse } from "../../utils/sendResponse";

const getUserStats = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await StatsService.getUserStats();
    sendResponse(res, {
      success: true,
      statusCode: 201,
      message: "User statistics retrieved",
      data: result,
    });
  }
);

const getBookingStats = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await StatsService.getBookingStats();
    sendResponse(res, {
      success: true,
      statusCode: 201,
      message: "User statistics retrieved",
      data: result,
    });
  }
);
const getPaymentStats = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await StatsService.getPaymentStats();
    sendResponse(res, {
      success: true,
      statusCode: 201,
      message: "User statistics retrieved",
      data: result,
    });
  }
);
const getTourStats = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await StatsService.getTourStats();
    sendResponse(res, {
      success: true,
      statusCode: 201,
      message: "User statistics retrieved",
      data: result,
    });
  }
);

export const StatsController = {
  getUserStats,
  getBookingStats,
  getPaymentStats,
  getTourStats,
};
