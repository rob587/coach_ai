import { useState, useEffect } from "react";
import { getFeedback, generateFeedback } from "../services/apiService";

const FeedbackAI = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(null);

  const loadFeedback = async () => {
    try {
      const data = await getFeedback();
      setFeedbacks(data.feedback);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedback();
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    try {
      const data = await generateFeedback();
      setFeedbacks([data.feedback, ...feedbacks]);
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatWeek = (dateString) => {
    const date = new Date(dateString);
    const end = new Date(date);
    end.setDate(date.getDate() + 6);
    return `${date.toLocaleDateString("it-IT", { day: "2-digit", month: "short" })} — ${end.toLocaleDateString("it-IT", { day: "2-digit", month: "short" })}`;
  };

  const renderContent = (text) => {
    return text.split("\n").map((line, i) => {
      if (line.startsWith("**") && line.endsWith("**")) {
        return (
          <h3
            key={i}
            style={{
              color: "#a78bfa",
              marginTop: "16px",
              marginBottom: "6px",
            }}
          >
            {line.replace(/\*\*/g, "")}
          </h3>
        );
      }
      if (line.startsWith("**")) {
        return (
          <p
            key={i}
            dangerouslySetInnerHTML={{
              __html: line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>"),
            }}
          />
        );
      }
      if (line.trim() === "") return <br key={i} />;
      return (
        <p
          key={i}
          style={{ margin: "4px 0", lineHeight: "1.7", fontSize: "0.92rem" }}
        >
          {line}
        </p>
      );
    });
  };

  if (loading)
    return (
      <div style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>
        Caricamento feedback...
      </div>
    );

  return (
    <div className="feedback-container">
      <div className="card" style={{ marginBottom: "20px" }}>
        <div className="card-header">
          <div>
            <h2>Feedback Settimanale AI</h2>
            <p
              style={{
                color: "#6b7280",
                fontSize: "0.85rem",
                marginTop: "4px",
              }}
            >
              Analisi dei tuoi allenamenti della settimana
            </p>
          </div>
          <button
            className="btn-primary"
            onClick={handleGenerate}
            disabled={generating}
          >
            {generating ? (
              <>
                <span className="spinner-inline" />
                Analisi in corso...
              </>
            ) : (
              "✨ Genera Feedback"
            )}
          </button>
        </div>

        {error && (
          <div className="error-banner" style={{ marginTop: "16px" }}>
            {error}
            <button onClick={() => setError(null)}>✕</button>
          </div>
        )}
      </div>

      {feedbacks.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <p>Nessun feedback ancora.</p>
            <p style={{ fontSize: "0.85rem" }}>
              Allena ti questa settimana e genera il tuo primo feedback!
            </p>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {feedbacks.map((f, index) => (
            <div
              key={f.id}
              className="card"
              onClick={() => setExpanded(expanded === index ? null : index)}
              style={{ cursor: "pointer" }}
            >
              <div className="card-header">
                <div>
                  <p
                    style={{
                      color: "#f3f4f6",
                      fontWeight: "600",
                      fontSize: "0.95rem",
                    }}
                  >
                    Settimana {formatWeek(f.settimana)}
                  </p>
                  <p
                    style={{
                      color: "#4b5563",
                      fontSize: "0.78rem",
                      marginTop: "4px",
                    }}
                  >
                    Generato il {formatDate(f.created_at)}
                  </p>
                </div>
                <span style={{ color: "#4b5563" }}>
                  {expanded === index ? "▲" : "▼"}
                </span>
              </div>

              {expanded !== index && (
                <p
                  style={{
                    color: "#6b7280",
                    fontSize: "0.85rem",
                    marginTop: "10px",
                    lineHeight: "1.6",
                  }}
                >
                  {f.contenuto.replace(/\*\*/g, "").slice(0, 150)}...
                </p>
              )}

              {expanded === index && (
                <div
                  style={{
                    marginTop: "16px",
                    paddingTop: "16px",
                    borderTop: "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  {renderContent(f.contenuto)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FeedbackAI;
