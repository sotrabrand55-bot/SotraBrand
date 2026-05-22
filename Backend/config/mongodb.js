import mongoose from "mongoose";
import { logInfo } from "../utils/logger.js";

const connectDB = async () => {
  mongoose.connection.on("connected", () => {
    logInfo("DB Connected");
  });
  await mongoose.connect(`${process.env.MONGO_URI}/levon_app`);
};

export default connectDB;

