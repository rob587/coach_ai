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
import {
  getPesiLog,
  createPesoLog,
  deletePesoLog,
} from "../services/apiService";

const Dashboard = ({ profile }) => {
  const [esercizi, setEsercizi] = useState([]);
  const [esercizioSelezionato, setEsercizioSelezionato] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingChart, setLoadingChart] = useState(false);
  const [pesiLog, setPesiLog] = useState([]);
  const [nuovoPeso, setNuovoPeso] = useState("");
  const [dataPeso, setDataPeso] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [savingPeso, setSavingPeso] = useState(false);

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

  useEffect(() => {
    loadPesiLog();
  }, []);

  const loadPesiLog = async () => {
    try {
      const data = await getPesiLog();
      setPesiLog(
        data.logs.map((l) => ({
          ...l,
          data: l.data.split("T")[0],
        })),
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleSavePeso = async () => {
    if (!nuovoPeso) return;
    setSavingPeso(true);
    try {
      const data = await createPesoLog(parseFloat(nuovoPeso), dataPeso);
      setPesiLog((prev) => {
        const filtered = prev.filter((l) => l.data !== dataPeso);
        return [
          ...filtered,
          { ...data.log, data: data.log.data.split("T")[0] },
        ].sort((a, b) => new Date(a.data) - new Date(b.data));
      });
      setNuovoPeso("");
    } catch (err) {
      console.error(err);
    } finally {
      setSavingPeso(false);
    }
  };

  const handleDeletePeso = async (id) => {
    try {
      await deletePesoLog(id);
      setPesiLog((prev) => prev.filter((l) => l.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const getBMI = () => {
    if (!profile?.peso || !profile?.altezza) return null;
    const altezzaM = profile.altezza / 100;
    return (profile.peso / (altezzaM * altezzaM)).toFixed(1);
  };

  const formatData = (dateString) => {
    return new Date(dateString).toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
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

      {/* Andamento peso corporeo */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-gray-100 mb-4">
          ⚖️ Peso Corporeo
        </h2>

        {/* Input nuovo peso */}
        <div className="flex gap-3 mb-6">
          <input
            type="number"
            value={nuovoPeso}
            onChange={(e) => setNuovoPeso(e.target.value)}
            placeholder="es. 80.5"
            step="0.1"
            min="30"
            max="300"
            className="w-32 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 text-sm focus:outline-none focus:border-violet-500"
          />
          <span className="text-gray-500 text-sm self-center">kg</span>
          <input
            type="date"
            value={dataPeso}
            onChange={(e) => setDataPeso(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 text-sm focus:outline-none focus:border-violet-500"
          />
          <button
            onClick={handleSavePeso}
            disabled={savingPeso || !nuovoPeso}
            className="bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-lg transition-all"
          >
            {savingPeso ? "..." : "Salva"}
          </button>
        </div>

        {/* Grafico */}
        {pesiLog.length < 2 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Aggiungi almeno 2 misurazioni per vedere il grafico.</p>
          </div>
        ) : (
          <div style={{ height: "220px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={pesiLog}>
                <defs>
                  <linearGradient id="pesoGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
                />
                <XAxis
                  dataKey="data"
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                  tickFormatter={(val) => val.slice(5)}
                />
                <YAxis
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                  domain={["auto", "auto"]}
                />
                <Tooltip
                  contentStyle={{
                    background: "#1e2130",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    color: "#f3f4f6",
                  }}
                  formatter={(val) => [`${val} kg`, "Peso"]}
                  labelFormatter={(label) => `Data: ${label}`}
                />
                <Area
                  type="monotone"
                  dataKey="peso"
                  stroke="#a78bfa"
                  strokeWidth={2}
                  fill="url(#pesoGradient)"
                  dot={{ fill: "#a78bfa", r: 4 }}
                  name="Peso (kg)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Lista ultime misurazioni */}
        {pesiLog.length > 0 && (
          <div className="mt-4 space-y-2 max-h-40 overflow-y-auto">
            {[...pesiLog]
              .reverse()
              .slice(0, 5)
              .map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 text-xs">{log.data}</span>
                    <span className="text-violet-300 font-semibold text-sm">
                      {log.peso} kg
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeletePeso(log.id)}
                    className="text-gray-600 hover:text-red-400 hover:bg-red-400/10 p-1.5 rounded-lg transition-all text-xs"
                  >
                    🗑
                  </button>
                </div>
              ))}
          </div>
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
