import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import generateToken from "../config/token.js";
import transporter from "../config/nodemailer.js";
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name|| !email || !password) {
      return res.status(400).json({success:false, message: "All fields are required" });
    }
    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters long" });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
     name,
      email,
      password: hashedPassword,
    });
    await newUser.save();
    const token = await generateToken(newUser._id);
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production"?"None":"strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

      //sending welcome email
      const mailOptions = {
          from: process.env.SENDER_EMAIL,
          to: email,
          subject: "Welcome To Mern-auth by Rohit Maurya",
          text:`Welcome to Mern-auth website. your account has beeen created with email id: ${email}` 
      }
      await transporter.sendMail(mailOptions)
    res
      .status(201)
      .json({ message: "User registered successfully", data: newUser });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Invalid Email" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = await generateToken(user._id);
     res.cookie("token", token, {
       httpOnly: true,
       secure: process.env.NODE_ENV === "production",
       sameSite: process.env.NODE_ENV === "production" ? "None" : "strict",
       maxAge: 24 * 60 * 60 * 1000,
     });
      res.status(200).json({
        success:true,
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

    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const sendVerifyOtp = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.isAccountVerified) {
      return res.json({ success: false, message: "Account already verified" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Account Verification OTP",
      text: `Your OTP is ${otp}. Verify your account using this OTP.`,
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (err) {
      return res
        .status(500)
        .json({
          success: false,
          message: "Failed to send email",
          error: err.message,
        });
    }

    res
      .status(201)
      .json({ success: true, message: "Verification OTP sent to your email" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const VerifyEmail = async (req, res) => {
  try {
    const { userId, otp } = req.body;
    if (!userId || !otp) {
      return res
        .status(400)
        .json({ success: false, message: "Missing details" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.verifyOtp === "" || user.verifyOtp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    if (user.verifyOtpExpireAt < Date.now()) {
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    user.isAccountVerified = true;
    user.verifyOtp = "";
    user.verifyOtpExpireAt = 0;
    await user.save();

    return res.json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
