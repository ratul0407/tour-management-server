/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, request, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { TourService } from "./tour.service";
import { sendResponse } from "../../utils/sendResponse";
import { ITour } from "./tour.interface";

const createTour = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload: ITour = {
      ...req.body,
      images: (req.files as Express.Multer.File[])?.map((file) => file.path),
    };
    console.log(req.files);
    const result = await TourService.createTour(payload);
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
    const query = req.query;
    const result = await TourService.getAllTours(
      query as Record<string, string>
    );
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "All tours retrieved successfully!",
      data: result,
    });
  }
);

const getSingleTour = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const slug = req.params.slug;
    const result = await TourService.getSingleTour(slug);
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Tour retrieved successfully!",
      data: result,
    });
  }
);
const updateTour = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const payload: ITour = {
      ...req.body,
      images: (req.files as Express.Multer.File[]).map((file) => file.path),
    };
    const result = await TourService.updateTour(id, payload);
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
    console.log(id);
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
    const query = req.query;
    const result = await TourService.getAllTourType(
      query as Record<string, string>
    );
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
    console.log(id);
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
  getSingleTour,
  updateTour,
  deleteTour,
  createTourType,
  getAllTourType,

  updateTourType,
  deleteTourType,
};
