import { useState, useEffect } from 'react';
import axios from 'axios';

const AppointmentList = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/appointments');
      setAppointments(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`http://localhost:5000/api/appointments/${id}`, { status });
      fetchAppointments(); // Refresh the list
    } catch (error) {
      console.error('Error updating appointment:', error);
    }
  };

  const deleteAppointment = async (id) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      try {
        await axios.delete(`http://localhost:5000/api/appointments/${id}`);
        fetchAppointments(); // Refresh the list
      } catch (error) {
        console.error('Error deleting appointment:', error);
      }
    }
  };

  if (loading) {
    return <div>Loading appointments...</div>;
  }

  return (
    <div className="appointment-list">
      <h2>Appointments</h2>
      {appointments.length === 0 ? (
        <p>No appointments found.</p>
      ) : (
        <div className="appointments-grid">
          {appointments.map((appointment) => (
            <div key={appointment._id} className="appointment-card">
              <h3>{appointment.patientName}</h3>
              <p><strong>Email:</strong> {appointment.patientEmail}</p>
              <p><strong>Phone:</strong> {appointment.patientPhone}</p>
              <p><strong>Doctor:</strong> {appointment.doctorName}</p>
              <p><strong>Date:</strong> {new Date(appointment.appointmentDate).toLocaleDateString()}</p>
              <p><strong>Time:</strong> {appointment.appointmentTime}</p>
              <p><strong>Reason:</strong> {appointment.reason}</p>
              <p><strong>Status:</strong> <span className={`status ${appointment.status}`}>{appointment.status}</span></p>
              <div className="appointment-actions">
                {appointment.status === 'pending' && (
                  <>
                    <button onClick={() => updateStatus(appointment._id, 'confirmed')}>Confirm</button>
                    <button onClick={() => updateStatus(appointment._id, 'cancelled')}>Cancel</button>
                  </>
                )}
                <button onClick={() => deleteAppointment(appointment._id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AppointmentList;
