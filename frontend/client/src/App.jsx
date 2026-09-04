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
    if (!loading) {
      if (user) {
        loadProfile();
      } else {
        setLoadingProfile(false);
      }
    }
  }, [user, loading]);

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
      <div className="min-h-screen bg-gray-950 flex flex-col">
        <header className="bg-gray-900 border-b border-gray-800 px-6 py-4 sticky top-0 z-50">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-violet-400">🏋️ CoachAI</h1>
              <span className="text-gray-500 text-sm">
                Ciao, {user.username}! 💪
              </span>
            </div>
            <button
              onClick={logout}
              className="text-gray-500 hover:text-red-400 border border-gray-700 hover:border-red-400/50 text-sm px-3 py-1.5 rounded-lg transition-all"
            >
              Esci
            </button>
          </div>
        </header>

        <nav className="bg-gray-900 border-b border-gray-800 px-6">
          <div className="max-w-5xl mx-auto flex gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                  activeTab === tab.id
                    ? "border-violet-500 text-violet-400"
                    : "border-transparent text-gray-500 hover:text-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </nav>

        <main className="flex-1 p-6">
          <div className="max-w-5xl mx-auto">
            {activeTab === "dashboard" && <Dashboard profile={profile} />}
            {activeTab === "log" && <LogAllenamento />}
            {activeTab === "sessioni" && <SessioneManager />}
            {activeTab === "feedback" && <FeedbackAI />}
          </div>
        </main>

        <footer className="border-t border-gray-800 py-4 text-center text-gray-600 text-sm">
          CoachAI — Il tuo coach personale AI
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
