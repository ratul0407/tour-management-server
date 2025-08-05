/* eslint-disable @typescript-eslint/no-explicit-any */
import AppError from "../../errorHelpers/appError";
import { ISSLCommerz } from "../../sslCommerz/sslCommerz.interface";
import { SSLService } from "../../sslCommerz/sslCommerz.service";
import { BOOKING_STATUS } from "../booking/booking.interface";
import { Booking } from "../booking/booking.model";
import { PAYMENT_STATUS } from "./payment.interface";
import { Payment } from "./payment.model";
import httpStatus from "http-status-codes";
const successPayment = async (query: Record<string, string>) => {
  const session = await Booking.startSession();
  session.startTransaction();

  try {
    const updatedPayment = await Payment.findOneAndUpdate(
      { transactionId: query.transactionId },
      [
        {
          $set: { status: PAYMENT_STATUS.PAID },
        },
      ],
      { session }
    );
    await Booking.findByIdAndUpdate(
      updatedPayment?.booking,

      {
        status: BOOKING_STATUS.COMPLETE,
      },
      { runValidators: true, session }
    );

    await session.commitTransaction(); // transaction
    session.endSession();
    return {
      success: true,
      message: "Payment completed successfully",
    };
  } catch (error) {
    console.log(error);
    await session.abortTransaction(); ///rollback
    session.endSession();
    throw error;
  }
};

const failPayment = async (query: Record<string, string>) => {
  const session = await Booking.startSession();
  session.startTransaction();

  try {
    const updatedPayment = await Payment.findOneAndUpdate(
      { transactionId: query.transactionId },
      [
        {
          $set: { status: PAYMENT_STATUS.FAILED },
        },
      ],
      { session }
    );
    await Booking.findByIdAndUpdate(
      updatedPayment?.booking,

      {
        status: BOOKING_STATUS.FAILED,
      },
      { runValidators: true, session }
    );

    await session.commitTransaction(); // transaction
    session.endSession();
    return {
      success: false,
      message: "Payment Failed",
    };
  } catch (error) {
    console.log(error);
    await session.abortTransaction(); ///rollback
    session.endSession();
    throw error;
  }
};

const cancelPayment = async (query: Record<string, string>) => {
  const session = await Booking.startSession();
  session.startTransaction();

  try {
    const updatedPayment = await Payment.findOneAndUpdate(
      { transactionId: query.transactionId },
      [
        {
          $set: { status: PAYMENT_STATUS.CANCELLED },
        },
      ],
      { session }
    );
    await Booking.findByIdAndUpdate(
      updatedPayment?.booking,

      {
        status: BOOKING_STATUS.CANCEL,
      },
      { runValidators: true, session }
    );

    await session.commitTransaction(); // transaction
    session.endSession();
    return {
      success: false,
      message: "Payment Cancelled",
    };
  } catch (error) {
    console.log(error);
    await session.abortTransaction(); ///rollback
    session.endSession();
    throw error;
  }
};

const initPayment = async (id: string) => {
  const payment = await Payment.findOne({ booking: id });
  if (!payment) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Payment Not Found. You haven't booked this tour."
    );
  }
  const booking = await Booking.findById(payment.booking);
  const userAddress = (booking?.user as any).address;
  const userEmail = (booking?.user as any).email;
  const userPhoneNumber = (booking?.user as any).phone;
  const userName = (booking?.user as any).name;

  const sslPayload: ISSLCommerz = {
    address: userAddress,
    email: userEmail,
    phoneNumber: userPhoneNumber,
    name: userName,
    amount: payment.amount,
    transactionId: payment.transactionId,
  };
  const sslPayment = await SSLService.sslPaymentInit(sslPayload);

  return {
    paymentUrl: sslPayment.GatewayPageURL,
  };
};
export const PaymentService = {
  successPayment,
  failPayment,
  cancelPayment,
  initPayment,
};
