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
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>DailyBrief</h1>
            <p>Crea il tuo account</p>
          </div>

          {error && <div className="error-banner">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="il_tuo_username"
                required
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="la@tua.email"
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="min. 6 caratteri"
                required
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Registrazione in corso..." : "Registrati"}
            </button>
          </form>

          <p className="auth-switch">
            Hai già un account? <span onClick={onSwitch}>Accedi</span>
          </p>
        </div>
      </div>
    </>
  );
};

export default Register;
