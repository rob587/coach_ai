import { useState, useEffect } from "react";
import { getLogsByEsercizio, getLogs } from "../services/apiService";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const Dashboard = ({ profile }) => {
  const [esercizi, setEsercizi] = useState([]);
  const [esercizioSelezionato, setEsercizioSelezionato] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingChart, setLoadingChart] = useState(false);

  const loadRecentLogs = async () => {
    try {
      const data = await getLogs();
      const logs = data.logs;

      const unici = [...new Set(logs.map((l) => l.nome_esercizio))];
      setEsercizi(unici);
      if (unici.length > 0) setEsercizioSelezionato(unici[0]);

      setRecentLogs(logs.slice(0, 5));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadChartData = async (nome) => {
    setLoadingChart(true);
    try {
      const data = await getLogsByEsercizio(nome);
      const formatted = data.logs.map((l) => ({
        data: l.data,
        peso: parseFloat(l.peso),
        volume: l.serie * l.ripetizioni * parseFloat(l.peso),
      }));
      setChartData(formatted);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingChart(false);
    }
  };

  useEffect(() => {
    loadRecentLogs();
  }, []);

  useEffect(() => {
    if (esercizioSelezionato) {
      loadChartData(esercizioSelezionato);
    }
  }, [esercizioSelezionato]);

  const getBMI = () => {
    if (!profile?.peso || !profile?.altezza) return null;
    const altezzaM = profile.altezza / 100;
    return (profile.peso / (altezzaM * altezzaM)).toFixed(1);
  };

  if (loading)
    return (
      <div style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>
        Caricamento dashboard...
      </div>
    );

  return (
    <div className="dashboard-container">
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Peso</span>
          <span className="stat-value">{profile?.peso || "—"} kg</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Altezza</span>
          <span className="stat-value">{profile?.altezza || "—"} cm</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">BF%</span>
          <span className="stat-value">{profile?.bf_percentuale || "—"}%</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">BMI</span>
          <span className="stat-value">{getBMI() || "—"}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Obiettivo</span>
          <span className="stat-value" style={{ textTransform: "capitalize" }}>
            {profile?.obiettivo || "—"}
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Livello</span>
          <span className="stat-value" style={{ textTransform: "capitalize" }}>
            {profile?.livello || "—"}
          </span>
        </div>
      </div>

      <div className="card" style={{ marginBottom: "20px" }}>
        <h2 style={{ marginBottom: "16px" }}>Progressi</h2>

        {esercizi.length === 0 ? (
          <div className="empty-state">
            <p>Nessun dato ancora.</p>
            <p style={{ fontSize: "0.85rem" }}>
              Inizia a loggare i tuoi allenamenti!
            </p>
          </div>
        ) : (
          <>
            <div className="esercizi-tabs" style={{ marginBottom: "20px" }}>
              {esercizi.map((e) => (
                <button
                  key={e}
                  onClick={() => setEsercizioSelezionato(e)}
                  className={`tab-btn ${esercizioSelezionato === e ? "tab-active" : ""}`}
                >
                  {e}
                </button>
              ))}
            </div>

            {loadingChart ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px",
                  color: "#6b7280",
                }}
              >
                Caricamento grafico...
              </div>
            ) : chartData.length < 2 ? (
              <div className="empty-state">
                <p>Servono almeno 2 sessioni per vedere il grafico.</p>
              </div>
            ) : (
              <div style={{ height: "280px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.05)"
                    />
                    <XAxis
                      dataKey="data"
                      tick={{ fill: "#6b7280", fontSize: 12 }}
                      tickFormatter={(val) => val.slice(5)}
                    />
                    <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        background: "#1e2130",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "8px",
                        color: "#f3f4f6",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="peso"
                      stroke="#a78bfa"
                      strokeWidth={2}
                      dot={{ fill: "#a78bfa", r: 4 }}
                      name="Peso (kg)"
                    />
                    <Line
                      type="monotone"
                      dataKey="volume"
                      stroke="#34d399"
                      strokeWidth={2}
                      dot={{ fill: "#34d399", r: 4 }}
                      name="Volume (kg)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        )}
      </div>

      <div className="card">
        <h2 style={{ marginBottom: "16px" }}>Ultimi allenamenti</h2>

        {recentLogs.length === 0 ? (
          <div className="empty-state">
            <p>Nessun allenamento registrato ancora.</p>
          </div>
        ) : (
          <div className="log-list">
            {recentLogs.map((log) => (
              <div key={log.id} className="log-card">
                <div className="log-info">
                  <span className="log-nome">{log.nome_esercizio}</span>
                  <div className="log-meta">
                    <span className="tag-serie">{log.serie} serie</span>
                    <span className="tag-rep">{log.ripetizioni} rep</span>
                    <span className="tag-peso">{log.peso} kg</span>
                    <span style={{ color: "#4b5563", fontSize: "0.78rem" }}>
                      {log.data}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
