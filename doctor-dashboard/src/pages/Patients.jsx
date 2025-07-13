import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // import for navigation
import axios from "axios";

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // hook to navigate between routes

  useEffect(() => {
    console.log("📡 Fetching patients...");

    axios
      .get("http://localhost:4000/api/v1/user/patients", { withCredentials: true })
      .then((res) => {
        console.log("✅ Fetched patients:", res.data.patients);
        setPatients(res.data.patients);
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Error fetching patients:", err);
        setLoading(false);
      });
  }, []);

  const styles = {
    container: {
      padding: "2rem",
    },
    card: {
      backgroundColor: "#f9f9f9",
      border: "1px solid #ddd",
      borderRadius: "8px",
      padding: "1rem",
      marginBottom: "1.5rem",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    },
    appointmentItem: {
      backgroundColor: "#fff",
      padding: "0.5rem",
      borderRadius: "4px",
      marginBottom: "0.5rem",
      border: "1px solid #ddd",
    },
    loginButton: {
      padding: "0.7rem 1.2rem",
      backgroundColor: "#007bff",
      color: "#fff",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      marginBottom: "2rem",
    },
  };

  return (
    <div style={styles.container}>
      <button style={styles.loginButton} onClick={() => navigate("/login")}>
        👨‍⚕️ Doctor Login
      </button>

      <h1>All Registered Patients</h1>
      {loading ? (
        <p>Loading...</p>
      ) : patients.length > 0 ? (
        patients.map((patient) => (
          <div key={patient._id} style={styles.card}>
  <h3>{patient.fullName}</h3>
  <p><strong>Email:</strong> {patient.email}</p>
  <p><strong>Phone:</strong> {patient.phone}</p>
  <p><strong>Gender:</strong> {patient.gender}</p>
  <p><strong>Date of Birth:</strong> {patient.dob?.substring(0, 10)}</p>

  <p><strong>Medical History:</strong></p>
  <p>{patient.medicalHistory || "No medical history yet."}</p>
  <p><strong>Complain:</strong> {patient.complain || "No complaint reported."}</p>

  <hr />
  <h4>🩺 Vital Signs</h4>
  <p><strong>Blood Pressure:</strong> {patient.bloodPressure || "N/A"}</p>
  <p><strong>Oxygen Level:</strong> {patient.oxygenLevel || "N/A"}</p>
  <p><strong>Heart Rate:</strong> {patient.heartRate || "N/A"} bpm</p>
  <p><strong>Temperature:</strong> {patient.temperature || "N/A"} °C</p>

  <hr />
  <h4>📅 Appointments</h4>
  {patient.appointments?.length > 0 ? (
    <ul>
      {patient.appointments.map((appt, index) => (
        <li key={index}>
          📅 <strong>{new Date(appt.appointment_date).toLocaleDateString()}</strong> at 🕒{" "}
          <strong>{appt.appointment_time || "No time"}</strong> – Status: {appt.status || "Unknown"}
        </li>
      ))}
    </ul>
  ) : (
    <p>No appointments.</p>
  )}
</div>

        ))
      ) : (
        <p>No patients found.</p>
      )}
    </div>
  );
};

export default Patients;
