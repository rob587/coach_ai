import pool from "../config/database.js";

// crud delle sessioni

export const getSessioni = async (req, res) => {
  try {
    const [sessioni] = await pool.query(
      "SELECT * FROM sessioni WHERE user_id = ? ORDER BY ordine ASC",
      [req.user.id],
    );
    res.json({ sessioni });
  } catch (err) {
    console.error("Errore getSessioni:", err);
    res.status(500).json({ error: "Errore interno del server" });
  }
};

export const createSessione = async (req, res) => {
  const { nome, giorno, gruppi_muscolari, ordine = 0 } = req.body;

  if (!nome || !giorno || !gruppi_muscolari) {
    return res
      .status(400)
      .json({ error: "Nome, giorno e gruppi muscolari sono obbligatori" });
  }

  try {
    const [result] = await pool.query(
      "INSERT INTO sessioni (user_id, nome, giorno, gruppi_muscolari, ordine) VALUES (?, ?, ?, ?, ?)",
      [req.user.id, nome, giorno, gruppi_muscolari, ordine],
    );

    const [newSessione] = await pool.query(
      "SELECT * FROM sessioni WHERE id = ?",
      [result.insertId],
    );

    res.status(201).json({ sessione: newSessione[0] });
  } catch (err) {
    console.error("Errore createSessione:", err);
    res.status(500).json({ error: "Errore interno del server" });
  }
};
