import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI environment variable is not set");
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};
