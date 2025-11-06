import { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import "./App.css";

export default function App() {
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({
    patientName: "",
    patientPhone: "",
    doctorId: "",
    date: "",
    reason: ""
  });
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadAppointments = async () => {
    const { data } = await axios.get("/api/appointments");
    setAppointments(data);
  };

  const loadDoctors = async () => {
    const { data } = await axios.get("/api/doctors").catch(() => ({ data: [] }));
    setDoctors(data);
  };

  useEffect(() => {
    loadAppointments();
    loadDoctors();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("/api/appointments", form);
      setForm({ patientName: "", patientPhone: "", doctorId: "", date: "", reason: "" });
      await loadAppointments();
    } catch (e) {
      alert(e?.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete appointment?")) return;
    await axios.delete(`/api/appointments/${id}`);
    await loadAppointments();
  };

  return (
    <div style={{ maxWidth: 900, margin: "2rem auto", fontFamily: "system-ui" }}>
      <h1>🏥 Hospital Appointment Booking</h1>

      <form onSubmit={submit} style={{ display: "grid", gap: 12, marginTop: 16 }}>
        <input
          placeholder="Patient Name"
          value={form.patientName}
          onChange={e => setForm({ ...form, patientName: e.target.value })}
          required
        />
        <input
          placeholder="Patient Phone"
          value={form.patientPhone}
          onChange={e => setForm({ ...form, patientPhone: e.target.value })}
          required
        />
        <select
          value={form.doctorId}
          onChange={e => setForm({ ...form, doctorId: e.target.value })}
          required
        >
          <option value="">Select Doctor</option>
          {doctors.map(d => (
            <option key={d._id} value={d._id}>
              {d.name} — {d.specialization}
            </option>
          ))}
        </select>
        <input
          type="datetime-local"
          value={form.date}
          onChange={e => setForm({ ...form, date: e.target.value })}
          required
        />
        <input
          placeholder="Reason (optional)"
          value={form.reason}
          onChange={e => setForm({ ...form, reason: e.target.value })}
        />
        <button disabled={loading}>{loading ? "Booking..." : "Book Appointment"}</button>
      </form>

      <h2 style={{ marginTop: 32 }}>📅 Appointments</h2>
      {!appointments.length && <p>No appointments yet.</p>}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {appointments.map(a => (
          <li key={a._id} style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8, marginBottom: 12 }}>
            <div><strong>Patient:</strong> {a.patient?.name} ({a.patient?.phone})</div>
            <div><strong>Doctor:</strong> {a.doctor?.name} — {a.doctor?.specialization}</div>
            <div><strong>Date:</strong> {dayjs(a.date).format("DD MMM YYYY, HH:mm")}</div>
            {a.reason && <div><strong>Reason:</strong> {a.reason}</div>}
            <button onClick={() => remove(a._id)} style={{ marginTop: 8 }}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
