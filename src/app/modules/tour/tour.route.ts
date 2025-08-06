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
import { multerUpload } from "../../config/multer.config";

const router = Router();

/// ----------- Tour Type Route --------------
router.get(
  "/tour-types",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  TourController.getAllTourType
);
router.post(
  "/create-tour-type",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(createTourTypeZodSchema),
  TourController.createTourType
);
router.patch(
  "/tour-type/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  TourController.updateTourType
);
router.delete(
  "/tour-type/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  TourController.deleteTourType
);

//------------------- Tour Route ---------------
router.get(
  "/",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  TourController.getAllTour
);
router.post(
  "/create",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  multerUpload.array("files"),
  validateRequest(createTourZodSchema),
  TourController.createTour
);
router.get("/:slug", TourController.getSingleTour);
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

export const TourRoutes = router;
