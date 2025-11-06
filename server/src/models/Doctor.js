import mongoose from "mongoose";
const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    specialization: { type: String, required: true }
  },
  { timestamps: true }
);
export default mongoose.model("Doctor", doctorSchema);
