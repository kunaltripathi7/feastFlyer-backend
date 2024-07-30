import { Router } from "express";
import multer from "multer";
import MyRestaurantController from "../controllers/MyRestaurantController";
import { jwtCheck, jwtParse } from "../middleware/auth";
import { validateMyRestaurantRequest } from "../middleware/validate";

const router = Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // automatically handles validation errors.
  },
});

router.get("/", jwtCheck, jwtParse, MyRestaurantController.getRestaurant);

router.put(
  "/",
  upload.single("imageFile"), // if no img then no req.file by multer
  validateMyRestaurantRequest,
  jwtCheck,
  jwtParse,
  MyRestaurantController.updateRestaurant
);

router.post(
  "/",
  upload.single("imageFile"), // upload file multer -> gonna take the file and store in memory and then add in req.file
  validateMyRestaurantRequest,
  jwtCheck,
  jwtParse,
  MyRestaurantController.createRestaurant
);

export default router;
