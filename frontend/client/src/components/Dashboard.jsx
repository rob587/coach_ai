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

  return <div>Dashboard</div>;
};

export default Dashboard;
