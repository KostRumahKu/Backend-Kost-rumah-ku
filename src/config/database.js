import mongoose from "mongoose";

export const connectDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("[Database] MongoDB Connected Successfully");
  } catch (error) {
    console.error("[Database] MongoDB Connection Failed:", error.message);
    process.exit(1);
  }
};
