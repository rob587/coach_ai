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
          <h3 key={i} className="text-violet-400 font-semibold mt-4 mb-2">
            {line.replace(/\*\*/g, "")}
          </h3>
        );
      }
      if (line.startsWith("**")) {
        return (
          <p
            key={i}
            className="text-gray-300 text-sm leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>"),
            }}
          />
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
        Caricamento feedback...
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-100">
              Feedback Settimanale AI
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Analisi dei tuoi allenamenti della settimana
            </p>
          </div>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-lg transition-all flex items-center gap-2"
          >
            {generating ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analisi...
              </>
            ) : (
              "✨ Genera Feedback"
            )}
          </button>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-500/40 text-red-400 rounded-lg px-4 py-3 text-sm mt-4 flex justify-between">
            {error}
            <button onClick={() => setError(null)}>✕</button>
          </div>
        )}
      </div>

      {feedbacks.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="text-center py-8 text-gray-500">
            <p className="text-lg mb-1">Nessun feedback ancora.</p>
            <p className="text-sm">
              Allenati questa settimana e genera il tuo primo feedback!
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {feedbacks.map((f, index) => (
            <div
              key={f.id}
              onClick={() => setExpanded(expanded === index ? null : index)}
              className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-2xl p-6 cursor-pointer transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-100 font-semibold">
                    Settimana {formatWeek(f.settimana)}
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    Generato il {formatDate(f.created_at)}
                  </p>
                </div>
                <span className="text-gray-500 text-sm">
                  {expanded === index ? "▲" : "▼"}
                </span>
              </div>

              {expanded !== index && (
                <p className="text-gray-500 text-sm mt-3 leading-relaxed">
                  {f.contenuto.replace(/\*\*/g, "").slice(0, 150)}...
                </p>
              )}

              {expanded === index && (
                <div className="mt-4 pt-4 border-t border-gray-800">
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
