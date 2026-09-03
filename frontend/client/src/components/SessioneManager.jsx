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
      <div className="flex items-center justify-center py-20 text-gray-500">
        Caricamento sessioni...
      </div>
    );

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-100">
            📅 Le tue Sessioni
          </h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-all"
          >
            {showForm ? "✕ Annulla" : "+ Nuova Sessione"}
          </button>
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
            className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 mb-4 space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1">
                  Nome sessione
                </label>
                <input
                  type="text"
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  placeholder="es. Upper Push"
                  required
                  autoFocus
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 text-sm focus:outline-none focus:border-violet-500"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">
                  Giorno
                </label>
                <select
                  value={form.giorno}
                  onChange={(e) => setForm({ ...form, giorno: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 text-sm focus:outline-none focus:border-violet-500"
                >
                  {GIORNI.map((g) => (
                    <option key={g.value} value={g.value}>
                      {g.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1">
                Gruppi muscolari
              </label>
              <input
                type="text"
                value={form.gruppi_muscolari}
                onChange={(e) =>
                  setForm({ ...form, gruppi_muscolari: e.target.value })
                }
                placeholder="es. Petto, Spalle, Tricipiti"
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 text-sm focus:outline-none focus:border-violet-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-all"
            >
              {submitting ? "Salvataggio..." : "Aggiungi Sessione"}
            </button>
          </form>
        )}

        {sessioni.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <p className="text-lg mb-1">📭 Nessuna sessione configurata.</p>
            <p className="text-sm">Aggiungi le tue sessioni di allenamento!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessioni.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3"
              >
                <div>
                  <span className="text-gray-100 font-medium">{s.nome}</span>
                  <div className="flex gap-2 mt-1">
                    <span className="bg-violet-500/20 text-violet-300 text-xs px-2 py-0.5 rounded-full">
                      {GIORNI.find((g) => g.value === s.giorno)?.label}
                    </span>
                    <span className="bg-gray-700 text-gray-400 text-xs px-2 py-0.5 rounded-full">
                      {s.gruppi_muscolari}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(s.id)}
                  className="text-gray-600 hover:text-red-400 hover:bg-red-400/10 p-2 rounded-lg transition-all"
                >
                  🗑
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SessioneManager;
