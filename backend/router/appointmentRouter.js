import express from "express";
import {
  deleteAppointment,
  getAllAppointments,
  getUserAppointments,
  postAppointment,
  updateAppointmentStatus,
  getAvailableTimeSlots,
  updateAppointmentTime,
} from "../controller/appointmentController.js";
import {
  isAdminAuthenticated,
  isAuthenticated,
  isPatientAuthenticated,
} from "../middlewares/auth.js";

const router = express.Router();

router.post("/post", isPatientAuthenticated, postAppointment);
router.get("/getall", isAdminAuthenticated, getAllAppointments);
router.put("/update/:id", isAdminAuthenticated, updateAppointmentStatus);
router.put("/update-time/:appointmentId", isPatientAuthenticated, updateAppointmentTime);
router.delete("/delete/:id", isAdminAuthenticated, deleteAppointment);
router.get("/my-appointments", isPatientAuthenticated, getUserAppointments);
router.get("/get-available-slots", isPatientAuthenticated, getAvailableTimeSlots);

export default router;
