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

/// ----------- Tour Type Route --------------
router.get("/tour-types");
router.post("/create-tour-type");
router.patch("/tour-type/:id");
router.delete("/tour-type/:id");

//------------------- Tour Route ---------------
router.get("/");
router.post(
  "/create",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(createTourZodSchema),
  TourController.createTour
);
router.patch(
  "/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(updateTourZodSchema),
  TourController.updateTour
);

router.delete(
  "/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  TourController.deleteTour
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
