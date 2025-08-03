import { BOOKING_STATUS } from "../booking/booking.interface";
import { Booking } from "../booking/booking.model";
import { PAYMENT_STATUS } from "./payment.interface";
import { Payment } from "./payment.model";

const successPayment = async (query: Record<string, string>) => {
  const session = await Booking.startSession();
  session.startTransaction();

  try {
    // const booking = await Booking.findByIdAndUpdate(
    //   [
    //     {
    //       user: userId,
    //       status: BOOKING_STATUS.PENDING,
    //       ...payload,
    //     },
    //   ],
    //   { session }
    // );
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
      { new: true, runValidators: true, session }
    )
      .populate("user", "name email phone address location")
      .populate("tour", "title location costFrom")
      .populate("payment");

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

const failPayment = async () => {};

const cancelPayment = async () => {};
export const PaymentService = {
  successPayment,
  failPayment,
  cancelPayment,
};
