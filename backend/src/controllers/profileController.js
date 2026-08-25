import pool from "../config/database.js";

// file per operazioni CRUD

export const getProfile = async (req, res) => {
  try {
    const [profiles] = await pool.query(
      "SELECT * FROM profiles WHERE user_id = ?",
      [req.user.id],
    );
    if (profiles.length === 0) {
      return res.status(404).json({ hasProfile: false });
    }

    res.json({ hasProfile: true, profile: profiles[0] });
  } catch (err) {
    console.error("Errore getProfile:", err);
    res.status(500).json({ error: "Errore interno del server" });
  }
};
