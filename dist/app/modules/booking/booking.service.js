"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingService = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const appError_1 = __importDefault(require("../../errorHelpers/appError"));
const user_model_1 = require("../user/user.model");
const booking_interface_1 = require("./booking.interface");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const booking_model_1 = require("./booking.model");
const payment_model_1 = require("../payment/payment.model");
const payment_interface_1 = require("../payment/payment.interface");
const tour_model_1 = require("../tour/tour.model");
const sslCommerz_service_1 = require("../../sslCommerz/sslCommerz.service");
const queryBuilder_1 = require("../../utils/queryBuilder");
const getTransactionId_1 = require("../../utils/getTransactionId");
const createBooking = (payload, userId) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const transactionId = (0, getTransactionId_1.getTransactionId)();
    const session = yield booking_model_1.Booking.startSession();
    session.startTransaction();
    try {
      const user = yield user_model_1.User.findById(userId);
      if (
        !(user === null || user === void 0 ? void 0 : user.phone) ||
        !(user === null || user === void 0 ? void 0 : user.address)
      ) {
        throw new appError_1.default(
          http_status_codes_1.default.BAD_REQUEST,
          "Please update your profile to book a tour"
        );
      }
      const tour = yield tour_model_1.Tour.findById(payload.tour).select(
        "costFrom"
      );
      if (!(tour === null || tour === void 0 ? void 0 : tour.costFrom)) {
        throw new appError_1.default(
          http_status_codes_1.default.BAD_REQUEST,
          "No tour cost found"
        );
      }
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const amount = Number(tour.costFrom) * Number(payload.guestCount);
      const booking = yield booking_model_1.Booking.create(
        [
          Object.assign(
            {
              user: userId,
              status: booking_interface_1.BOOKING_STATUS.PENDING,
            },
            payload
          ),
        ],
        { session }
      );
      const updatedUser = yield user_model_1.User.findByIdAndUpdate(
        userId,
        {
          $push: { bookings: booking[0]._id },
        },
        { session }
      );
      const payment = yield payment_model_1.Payment.create(
        [
          {
            booking: booking[0]._id,
            status: payment_interface_1.PAYMENT_STATUS.PENDING,
            transactionId: transactionId,
            amount: amount,
          },
        ],
        { session }
      );
      const updatedBooking = yield booking_model_1.Booking.findByIdAndUpdate(
        booking[0]._id,
        {
          payment: payment[0]._id,
        },
        { new: true, runValidators: true, session }
      )
        .populate("user", "name email phone address location")
        .populate("tour", "title location costFrom")
        .populate("payment");
      const userAddress = (
        updatedBooking === null || updatedBooking === void 0
          ? void 0
          : updatedBooking.user
      ).address;
      const userEmail = (
        updatedBooking === null || updatedBooking === void 0
          ? void 0
          : updatedBooking.user
      ).email;
      const userPhoneNumber = (
        updatedBooking === null || updatedBooking === void 0
          ? void 0
          : updatedBooking.user
      ).phone;
      const userName = (
        updatedBooking === null || updatedBooking === void 0
          ? void 0
          : updatedBooking.user
      ).name;
      const sslPayload = {
        address: userAddress,
        email: userEmail,
        phoneNumber: userPhoneNumber,
        name: userName,
        amount: amount,
        transactionId: transactionId,
      };
      const sslPayment = yield sslCommerz_service_1.SSLService.sslPaymentInit(
        sslPayload
      );
      yield session.commitTransaction(); // transaction
      session.endSession();
      return {
        paymentUrl: sslPayment.GatewayPageURL,
        booking: updatedBooking,
      };
    } catch (error) {
      yield session.abortTransaction(); ///rollback
      session.endSession();
      throw error;
    }
  });
const getUserBookings = (token, query) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = token;
    const user = yield user_model_1.User.findOne({ _id: userId });
    const queryBuilder = yield new queryBuilder_1.QueryBuilder(
      booking_model_1.Booking.find({
        _id: { $in: user === null || user === void 0 ? void 0 : user.bookings },
      }),
      query
    );
    const bookings = yield queryBuilder.filter().sort().fields().paginate();
    const [data, meta] = yield Promise.all([
      bookings.build(),
      bookings.getMeta(),
    ]);
    return {
      meta,
      data,
    };
  });
const getAllBookings = () =>
  __awaiter(void 0, void 0, void 0, function* () {
    return {};
  });
exports.bookingService = {
  createBooking,
  getAllBookings,
  getUserBookings,
};
