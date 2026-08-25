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

export const createProfile = async (req, res) => {
  const { peso, altezza, eta, bf_percentuale, obiettivo, livello } = req.body;

  if (!peso || !altezza || !eta || !obiettivo || !livello) {
    return res
      .status(400)
      .json({ error: "Tutti i campi obbligatori mancanti" });
  }

  try {
    const [existing] = await pool.query(
      "SELECT id FROM profiles WHERE user_id = ?",
      [req.user.id],
    );

    if (existing.length > 0) {
      return res
        .status(409)
        .json({ error: "Profilo già esistente, usa l'aggiornamento" });
    }

    await pool.query(
      "INSERT INTO profiles (user_id, peso, altezza, eta, bf_percentuale, obiettivo, livello) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        req.user.id,
        peso,
        altezza,
        eta,
        bf_percentuale || null,
        obiettivo,
        livello,
      ],
    );

    const [newProfile] = await pool.query(
      "SELECT * FROM profiles WHERE user_id = ?",
      [req.user.id],
    );

    res.status(201).json({ profile: newProfile[0] });
  } catch (err) {
    console.error("Errore createProfile:", err);
    res.status(500).json({ error: "Errore interno del server" });
  }
};

export const updateProfile = async (req, res) => {
  const { peso, altezza, eta, bf_percentuale, obiettivo, livello } = req.body;

  try {
    const [existing] = await pool.query(
      "SELECT id FROM profiles WHERE user_id = ?",
      [req.user.id],
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: "Profilo non trovato" });
    }

    await pool.query(
      `UPDATE profiles SET 
        peso = COALESCE(?, peso),
        altezza = COALESCE(?, altezza),
        eta = COALESCE(?, eta),
        bf_percentuale = COALESCE(?, bf_percentuale),
        obiettivo = COALESCE(?, obiettivo),
        livello = COALESCE(?, livello)
      WHERE user_id = ?`,
      [peso, altezza, eta, bf_percentuale, obiettivo, livello, req.user.id],
    );

    const [updated] = await pool.query(
      "SELECT * FROM profiles WHERE user_id = ?",
      [req.user.id],
    );

    res.json({ profile: updated[0] });
  } catch (err) {
    console.error("Errore updateProfile:", err);
    res.status(500).json({ error: "Errore interno del server" });
  }
};
