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

export const getLogsByEsercizio = async (req, res) => {
  const { nome_esercizio } = req.params;
  try {
    const [logs] = await pool.query(
      `SELECT * FROM esercizi_log 
       WHERE user_id = ? AND nome_esercizio = ?
       ORDER BY data ASC`,
      [req.user.id, nome_esercizio],
    );

    res.json({ logs });
  } catch (err) {
    console.error("Errore getLogsByEsercizio:", err);
    res.status(500).json({ error: "Errore interno del server" });
  }
};

export const createLog = async (req, res) => {
  const { sessione_id, data, nome_esercizio, serie, ripetizioni, peso, note } =
    req.body;

  if (
    !sessione_id ||
    !data ||
    !nome_esercizio ||
    !serie ||
    !ripetizioni ||
    !peso
  ) {
    return res
      .status(400)
      .json({ error: "Tutti i campi obbligatori mancanti" });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO esercizi_log 
       (user_id, sessione_id, data, nome_esercizio, serie, ripetizioni, peso, note) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        sessione_id,
        data,
        nome_esercizio,
        serie,
        ripetizioni,
        peso,
        note || null,
      ],
    );

    const [newLog] = await pool.query(
      "SELECT * FROM esercizi_log WHERE id = ?",
      [result.insertId],
    );

    res.status(201).json({ log: newLog[0] });
  } catch (err) {
    console.error("Errore createLog:", err);
    res.status(500).json({ error: "Errore interno del server" });
  }
};
