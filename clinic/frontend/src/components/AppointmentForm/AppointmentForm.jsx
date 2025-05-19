import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./Appointment.css";
import { useTranslation } from "react-i18next";

const AppointmentForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [department, setDepartment] = useState("Pediatrics");
  const [doctorFullName, setDoctorFullName] = useState("");
  const [address, setAddress] = useState("");
  const [hasVisited, setHasVisited] = useState(false);

  const departmentsArray = ["Orthopedics", "Physical Therapy"];
  const [doctors, setDoctors] = useState([]);

  const fetchDoctors = async () => {
    try {
      const { data } = await axios.get("http://localhost:4000/api/v1/user/doctors", {
        withCredentials: true,
      });
      setDoctors(data.doctors);
    } catch (error) {
      console.error("Error fetching doctors:", error);
    }
  };

  useEffect(() => {
    if (department) {
      fetchDoctors();
    }
  }, [department]);

  const handleAppointment = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        "http://localhost:4000/api/v1/appointment/post",
        {
          fullName,
          email,
          phone,
          dob,
          gender,
          appointment_date: appointmentDate,
          department,
          doctor_fullName: doctorFullName,
          hasVisited: Boolean(hasVisited),
          address,
        },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      toast.success(data.message);
      setFullName("");
      setEmail("");
      setPhone("");
      setDob("");
      setGender("");
      setAppointmentDate("");
      setDepartment("");
      setDoctorFullName("");
      setHasVisited(false);
      setAddress("");
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const handleCancel = () => {
    navigate("/");
  };

  return (
    <div className="container form-component appointment-form">
      <h2>{t("appointment")}</h2>
      <form onSubmit={handleAppointment}>
        <input type="text" placeholder={t("fullName")} value={fullName} onChange={(e) => setFullName(e.target.value)} />
        <input type="text" placeholder={t("email")} value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="number" placeholder={t("mobileNumber")} value={phone} onChange={(e) => setPhone(e.target.value)} />
        <input type="date" placeholder={t("dateOfBirth")} value={dob} onChange={(e) => setDob(e.target.value)} />
        <select value={gender} onChange={(e) => setGender(e.target.value)}>
          <option value="">{t("selectGender")}</option>
          <option value="Male">{t("male")}</option>
          <option value="Female">{t("female")}</option>
        </select>
        <input type="date" placeholder={t("appointmentDate")} value={appointmentDate} onChange={(e) => setAppointmentDate(e.target.value)} />
        <select value={department} onChange={(e) => { setDepartment(e.target.value); setDoctorFullName(""); }}>
          {departmentsArray.map((depart, index) => (
            <option value={depart} key={index}>{t(depart)}</option>
          ))}
        </select>
        <select value={doctorFullName} onChange={(e) => setDoctorFullName(e.target.value)} disabled={!department}>
          <option value="">{t("selectDoctor")}</option>
          {doctors.filter((doctor) => doctor.doctorDepartment === department).map((doctor, index) => (
            <option value={doctor.fullName} key={index}>{doctor.fullName}</option>
          ))}
        </select>
        <textarea rows="10" value={address} onChange={(e) => setAddress(e.target.value)} placeholder={t("address")} />
        <div className="checkbox-container">
          <p>{t("haveYouVisited")}</p>
          <input type="checkbox" checked={hasVisited} onChange={(e) => setHasVisited(e.target.checked)} />
        </div>
        <div className="button-container">
          <button type="submit" className="get-appointment-btn">{t("getAppointment")}</button>
          <button type="button" onClick={handleCancel} className="cancel-btn">{t("cancel")}</button>
        </div>
      </form>
    </div>
  );
};

export default AppointmentForm;
