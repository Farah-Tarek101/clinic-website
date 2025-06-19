import React, { useContext, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import Appointments from "./pages/Appointments";
import Login from "./pages/Login";
import { Context } from "./main";
// import ProtectedRoute from "./components/ProtectedRoute"; ❌ Temporarily disable this
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  const { setIsAuthenticated, setDoctor } = useContext(Context);

  useEffect(() => {
    // ✅ Mock authentication for development
    setIsAuthenticated(true);
    setDoctor({
      _id: "mock-id",
      fullName: "Dr. Test User",
      email: "test@clinic.com",
      role: "Doctor",
    });
  }, [setIsAuthenticated, setDoctor]);

  return (
    <Router>
      <Sidebar />
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* ✅ Default path shows Patients page */}
        <Route path="/" element={<Patients />} />

        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/patients" element={<Patients />} />
        <Route path="/appointments" element={<Appointments />} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <ToastContainer position="top-center" />
    </Router>
  );
};

export default App;
