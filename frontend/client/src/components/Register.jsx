import { useState } from "react";
import { registerUser } from "../services/apiService";
import { useAuth } from "../context/AuthContext";

const Register = ({ onSwitch }) => {
  const { login } = useAuth();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      setError("La password deve avere almeno 6 caratteri");
      return;
    }
    setLoading(true);
    try {
      const data = await registerUser(form.username, form.email, form.password);
      login(data.user, data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-violet-400 mb-2">
              🏋️ CoachAI
            </h1>
            <p className="text-gray-500 text-sm">Crea il tuo account</p>
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-500/40 text-red-400 rounded-lg px-4 py-3 text-sm mb-6 flex justify-between items-center">
              {error}
              <button
                onClick={() => setError(null)}
                className="ml-2 hover:text-red-300"
              >
                ✕
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="il_tuo_username"
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-100 text-sm focus:outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="la@tua.email"
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-100 text-sm focus:outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="min. 6 caratteri"
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-100 text-sm focus:outline-none focus:border-violet-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all mt-2"
            >
              {loading ? "Registrazione in corso..." : "Registrati"}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            Hai già un account?{" "}
            <span
              onClick={onSwitch}
              className="text-violet-400 cursor-pointer hover:underline font-medium"
            >
              Accedi
            </span>
          </p>
        </div>
      </div>
    </>
  );
};

export default Register;
