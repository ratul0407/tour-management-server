/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, request, Request, Response } from "express";
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

const getAllTour = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await TourService.getAllTours();
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "All tours retrieved successfully!",
      data: result,
    });
  }
);
const updateTour = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const result = await TourService.updateTour(id, req.body);
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Tour updated successfully!",
      data: result,
    });
  }
);

const deleteTour = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const result = await TourService.deleteTour(id);
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Tour deleted successfully!",
      data: result,
    });
  }
);

const createTourType = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await TourService.createTourType(req.body);
    sendResponse(res, {
      statusCode: 201,
      message: "Tour Type created successfully!",
      success: true,
      data: result,
    });
  }
);

const getAllTourType = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await TourService.getAllTourType();
    sendResponse(res, {
      success: true,
      message: "All Tour Types retrieved successfully!",
      statusCode: 201,
      data: result,
    });
  }
);
const updateTourType = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const updatedTourType = await TourService.updateTourType(id, req.body);
    sendResponse(res, {
      statusCode: 201,
      message: "Tour type Updated successfully!",
      data: updatedTourType,
      success: true,
    });
  }
);

const deleteTourType = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const result = await TourService.deleteTourType(id);
    sendResponse(res, {
      statusCode: 201,
      message: "Tour type deleted successfully!",
      success: true,
      data: result,
    });
  }
);
export const TourController = {
  createTour,
  getAllTour,
  updateTour,
  deleteTour,
  createTourType,
  getAllTourType,
  updateTourType,
  deleteTourType,
};
