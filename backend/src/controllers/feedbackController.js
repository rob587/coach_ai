import pool from "../config/database.js";
import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const getFeedback = async (req, res) => {
  try {
    const [feedback] = await pool.query(
      "SELECT * FROM feedback_settimanale WHERE user_id = ? ORDER BY created_at DESC LIMIT 10",
      [req.user.id],
    );
    res.json({ feedback });
  } catch (err) {
    console.error("Errore getFeedback:", err);
    res.status(500).json({ error: "Errore interno del server" });
  }
};
