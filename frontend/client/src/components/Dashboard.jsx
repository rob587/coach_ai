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
      <div className="flex items-center justify-center py-20 text-gray-500">
        Caricamento dashboard...
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {[
          { label: "Peso", value: `${profile?.peso || "—"} kg` },
          { label: "Altezza", value: `${profile?.altezza || "—"} cm` },
          { label: "BF%", value: `${profile?.bf_percentuale || "—"}%` },
          { label: "BMI", value: getBMI() || "—" },
          { label: "Obiettivo", value: profile?.obiettivo || "—" },
          { label: "Livello", value: profile?.livello || "—" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center"
          >
            <p className="text-gray-500 text-xs mb-1">{stat.label}</p>
            <p className="text-gray-100 font-semibold text-sm capitalize">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-gray-100 mb-4">Progressi</h2>

        {esercizi.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <p>Nessun dato ancora.</p>
            <p className="text-sm mt-1">Inizia a loggare i tuoi allenamenti!</p>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-2 mb-6">
              {esercizi.map((e) => (
                <button
                  key={e}
                  onClick={() => setEsercizioSelezionato(e)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                    esercizioSelezionato === e
                      ? "bg-violet-500/20 border-violet-500 text-violet-300"
                      : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>

            {loadingChart ? (
              <div className="flex items-center justify-center py-10 text-gray-500">
                Caricamento grafico...
              </div>
            ) : chartData.length < 2 ? (
              <div className="text-center py-10 text-gray-500">
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

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-gray-100 mb-4">
          Ultimi allenamenti
        </h2>

        {recentLogs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Nessun allenamento registrato ancora.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3"
              >
                <div>
                  <span className="text-gray-100 font-medium">
                    {log.nome_esercizio}
                  </span>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    <span className="bg-gray-700 text-gray-300 text-xs px-2 py-0.5 rounded-full">
                      {log.serie} serie
                    </span>
                    <span className="bg-gray-700 text-gray-300 text-xs px-2 py-0.5 rounded-full">
                      {log.ripetizioni} rep
                    </span>
                    <span className="bg-violet-500/20 text-violet-300 text-xs px-2 py-0.5 rounded-full font-medium">
                      {log.peso} kg
                    </span>
                    <span className="text-gray-500 text-xs">{log.data}</span>
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
