import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { connectDB } from "./db.js";

import appointmentRoutes from "./routes/appointments.js";
import doctorRoutes from "./routes/doctor.routes.js"; // if you added it
import authRoutes from "./routes/auth.routes.js";     // <-- NEW
import Doctor from "./models/Doctor.js";

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true, // allow cookies
}));
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

app.get("/", (_req, res) => res.send("Hospital API running"));

app.use("/api/auth", authRoutes);           // <-- NEW
app.use("/api/appointments", appointmentRoutes);
app.use("/api/doctors", doctorRoutes);      // if present

// --- TEMP SEED ROUTE ---
app.post("/api/seed/doctors", async (_req, res) => {
  try {
    const count = await Doctor.countDocuments();
    if (count > 0) return res.json({ message: "Doctors already exist" });

    const docs = await Doctor.insertMany([
      { name: "Dr. Asha Menon", specialization: "Cardiology" },
      { name: "Dr. R. Kumar", specialization: "Neurology" },
      { name: "Dr. Neha Singh", specialization: "Dermatology" },
      { name: "Dr. Priya Nair", specialization: "Pediatrics" },
      { name: "Dr. Manoj Verma", specialization: "Orthopedics" }
    ]);

    res.json(docs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

import { errorHandler } from "./middleware/errorHandler.js";
app.use(errorHandler);

const port = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(port, () => console.log(`🚀 Server on http://localhost:${port}`));
});
