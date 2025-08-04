/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { PaymentService } from "./payment.service";
import { envVars } from "../../config/env";

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

export const PaymentController = {
  successPayment,
  failPayment,
  cancelPayment,
};

//http://localhost:5173/api/v1/payment/fail?transactionId=tran_1754211828405_690&message=Payment%20Failed&amount=6800&success=Fail

//http://localhost:5173/api/v1/payment/cancel?transactionId=tran_1754211870289_710&message=Payment%20Cancelled&amount=6800&success=cancel
