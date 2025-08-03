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
  async (req: Request, res: Response, next: NextFunction) => {}
);

const cancelPayment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {}
);

export const PaymentController = {
  successPayment,
  failPayment,
  cancelPayment,
};
