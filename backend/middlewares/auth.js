import { body } from 'express-validator';
import jwt from "jsonwebtoken";
import { User } from "../models/userSchema.js";
import { catchAsyncErrors } from "./catchAsyncErrors.js";
import ErrorHandler from "./error.js";

// Centralized authentication logic
const authenticateUser = async (token) => {
  if (!token) {
    throw new ErrorHandler("Authentication token missing", 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    console.log("Decoded token ID:", decoded.id);
    const user = await User.findById(decoded.id);
    if (!user) {
      throw new ErrorHandler("User not found", 404);
    }
    return user;
  } catch (error) {
    throw new ErrorHandler("Invalid token", 401);
  }
};



// Middleware to authenticate dashboard users
export const isAdminAuthenticated = catchAsyncErrors(async (req, res, next) => {
  try {
    // Check for token in cookies or Authorization header (for API requests)
    const token = req.cookies.adminToken || (req.headers.authorization && req.headers.authorization.startsWith('Bearer') 
      ? req.headers.authorization.split(' ')[1] : null);
    
    req.user = await authenticateUser(token, ["Admin"]);
    next();
  } catch (err) {
    return next(new ErrorHandler(err.message || "Authentication failed", 401));
  }
});

// Similarly, adjust the `isPatientAuthenticated` middleware
export const isPatientAuthenticated = catchAsyncErrors(async (req, res, next) => {
  try {
    // Check for token in cookies or Authorization header (for API requests)
    const token = req.cookies.patientToken || (req.headers.authorization && req.headers.authorization.startsWith('Bearer') 
      ? req.headers.authorization.split(' ')[1] : null);
      console.log("Extracted Token:", token);
      console.log("Decoded Token:", jwt.verify(token, process.env.JWT_SECRET_KEY));

    req.user = await authenticateUser(token, ["Patient"]);
    next();
  } catch (err) {
    return next(new ErrorHandler(err.message || "Authentication failed", 401));
  }
});

// New general authentication middleware that works for all user types
export const isAuthenticated = catchAsyncErrors(async (req, res, next) => {
  try {
    const token =
      req.cookies.adminToken ||
      req.cookies.patientToken ||
      req.cookies.doctorToken ||
      req.cookies.token ||
      (req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
        ? req.headers.authorization.split(" ")[1]
        : null);

    if (!token) {
      return next(new ErrorHandler("Authentication token missing", 401));
    }

    req.user = await authenticateUser(token); // Now it returns a user instead of calling next()
    next();
  } catch (err) {
    next(err); // Correctly pass the error to Express error handler
  }
});

export const validateUser = [
  body('fullName')
    .isString()
    .withMessage('Full name is required and should be a string')
    .notEmpty()
    .withMessage('Full name cannot be empty'),
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email address'),
  body('phone')
    .isMobilePhone()
    .withMessage('Please enter a valid phone number'),
  body('appointment_date')
    .isISO8601()
    .withMessage('Please enter a valid date'),
  body('department')
    .isString()
    .withMessage('Department must be a string')
    .notEmpty()
    .withMessage('Department cannot be empty'),
];

export const isAuthorized = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          `${req.user.role} not allowed to access this resource!`,
          403
        )
      );
    }
    next();
  };
};
