/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { TourService } from "./tour.service";
import { sendResponse } from "../../utils/sendResponse";

const createTour = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await TourService.createTour(req.body);
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Tour created successfully!",
      data: result,
    });
  }
);

export const TourController = {
  createTour,
};
