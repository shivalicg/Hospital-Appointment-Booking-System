import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import dayjs from 'dayjs';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // appointment booking state
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({
    patientName: "",
    patientPhone: "",
    doctorId: "",
    date: "",
    reason: ""
  });
  const [appointments, setAppointments] = useState([]);
  const [loadingApp, setLoadingApp] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get('/auth/me');
        setUser(response.data);
      } catch (err) {
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [navigate]);

  const loadAppointments = async () => {
    const { data } = await api.get("/appointments");
    setAppointments(data);
  };

  const loadDoctors = async () => {
    const { data } = await api.get("/doctors").catch(() => ({ data: [] }));
    setDoctors(data);
  };

  useEffect(() => {
    if (user) {
      loadAppointments();
      loadDoctors();
    }
  }, [user]);

  const submit = async (e) => {
    e.preventDefault();
    setLoadingApp(true);
    try {
      await api.post("/appointments", form);
      setForm({ patientName: "", patientPhone: "", doctorId: "", date: "", reason: "" });
      await loadAppointments();
    } catch (e) {
      alert(e?.response?.data?.message || "Failed");
    } finally {
      setLoadingApp(false);
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete appointment?")) return;
    await api.delete(`/appointments/${id}`);
    await loadAppointments();
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      navigate('/login');
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  if (loading) return <div>Loading...</div>;

  if (!user) return null;

  return (
    <div style={{ maxWidth: 900, margin: "2rem auto", fontFamily: "system-ui" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>🏥 Hospital Appointment Booking</h1>
        <div>
          <span>Welcome, {user.full_name}!</span>
          <button onClick={handleLogout} style={{ marginLeft: 16 }}>Logout</button>
        </div>
      </div>

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
        <button disabled={loadingApp}>{loadingApp ? "Booking..." : "Book Appointment"}</button>
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
};

export default Dashboard;
