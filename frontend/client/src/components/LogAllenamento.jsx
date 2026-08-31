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
  return <div>LogAllenamento</div>;
};

export default LogAllenamento;
