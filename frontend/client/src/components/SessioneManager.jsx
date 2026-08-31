import { useState, useEffect } from "react";
import {
  getSessioni,
  createSessione,
  deleteSessione,
} from "../services/apiService";

const GIORNI = [
  { value: "lunedi", label: "Lunedì" },
  { value: "martedi", label: "Martedì" },
  { value: "mercoledi", label: "Mercoledì" },
  { value: "giovedi", label: "Giovedì" },
  { value: "venerdi", label: "Venerdì" },
  { value: "sabato", label: "Sabato" },
  { value: "domenica", label: "Domenica" },
];

const SessioneManager = ({ onSessioniChange }) => {
  const [sessioni, setSessioni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    giorno: "lunedi",
    gruppi_muscolari: "",
    ordine: 0,
  });
  const [submitting, setSubmitting] = useState(false);

  const loadSessioni = async () => {
    try {
      const data = await getSessioni();
      setSessioni(data.sessioni);
      onSessioniChange?.(data.sessioni);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessioni();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.nome.trim() || !form.gruppi_muscolari.trim()) return;
    setSubmitting(true);
    try {
      const data = await createSessione(form);
      const updated = [...sessioni, data.sessione];
      setSessioni(updated);
      onSessioniChange?.(updated);
      setForm({
        nome: "",
        giorno: "lunedi",
        gruppi_muscolari: "",
        ordine: 0,
      });
      setShowForm(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteSessione(id);
      const updated = sessioni.filter((s) => s.id !== id);
      setSessioni(updated);
      onSessioniChange?.(updated);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading)
    return (
      <div style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>
        Caricamento sessioni...
      </div>
    );

  return (
    <div className="card">
      <div className="card-header">
        <h2>📅 Le tue Sessioni</h2>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "✕ Annulla" : "+ Nuova Sessione"}
        </button>
      </div>

      {error && (
        <div className="error-banner">
          {error}
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleCreate} className="inner-form">
          <div className="form-row">
            <div className="form-group">
              <label>Nome sessione</label>
              <input
                type="text"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                placeholder="es. Upper Push"
                required
                autoFocus
              />
            </div>
            <div className="form-group">
              <label>Giorno</label>
              <select
                value={form.giorno}
                onChange={(e) => setForm({ ...form, giorno: e.target.value })}
              >
                {GIORNI.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Gruppi muscolari</label>
            <input
              type="text"
              value={form.gruppi_muscolari}
              onChange={(e) =>
                setForm({ ...form, gruppi_muscolari: e.target.value })
              }
              placeholder="es. Petto, Spalle, Tricipiti"
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? "Salvataggio..." : "Aggiungi Sessione"}
          </button>
        </form>
      )}

      {sessioni.length === 0 ? (
        <div className="empty-state">
          <p>📭 Nessuna sessione configurata.</p>
          <p>Aggiungi le tue sessioni di allenamento!</p>
        </div>
      ) : (
        <div className="sessioni-list">
          {sessioni.map((s) => (
            <div key={s.id} className="sessione-card">
              <div className="sessione-info">
                <span className="sessione-nome">{s.nome}</span>
                <div className="sessione-meta">
                  <span className="tag-giorno">
                    {GIORNI.find((g) => g.value === s.giorno)?.label}
                  </span>
                  <span className="tag-muscoli">{s.gruppi_muscolari}</span>
                </div>
              </div>
              <button onClick={() => handleDelete(s.id)} className="btn-delete">
                🗑
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SessioneManager;
