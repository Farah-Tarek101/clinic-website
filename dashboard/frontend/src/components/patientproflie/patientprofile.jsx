import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { Context } from "../../main";
import "./patientprofile.css";
import { useTranslation } from "react-i18next";

// Use environment variable for API base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const PatientProfile = () => {
  const [userDetails, setUserDetails] = useState(null);
  const { isAuthenticated, user } = useContext(Context);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userAppointments, setUserAppointments] = useState([]);
  const { t } = useTranslation();
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [newAppointmentDate, setNewAppointmentDate] = useState("");
  const [newAppointmentTime, setNewAppointmentTime] = useState("");
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    dob: "",
    gender: "",
    medicalHistory: "",
    complain: "",
    bloodPressure: "",
    oxygenLevel: "",
    heartRate: "",
    temperature: ""
  });

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const token = localStorage.getItem("authToken");
        
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await axios.get("/api/v1/user/patient/me", {
          headers: {
            Authorization: `Bearer ${token}`
          },
          withCredentials: true
        });

        const userData = response.data.user;
        setUserDetails(userData);
        console.log("User details fetched:", userData);
        
        setFormData({
          fullName: userData.fullName || "",
          email: userData.email || "",
          phone: userData.phone || "",
          dob: userData.dob ? new Date(userData.dob).toISOString().split('T')[0] : "",
          gender: userData.gender || "",
          medicalHistory: userData.medicalHistory || "",
          complain: userData.complain || "",
          bloodPressure: userData.bloodPressure || "",
          oxygenLevel: userData.oxygenLevel || "",
          heartRate: userData.heartRate || "",
          temperature: userData.temperature || ""
        });

        // Fetch user appointments
        const appointmentsResponse = await axios.get(
          "/api/v1/appointment/my-appointments",
          { 
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        console.log("Fetched appointments:", appointmentsResponse.data.appointments);
        setUserAppointments(appointmentsResponse.data.appointments);

      } catch (err) {
        console.error("Error fetching user data or appointments:", err);
        setError(err.message || "Failed to fetch user data or appointments");
        
        if (user) {
          setUserDetails(user);
          setFormData({
            fullName: user.fullName || "",
            email: user.email || "",
            phone: user.phone || "",
            dob: user.dob ? new Date(user.dob).toISOString().split('T')[0] : "",
            gender: user.gender || "",
            medicalHistory: user.medicalHistory || "",
            complain: user.complain || "",
            bloodPressure: user.bloodPressure || "",
            oxygenLevel: user.oxygenLevel || "",
            heartRate: user.heartRate || "",
            temperature: user.temperature || ""
          });
        }
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchUserData();
    }
  }, [isAuthenticated, user]);

  const handleEdit = () => {
    setIsEditing(true);
    console.log("Entering edit mode. Current formData.phone:", formData.phone);
  };
  
  const handleCancel = () => {
    setIsEditing(false);
    if (userDetails) {
      setFormData({
        fullName: userDetails.fullName || "",
        email: userDetails.email || "",
        phone: userDetails.phone || "",
        dob: userDetails.dob ? new Date(userDetails.dob).toISOString().split('T')[0] : "",
        gender: userDetails.gender || "",
        medicalHistory: userDetails.medicalHistory || "",
        complain: userDetails.complain || "",
        bloodPressure: userDetails.bloodPressure || "",
        oxygenLevel: userDetails.oxygenLevel || "",
        heartRate: userDetails.heartRate || "",
        temperature: userDetails.temperature || ""
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Special handling for phone number
    if (name === 'phone') {
      // Only allow digits and limit to 11 characters
      const phoneValue = value.replace(/\D/g, '').slice(0, 11);
      console.log("Phone value after cleaning:", phoneValue);
      setFormData(prev => ({ ...prev, [name]: phoneValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    try {
      // Only include fields that have changed
      const changedFields = {};
      
      // Handle phone number separately
      if (formData.phone !== userDetails.phone) {
        const cleanedPhone = formData.phone.replace(/\D/g, '');
        if (cleanedPhone.length !== 11) {
          setError("Phone number must be exactly 11 digits");
          return;
        }
        changedFields.phone = cleanedPhone;
      }

      // Handle other fields
      if (formData.fullName !== userDetails.fullName) changedFields.fullName = formData.fullName;
      if (formData.email !== userDetails.email) changedFields.email = formData.email;
      if (formData.dob !== userDetails.dob) changedFields.dob = formData.dob;
      if (formData.gender !== userDetails.gender) changedFields.gender = formData.gender;
      if (formData.medicalHistory !== userDetails.medicalHistory) changedFields.medicalHistory = formData.medicalHistory;
      if (formData.complain !== userDetails.complain) changedFields.complain = formData.complain;

      // Handle vital signs - send exactly as entered
      if (formData.bloodPressure !== userDetails.bloodPressure) {
        changedFields.bloodPressure = formData.bloodPressure;
      }
      if (formData.oxygenLevel !== userDetails.oxygenLevel) {
        changedFields.oxygenLevel = formData.oxygenLevel;
      }
      if (formData.heartRate !== userDetails.heartRate) {
        changedFields.heartRate = formData.heartRate;
      }
      if (formData.temperature !== userDetails.temperature) {
        changedFields.temperature = formData.temperature;
      }

      console.log("Sending data to server:", changedFields);

      const { data } = await axios.put(
        `/api/v1/user/patient/me`,
        changedFields,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (data.success) {
        setUserDetails(data.user);
        setIsEditing(false);
        setError("");
        alert("Profile updated successfully!");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      console.error("Backend error response:", error.response?.data);
      
      // Keep the form data and user details intact
      setFormData(prevData => ({ ...prevData }));
      setUserDetails(prevDetails => ({ ...prevDetails }));
      
      // Show error message
      const errorMessage = error.response?.data?.message || "Error updating profile";
      setError(errorMessage);
      alert(errorMessage);
    }
  };

  // Add the missing handleSendCaseToDoctor function
  const handleSendCaseToDoctor = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.post(
        "/api/v1/doctor/send-case",
        {
          ...formData,
          patientId: userDetails._id
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );

      alert("Case sent to doctor successfully!");
    } catch (error) {
      console.error("Error sending case to doctor:", error);
      alert(error.response?.data?.message || "Error sending case to doctor!");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAppointment = async (appointment) => {
    console.log("Selected appointment for update:", appointment);
    if (!appointment._id || appointment._id.length !== 24) {
      console.error("Invalid appointment ID:", appointment._id);
      alert("Invalid appointment ID. Please try again.");
      return;
    }
    setEditingAppointment(appointment);
    setNewAppointmentDate(appointment.appointment_date.split('T')[0]);
    setNewAppointmentTime(appointment.appointment_time);
    
    // Fetch available time slots for the selected date
    try {
      const response = await axios.get(
        `/api/v1/appointment/get-available-slots?date=${appointment.appointment_date.split('T')[0]}&doctorId=${appointment.doctorId._id}`,
        { 
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`
          }
        }
      );
      setAvailableTimeSlots(response.data.availableSlots);
    } catch (error) {
      console.error("Error fetching time slots:", error);
      alert("Error fetching available time slots");
    }
  };

  const handleSaveAppointmentUpdate = async () => {
    if (!editingAppointment) return;

    try {
      console.log("Updating appointment:", editingAppointment._id);
      console.log("New date:", newAppointmentDate);
      console.log("New time:", newAppointmentTime);

      if (!editingAppointment._id || editingAppointment._id.length !== 24) {
        console.error("Invalid appointment ID:", editingAppointment._id);
        alert("Invalid appointment ID. Please try again.");
        return;
      }

      const response = await axios.put(
        `${API_BASE_URL}/api/v1/appointment/update-time/${editingAppointment._id}`,
        {
          newDate: newAppointmentDate,
          newTime: newAppointmentTime
        },
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        }
      );

      if (response.data.success) {
        // Update the appointments list
        const updatedAppointments = userAppointments.map(app => 
          app._id === editingAppointment._id ? response.data.appointment : app
        );
        setUserAppointments(updatedAppointments);
        setEditingAppointment(null);
        alert("Appointment time updated successfully! Waiting for admin approval.");
      }
    } catch (error) {
      console.error("Error updating appointment:", error);
      console.error("Error response:", error.response?.data);
      alert(error.response?.data?.message || "Error updating appointment time");
    }
  };

  const handleCancelAppointmentUpdate = () => {
    setEditingAppointment(null);
    setNewAppointmentDate("");
    setNewAppointmentTime("");
  };

  // Add error boundary to prevent component from disappearing
  if (!userDetails) {
    return <div>Loading...</div>;
  }

  return (
    <div className="profile-container">
      <div className="banner">
        <h1 className="banner-title">Hello, <span className="user-name">{userDetails.fullName || "Patient"}</span></h1>
        <p className="banner-subtitle">Manage your profile and update your vital signs anytime.</p>
      </div>

      <div className="profile-details">
        <h2 className="profile-header">Your Profile</h2>
        <div className="profile-info">
          <div className="profile-box">
            <h3>User Details</h3>
            <p><strong>Name:</strong> {isEditing ? <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="input-field" /> : userDetails.fullName || "N/A"}</p>
            <p><strong>Email:</strong> {isEditing ? <input type="email" name="email" value={formData.email} onChange={handleChange} className="input-field" /> : userDetails.email || "N/A"}</p>
            <p><strong>Phone:</strong> {isEditing ? 
              <input 
                type="tel" 
                name="phone" 
                value={formData.phone || ''} 
                onChange={handleChange} 
                className="input-field" 
                placeholder="Enter 11-digit phone number"
                maxLength="11"
                pattern="[0-9]*"
                inputMode="numeric"
              /> 
              : userDetails.phone || "N/A"
            }</p>
            <p><strong>Date of Birth:</strong> {isEditing ? <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="input-field" /> : new Date(userDetails.dob).toLocaleDateString() || "N/A"}</p>
            <p><strong>Gender:</strong> {isEditing ? 
              <select name="gender" value={formData.gender} onChange={handleChange} className="input-field">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select> : userDetails.gender || "N/A"
            }</p>
          </div>
        </div>

        <div className="profile-info">
          <div className="profile-box">
            <h3>Medical History & Complaints</h3>
            <p><strong>Medical History:</strong> {isEditing ? <textarea name="medicalHistory" value={formData.medicalHistory} onChange={handleChange} className="input-textarea" /> : userDetails.medicalHistory || "No history available"}</p>
            <p><strong>Complain:</strong> {isEditing ? <textarea name="complain" value={formData.complain} onChange={handleChange} className="input-textarea" /> : userDetails.complain || "No complaint"}</p>
          </div>
        </div>

        <div className="profile-info">
          <div className="profile-box">
            <h3>Vital Signs</h3>
            <p><strong>Blood Pressure:</strong> {isEditing ? <textarea name="bloodPressure" value={formData.bloodPressure} onChange={handleChange} className="input-textarea" /> : userDetails.bloodPressure || "No blood pressure available"}</p>
            <p><strong>Oxygen Level:</strong> {isEditing ? <textarea name="oxygenLevel" value={formData.oxygenLevel} onChange={handleChange} className="input-textarea" /> : userDetails.oxygenLevel || "No oxygen level available"}</p>
            <p><strong>Heart Rate:</strong> {isEditing ? <textarea name="heartRate" value={formData.heartRate} onChange={handleChange} className="input-textarea" /> : userDetails.heartRate || "No heart rate available"}</p>
            <p><strong>Temperature:</strong> {isEditing ? <textarea name="temperature" value={formData.temperature} onChange={handleChange} className="input-textarea" /> : userDetails.temperature || "No temperature available"}</p>
          </div>
        </div>

        <div className="profile-buttons">
          {isEditing ? (
            <>
              {loading ? (
                <div>Loading...</div>
              ) : (
                <>
                  <button onClick={handleSave} className="btn-save">Save</button>
                  <button onClick={handleCancel} className="btn-cancel">Cancel</button>
                </>
              )}
            </>
          ) : (
            <>
              <button onClick={handleEdit} className="btn-edit">Edit Profile</button>
              <button onClick={handleSendCaseToDoctor} className="btn-send">Send Case to Doctor</button>
            </>
          )}
        </div>

        <div className="profile-info">
          <div className="profile-box">
            <h3>My Appointments</h3>
            {userAppointments && userAppointments.length > 0 ? (
              <div className="appointments-section">
                <h2>{t("myAppointments")}</h2>
                <div className="appointments-list">
                  {userAppointments.map((appointment) => (
                    <div key={appointment._id} className="appointment-card">
                      <div className="appointment-info">
                        <p><strong>{t("date")}:</strong> {new Date(appointment.appointment_date).toLocaleDateString()}</p>
                        <p><strong>{t("time")}:</strong> {appointment.appointment_time}</p>
                        <p><strong>{t("status")}:</strong> <span className={`status ${appointment.status.toLowerCase()}`}>{t(appointment.status)}</span></p>
                        <p><strong>{t("department")}:</strong> {t(appointment.department?.toLowerCase() || "notAssigned")}</p>
                      </div>
                      {appointment.status !== "cancelled" && (
                        <div className="appointment-actions">
                          {editingAppointment?._id === appointment._id ? (
                            <div className="update-form">
                              <input
                                type="date"
                                value={newAppointmentDate}
                                onChange={(e) => setNewAppointmentDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                              />
                              <select
                                value={newAppointmentTime}
                                onChange={(e) => setNewAppointmentTime(e.target.value)}
                              >
                                <option value="">{t("selectTime")}</option>
                                {availableTimeSlots.map((slot) => (
                                  <option key={slot} value={slot}>
                                    {slot}
                                  </option>
                                ))}
                              </select>
                              <div className="update-buttons">
                                <button onClick={handleSaveAppointmentUpdate} className="save-btn">
                                  {t("save")}
                                </button>
                                <button onClick={handleCancelAppointmentUpdate} className="cancel-btn">
                                  {t("cancel")}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleUpdateAppointment(appointment)}
                              className="update-btn"
                              disabled={new Date(appointment.appointment_date) - new Date() < 2 * 60 * 60 * 1000}
                            >
                              {t("updateAppointment")}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="no-appointments">No appointments found. Book your first appointment today!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientProfile;