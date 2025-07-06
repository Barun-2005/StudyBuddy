import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI environment variable is not set");
    }

    console.log("Connecting to MongoDB...");
    console.log("MongoDB URI exists:", !!process.env.MONGODB_URI);
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection error:", error);
    console.log("MongoDB URI:", process.env.MONGODB_URI ? "SET" : "NOT SET");
    process.exit(1);
  }
};
