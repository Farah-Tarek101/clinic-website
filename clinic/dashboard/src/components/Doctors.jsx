import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Context } from "../main";
import { Navigate } from "react-router-dom";

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const { isAuthenticated } = useContext(Context);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [updateData, setUpdateData] = useState({
    fullName: "",
    email: "",
    phone: "",
    nic: "",
    dob: "",
    gender: "",
   
    doctorDepartment: "",
  });

  // Fetch doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:4000/api/v1/user/doctors",
          { withCredentials: true }
        );
        setDoctors(data.doctors);
      } catch (error) {
        toast.error(error.response?.data?.message || "Error fetching doctors");
      }
    };
    fetchDoctors();
  }, []);

  // Delete doctor
  const handleDeleteDoctor = async (doctorId) => {
    try {
      const { data } = await axios.delete(
        `http://localhost:4000/api/v1/user/doctor/delete/${doctorId}`,
        { withCredentials: true }
      );
      // Remove the deleted doctor from the state
      setDoctors((prevDoctors) =>
        prevDoctors.filter((doctor) => doctor._id !== doctorId)
      );
      toast.success(data.message || "Doctor deleted successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Error deleting doctor");
    }
  };

  // Update doctor
  const handleUpdateDoctor = async (e) => {
    e.preventDefault(); // Prevent form submission
    console.log("Updating doctor:", updateData); // Log the update data
    console.log("Doctor ID being updated:", editingDoctor._id); // Log the doctor ID being used

    try {
        const { data } = await axios.put(
            `http://localhost:4000/api/v1/user/doctor/update/${editingDoctor._id}`,
            updateData,  // Send the updateData object
            { withCredentials: true }
        );

        // Update the doctor list with the new doctor data
        setDoctors((prevDoctors) =>
            prevDoctors.map((doc) =>
                doc._id === editingDoctor._id ? { ...doc, ...data.doctor } : doc
            )
        );
        
        // Show success message
        toast.success(data.message);
        
        // Clear the editing state
        setEditingDoctor(null);
    } catch (error) {
        // Improved error handling
        console.error("Error updating doctor:", error.response?.data || error);
        toast.error(error.response?.data?.message || error.message || "Error updating doctor");
    }
};

  
  

  if (!isAuthenticated) {
    return <Navigate to={"/login"} />;
  }

  return (
    <section className="page doctors">
      <h1>DOCTORS</h1>
      <div className="banner">
        {doctors && doctors.length > 0 ? (
          doctors.map((doctor) => (
            <div className="card" key={doctor._id}>
            <h4>{doctor.fullName}</h4>
            <div className="details">
              <p>Email: <span>{doctor.email}</span></p>
              <p>Phone: <span>{doctor.phone}</span></p>
              <p>DOB: <span>{doctor.dob.substring(0, 10)}</span></p>
              <p>Department: <span>{doctor.doctorDepartment || "Not Provided"}</span></p>
              <p>NIC: <span>{doctor.nic || "Not Provided"}</span></p>
              <p>Gender: <span>{doctor.gender}</span></p>
            </div>
            <div className="button-container">
              <button
                onClick={() => {
                  setEditingDoctor(doctor);
                  setUpdateData({
                    fullName: doctor.fullName,
                    email: doctor.email,
                    phone: doctor.phone,
                    nic: doctor.nic,
                    dob: doctor.dob.substring(0, 10),
                    gender: doctor.gender,
                    doctorDepartment: doctor.doctorDepartment,
                  });
                }}
                className="update-btn"
              >
                Update Doctor
              </button>
              <button
                onClick={() => handleDeleteDoctor(doctor._id)}
                className="delete-btn"
              >
                Delete Doctor
              </button>
            </div>
          </div>
          
          ))
        ) : (
          <h1>No Registered Doctors Found!</h1>
        )}
      </div>

      {/* Update Form */}
      {editingDoctor && (
        <div className="update-modal">
          <form onSubmit={handleUpdateDoctor}>
            <h2>Update Doctor</h2>
            <label>Full Name</label>
            <input
              type="text"
              value={updateData.fullName}
              onChange={(e) => setUpdateData({ ...updateData, fullName: e.target.value })}
              required
            />
            <label>Email</label>
            <input
              type="email"
              value={updateData.email}
              onChange={(e) => setUpdateData({ ...updateData, email: e.target.value })}
              required
            />
            <label>Phone</label>
            <input
              type="text"
              value={updateData.phone}
              onChange={(e) => setUpdateData({ ...updateData, phone: e.target.value })}
              required
            />
            <label>NIC</label>
            <input
              type="text"
              value={updateData.nic}
              onChange={(e) => setUpdateData({ ...updateData, nic: e.target.value })}
              required
            />
            <label>Date of Birth</label>
            <input
              type="date"
              value={updateData.dob}
              onChange={(e) => setUpdateData({ ...updateData, dob: e.target.value })}
              required
            />
            <label>Gender</label>
            <select
              value={updateData.gender}
              onChange={(e) => setUpdateData({ ...updateData, gender: e.target.value })}
              required
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
            <label>Department</label>
            <select
              value={updateData.doctorDepartment}
              onChange={(e) => setUpdateData({ ...updateData, doctorDepartment: e.target.value })}
              required
            >
              <option value="">Select Department</option>
              <option value="Physical Therapy">Physical Therapy</option>
              <option value="Orthopedics">Orthopedics</option>
            </select>
            <button type="submit" className="save-btn">Save</button>
            <button
              type="button"
              onClick={() => setEditingDoctor(null)}
              className="cancel-btn"
            >
              Cancel
            </button>
          </form>
        </div>
      )}
    </section>
  );
};

export default Doctors;
