/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { PaymentService } from "./payment.service";
import { envVars } from "../../config/env";
import { sendResponse } from "../../utils/sendResponse";

const successPayment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query as Record<string, string>;
    const result = await PaymentService.successPayment(query);
    if (result.success) {
      res.redirect(
        `${envVars.SSL_SUCCESS_FRONTEND_URL}?transactionId=${query.transactionId}&message=${result.message}&amount=${query.amount}&success=${query.status}`
      );
    }
  }
);

const failPayment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query as Record<string, string>;
    const result = await PaymentService.failPayment(query);
    if (!result.success) {
      res.redirect(
        `${envVars.SSL_FAIL_FRONTEND_URL}?transactionId=${query.transactionId}&message=${result.message}&amount=${query.amount}&success=${query.status}`
      );
    }
  }
);

const cancelPayment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query as Record<string, string>;
    const result = await PaymentService.cancelPayment(query);
    if (!result.success) {
      res.redirect(
        `${envVars.SSL_CANCEL_FRONTEND_URL}?transactionId=${query.transactionId}&message=${result.message}&amount=${query.amount}&success=${query.status}`
      );
    }
  }
);

const initPayment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const bookingId = req.params.bookingId;
    const result = await PaymentService.initPayment(bookingId);
    sendResponse(res, {
      data: result,
      statusCode: 201,
      message: "Payment successful",
      success: true,
    });
  }
);
const getInvoiceDownloadUrl = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { paymentId } = req.params;
    const result = await PaymentService.getInvoiceDownloadUrl(paymentId);
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Invoice download url retrieved successfully!",
      data: result,
    });
  }
);
export const PaymentController = {
  successPayment,
  failPayment,
  cancelPayment,
  initPayment,
  getInvoiceDownloadUrl,
};
