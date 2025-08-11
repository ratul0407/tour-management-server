/* eslint-disable @typescript-eslint/no-explicit-any */
import { Booking } from "../booking/booking.model";
import { PAYMENT_STATUS } from "../payment/payment.interface";
import { Payment } from "../payment/payment.model";
import { Tour } from "../tour/tour.model";
import { IsActive } from "../user/user.interface";
import { User } from "../user/user.model";

const now = new Date();
const sevenDaysAgo = new Date(now).setDate(now.getDate() - 7);
const thirtyDaysAgo = new Date(now).setDate(now.getDate() - 30);
const getUserStats = async () => {
  const totalUsersPromise = User.countDocuments();
  const totalActiveUsersPromise = User.countDocuments({
    isActive: IsActive.ACTIVE,
  });
  const totalInActiveUsersPromise = User.countDocuments({
    isActive: IsActive.INACTIVE,
  });
  const totalBlockedUsersPromise = User.countDocuments({
    isActive: IsActive.BLOCKED,
  });

  const newUsersInLast7DaysPromise = User.countDocuments({
    createdAt: { $gte: sevenDaysAgo },
  });

  const newUsersInLast30DaysPromise = User.countDocuments({
    createdAt: { $gte: thirtyDaysAgo },
  });
  const usersByRolePromise = User.aggregate([
    //stage-1 - grouping users by role and count total users by each role
    {
      $group: {
        _id: "$role",
        count: { $sum: 1 },
      },
    },
  ]);
  const [
    totalUsers,
    totalActiveUsers,
    totalInactiveUsers,
    totalBlockedUsers,
    newUsersInLast7Days,
    newUsersInLast30Days,
    usersByRole,
  ] = await Promise.all([
    totalUsersPromise,
    totalActiveUsersPromise,
    totalInActiveUsersPromise,
    totalBlockedUsersPromise,
    newUsersInLast7DaysPromise,
    newUsersInLast30DaysPromise,
    usersByRolePromise,
  ]);
  return {
    totalUsers,
    totalActiveUsers,
    totalInactiveUsers,
    totalBlockedUsers,
    newUsersInLast7Days,
    newUsersInLast30Days,
    usersByRole,
  };
};
const getTourStats = async () => {
  const totalTourPromise = Tour.countDocuments();
  const totalTourByTourTypePromise = Tour.aggregate([
    //stage-1 : connect Tour Type model - lookup stage
    {
      $lookup: {
        from: "tourtypes",
        localField: "tourType",
        foreignField: "_id",
        as: "type",
      },
    },
    {
      $unwind: "$type",
    },
    {
      $group: {
        _id: "$type.name",
        count: { $sum: 1 },
      },
    },
  ]);

  const avgTourCostPromise = Tour.aggregate([
    {
      $group: {
        _id: null,
        avgCostFrom: { $avg: "$costFrom" },
      },
    },
  ]);
  const totalTourByDivisionPromise = Tour.aggregate([
    {
      $lookup: {
        from: "divisions",
        localField: "division",
        foreignField: "_id",
        as: "division",
      },
    },
    {
      $unwind: "$division",
    },
    {
      $group: {
        _id: "$division.name",
        count: { $sum: 1 },
      },
    },
  ]);

  const totalHighestBookedTourPromise = Booking.aggregate([
    // stage-1 : Group the tour
    {
      $group: {
        _id: "$tour",
        bookingCount: { $sum: 1 },
      },
    },

    //stage-2 : sort the tour

    {
      $sort: { bookingCount: -1 },
    },

    //stage-3 : sort
    {
      $limit: 5,
    },

    //stage-4 lookup stage
    {
      $lookup: {
        from: "tours",
        let: { tourId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", "$$tourId"] },
            },
          },
        ],
        as: "tour",
      },
    },
    //stage-5 unwind stage
    { $unwind: "$tour" },

    //stage-6 Project stage

    {
      $project: {
        bookingCount: 1,
        "tour.title": 1,
        "tour.slug": 1,
      },
    },
  ]);
  const [
    totalTour,
    totalTourByTourType,
    avgTourCost,
    totalTourByDivision,
    totalHighestBookedTour,
  ] = await Promise.all([
    totalTourPromise,
    totalTourByTourTypePromise,
    avgTourCostPromise,
    totalTourByDivisionPromise,
    totalHighestBookedTourPromise,
  ]);

  return {
    totalTour,
    totalTourByTourType,
    avgTourCost,
    totalTourByDivision,
    totalHighestBookedTour,
  };
};

const getBookingStats = async () => {
  const totalBookingsPromise = Booking.countDocuments();
  const totalBookingsByStatusPromise = Booking.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);
  const bookingsPerTourPromise = Booking.aggregate([
    {
      $group: {
        _id: "$tour",
        bookingCount: { $sum: 1 },
      },
    },
    {
      $sort: { bookingCount: -1 },
    },

    {
      $limit: 10,
    },
    {
      $lookup: {
        from: "tours",
        localField: "_id",
        foreignField: "_id",
        as: "tour",
      },
    },
    {
      $unwind: "$tours",
    },
    {
      $project: {
        bookingCount: 1,
        _id: 1,
        "tour.title": 1,
        "tour.slug": 1,
      },
    },
  ]);

  const avgGuestCountPerBookingPromise = Booking.aggregate([
    {
      $group: {
        _id: null,
        avgGuestCount: { $avg: "$guestCount" },
      },
    },
  ]);

  const bookingsInLast7DaysPromise = Booking.countDocuments({
    createdAt: { $gte: sevenDaysAgo },
  });
  const bookingsInLast30DaysPromise = Booking.countDocuments({
    createdAt: { $gte: thirtyDaysAgo },
  });
  const totalBookingsByUniqueUsersPromise = Booking.distinct("user").then(
    (user: any) => user.length
  );
  const [
    totalBookings,
    totalBookingsByStatus,
    bookingsPerTour,
    avgGuestCountPerBooking,
    bookingsInLast7Days,
    bookingsInLast30Days,
    totalBookingsByUniqueUsers,
  ] = await Promise.all([
    totalBookingsPromise,
    totalBookingsByStatusPromise,
    bookingsPerTourPromise,
    avgGuestCountPerBookingPromise,
    bookingsInLast7DaysPromise,
    bookingsInLast30DaysPromise,
    totalBookingsByUniqueUsersPromise,
  ]);
  return {
    totalBookings,
    totalBookingsByStatus,
    bookingsPerTour,
    avgGuestCountPerBooking: avgGuestCountPerBooking[0].avgGuestCount,
    bookingsInLast7Days,
    bookingsInLast30Days,
    totalBookingsByUniqueUsers,
  };
};
const getPaymentStats = async () => {
  const totalPaymentPromise = Payment.countDocuments();
  const totalPaymentByStatusPromise = Payment.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);
  const totalRevenuePromise = Payment.aggregate([
    { $match: { status: PAYMENT_STATUS.PAID } },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$amount" },
      },
    },
  ]);
  const avgPaymentAmountPromise = Payment.aggregate([
    {
      $group: {
        _id: null,
        avgPayment: { $avg: "$amount" },
      },
    },
  ]);
  const paymentGatewayDataPromise = Payment.aggregate([
    {
      $group: {
        _id: { $ifNull: ["$paymentGatewayData.status", "UNKNOWN"] },
        count: { $sum: 1 },
      },
    },
  ]);
  const [
    totalPayment,
    totalRevenue,
    totalPaymentByStatus,
    avgPaymentAmount,
    paymentGatewayData,
  ] = await Promise.all([
    totalPaymentPromise,
    totalRevenuePromise,
    totalPaymentByStatusPromise,
    avgPaymentAmountPromise,
    paymentGatewayDataPromise,
  ]);

  return {
    totalPayment,
    totalPaymentByStatus,
    totalRevenue: totalRevenue[0].totalRevenue,
    avgPaymentAmount: avgPaymentAmount[0].avgPayment,
    paymentGatewayData,
  };
};
export const StatsService = {
  getUserStats,
  getBookingStats,
  getPaymentStats,
  getTourStats,
};
