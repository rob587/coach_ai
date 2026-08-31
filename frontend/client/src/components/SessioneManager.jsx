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

  return <div>SessioneManager</div>;
};

export default SessioneManager;
