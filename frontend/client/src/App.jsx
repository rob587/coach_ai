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
function App() {
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
  return <></>;
}

export default App;
