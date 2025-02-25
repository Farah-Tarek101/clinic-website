import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { Appointment } from "../models/appointmentSchema.js";
import { User } from "../models/userSchema.js";
import { generateToken } from "../utils/jwtToken.js";
import passport from "passport";
// Function to check if password meets criteria
const validatePassword = (password) => {
  const passwordRegex = /^(?=.*[a-z]).+$/; // At least one lowercase letters
  return passwordRegex.test(password);
};


export const googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email']
});

export const googleAuthCallback = async (req, res, next) => {
  passport.authenticate('google', async (err, user, info) => {
    if (err) {
      return next(err); // Pass error to Express error handler
    }
    if (!user) {
      return res.status(401).json({ message: "Authentication failed" });
    }

    // Get the redirect URL from query params or use default
    const redirectUrl = req.query.redirect_url || process.env.FRONTEND_URL || 'http://localhost:5173/';

    try {
      // Generate JWT token
      const token = user.generateJsonWebToken();
      
      // Set appropriate cookie based on user role
      const cookieName = user.role === 'Admin' ? 'adminToken' : 
                        user.role === 'Patient' ? 'patientToken' : 
                        user.role === 'Doctor' ? 'doctorToken' : 'token';
      
      // Two options for handling authentication:
      
      // Option 1: API response (for API clients)
      if (req.xhr || req.headers.accept.includes('application/json')) {
        return res.status(200).json({ 
          success: true,
          message: "Login successful via Google",
          token, 
          user 
        });
      }
      
      // Option 2: Redirect with token (for web browser flow)
      // Construct redirect URL with token as query parameter
      const finalRedirectUrl = `${redirectUrl}?token=${token}&userId=${user._id}&role=${user.role}`;
      
      // Store token in cookie and redirect
      res.cookie(cookieName, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Use secure in production
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });
      
      return res.redirect(finalRedirectUrl);
    } catch (error) {
      console.error('Error in Google auth callback:', error);
      return next(new ErrorHandler("Authentication failed", 500));
    }
  })(req, res, next);
};export const patientRegister = catchAsyncErrors(async (req, res, next) => {
  const { fullName, email, phone, dob, gender, password, googleId } = req.body;

  // Validate required fields
  if (!fullName || !email || !phone || !dob || !gender || (!googleId && !password)) {
    return next(new ErrorHandler("Please Fill Full Form!", 400));
  }

  // Validate email format (should be @gmail.com)
  if (!email.endsWith("@gmail.com")) {
    return next(new ErrorHandler("Email should be a Gmail address!", 400));
  }

  // Validate password (if not using Google)
  if (!googleId && !validatePassword(password)) {
    return next(new ErrorHandler("Password must contain at least one number, one uppercase letter, and one lowercase letter!", 400));
  }

  // Check if the user is already registered
  const isRegistered = await User.findOne({ email });
  if (isRegistered) {
    return next(new ErrorHandler("User already Registered!", 400));
  }

  // Create a new user without medicalHistory field
  const user = await User.create({
    fullName,
    email,
    phone,
    dob,
    gender,
    password: googleId ? undefined : password, // Set password if not using Google login
    googleId, // If using Google, store googleId
    role: "Patient", // Default role for patient registration
  });

  // Generate a token and respond
  generateToken(user, "User Registered!", 200, res);
});

export const login = catchAsyncErrors(async (req, res, next) => {
  const { email, password, role, googleId } = req.body; // Removed confirmPassword from here

  if (!email || (!googleId && !password) || !role) {
    return next(new ErrorHandler("Please Fill Full Form!", 400));
  }

  // Validate email format (should be @gmail.com)
  if (!email.endsWith("@gmail.com")) {
    return next(new ErrorHandler("Email should be a Gmail address!", 400));
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorHandler("Invalid Email Or Password!", 400));
  }

  // If user has googleId but no password (OAuth only user)
  if (user.googleId && !user.password) {
    return next(new ErrorHandler("Please login with Google", 400));
  }

  const isPasswordMatch = googleId ? true : await user.comparePassword(password);
  if (!isPasswordMatch) {
    return next(new ErrorHandler("Invalid Email Or Password!", 400));
  }
  if (role !== user.role) {
    return next(new ErrorHandler(`${role} Not Found With This Role!`, 400));
  }

  generateToken(user, "Login Successfully!", 201, res);
});

export const addNewDoctor = catchAsyncErrors(async (req, res, next) => {
  const {
    fullName,
    email,
    phone,
    nic,
    dob,
    gender,
    password,
    doctorDepartment,
  } = req.body;

  if (
    !fullName ||
    !email ||
    !phone ||
    !nic ||
    !dob ||
    !gender ||
    !password ||
    !doctorDepartment
  ) {
    return next(new ErrorHandler("Please Fill Full Form!", 400));
  }

  // Validate email format
  if (!email.endsWith("@gmail.com")) {
    return next(new ErrorHandler("Email must be @gmail.com", 400));
  }

  // Password validation
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)/;
  if (!passwordRegex.test(password)) {
    return next(new ErrorHandler("Password must contain at least one number and one capital letter", 400));
  }

  const isRegistered = await User.findOne({ email });
  if (isRegistered) {
    return next(
      new ErrorHandler("Doctor With This Email Already Exists!", 400)
    );
  }

  const doctor = await User.create({
    fullName,
    email,
    phone,
    nic,
    dob,
    gender,
    password,
    role: "Doctor",
    doctorDepartment,
  });

  res.status(200).json({
    success: true,
    message: "New Doctor Registered",
    doctor,
  });
});

export const addNewAdmin = catchAsyncErrors(async (req, res, next) => {
  const { fullName, email, phone, nic, gender, password, dob } = req.body;
  
  // Validate required fields
  if (!fullName || !email || !phone || !nic || !gender || !password || !dob) {
    return next(new ErrorHandler("Please Fill Full Form!", 400));
  }

  // Validate email format (should be @gmail.com)
  if (!email.endsWith("@gmail.com")) {
    return next(new ErrorHandler("Email should be a Gmail address!", 400));
  }

  // Validate password
  if (!validatePassword(password)) {
    return next(new ErrorHandler("Password must contain at least one number and one uppercase letter!", 400));
  }

  const isRegistered = await User.findOne({ email });
  if (isRegistered) {
    return next(new ErrorHandler(`${isRegistered.role} With This Email Already Exists!`, 400));
  }

  const admin = await User.create({
    fullName,
    email,
    phone,
    nic,
    gender,
    password,
    role: "Admin",
    dob,
  });
  res.status(200).json({
    success: true,
    message: "New Admin Registered",
    admin,
  });
});

export const deleteDoctor = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params; 

  
  const doctor = await User.findById(id);

  if (!doctor || doctor.role !== "Doctor") {
    return next(new ErrorHandler("Doctor Not Found!", 404));
  }

  console.log("Doctor to be deleted:", doctor);

  const deletedAppointments = await Appointment.deleteMany({ doctorId: id });
  console.log(`Deleted ${deletedAppointments.deletedCount} appointments.`);

  await doctor.deleteOne();

  res.status(200).json({
    success: true,
    message: `Doctor and ${deletedAppointments.deletedCount} related appointments deleted successfully!`,
  });
});

export const updateDoctor = async (req, res) => {
  try {
    const { id } = req.params; 
    const updateData = req.body; 

    if (!id || !Object.keys(updateData).length) {
      return res.status(400).json({ message: "Invalid request data" });
    }

    
    console.log("Updating doctor with ID:", id);
    console.log("Update Data:", updateData);

    const doctor = await User.findByIdAndUpdate(
      id, 
      { ...updateData, role: 'Doctor' }, 
      { new: true } 
    );

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.status(200).json({ message: "Doctor updated successfully", doctor });
  } catch (error) {
    console.error("Error updating doctor:", error.message); 
    res.status(500).json({ message: "Internal Server Error" });
  }
};



export const logoutUser = (req, res) => {
  res.clearCookie("token"); // If using cookies
  return res.status(200).json({ message: "Logged out successfully" });
};


export const getAllDoctors = catchAsyncErrors(async (req, res, next) => {
  const doctors = await User.find({ role: "Doctor" });
  res.status(200).json({
    success: true,
    doctors,
  });
});

export const getUserDetails = catchAsyncErrors(async (req, res, next) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    user,
  });
});

// In userController.js
export const logout = catchAsyncErrors(async (req, res, next) => {
  console.log("Logout attempt started"); // Debug log
  
  try {
    // 1. Remove JWT token cookie
    res.cookie('token', '', {
      expires: new Date(0),
      httpOnly: true
    });

    // 2. Remove patient token cookie
    res.cookie('patientToken', '', {
      expires: new Date(0),
      httpOnly: true
    });

    // 3. Remove admin token cookie
    res.cookie('adminToken', '', {
      expires: new Date(0),
      httpOnly: true
    });

    // 4. Clear session synchronously
    if (req.session) {
      req.session = null;
    }

    console.log("Cookies and session cleared"); // Debug log

    return res.status(200).json({
      success: true,
      message: "Logged out successfully"
    });
  } catch (error) {
    console.error("Logout error:", error); // Debug log
    return next(new ErrorHandler("Error during logout", 500));
  }
});
// Update logoutAdmin to use the universal logout
export const logoutAdmin = catchAsyncErrors(async (req, res, next) => {
  return logout(req, res, next);
});

// Update logoutPatient to use the universal logout
export const logoutPatient = catchAsyncErrors(async (req, res, next) => {
  return logout(req, res, next);
});export const updateProfile = catchAsyncErrors(async (req, res, next) => {
  try {
    console.log("Request Body:", req.body); // Log the incoming data

    const { fullName, email, phone, dob, gender, medicalHistory, complain, bloodPressure, oxygenLevel, heartRate, temperature } = req.body;

    // Find and update the user by their ID
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id, // Replace this with the correct user ID logic
      { fullName, email, phone, dob, gender, medicalHistory, complain, bloodPressure, oxygenLevel, heartRate, temperature }, // Include medicalHistory
      { new: true, runValidators: true } // Return updated document and validate input
    );

    if (!updatedUser) {
      return next(new ErrorHandler("User not found!", 404)); // Handle not found error
    }

    // Respond with the updated user data
    res.status(200).json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating profile:", error.message);

    // Respond with an internal server error if any exception occurs
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// Get User Profile
export const getUserProfile = async (req, res) => { 
  try {
    const user = await User.findById(req.user.id); // req.user.id comes from JWT middleware
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


export const handleUpdateMedicalHistory = catchAsyncErrors(async (req, res, next) => {
  const { medicalHistory } = req.body;

  if (!medicalHistory) {
    return next(new ErrorHandler("Medical history is required!", 400));
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    { $set: { medicalHistory } }, // Only update medical history
    { new: true, runValidators: true }
  );

  if (!updatedUser) {
    return next(new ErrorHandler("User not found!", 404));
  }

  res.status(200).json({
    success: true,
    message: "Medical history updated successfully",
    user: updatedUser,
  });
});




