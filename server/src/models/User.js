import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    full_name: { type: String, required: true, trim: true },
    email:     { type: String, required: true, unique: true, lowercase: true, index: true },
    username:  { type: String, required: true, unique: true, lowercase: true, index: true },
    password:  { type: String, required: true }, // hashed
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

// ensure unique indexes exist
userSchema.index({ email: 1 },   { unique: true });
userSchema.index({ username: 1 },{ unique: true });

export default mongoose.model("User", userSchema);
