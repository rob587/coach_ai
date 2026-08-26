import pool from "../config/database.js";
import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const getLogs = async (req, res) => {
  try {
    let query = "SELECT * FROM esercizi_log WHERE user_id = ?";
    const params = [req.user.id];

    if (sessione_id) {
      query += " AND sessione_id = ?";
      params.push(sessione_id);
    }

    if (data) {
      query += " AND data = ?";
      params.push(data);
    }

    query += " ORDER BY data DESC, created_at ASC";

    const [logs] = await pool.query(query, params);
    res.json({ logs });
  } catch (err) {
    console.error("Errore getLogs:", err);
    res.status(500).json({ error: "Errore interno del server" });
  }
};
