import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import validator from "validator";

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, "Please enter your full name"],
  },
  email: {
    type: String,
    required: [true, "Email Is Required!"],
    validate: [validator.isEmail, "Provide A Valid Email!"],
    unique: true,
  },
 
  
  gender: {
    type: String,
    required: function() {
      // Only require gender if not using Google login
      return !this.googleId;
    },
    enum: ["Male", "Female", "Not Specified"],
  },
  password: {
    type: String,
    required: function() {
      // Only require password if not using Google login
      return !this.googleId;
    },
    minLength: [8, "Password Must Contain At Least 8 Characters!"],
    select: false,
  },
  
  role: {
    type: String,
    required: [true, "User Role Required!"],
    enum: ["Patient", "Doctor", "Admin"],
  },
  dob: {
    type: Date,
    required: [true, "DOB Is Required!"],
  },
  patientID: {
    type: String,
    unique: true,
    default: function() {
      return `P-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }
  },
  complain: {
    type: String,
    default: "",
    trim: true,
    maxlength: 500,
},
    medicalHistory: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
  },
  
    bloodPressure: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
  },
    oxygenLevel:{
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
  },
   heartRate: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
  },
    temperature: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
  },

     doctorDepartment:{
    type: String,
  },
  googleId: { type: String },
});

// Password hashing middleware
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

// Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// JWT token generation method
userSchema.methods.generateJsonWebToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};

export const User = mongoose.model("User", userSchema);


