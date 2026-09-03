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
          <h3 key={i} className="text-violet-400 font-semibold mt-3 mb-1">
            {line.replace(/\*\*/g, "")}
          </h3>
        );
      }
      if (line.trim() === "") return <br key={i} />;
      return (
        <p key={i} className="text-gray-300 text-sm leading-relaxed">
          {line}
        </p>
      );
    });
  };

  if (loading)
    return (
      <div className="flex items-center justify-center py-20 text-gray-500">
        Caricamento...
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Selettore sessione */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-gray-100 mb-4">
          🏋️ Log Allenamento —{" "}
          <span className="text-gray-400 font-normal text-sm">{oggi}</span>
        </h2>

        {sessioni.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <p>Nessuna sessione configurata.</p>
            <p className="text-sm mt-1">Vai in Sessioni per aggiungerne una.</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {sessioni.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setSessioneSelezionata(s);
                  setSuggerimento(null);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                  sessioneSelezionata?.id === s.id
                    ? "bg-violet-500/20 border-violet-500 text-violet-300"
                    : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600"
                }`}
              >
                {s.nome}
              </button>
            ))}
          </div>
        )}
      </div>

      {sessioneSelezionata && (
        <>
          {/* Header sessione + azioni */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-violet-400 font-semibold text-lg">
                  {sessioneSelezionata.nome}
                </h3>
                <p className="text-gray-500 text-sm mt-1">
                  {sessioneSelezionata.gruppi_muscolari}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSuggerimento}
                  disabled={loadingSuggerimento}
                  className="bg-gray-800 hover:bg-gray-700 disabled:opacity-50 border border-gray-700 text-gray-300 text-sm px-3 py-2 rounded-lg transition-all"
                >
                  {loadingSuggerimento ? "⏳ Analisi..." : "🤖 Suggerimento AI"}
                </button>
                <button
                  onClick={() => setShowForm(!showForm)}
                  className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-3 py-2 rounded-lg transition-all"
                >
                  {showForm ? "✕ Annulla" : "+ Esercizio"}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-900/30 border border-red-500/40 text-red-400 rounded-lg px-4 py-3 text-sm mb-4 flex justify-between">
                {error}
                <button onClick={() => setError(null)}>✕</button>
              </div>
            )}

            {showForm && (
              <form
                onSubmit={handleCreate}
                className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 space-y-4"
              >
                <div>
                  <label className="block text-gray-400 text-sm mb-1">
                    Nome esercizio
                  </label>
                  <input
                    type="text"
                    value={form.nome_esercizio}
                    onChange={(e) =>
                      setForm({ ...form, nome_esercizio: e.target.value })
                    }
                    placeholder="es. Panca Piana"
                    required
                    autoFocus
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 text-sm focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">
                      Serie
                    </label>
                    <input
                      type="number"
                      value={form.serie}
                      onChange={(e) =>
                        setForm({ ...form, serie: e.target.value })
                      }
                      placeholder="es. 4"
                      min="1"
                      required
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 text-sm focus:outline-none focus:border-violet-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">
                      Ripetizioni
                    </label>
                    <input
                      type="number"
                      value={form.ripetizioni}
                      onChange={(e) =>
                        setForm({ ...form, ripetizioni: e.target.value })
                      }
                      placeholder="es. 8"
                      min="1"
                      required
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 text-sm focus:outline-none focus:border-violet-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">
                      Peso (kg)
                    </label>
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
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 text-sm focus:outline-none focus:border-violet-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">
                    Note (opzionale)
                  </label>
                  <input
                    type="text"
                    value={form.note}
                    onChange={(e) => setForm({ ...form, note: e.target.value })}
                    placeholder="es. RPE 8, buona forma"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 text-sm focus:outline-none focus:border-violet-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-all"
                >
                  {submitting ? "Salvataggio..." : "Aggiungi Esercizio"}
                </button>
              </form>
            )}
          </div>

          {/* Suggerimento AI */}
          {suggerimento && (
            <div className="bg-violet-950/30 border border-violet-500/30 rounded-2xl p-6">
              <h3 className="text-violet-400 font-semibold mb-3">
                🤖 Suggerimento Carichi
              </h3>
              <div>{renderSuggerimento(suggerimento)}</div>
            </div>
          )}

          {/* Lista esercizi */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h3 className="font-semibold text-gray-100 mb-4">
              Esercizi di oggi{" "}
              <span className="text-gray-500 font-normal text-sm">
                ({logs.length})
              </span>
            </h3>

            {logs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>🎯 Nessun esercizio loggato oggi.</p>
                <p className="text-sm mt-1">Aggiungi il primo esercizio!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3"
                  >
                    <div>
                      <span className="text-gray-100 font-medium">
                        {log.nome_esercizio}
                      </span>
                      <div className="flex gap-2 mt-1 flex-wrap">
                        <span className="bg-gray-700 text-gray-300 text-xs px-2 py-0.5 rounded-full">
                          {log.serie} serie
                        </span>
                        <span className="bg-gray-700 text-gray-300 text-xs px-2 py-0.5 rounded-full">
                          {log.ripetizioni} rep
                        </span>
                        <span className="bg-violet-500/20 text-violet-300 text-xs px-2 py-0.5 rounded-full font-medium">
                          {log.peso} kg
                        </span>
                        {log.note && (
                          <span className="text-gray-500 text-xs">
                            — {log.note}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(log.id)}
                      className="text-gray-600 hover:text-red-400 hover:bg-red-400/10 p-2 rounded-lg transition-all"
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
