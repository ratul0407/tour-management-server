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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const cloudinary_config_1 = require("../../config/cloudinary.config");
const appError_1 = __importDefault(require("../../errorHelpers/appError"));
const sslCommerz_service_1 = require("../../sslCommerz/sslCommerz.service");
const invoice_1 = require("../../utils/invoice");
const sendEmail_1 = require("../../utils/sendEmail");
const booking_interface_1 = require("../booking/booking.interface");
const booking_model_1 = require("../booking/booking.model");
const payment_interface_1 = require("./payment.interface");
const payment_model_1 = require("./payment.model");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const successPayment = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield booking_model_1.Booking.startSession();
    session.startTransaction();
    try {
        const updatedPayment = yield payment_model_1.Payment.findOneAndUpdate({ transactionId: query.transactionId }, [
            {
                $set: { status: payment_interface_1.PAYMENT_STATUS.PAID },
            },
        ], { session });
        if (!updatedPayment) {
            throw new appError_1.default(401, "Payment not found");
        }
        const updatedBooking = yield booking_model_1.Booking.findByIdAndUpdate(updatedPayment === null || updatedPayment === void 0 ? void 0 : updatedPayment.booking, {
            status: booking_interface_1.BOOKING_STATUS.COMPLETE,
        }, { new: true, runValidators: true, session })
            .populate("tour", "title")
            .populate("user", "name email");
        if (!updatedBooking) {
            throw new appError_1.default(http_status_codes_1.default.BAD_REQUEST, "Booking was not found");
        }
        console.log(updatedPayment);
        const invoiceData = {
            bookingDate: updatedBooking.createdAt,
            guestCount: updatedBooking.guestCount,
            totalAmount: updatedPayment.amount,
            tourTitle: updatedBooking.tour.title,
            transactionId: updatedPayment.transactionId,
            userName: updatedBooking.user.name,
        };
        const pdfBuffer = yield (0, invoice_1.generatePdf)(invoiceData);
        const cloudinaryResult = yield (0, cloudinary_config_1.uploadBufferToCloudinary)(pdfBuffer, "invoice");
        console.log(cloudinaryResult, "from line 61");
        if (!cloudinaryResult) {
            throw new appError_1.default(401, "Error uploading pdf");
        }
        const setInvoice = yield payment_model_1.Payment.findByIdAndUpdate(updatedPayment._id, {
            invoiceUrl: cloudinaryResult.secure_url,
        }, { runValidators: true, session });
        console.log(setInvoice, "from line 70");
        yield (0, sendEmail_1.sendEmail)({
            to: updatedBooking.user.email,
            subject: "Payment Invoice",
            templateName: "invoice",
            templateData: invoiceData,
            attachments: [
                {
                    filename: "invoice.pdf",
                    content: pdfBuffer,
                    contentType: "application-pdf ",
                },
            ],
        });
        yield session.commitTransaction(); // transaction
        session.endSession();
        return {
            success: true,
            message: "Payment completed successfully",
        };
    }
    catch (error) {
        console.log(error);
        yield session.abortTransaction(); ///rollback
        session.endSession();
        throw error;
    }
});
const failPayment = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield booking_model_1.Booking.startSession();
    session.startTransaction();
    try {
        const updatedPayment = yield payment_model_1.Payment.findOneAndUpdate({ transactionId: query.transactionId }, [
            {
                $set: { status: payment_interface_1.PAYMENT_STATUS.FAILED },
            },
        ], { session });
        yield booking_model_1.Booking.findByIdAndUpdate(updatedPayment === null || updatedPayment === void 0 ? void 0 : updatedPayment.booking, {
            status: booking_interface_1.BOOKING_STATUS.FAILED,
        }, { runValidators: true, session });
        yield session.commitTransaction(); // transaction
        session.endSession();
        return {
            success: false,
            message: "Payment Failed",
        };
    }
    catch (error) {
        console.log(error);
        yield session.abortTransaction(); ///rollback
        session.endSession();
        throw error;
    }
});
const cancelPayment = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield booking_model_1.Booking.startSession();
    session.startTransaction();
    try {
        const updatedPayment = yield payment_model_1.Payment.findOneAndUpdate({ transactionId: query.transactionId }, [
            {
                $set: { status: payment_interface_1.PAYMENT_STATUS.CANCELLED },
            },
        ], { session });
        yield booking_model_1.Booking.findByIdAndUpdate(updatedPayment === null || updatedPayment === void 0 ? void 0 : updatedPayment.booking, {
            status: booking_interface_1.BOOKING_STATUS.CANCEL,
        }, { runValidators: true, session });
        yield session.commitTransaction(); // transaction
        session.endSession();
        return {
            success: false,
            message: "Payment Cancelled",
        };
    }
    catch (error) {
        console.log(error);
        yield session.abortTransaction(); ///rollback
        session.endSession();
        throw error;
    }
});
const initPayment = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const payment = yield payment_model_1.Payment.findOne({ booking: id });
    if (!payment) {
        throw new appError_1.default(http_status_codes_1.default.NOT_FOUND, "Payment Not Found. You haven't booked this tour.");
    }
    const booking = yield booking_model_1.Booking.findById(payment.booking);
    const userAddress = (booking === null || booking === void 0 ? void 0 : booking.user).address;
    const userEmail = (booking === null || booking === void 0 ? void 0 : booking.user).email;
    const userPhoneNumber = (booking === null || booking === void 0 ? void 0 : booking.user).phone;
    const userName = (booking === null || booking === void 0 ? void 0 : booking.user).name;
    const sslPayload = {
        address: userAddress,
        email: userEmail,
        phoneNumber: userPhoneNumber,
        name: userName,
        amount: payment.amount,
        transactionId: payment.transactionId,
    };
    const sslPayment = yield sslCommerz_service_1.SSLService.sslPaymentInit(sslPayload);
    return {
        paymentUrl: sslPayment.GatewayPageURL,
    };
});
const getInvoiceDownloadUrl = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const payment = yield payment_model_1.Payment.findById(id).select("invoiceUrl");
    if (!payment) {
        throw new appError_1.default(401, "Payment not found");
    }
    if (!payment.invoiceUrl) {
        throw new appError_1.default(401, "No invoice url found");
    }
    return payment.invoiceUrl;
});
exports.PaymentService = {
    successPayment,
    failPayment,
    cancelPayment,
    initPayment,
    getInvoiceDownloadUrl,
};
