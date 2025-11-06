import { Router } from "express";
import Doctor from "../models/Doctor.js";

const router = Router();

// Get all doctors
router.get("/", async (_req, res) => {
  try {
    const doctors = await Doctor.find().sort({ name: 1 });
    res.json(doctors);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

export default router;
