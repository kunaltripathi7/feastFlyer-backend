import express, { Request, Response } from "express"; // types from express
import cors from "cors";
import "dotenv/config";
import mongoose from "mongoose";
import myUserRoute from "./routes/MyUserRoute";
import myRestaurantRoute from "./routes/MyRestaurantRoute";
import orderRoute from "./routes/OrderRoute";
import RestaurantRoute from "./routes/RestaurantRoute";
import { v2 as cloudinary } from "cloudinary";

mongoose
  .connect(process.env.MONGODB_CONNECTION_STRING as string)
  .then(() => console.log("Database Connected"));

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
app.use(cors());

// untampered data for stripe
app.use("/api/order/checkout/webhook", express.raw({ type: "*/*" }));

app.use(express.json());
// end point to check server is ok
app.get("/health", async (req: Request, res: Response) => {
  res.send({ message: "health ok" });
});

app.use("/api/my/user", myUserRoute); // convention to include my for logged in user
app.use("/api/my/restaurant", myRestaurantRoute);
app.use("/api/restaurant", RestaurantRoute);
app.use("/api/order", orderRoute);

app.get("/test", async (req: Request, res: Response) => {
  res.json({ message: "Hello" });
});

app.listen(7000, () => {
  console.log("Server started at port:7000");
});
