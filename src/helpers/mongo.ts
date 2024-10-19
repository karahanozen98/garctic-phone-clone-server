import mongoose from "mongoose";
import { env } from "process";

export function connectMongo() {
  mongoose
    .connect(env.MONGO_URI as string, {})
    .then(() => {
      console.log("Connected to MongoDB successfully");
    })
    .catch((err) => {
      console.error("Error connecting to MongoDB:", err);
    });
}
