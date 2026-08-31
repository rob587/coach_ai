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

  return <div>SessioneManager</div>;
};

export default SessioneManager;
