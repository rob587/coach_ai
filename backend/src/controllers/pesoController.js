import pool from "../config/database.js";

export const getPesiLog = async (req, res) => {
  try {
    const [logs] = await pool.query(
      "SELECT * FROM peso_log WHERE user_id = ? ORDER BY data ASC",
      [req.user.id],
    );
    res.json({ logs });
  } catch (err) {
    console.error("Errore getPesiLog:", err);
    res.status(500).json({ error: "Errore interno del server" });
  }
};

export const createPesoLog = async (req, res) => {
  const { peso, data } = req.body;

  if (!peso || !data) {
    return res.status(400).json({ error: "Peso e data sono obbligatori" });
  }

  try {
    const [existing] = await pool.query(
      "SELECT id FROM peso_log WHERE user_id = ? AND data = ?",
      [req.user.id, data],
    );

    if (existing.length > 0) {
      await pool.query(
        "UPDATE peso_log SET peso = ? WHERE user_id = ? AND data = ?",
        [peso, req.user.id, data],
      );
    } else {
      await pool.query(
        "INSERT INTO peso_log (user_id, peso, data) VALUES (?, ?, ?)",
        [req.user.id, peso, data],
      );
    }

    const [updated] = await pool.query(
      "SELECT * FROM peso_log WHERE user_id = ? AND data = ?",
      [req.user.id, data],
    );

    res.json({ log: updated[0] });
  } catch (err) {
    console.error("Errore createPesoLog:", err);
    res.status(500).json({ error: "Errore interno del server" });
  }
};

export const deletePesoLog = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query("DELETE FROM peso_log WHERE id = ? AND user_id = ?", [
      id,
      req.user.id,
    ]);
    res.json({ message: "Log eliminato" });
  } catch (err) {
    console.error("Errore deletePesoLog:", err);
    res.status(500).json({ error: "Errore interno del server" });
  }
};
