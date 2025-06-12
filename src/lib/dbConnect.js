import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGO_DB_URL;

let isConnected = false;

async function dbConnect() {
  if (isConnected) return;

  if (!MONGODB_URI) throw new Error("MongoDB URI not defined");

  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    isConnected = true;
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}

export default dbConnect;
