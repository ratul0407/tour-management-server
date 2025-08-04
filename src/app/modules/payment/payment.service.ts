import { BOOKING_STATUS } from "../booking/booking.interface";
import { Booking } from "../booking/booking.model";
import { PAYMENT_STATUS } from "./payment.interface";
import { Payment } from "./payment.model";

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
export const PaymentService = {
  successPayment,
  failPayment,
  cancelPayment,
};
