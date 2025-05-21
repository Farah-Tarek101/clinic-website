import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { Message } from "../models/messageSchema.js";

// Helper functions for validation
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidPhone = (phone) => {
  const phoneRegex = /^\d{10,15}$/;  // Matches digits between 10 and 15 long
  return phoneRegex.test(phone);
};


export const sendMessage = catchAsyncErrors(async (req, res, next) => {
  const { fullName, email, phone, message, googleId, isVerified } = req.body;

  if (!fullName || !email || !phone || !message) {
    return next(new ErrorHandler("Please fill out the entire form!", 400));
  }

  if (!isValidEmail(email)) {
    return next(new ErrorHandler("Please enter a valid email address.", 400));
  }

  if (!message.trim()) {
    return next(new ErrorHandler("Message cannot be empty.", 400));
  }

  if (!isValidPhone(phone)) {
    return next(new ErrorHandler("Phone number must be exactly 10 digits.", 400));
  }

  await Message.create({ fullName, email, phone, message, googleId, isVerified });

  res.status(200).json({
    success: true,
    message: "Message sent!",
  });
});

export const getAllMessages = catchAsyncErrors(async (req, res, next) => {
  const messages = await Message.find();
  res.status(200).json({
    success: true,
    messages,
  });
});
