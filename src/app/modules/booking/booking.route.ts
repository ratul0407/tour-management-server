import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { validateRequest } from "../../middlewares/validateRequest";
import {
  createBookingZodSchema,
  updateBookingZodSchema,
} from "./booking.validation";
import { bookingController } from "./booking.controller";

const router = Router();

router.post(
  "/",
  checkAuth(...Object.values(Role)),
  validateRequest(createBookingZodSchema),
  bookingController.createBooking
);

router.get(
  "/",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  bookingController.getAllBookings
);

router.get(
  "/my-bookings",
  checkAuth(...Object.values(Role)),
  bookingController.getUserBookings
);

router.get(
  "/:bookingId",
  checkAuth(...Object.values(Role)),
  bookingController.getSingleBooking
);

router.patch(
  "/:bookingId/status",
  checkAuth(...Object.values(Role)),
  validateRequest(updateBookingZodSchema),
  bookingController.updateBookingStatus
);
export const bookingRoutes = router;
