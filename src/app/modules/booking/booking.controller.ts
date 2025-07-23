/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { bookingService } from "./booking.service";
import { sendResponse } from "../../utils/sendResponse";
import { JwtPayload } from "jsonwebtoken";

const createBooking = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const decoded = req.user as JwtPayload;
    const booking = await bookingService.createBooking(
      req.body,
      decoded.userId
    );
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Booking created successfully!",
      data: booking,
    });
  }
);
const getAllBookings = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {}
);

const getUserBookings = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {}
);
const getSingleBooking = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
  }
);
const updateBookingStatus = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {}
);
export const bookingController = {
  createBooking,
  getAllBookings,
  getUserBookings,
  getSingleBooking,
  updateBookingStatus,
};
