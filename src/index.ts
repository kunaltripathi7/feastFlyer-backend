import express, { Request, Response } from "express"; // types from express
import cors from "cors";
import "dotenv/config";
import mongoose from "mongoose";
import myUserRoute from "./routes/MyUserRoute";

mongoose
  .connect(process.env.MONGODB_CONNECTION_STRING as string)
  .then(() => console.log("Database Connected"));

const app = express();
app.use(express.json());
app.use(cors());

// end point to check server is ok
app.get("/health", async (req: Request, res: Response) => {
  res.send({ message: "health ok" });
});

app.use("/api/my/user", myUserRoute); // convention to include my for logged in user

app.get("/test", async (req: Request, res: Response) => {
  res.json({ message: "Hello" });
});

app.listen(7000, () => {
  console.log("Server started at port:7000");
});
