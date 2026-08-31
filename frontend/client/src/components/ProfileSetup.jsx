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
        
    )
};
