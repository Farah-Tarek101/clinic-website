import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { Appointment } from "../models/appointmentSchema.js";
import { User } from "../models/userSchema.js";

export const postAppointment = catchAsyncErrors(async (req, res, next) => {
  const {
    fullName,
    email,
    phone,
    dob,
    gender,
    appointment_date,
    department,
    doctor_fullName,
    hasVisited,
    address,
  } = req.body;

  // Ensure user is authenticated
  if (!req.user) {
    return next(new ErrorHandler("User not authenticated!", 401));
  }

  const userEmail = req.user.email;
  const userFullName = req.user.fullName;

  if (
    !userFullName ||
    !userEmail ||
    !phone ||
    !dob ||
    !gender ||
    !appointment_date ||
    !department ||
    !doctor_fullName ||
    !address
  ) {
    return next(new ErrorHandler("Please fill the full form!", 400));
  }

const trimmedEmail = email.trim();
const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail|yahoo)\.com$/;

console.log("Email from body:", email);
console.log("Trimmed Email:", trimmedEmail);

if (!emailRegex.test(trimmedEmail)) {
  return next(new ErrorHandler("Email must be a Gmail or Yahoo address.", 400));
}


  // Ensure email matches the logged-in user's email
  if (email !== userEmail) {
    return next(new ErrorHandler("Email does not match logged-in user.", 403));
  }

  // Validate phone number format
  if (!/^\d{10,15}$/.test(phone)) {
    return next(new ErrorHandler("Phone number must be between 10 and 15 digits.", 400));
  }

  // Prevent booking in the past
  const currentDate = new Date();
  const appointmentDate = new Date(appointment_date);
  if (appointmentDate < currentDate) {
    return next(new ErrorHandler("Appointment cannot be booked in the past!", 400));
  }

  // Find doctor
  const doctor = await User.findOne({
    fullName: doctor_fullName,
    role: "Doctor",
    doctorDepartment: department,
  });

  if (!doctor) {
    return next(new ErrorHandler("Doctor not found.", 404));
  }

  // Create appointment
  const appointment = await Appointment.create({
    fullName: userFullName,
    email: userEmail,
    phone,
    dob,
    gender,
    appointment_date,
    department,
    doctor: {
      fullName: doctor_fullName,
    },
    hasVisited,
    address,
    doctorId: doctor._id,
    patientId: req.user._id,
  });

  res.status(200).json({
    success: true,
    appointment,
    message: "Appointment Sent!",
  });
});


export const getAllAppointments = catchAsyncErrors(async (req, res, next) => {
  const appointments = await Appointment.find();
  res.status(200).json({
    success: true,
    appointments,
  });
});

export const updateAppointmentStatus = catchAsyncErrors(
  async (req, res, next) => {
    const { id } = req.params;
    let appointment = await Appointment.findById(id);

    if (!appointment) {
      return next(new ErrorHandler("Appointment not found!", 404));
    }

    appointment = await Appointment.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });

    res.status(200).json({
      success: true,
      message: "Appointment Status Updated!",
    });
  }
);

// Delete appointment controller
export const deleteAppointment = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const appointment = await Appointment.findById(id);

  if (!appointment) {
    return next(new ErrorHandler("Appointment Not Found!", 404));
  }

  await appointment.deleteOne();

  res.status(200).json({
    success: true,
    message: "Appointment Deleted!",
  });
});
