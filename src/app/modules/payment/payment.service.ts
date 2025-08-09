/* eslint-disable @typescript-eslint/no-explicit-any */
import { uploadBufferToCloudinary } from "../../config/cloudinary.config";
import AppError from "../../errorHelpers/appError";
import { ISSLCommerz } from "../../sslCommerz/sslCommerz.interface";
import { SSLService } from "../../sslCommerz/sslCommerz.service";
import { generatePdf, IInvoiceData } from "../../utils/invoice";
import { sendEmail } from "../../utils/sendEmail";
import { BOOKING_STATUS } from "../booking/booking.interface";
import { Booking } from "../booking/booking.model";
import { ITour } from "../tour/tour.interface";
import { IUser } from "../user/user.interface";
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
    if (!updatedPayment) {
      throw new AppError(401, "Payment not found");
    }
    const updatedBooking = await Booking.findByIdAndUpdate(
      updatedPayment?.booking,

      {
        status: BOOKING_STATUS.COMPLETE,
      },
      { new: true, runValidators: true, session }
    )
      .populate("tour", "title")
      .populate("user", "name email");

    if (!updatedBooking) {
      throw new AppError(httpStatus.BAD_REQUEST, "Booking was not found");
    }
    console.log(updatedPayment);
    const invoiceData: IInvoiceData = {
      bookingDate: updatedBooking.createdAt as Date,
      guestCount: updatedBooking.guestCount,
      totalAmount: updatedPayment.amount,
      tourTitle: (updatedBooking.tour as unknown as ITour).title,
      transactionId: updatedPayment.transactionId,
      userName: (updatedBooking.user as unknown as IUser).name,
    };
    const pdfBuffer = await generatePdf(invoiceData);
    const cloudinaryResult = await uploadBufferToCloudinary(
      pdfBuffer,
      "invoice"
    );
    if (!cloudinaryResult) {
      throw new AppError(401, "Error uploading pdf");
    }
    await Payment.findByIdAndUpdate(
      updatedPayment._id,
      {
        invoiceUrl: cloudinaryResult.secureUrl,
      },
      { runValidators: true, session }
    );
    await sendEmail({
      to: (updatedBooking.user as unknown as IUser).email,
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

const getInvoiceDownloadUrl = async (id: string) => {
  const payment = await Payment.findById(id).select("invoiceUrl");
  if (!payment) {
    throw new AppError(401, "Payment not found");
  }
  if (!payment.invoiceUrl) {
    throw new AppError(401, "No invoice url found");
  }
  return payment.invoiceUrl;
};
export const PaymentService = {
  successPayment,
  failPayment,
  cancelPayment,
  initPayment,
  getInvoiceDownloadUrl,
};
