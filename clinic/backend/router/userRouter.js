import express from "express";
import passport from "passport";
import {
  addNewAdmin,
  addNewDoctor,
  deleteDoctor,
  getAllDoctors,
  getUserDetails,
  getUserProfile,
  handleUpdateMedicalHistory,
  login,
  logout,  // Import the universal logout function
  logoutAdmin,
  logoutPatient,
  patientRegister,
  updateDoctor,
  updateProfile,
  googleAuth,
  logoutUser,
  googleAuthCallback,
} from "../controller/userController.js";
import {
  isAdminAuthenticated,
  isPatientAuthenticated,
  isAuthenticated,  // Import the universal authentication middleware
} from "../middlewares/auth.js";

const router = express.Router();

// Google OAuth routes
router.get('/auth/google', googleAuth);
router.get('/auth/google/callback', googleAuthCallback);

// Public routes
router.post("/patient/register", patientRegister);
router.post("/login", login);
router.post("/patient/login", login);

// Admin routes - requires admin authentication
router.post("/admin/addnew", isAdminAuthenticated, addNewAdmin);
router.post("/doctor/addnew", isAdminAuthenticated, addNewDoctor);
router.get("/doctors", getAllDoctors);
router.get("/admin/logout", isAdminAuthenticated, logoutAdmin);

// Patient routes - requires patient authentication
router.get("/patient/me", isPatientAuthenticated, getUserDetails);
router.get("/admin/me", isAdminAuthenticated, getUserDetails);
router.get("/patient/logout", isPatientAuthenticated, logoutPatient);

// Add universal logout route that works for any authenticated user
router.get("/logout", isAuthenticated, logout);
router.get("/patient/logout", isPatientAuthenticated, logout);
router.post("/logout", isAuthenticated, logoutUser);
// Other routes remain the same
router.put("/patient/me", isPatientAuthenticated, updateProfile);
router.get('/profile', isPatientAuthenticated, getUserProfile);
router.put("/patient/me", isPatientAuthenticated, handleUpdateMedicalHistory);
router.put("/patient/medical-history", isPatientAuthenticated, handleUpdateMedicalHistory);
router.get("/doctors", getAllDoctors);
router.delete("/doctor/delete/:id", isAdminAuthenticated, deleteDoctor);
router.put("/doctor/update/:id", isAdminAuthenticated, updateDoctor);

export default router;

