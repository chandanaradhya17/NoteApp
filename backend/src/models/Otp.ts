import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  username: { type: String },           // store username for signup
  createdAt: { type: Date, default: Date.now, expires: 300 }, // 5 min expiry
});

export const Otp = mongoose.model("Otp", otpSchema);
