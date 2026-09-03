import { useState } from "react";
import { createProfile } from "../services/apiService";

const OBIETTIVI = [
  { value: "massa", label: "💪 Massa" },
  { value: "forza", label: "🏋️ Forza" },
  { value: "definizione", label: "🔥 Definizione" },
  { value: "recomposizione", label: "⚖️ Recomposizione" },
];

const LIVELLI = [
  { value: "principiante", label: "🌱 Principiante" },
  { value: "intermedio", label: "⚡ Intermedio" },
  { value: "avanzato", label: "🔱 Avanzato" },
];

const ProfileSetup = ({ onComplete }) => {
  const [form, setForm] = useState({
    peso: "",
    altezza: "",
    eta: "",
    bf_percentuale: "",
    obiettivo: "massa",
    livello: "intermedio",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.peso || !form.altezza || !form.eta) {
      setError("Peso, altezza ed età sono obbligatori");
      return;
    }
    setLoading(true);
    try {
      const data = await createProfile({
        peso: parseFloat(form.peso),
        altezza: parseInt(form.altezza),
        eta: parseInt(form.eta),
        bf_percentuale: form.bf_percentuale
          ? parseFloat(form.bf_percentuale)
          : null,
        obiettivo: form.obiettivo,
        livello: form.livello,
      });
      onComplete(data.profile);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-violet-400 mb-2">
            🏋️ CoachAI
          </h1>
          <h2 className="text-xl font-semibold text-gray-100 mb-1">
            Configura il tuo profilo
          </h2>
          <p className="text-gray-500 text-sm">
            Inserisci i tuoi dati per personalizzare l'esperienza
          </p>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-500/40 text-red-400 rounded-lg px-4 py-3 text-sm mb-6 flex justify-between items-center">
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-2 hover:text-red-300"
            >
              ✕
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1">
                Peso (kg)
              </label>
              <input
                type="number"
                name="peso"
                value={form.peso}
                onChange={handleChange}
                placeholder="es. 80"
                step="0.1"
                min="30"
                max="300"
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 text-sm focus:outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">
                Altezza (cm)
              </label>
              <input
                type="number"
                name="altezza"
                value={form.altezza}
                onChange={handleChange}
                placeholder="es. 180"
                min="100"
                max="250"
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 text-sm focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1">Età</label>
              <input
                type="number"
                name="eta"
                value={form.eta}
                onChange={handleChange}
                placeholder="es. 25"
                min="14"
                max="100"
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 text-sm focus:outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">
                BF% (opzionale)
              </label>
              <input
                type="number"
                name="bf_percentuale"
                value={form.bf_percentuale}
                onChange={handleChange}
                placeholder="es. 15"
                step="0.1"
                min="3"
                max="60"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 text-sm focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-2">
              Obiettivo
            </label>
            <div className="grid grid-cols-2 gap-2">
              {OBIETTIVI.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => setForm({ ...form, obiettivo: o.value })}
                  className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                    form.obiettivo === o.value
                      ? "bg-violet-500/20 border-violet-500 text-violet-300"
                      : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-2">Livello</label>
            <div className="grid grid-cols-3 gap-2">
              {LIVELLI.map((l) => (
                <button
                  key={l.value}
                  type="button"
                  onClick={() => setForm({ ...form, livello: l.value })}
                  className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                    form.livello === l.value
                      ? "bg-violet-500/20 border-violet-500 text-violet-300"
                      : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600"
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all"
          >
            {loading ? "Salvataggio..." : "Inizia ad allenarti →"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetup;
