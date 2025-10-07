
import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import generateToken from "../config/token.js";
import { sendBrevoEmail } from "../utils/brevoApi.js";

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }
    if (password.length < 8) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Password must be at least 8 characters long",
        });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    const token = await generateToken(newUser._id);
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    // send welcome email via Brevo API
    const subject = "Welcome To Mern-auth";
    const text = `Welcome ${name}! Your account has been created with ${email}.`;
    try {
      await sendBrevoEmail({
        to: email,
        subject,
        text,
        html: `<p>${text}</p>`,
      });
    } catch (err) {
      console.error("Brevo send error (welcome):", err.message || err);
      // continue — registration succeeded even if email fails
    }

    res
      .status(201)
      .json({
        success: true,
        message: "User registered successfully",
        data: newUser,
      });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Invalid Email" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = await generateToken(user._id);
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res
      .status(200)
      .json({
        success: true,
        message: `Welcome back! ${user.name}`,
        data: user,
      });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const logout = (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "strict",
    });
    res.status(200).json({ success: true, message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const sendVerifyOtp = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    if (user.isAccountVerified)
      return res.json({ success: false, message: "Account already verified" });

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 10 * 60 * 1000;
    await user.save();

    const subject = "Account Verification OTP";
    const text = `Your OTP is ${otp}. It expires in 10 minutes.`;

    try {
      await sendBrevoEmail({
        to: user.email,
        subject,
        text,
        html: `<p>${text}</p>`,
      });
    } catch (err) {
      console.error("Brevo send error (verify-otp):", err.message || err);
      return res
        .status(500)
        .json({
          success: false,
          message: "Failed to send email",
          error: err.message,
        });
    }

    return res
      .status(201)
      .json({ success: true, message: "Verification OTP sent to your email" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const VerifyEmail = async (req, res) => {
  try {
    const { userId, otp } = req.body;
    if (!userId || !otp)
      return res
        .status(400)
        .json({ success: false, message: "Missing details" });

    const user = await User.findById(userId);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    if (!user.verifyOtp || user.verifyOtp !== otp)
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    if (user.verifyOtpExpireAt < Date.now())
      return res.status(400).json({ success: false, message: "OTP expired" });

    user.isAccountVerified = true;
    user.verifyOtp = "";
    user.verifyOtpExpireAt = 0;
    await user.save();

    return res.json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const isAuthenticated = (req, res) => {
  try {
    // optionally verify token here or just return true if middleware passed
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const sendResetOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res
        .status(400)
        .json({ success: false, message: "Email is Required" });

    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User Not found" });

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 10 * 60 * 1000;
    await user.save();

    const subject = "Password Reset OTP";
    const text = `Your OTP for resetting your password is ${otp}.`;

    try {
      await sendBrevoEmail({
        to: user.email,
        subject,
        text,
        html: `<p>${text}</p>`,
      });
    } catch (err) {
      console.error("Brevo send error (reset-otp):", err.message || err);
      return res
        .status(500)
        .json({
          success: false,
          message: "Failed to send email",
          error: err.message,
        });
    }

    res.status(200).json({ success: true, message: "OTP sent to your Email" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword)
      return res
        .status(400)
        .json({ message: "Email,OTP, NewPassword are required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (!user.resetOtp || user.resetOtp !== otp)
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    if (user.resetOtpExpireAt < Date.now())
      return res.status(400).json({ success: false, message: "OTP expired" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetOtp = "";
    user.resetOtpExpireAt = 0;
    await user.save();

    return res.json({
      success: true,
      message: "Password has been reset successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
