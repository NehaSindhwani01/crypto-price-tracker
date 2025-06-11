import mongoose from 'mongoose';
import dotenv from "dotenv";
dotenv.config();

let isConnected = false;

export const dbConnect = async () => {
  if (isConnected) return;

  try {

    await mongoose.connect(process.env.MONGO_DB_URL, {
      dbName: "crypto-price-tracker",
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    isConnected = true;
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed", error);
  }
};
