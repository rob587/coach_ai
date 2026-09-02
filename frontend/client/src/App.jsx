import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./components/Login";
import Register from "./components/Register";
import ProfileSetup from "./components/ProfileSetup";
import SessioneManager from "./components/SessioneManager";
import LogAllenamento from "./components/LogAllenamento";
import Dashboard from "./components/Dashboard";
import FeedbackAI from "./components/FeedbackAI";
import { getProfile } from "./services/apiService";
function AppContent() {
  const { user, logout, loading } = useAuth();
  const [showRegister, setShowRegister] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [profile, setProfile] = useState(null);
  const [hasProfile, setHasProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const loadProfile = async () => {
    try {
      const data = await getProfile();
      if (data.hasProfile) {
        setProfile(data.profile);
        setHasProfile(true);
      } else {
        setHasProfile(false);
      }
    } catch (err) {
      setHasProfile(false);
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    if (user) loadProfile();
  }, [user]);

  const handleProfileComplete = (profileData) => {
    setProfile(profileData);
    setHasProfile(true);
  };

  if (loading || loadingProfile)
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          color: "#6b7280",
        }}
      >
        Caricamento...
      </div>
    );

  if (!user) {
    return showRegister ? (
      <Register onSwitch={() => setShowRegister(false)} />
    ) : (
      <Login onSwitch={() => setShowRegister(true)} />
    );
  }

  if (!hasProfile) {
    return <ProfileSetup onComplete={handleProfileComplete} />;
  }

  const TABS = [
    { id: "dashboard", label: "📊 Dashboard" },
    { id: "log", label: "🏋️ Allena" },
    { id: "sessioni", label: "📅 Sessioni" },
    { id: "feedback", label: "🤖 Feedback AI" },
  ];

  return (
    <>
      <div className="app-container">
        <header className="app-header">
          <div className="header-left">
            <h1>🏋️ CoachAI</h1>
            <span className="header-subtitle">Ciao, {user.username}! 💪</span>
          </div>
          <button className="btn-logout" onClick={logout}>
            Esci
          </button>
        </header>

        <nav className="app-nav">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`nav-tab ${activeTab === tab.id ? "nav-tab-active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <main className="app-main">
          {activeTab === "dashboard" && <Dashboard profile={profile} />}
          {activeTab === "log" && <LogAllenamento />}
          {activeTab === "sessioni" && <SessioneManager />}
          {activeTab === "feedback" && <FeedbackAI />}
        </main>

        <footer className="app-footer">
          <p>CoachAI — Il tuo coach personale AI</p>
        </footer>
      </div>
    </>
  );
}

const App = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;
