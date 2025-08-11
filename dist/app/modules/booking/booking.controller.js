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
exports.bookingController = void 0;
const catchAsync_1 = require("../../utils/catchAsync");
const booking_service_1 = require("./booking.service");
const sendResponse_1 = require("../../utils/sendResponse");
const createBooking = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const decoded = req.user;
    const booking = yield booking_service_1.bookingService.createBooking(req.body, decoded.userId);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 201,
        success: true,
        message: "Booking created successfully!",
        data: booking,
    });
}));
const getAllBookings = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield booking_service_1.bookingService.getAllBookings();
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 201,
        success: true,
        message: "All bookings retrieved successfully!",
        data: result,
    });
}));
const getUserBookings = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const decodedToken = req.user;
    const query = req.query;
    const result = yield booking_service_1.bookingService.getUserBookings(decodedToken, query);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: 201,
        data: result,
        message: "User bookings retrieved successfully!",
    });
}));
const getSingleBooking = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
}));
const updateBookingStatus = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    return;
}));
exports.bookingController = {
    createBooking,
    getAllBookings,
    getUserBookings,
    getSingleBooking,
    updateBookingStatus,
};
