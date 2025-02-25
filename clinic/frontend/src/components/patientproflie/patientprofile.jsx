import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { Context } from "../../main";
import "./patientprofile.css";

const PatientProfile = () => {
  const [userDetails, setUserDetails] = useState(null);
  const { isAuthenticated, user } = useContext(Context);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

        const response = await axios.get("http://localhost:4000/api/v1/user/patient/me", {
          headers: {
            Authorization: `Bearer ${token}`
          },
          withCredentials: true
        });

        const userData = response.data.user;
        setUserDetails(userData);
        
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
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError(err.message || "Failed to fetch user data");
        
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

  const handleEdit = () => setIsEditing(true);
  
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
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.put(
        "http://localhost:4000/api/v1/user/patient/me",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );

      setUserDetails(response.data.user);
      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Error updating profile!");
    } finally {
      setLoading(false);
    }
  };

  // Add the missing handleSendCaseToDoctor function
  const handleSendCaseToDoctor = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.post(
        "http://localhost:4000/api/v1/doctor/send-case",
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

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  if (!isAuthenticated || !userDetails) {
    return <div className="error">Please log in to view your profile</div>;
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
            <p><strong>Phone:</strong> {isEditing ? <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="input-field" /> : userDetails.phone || "N/A"}</p>
            <p><strong>Date of Birth:</strong> {isEditing ? <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="input-field" /> : new Date(userDetails.dob).toLocaleDateString() || "N/A"}</p>
            <p><strong>Gender:</strong> {isEditing ? 
              <select name="gender" value={formData.gender} onChange={handleChange} className="input-field">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
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
      </div>
    </div>
  );
};

export default PatientProfile;