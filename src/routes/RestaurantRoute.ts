import { Router } from "express";
import { param } from "express-validator";
import RestaurantController from "../controllers/RestaurantController";
import { jwtCheck, jwtParse } from "../middleware/auth";

const router = Router();

router.get(
  "/search/:city",
  // jwtCheck,
  // jwtParse,
  param("city")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("City parameter must be a valid string"),
  RestaurantController.searchRestaurant
);

export default router;
