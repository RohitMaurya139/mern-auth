// src/utils/brevoApi.js
import axios from "axios";

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

export async function sendBrevoEmail({ to, subject, text, html, senderName }) {
  try {
    const payload = {
      sender: {
        name: senderName || "Mern Auth",
        email: process.env.SENDER_EMAIL,
      },
      to: Array.isArray(to) ? to.map((email) => ({ email })) : [{ email: to }],
      subject,
      textContent: text,
      htmlContent: html,
    };

    const res = await axios.post(BREVO_API_URL, payload, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "api-key": process.env.BREVO_API_KEY,
      },
      timeout: 10000,
    });

    return res.data;
  } catch (err) {
    // Build a readable message for logs
    const serverMsg = err.response?.data || err.message;
    throw new Error(
      typeof serverMsg === "string" ? serverMsg : JSON.stringify(serverMsg)
    );
  }
}
