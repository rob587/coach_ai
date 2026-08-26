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

export const generateFeedback = async (req, res) => {
  try {
    // Prendo i log della settimana corrente
    const oggi = new Date();
    const lunedi = new Date(oggi);
    lunedi.setDate(oggi.getDate() - oggi.getDay() + 1);
    const lunediStr = lunedi.toISOString().split("T")[0];
    const oggiStr = oggi.toISOString().split("T")[0];

    const [logs] = await pool.query(
      `SELECT el.*, s.nome as sessione_nome, s.gruppi_muscolari
       FROM esercizi_log el
       JOIN sessioni s ON el.sessione_id = s.id
       WHERE el.user_id = ? AND el.data BETWEEN ? AND ?
       ORDER BY el.data ASC, el.created_at ASC`,
      [req.user.id, lunediStr, oggiStr],
    );

    if (logs.length === 0) {
      return res
        .status(400)
        .json({ error: "Nessun allenamento registrato questa settimana" });
    }

    // Prendo il profilo
    const [profiles] = await pool.query(
      "SELECT * FROM profiles WHERE user_id = ?",
      [req.user.id],
    );

    const profile = profiles[0];

    // Raggruppo i log per giorno e sessione
    const giorni = {};
    logs.forEach((log) => {
      if (!giorni[log.data]) {
        giorni[log.data] = {
          sessione: log.sessione_nome,
          gruppi: log.gruppi_muscolari,
          esercizi: [],
        };
      }
      giorni[log.data].esercizi.push(
        `${log.nome_esercizio}: ${log.serie}x${log.ripetizioni} @ ${log.peso}kg`,
      );
    });

    const settimanaText = Object.entries(giorni)
      .map(([data, info]) => {
        return `📅 ${data} — ${info.sessione} (${info.gruppi})\n${info.esercizi.map((e) => `  • ${e}`).join("\n")}`;
      })
      .join("\n\n");

    const prompt = `Sei CoachAI, un coach di strength training esperto.

Profilo atleta:
- Livello: ${profile?.livello || "intermedio"}
- Obiettivo: ${profile?.obiettivo || "massa"}
- Peso corporeo: ${profile?.peso || "N/A"}kg
- BF%: ${profile?.bf_percentuale || "N/A"}%

Allenamenti della settimana (${lunediStr} → ${oggiStr}):
${settimanaText}

Genera un feedback settimanale dettagliato che includa:
1. **Valutazione generale** — com'è andata la settimana
2. **Punti di forza** — cosa ha fatto bene
3. **Aree di miglioramento** — cosa può migliorare
4. **Suggerimenti per la prossima settimana** — consigli pratici


Sii diretto, tecnico ma anche motivante. Rispondi in italiano.`;

    const response = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "Sei CoachAI, un coach di strength training esperto e motivante. Parli sempre in italiano, sei diretto e dai consigli pratici basati sui dati.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 1000,
    });

    const contenuto = response.choices[0]?.message?.content || "";

    // Salvo il feedback
    const [result] = await pool.query(
      "INSERT INTO feedback_settimanale (user_id, settimana, contenuto) VALUES (?, ?, ?)",
      [req.user.id, lunediStr, contenuto],
    );

    res.json({
      success: true,
      feedback: {
        id: result.insertId,
        settimana: lunediStr,
        contenuto,
        created_at: new Date(),
      },
    });
  } catch (err) {
    console.error("Errore generateFeedback:", err);
    res.status(500).json({ error: "Errore nella generazione del feedback" });
  }
};
