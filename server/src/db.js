import mongoose from "mongoose";

export const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI, { dbName: "hospital_appointments" });
  console.log("✅ MongoDB connected");
};
