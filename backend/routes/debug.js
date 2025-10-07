// routes/debug.js
import express from "express";
import { sendBrevoEmail } from "../utils/brevoApi.js";
const router = express.Router();

router.get("/_debug/send-test-email", async (req, res) => {
  try {
    await sendBrevoEmail({
      to: process.env.SENDER_EMAIL,
      subject: "Test email from backend",
      text: "If you receive this, Brevo API works from the server",
    });
    return res.json({ success: true, message: "Test email sent" });
  } catch (err) {
    console.error("Debug send error:", err);
    return res.status(500).json({ success: false, error: err.message || err });
  }
});

export default router;
