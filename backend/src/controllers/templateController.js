import pool from "../config/database.js";

export const getTemplate = async (req, res) => {
  const { sessione_id } = req.params;

  try {
    const [templates] = await pool.query(
      "SELECT * FROM templates WHERE user_id = ? AND sessione_id = ? ORDER BY ordine ASC",
      [req.user.id, sessione_id],
    );
    res.json({ templates });
  } catch (err) {
    console.error("Errore getTemplate:", err);
    res.status(500).json({ error: "Errore interno del server" });
  }
};

export const saveTemplate = async (req, res) => {
  const { sessione_id, esercizi } = req.body;

  if (!sessione_id || !esercizi || esercizi.length === 0) {
    return res
      .status(400)
      .json({ error: "Sessione e esercizi sono obbligatori" });
  }

  try {
    await pool.query(
      "DELETE FROM templates WHERE user_id = ? AND sessione_id = ?",
      [req.user.id, sessione_id],
    );

    for (let i = 0; i < esercizi.length; i++) {
      const { nome_esercizio, serie_default } = esercizi[i];
      await pool.query(
        "INSERT INTO templates (user_id, sessione_id, nome_esercizio, serie_default, ordine) VALUES (?, ?, ?, ?, ?)",
        [req.user.id, sessione_id, nome_esercizio, serie_default || null, i],
      );
    }

    const [templates] = await pool.query(
      "SELECT * FROM templates WHERE user_id = ? AND sessione_id = ? ORDER BY ordine ASC",
      [req.user.id, sessione_id],
    );

    res.json({ templates, message: "Template salvato con successo" });
  } catch (err) {
    console.error("Errore saveTemplate:", err);
    res.status(500).json({ error: "Errore interno del server" });
  }
};

export const deleteTemplate = async (req, res) => {
  const { sessione_id } = req.params;

  try {
    await pool.query(
      "DELETE FROM templates WHERE user_id = ? AND sessione_id = ?",
      [req.user.id, sessione_id],
    );
    res.json({ message: "Template eliminato con successo" });
  } catch (err) {
    console.error("Errore deleteTemplate:", err);
    res.status(500).json({ error: "Errore interno del server" });
  }
};
