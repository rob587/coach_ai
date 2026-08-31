import { useState, useEffect } from "react";
import {
  getSessioni,
  getLogs,
  createLog,
  deleteLog,
  getSuggerimentoCarichi,
} from "../services/apiService";

const LogAllenamento = () => {
  const [sessioni, setSessioni] = useState([]);
  const [sessioneSelezionata, setSessioneSelezionata] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [suggerimento, setSuggerimento] = useState(null);
  const [loadingSuggerimento, setLoadingSuggerimento] = useState(false);
  const [form, setForm] = useState({
    nome_esercizio: "",
    serie: "",
    ripetizioni: "",
    peso: "",
    note: "",
  });

  const oggi = new Date().toISOString().split("T")[0];

  const loadSessioni = async () => {
    try {
      const data = await getSessioni();
      setSessioni(data.sessioni);
      if (data.sessioni.length > 0) setSessioneSelezionata(data.sessioni[0]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadLogs = async (sessione_id) => {
    try {
      const data = await getLogs({ sessione_id, data: oggi });
      setLogs(data.logs);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadSessioni();
  }, []);

  useEffect(() => {
    if (sessioneSelezionata) {
      loadLogs(sessioneSelezionata.id);
    }
  }, [sessioneSelezionata]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!sessioneSelezionata) return;
    setSubmitting(true);
    try {
      const data = await createLog({
        sessione_id: sessioneSelezionata.id,
        data: oggi,
        nome_esercizio: form.nome_esercizio,
        serie: parseInt(form.serie),
        ripetizioni: parseInt(form.ripetizioni),
        peso: parseFloat(form.peso),
        note: form.note || null,
      });
      setLogs([...logs, data.log]);
      setForm({
        nome_esercizio: "",
        serie: "",
        ripetizioni: "",
        peso: "",
        note: "",
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
      await deleteLog(id);
      setLogs(logs.filter((l) => l.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSuggerimento = async () => {
    if (!sessioneSelezionata) return;
    setLoadingSuggerimento(true);
    setSuggerimento(null);
    try {
      const data = await getSuggerimentoCarichi(sessioneSelezionata.id);
      setSuggerimento(data.suggerimento);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingSuggerimento(false);
    }
  };

  const renderSuggerimento = (text) => {
    return text.split("\n").map((line, i) => {
      if (line.startsWith("**") && line.endsWith("**")) {
        return (
          <h3
            key={i}
            style={{
              color: "#a78bfa",
              marginTop: "12px",
              marginBottom: "4px",
            }}
          >
            {line.replace(/\*\*/g, "")}
          </h3>
        );
      }
      if (line.trim() === "") return <br key={i} />;
      return (
        <p
          key={i}
          style={{ margin: "3px 0", lineHeight: "1.6", fontSize: "0.9rem" }}
        >
          {line}
        </p>
      );
    });
  };
  if (loading)
    return (
      <div style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>
        Caricamento...
      </div>
    );
  return (
    <div className="log-container">
      {/* Selettore sessione */}
      <div className="card" style={{ marginBottom: "20px" }}>
        <h2 style={{ marginBottom: "16px" }}>🏋️ Log Allenamento — {oggi}</h2>

        {sessioni.length === 0 ? (
          <div className="empty-state">
            <p>Nessuna sessione configurata.</p>
            <p style={{ fontSize: "0.85rem" }}>
              Vai nelle Impostazioni per aggiungere le tue sessioni.
            </p>
          </div>
        ) : (
          <div className="sessioni-tabs">
            {sessioni.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setSessioneSelezionata(s);
                  setSuggerimento(null);
                }}
                className={`tab-btn ${sessioneSelezionata?.id === s.id ? "tab-active" : ""}`}
              >
                {s.nome}
              </button>
            ))}
          </div>
        )}
      </div>

      {sessioneSelezionata && (
        <>
          {/* Header sessione */}
          <div className="card" style={{ marginBottom: "20px" }}>
            <div className="card-header">
              <div>
                <h3 style={{ color: "#a78bfa" }}>{sessioneSelezionata.nome}</h3>
                <p
                  style={{
                    color: "#6b7280",
                    fontSize: "0.85rem",
                    marginTop: "4px",
                  }}
                >
                  {sessioneSelezionata.gruppi_muscolari}
                </p>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  className="btn-secondary"
                  onClick={handleSuggerimento}
                  disabled={loadingSuggerimento}
                >
                  {loadingSuggerimento ? "⏳ Analisi..." : "🤖 Suggerimento AI"}
                </button>
                <button
                  className="btn-primary"
                  onClick={() => setShowForm(!showForm)}
                >
                  {showForm ? "✕ Annulla" : "+ Esercizio"}
                </button>
              </div>
            </div>

            {/* Form aggiunta esercizio */}
            {showForm && (
              <form
                onSubmit={handleCreate}
                className="inner-form"
                style={{ marginTop: "16px" }}
              >
                <div className="form-group">
                  <label>Nome esercizio</label>
                  <input
                    type="text"
                    value={form.nome_esercizio}
                    onChange={(e) =>
                      setForm({ ...form, nome_esercizio: e.target.value })
                    }
                    placeholder="es. Panca Piana"
                    required
                    autoFocus
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Serie</label>
                    <input
                      type="number"
                      value={form.serie}
                      onChange={(e) =>
                        setForm({ ...form, serie: e.target.value })
                      }
                      placeholder="es. 4"
                      min="1"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Ripetizioni</label>
                    <input
                      type="number"
                      value={form.ripetizioni}
                      onChange={(e) =>
                        setForm({ ...form, ripetizioni: e.target.value })
                      }
                      placeholder="es. 8"
                      min="1"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Peso (kg)</label>
                    <input
                      type="number"
                      value={form.peso}
                      onChange={(e) =>
                        setForm({ ...form, peso: e.target.value })
                      }
                      placeholder="es. 80"
                      step="0.5"
                      min="0"
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Note (opzionale)</label>
                  <input
                    type="text"
                    value={form.note}
                    onChange={(e) => setForm({ ...form, note: e.target.value })}
                    placeholder="es. RPE 8, buona forma"
                  />
                </div>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={submitting}
                >
                  {submitting ? "Salvataggio..." : "Aggiungi Esercizio"}
                </button>
              </form>
            )}
          </div>

          {/* Suggerimento AI */}
          {suggerimento && (
            <div className="card card-ai" style={{ marginBottom: "20px" }}>
              <h3 style={{ color: "#a78bfa", marginBottom: "12px" }}>
                🤖 Suggerimento Carichi
              </h3>
              <div>{renderSuggerimento(suggerimento)}</div>
            </div>
          )}

          {/* Lista esercizi loggati */}
          {error && (
            <div className="error-banner">
              {error}
              <button onClick={() => setError(null)}>✕</button>
            </div>
          )}

          <div className="card">
            <h3 style={{ marginBottom: "16px" }}>
              Esercizi di oggi
              <span
                style={{
                  color: "#6b7280",
                  fontSize: "0.85rem",
                  fontWeight: "400",
                  marginLeft: "8px",
                }}
              >
                ({logs.length} esercizi)
              </span>
            </h3>

            {logs.length === 0 ? (
              <div className="empty-state">
                <p>🎯 Nessun esercizio loggato oggi.</p>
                <p style={{ fontSize: "0.85rem" }}>
                  Aggiungi il primo esercizio!
                </p>
              </div>
            ) : (
              <div className="log-list">
                {logs.map((log) => (
                  <div key={log.id} className="log-card">
                    <div className="log-info">
                      <span className="log-nome">{log.nome_esercizio}</span>
                      <div className="log-meta">
                        <span className="tag-serie">{log.serie} serie</span>
                        <span className="tag-rep">{log.ripetizioni} rep</span>
                        <span className="tag-peso">{log.peso} kg</span>
                        {log.note && (
                          <span
                            style={{ color: "#6b7280", fontSize: "0.78rem" }}
                          >
                            — {log.note}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(log.id)}
                      className="btn-delete"
                    >
                      🗑
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default LogAllenamento;
