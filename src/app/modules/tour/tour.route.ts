import { Router } from "express";
import { TourController } from "./tour.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import {
  createTourTypeZodSchema,
  createTourZodSchema,
  updateTourZodSchema,
} from "./tour.validation";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";

const router = Router();

router.post(
  "/create",
  validateRequest(createTourZodSchema),
  TourController.createTour
);
// router.post(
//   "/craete-tour-type",
//   checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
//   validateRequest(createTourTypeZodSchema),
//   TourController.createTourType
// );
// router.get("/tour-types", TourController.getAllYourTourTypes);
// router.patch(
//   "/tour-types/:id",
//   checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
//   validateRequest(Role.ADMIN, Role.SUPER_ADMIN),
//   TourController.updateTourType
// );
// router.delete(
//   "/tour-types/:id",
//   checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
//   TourController.deleteTourType
// );
// router.patch(
//   "/:id",
//   checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
//   validateRequest(updateTourZodSchema),
//   TourController.updateTour
// );
// router.delete(
"/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), TourController.deleteTour;
// );
export const TourRoutes = router;
