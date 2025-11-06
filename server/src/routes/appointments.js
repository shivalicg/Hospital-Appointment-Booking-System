import { Router } from "express";
import Appointment from "../models/Appointment.js";
import Patient from "../models/Patient.js";
import Doctor from "../models/Doctor.js";

const router = Router();

/** Create appointment (also auto-create basic Patient if not exists by name+phone) */
router.post("/", async (req, res, next) => {
  try {
    const { patientName, patientPhone, doctorId, date, reason } = req.body;
    if (!patientName || !patientPhone || !doctorId || !date) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // find or create patient
    let patient = await Patient.findOne({ name: patientName, phone: patientPhone });
    if (!patient) patient = await Patient.create({ name: patientName, phone: patientPhone });

    // ensure doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    const appt = await Appointment.create({
      patient: patient._id,
      doctor: doctor._id,
      date,
      reason
    });

    const populated = await appt.populate("patient doctor");
    res.status(201).json(populated);
  } catch (e) {
    next(e);
  }
});

/** List all appointments (populate doctor & patient) */
router.get("/", async (_req, res, next) => {
  try {
    const appts = await Appointment.find().sort({ date: 1 }).populate("patient doctor");
    res.json(appts);
  } catch (e) {
    next(e);
  }
});

/** Delete appointment by ID */
router.delete("/:id", async (req, res, next) => {
  try {
    const deleted = await Appointment.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted", id: req.params.id });
  } catch (e) {
    next(e);
  }
});

export default router;
