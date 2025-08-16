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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentController = void 0;
const catchAsync_1 = require("../../utils/catchAsync");
const payment_service_1 = require("./payment.service");
const env_1 = require("../../config/env");
const sendResponse_1 = require("../../utils/sendResponse");
const sslCommerz_service_1 = require("../../sslCommerz/sslCommerz.service");
const successPayment = (0, catchAsync_1.catchAsync)((req, res, next) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query;
    const result = yield payment_service_1.PaymentService.successPayment(query);
    if (result.success) {
      res.redirect(
        `${env_1.envVars.SSL_SUCCESS_FRONTEND_URL}?transactionId=${query.transactionId}&message=${result.message}&amount=${query.amount}&success=${query.status}`
      );
    }
  })
);
const failPayment = (0, catchAsync_1.catchAsync)((req, res, next) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query;
    const result = yield payment_service_1.PaymentService.failPayment(query);
    if (!result.success) {
      res.redirect(
        `${env_1.envVars.SSL_FAIL_FRONTEND_URL}?transactionId=${query.transactionId}&message=${result.message}&amount=${query.amount}&success=${query.status}`
      );
    }
  })
);
const cancelPayment = (0, catchAsync_1.catchAsync)((req, res, next) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query;
    const result = yield payment_service_1.PaymentService.cancelPayment(query);
    if (!result.success) {
      res.redirect(
        `${env_1.envVars.SSL_CANCEL_FRONTEND_URL}?transactionId=${query.transactionId}&message=${result.message}&amount=${query.amount}&success=${query.status}`
      );
    }
  })
);
const initPayment = (0, catchAsync_1.catchAsync)((req, res, next) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const bookingId = req.params.bookingId;
    const result = yield payment_service_1.PaymentService.initPayment(
      bookingId
    );
    (0, sendResponse_1.sendResponse)(res, {
      data: result,
      statusCode: 201,
      message: "Payment successful",
      success: true,
    });
  })
);
const getInvoiceDownloadUrl = (0, catchAsync_1.catchAsync)((req, res, next) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const { paymentId } = req.params;
    const result = yield payment_service_1.PaymentService.getInvoiceDownloadUrl(
      paymentId
    );
    (0, sendResponse_1.sendResponse)(res, {
      statusCode: 201,
      success: true,
      message: "Invoice download url retrieved successfully!",
      data: result,
    });
  })
);
const validatePayment = (0, catchAsync_1.catchAsync)((req, res, next) =>
  __awaiter(void 0, void 0, void 0, function* () {
    yield sslCommerz_service_1.SSLService.validatePayment(req.body);
    (0, sendResponse_1.sendResponse)(res, {
      success: true,
      statusCode: 201,
      message: "Payment validated successfully!",
      data: null,
    });
  })
);
exports.PaymentController = {
  successPayment,
  failPayment,
  cancelPayment,
  initPayment,
  getInvoiceDownloadUrl,
  validatePayment,
};
