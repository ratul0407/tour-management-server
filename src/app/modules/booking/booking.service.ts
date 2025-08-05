/* eslint-disable @typescript-eslint/no-explicit-any */
import AppError from "../../errorHelpers/appError";
import { User } from "../user/user.model";
import { BOOKING_STATUS, IBooking } from "./booking.interface";
import httpStatus from "http-status-codes";
import { Booking } from "./booking.model";
import { Payment } from "../payment/payment.model";
import { PAYMENT_STATUS } from "../payment/payment.interface";
import { Tour } from "../tour/tour.model";
import { SSLService } from "../../sslCommerz/sslCommerz.service";
import { ISSLCommerz } from "../../sslCommerz/sslCommerz.interface";
import { JwtPayload } from "jsonwebtoken";
import { QueryBuilder } from "../../utils/queryBuilder";

const getTransactionId = () => {
  return `tran_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
};
const createBooking = async (payload: Partial<IBooking>, userId: string) => {
  const transactionId = getTransactionId();
  const session = await Booking.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(userId);
    if (!user?.phone || user?.address) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Please update your profile to book a tour"
      );
    }
    const tour = await Tour.findById(payload.tour).select("costFrom");
    if (!tour?.costFrom) {
      throw new AppError(httpStatus.BAD_REQUEST, "No tour cost found");
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const amount = Number(tour.costFrom) * Number(payload.guestCount!);
    const booking = await Booking.create(
      [
        {
          user: userId,
          status: BOOKING_STATUS.PENDING,
          ...payload,
        },
      ],
      { session }
    );

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $push: { bookings: booking[0]._id },
      },
      { session }
    );
    console.log(updatedUser);
    const payment = await Payment.create(
      [
        {
          booking: booking[0]._id,
          status: PAYMENT_STATUS.PENDING,
          transactionId: transactionId,
          amount: amount,
        },
      ],
      { session }
    );
    const updatedBooking = await Booking.findByIdAndUpdate(
      booking[0]._id,

      {
        payment: payment[0]._id,
      },
      { new: true, runValidators: true, session }
    )
      .populate("user", "name email phone address location")
      .populate("tour", "title location costFrom")
      .populate("payment");
    const userAddress = (updatedBooking?.user as any).address;
    const userEmail = (updatedBooking?.user as any).email;
    const userPhoneNumber = (updatedBooking?.user as any).phone;
    const userName = (updatedBooking?.user as any).name;

    const sslPayload: ISSLCommerz = {
      address: userAddress,
      email: userEmail,
      phoneNumber: userPhoneNumber,
      name: userName,
      amount: amount,
      transactionId: transactionId,
    };
    const sslPayment = await SSLService.sslPaymentInit(sslPayload);
    await session.commitTransaction(); // transaction
    session.endSession();
    return {
      paymentUrl: sslPayment.GatewayPageURL,
      booking: updatedBooking,
    };
  } catch (error: any) {
    console.log(error);
    await session.abortTransaction(); ///rollback
    session.endSession();
    throw error;
  }
};

const getUserBookings = async (
  token: JwtPayload,
  query: Record<string, string>
) => {
  const { userId } = token;
  const user = await User.findOne({ _id: userId });
  const queryBuilder = await new QueryBuilder(
    Booking.find({ _id: { $in: user?.bookings } }),
    query
  );
  const bookings = await queryBuilder.filter().sort().fields().paginate();
  const [data, meta] = await Promise.all([
    bookings.build(),
    bookings.getMeta(),
  ]);

  return {
    meta,
    data,
  };
};
const getAllBookings = async () => {
  return {};
};
export const bookingService = {
  createBooking,
  getAllBookings,
  getUserBookings,
};
