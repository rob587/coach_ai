import pool from "../config/database.js";
import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

export const getLogs = async (req, res) => {
  const { sessione_id, data } = req.query;

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

export const updateLog = async (req, res) => {
  const { id } = req.params;
  const { serie, ripetizioni, peso, note } = req.body;

  try {
    const [existing] = await pool.query(
      "SELECT id FROM esercizi_log WHERE id = ? AND user_id = ?",
      [id, req.user.id],
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: "Log non trovato" });
    }

    await pool.query(
      `UPDATE esercizi_log SET
      serie = COALESCE(?, serie),
      ripetizioni = COALESCE(?, ripetizioni),
      peso = COALESCE(?, peso),
      note = COALESCE(?, note)
      WHERE id = ? AND user_id = ?`,
      [serie, ripetizioni, peso, note, id, req.user.id],
    );

    const [updated] = await pool.query(
      "SELECT * FROM esercizi_log WHERE id = ?",
      [id],
    );

    res.json({ log: updated[0] });
  } catch (err) {
    console.error("Errore updateLog:", err);
    res.status(500).json({ error: "Errore interno del server" });
  }
};

export const deleteLog = async (req, res) => {
  const { id } = req.params;

  try {
    const [existing] = await pool.query(
      "SELECT id FROM esercizi_log WHERE id = ? AND user_id = ?",
      [id, req.user.id],
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: "Log non trovato" });
    }

    await pool.query("DELETE FROM esercizi_log WHERE id = ? AND user_id = ?", [
      id,
      req.user.id,
    ]);

    res.json({ message: "Log eliminato con successo" });
  } catch (err) {
    console.error("Errore deleteLog:", err);
    res.status(500).json({ error: "Errore interno del server" });
  }
};

export const getSuggerimentoCarichi = async (req, res) => {
  const { sessione_id } = req.params;
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  try {
    // Prendo gli ultimi 4 log per ogni esercizio della sessione
    const [logs] = await pool.query(
      `SELECT nome_esercizio, serie, ripetizioni, peso, data
      FROM esercizi_log
      WHERE user_id = ? AND sessione_id = ?
      ORDER BY data DESC
      LIMIT 50`,
      [req.user.id, sessione_id],
    );

    if (logs.length === 0) {
      return res
        .status(404)
        .json({ error: "Nessun log trovato per questa sessione" });
    }

    // Raggruppo per esercizio
    const eserciziMap = {};
    logs.forEach((log) => {
      if (!eserciziMap[log.nome_esercizio]) {
        eserciziMap[log.nome_esercizio] = [];
      }
      eserciziMap[log.nome_esercizio].push(log);
    });

    // Prendo il profilo utente
    const [profiles] = await pool.query(
      "SELECT * FROM profiles WHERE user_id = ?",
      [req.user.id],
    );

    const profile = profiles[0];

    const esercizText = Object.entries(eserciziMap)
      .map(([nome, entries]) => {
        const ultimi = entries.slice(0, 4);
        const storico = ultimi
          .map(
            (e) => `  - ${e.data}: ${e.serie}x${e.ripetizioni} @ ${e.peso}kg`,
          )
          .join("\n");
        return `${nome}:\n${storico}`;
      })
      .join("\n\n");

    const prompt = `Sei CoachAI, un coach di strength training esperto di progressive overload.

Profilo atleta:
- Livello: ${profile?.livello || "intermedio"}
- Obiettivo: ${profile?.obiettivo || "massa"}
- Peso corporeo: ${profile?.peso || "N/A"}kg

Storico ultimi allenamenti per questa sessione:
${esercizText}

Analizza il progresso e suggerisci i carichi per la prossima sessione applicando il principio del progressive overload. Per ogni esercizio indica:
- Peso consigliato
- Serie e ripetizioni consigliate

Sii diretto e tecnico. Rispondi in italiano.`;

    const response = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "Sei un coach di strength training esperto. Dai consigli tecnici, diretti e basati sui dati. Parla sempre in italiano.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.5,
      max_tokens: 800,
    });

    const suggerimento = response.choices[0]?.message?.content || "";

    res.json({ suggerimento });
  } catch (err) {
    console.error("Errore getSuggerimentoCarichi:", err);
    res
      .status(500)
      .json({ error: "Errore nella generazione del suggerimento" });
  }
};
