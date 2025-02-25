import { config } from 'dotenv';
config(); // Ensure this line is placed at the top

import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import fileUpload from "express-fileupload";
import session from "express-session";
import passport from "passport";
import { dbConnection } from './database/dbConnection.js';
import { errorMiddleware } from "./middlewares/error.js";
import setupPassport from './config/setupPassport.js';  // Ensure this path matches where you created the file
import appointmentRouter from "./router/appointmentRouter.js";
import messageRouter from "./router/messageRouter.js";
import userRouter from "./router/userRouter.js";

const app = express();

app.use(
  cors({
    origin: [process.env.FRONTEND_URL_ONE,
        process.env.FRONTEND_URL_TWO],
    methods: ["GET", "POST", "DELETE", "PUT"],
    credentials: true,
  })
);app.get('/api/v1/user/appointments', async (req, res) => {
  try {
    const appointments = await Appointment.find(); // Fetch from MongoDB
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});


// Setup session before passport
app.use(session({
  secret: process.env.JWT_SECRET_KEY, // Use your existing JWT secret
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Only use secure cookies in production
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});
// Initialize Passport and set up Google OAuth
setupPassport();  // Call the setup function here
app.use(passport.initialize());
app.use(passport.session());

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

app.use("/api/v1/message", messageRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/appointment", appointmentRouter);

dbConnection();

app.use(errorMiddleware);
export default app;

