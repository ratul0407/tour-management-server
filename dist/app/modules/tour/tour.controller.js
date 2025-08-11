"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TourController = void 0;
const catchAsync_1 = require("../../utils/catchAsync");
const tour_service_1 = require("./tour.service");
const sendResponse_1 = require("../../utils/sendResponse");
const createTour = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const payload = Object.assign(Object.assign({}, req.body), { images: (_a = req.files) === null || _a === void 0 ? void 0 : _a.map((file) => file.path) });
    console.log(req.files);
    const result = yield tour_service_1.TourService.createTour(payload);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 201,
        success: true,
        message: "Tour created successfully!",
        data: result,
    });
}));
const getAllTour = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query;
    const result = yield tour_service_1.TourService.getAllTours(query);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 201,
        success: true,
        message: "All tours retrieved successfully!",
        data: result,
    });
}));
const getSingleTour = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const slug = req.params.slug;
    const result = yield tour_service_1.TourService.getSingleTour(slug);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 201,
        success: true,
        message: "Tour retrieved successfully!",
        data: result,
    });
}));
const updateTour = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const payload = Object.assign(Object.assign({}, req.body), { images: req.files.map((file) => file.path) });
    const result = yield tour_service_1.TourService.updateTour(id, payload);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 201,
        success: true,
        message: "Tour updated successfully!",
        data: result,
    });
}));
const deleteTour = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    console.log(id);
    const result = yield tour_service_1.TourService.deleteTour(id);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 201,
        success: true,
        message: "Tour deleted successfully!",
        data: result,
    });
}));
const createTourType = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield tour_service_1.TourService.createTourType(req.body);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 201,
        message: "Tour Type created successfully!",
        success: true,
        data: result,
    });
}));
const getAllTourType = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query;
    const result = yield tour_service_1.TourService.getAllTourType(query);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        message: "All Tour Types retrieved successfully!",
        statusCode: 201,
        data: result,
    });
}));
const updateTourType = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const updatedTourType = yield tour_service_1.TourService.updateTourType(id, req.body);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 201,
        message: "Tour type Updated successfully!",
        data: updatedTourType,
        success: true,
    });
}));
const deleteTourType = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    console.log(id);
    const result = yield tour_service_1.TourService.deleteTourType(id);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 201,
        message: "Tour type deleted successfully!",
        success: true,
        data: result,
    });
}));
exports.TourController = {
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
