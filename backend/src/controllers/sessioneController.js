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

export const updateSessione = async (req, res) => {
  const { id } = req.params;
  const { nome, giorno, gruppi_muscolari, ordine } = req.body;

  try {
    const [existing] = await pool.query(
      "SELECT id FROM sessioni WHERE id = ? AND user_id = ?",
      [id, req.user.id],
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: "Sessione non trovata" });
    }

    await pool.query(
      `UPDATE sessioni SET
        nome = COALESCE(?, nome),
        giorno = COALESCE(?, giorno),
        gruppi_muscolari = COALESCE(?, gruppi_muscolari),
        ordine = COALESCE(?, ordine)
      WHERE id = ? AND user_id = ?`,
      [nome, giorno, gruppi_muscolari, ordine, id, req.user.id],
    );

    const [updated] = await pool.query("SELECT * FROM sessioni WHERE id = ?", [
      id,
    ]);

    res.json({ sessione: updated[0] });
  } catch (err) {
    console.error("Errore updateSessione:", err);
    res.status(500).json({ error: "Errore interno del server" });
  }
};

export const deleteSessione = async (req, res) => {
  const { id } = req.params;

  try {
    const [existing] = await pool.query(
      "SELECT id FROM sessioni WHERE id = ? AND user_id = ?",
      [id, req.user.id],
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: "Sessione non trovata" });
    }

    await pool.query("DELETE FROM sessioni WHERE id = ? AND user_id = ?", [
      id,
      req.user.id,
    ]);

    res.json({ message: "Sessione eliminata con successo" });
  } catch (err) {
    console.error("Errore deleteSessione:", err);
    res.status(500).json({ error: "Errore interno del server" });
  }
};
