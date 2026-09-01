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

  return <div>FeedbackAI</div>;
};

export default FeedbackAI;
