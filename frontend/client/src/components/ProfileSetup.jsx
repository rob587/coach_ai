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
    <div className="setup-container">
      <div className="setup-card">
        <div className="setup-header">
          <h1>🏋️ CoachAI</h1>
          <h2>Configura il tuo profilo</h2>
          <p>Inserisci i tuoi dati per personalizzare l'esperienza</p>
        </div>

        {error && (
          <div className="error-banner">
            {error}
            <button onClick={() => setError(null)}>✕</button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="setup-form">
          <div className="form-row">
            <div className="form-group">
              <label>Peso (kg)</label>
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
              />
            </div>
            <div className="form-group">
              <label>Altezza (cm)</label>
              <input
                type="number"
                name="altezza"
                value={form.altezza}
                onChange={handleChange}
                placeholder="es. 180"
                min="100"
                max="250"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Età</label>
              <input
                type="number"
                name="eta"
                value={form.eta}
                onChange={handleChange}
                placeholder="es. 25"
                min="14"
                max="100"
                required
              />
            </div>
            <div className="form-group">
              <label>BF% (opzionale)</label>
              <input
                type="number"
                name="bf_percentuale"
                value={form.bf_percentuale}
                onChange={handleChange}
                placeholder="es. 15"
                step="0.1"
                min="3"
                max="60"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Obiettivo</label>
            <div className="option-grid">
              {OBIETTIVI.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => setForm({ ...form, obiettivo: o.value })}
                  className={`option-btn ${form.obiettivo === o.value ? "option-active" : ""}`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Livello</label>
            <div className="option-grid">
              {LIVELLI.map((l) => (
                <button
                  key={l.value}
                  type="button"
                  onClick={() => setForm({ ...form, livello: l.value })}
                  className={`option-btn ${form.livello === l.value ? "option-active" : ""}`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary btn-full"
            disabled={loading}
          >
            {loading ? "Salvataggio..." : "Inizia ad allenarti →"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetup;
