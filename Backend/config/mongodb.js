import mongoose from "mongoose";
import { logInfo } from "../utils/logger.js";

const connectDB = async () => {
  mongoose.connection.on("connected", () => {
    logInfo("DB Connected");
  });
  const baseUri = String(process.env.MONGO_URI || "").trim();
  const [uriWithoutQuery, query = ""] = baseUri.split("?");
  const mongoUri = `${uriWithoutQuery.replace(/\/+$/, "")}/levon_app${query ? `?${query}` : ""}`;
  await mongoose.connect(mongoUri);
};

export default connectDB;

