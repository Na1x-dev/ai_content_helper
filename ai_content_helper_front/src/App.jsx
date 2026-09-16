import { useEffect, useState } from "react";
import AuthForm from "./components/AuthForm";
import MainLayout from "./components/MainLayout";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, History, Shield, Sparkles, Zap } from "lucide-react";
import API from "./api";

function AmbientBackground({ compact = false }) {
  return (
    <div
      className={`ambient-layer ${compact ? "ambient-layer-compact" : ""}`}
      aria-hidden="true"
    >
      <motion.div
        className="ambient-orb ambient-orb-cyan"
        animate={{
          x: [0, 80, -30, 0],
          y: [0, -50, 50, 0],
          scale: [1, 1.12, 0.92, 1],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="ambient-orb ambient-orb-violet"
        animate={{
          x: [0, -70, 30, 0],
          y: [0, 70, -40, 0],
          scale: [1, 0.9, 1.15, 1],
        }}
        transition={{ duration: 21, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="ambient-orb ambient-orb-blue"
        animate={{
          x: [0, 40, -70, 0],
          y: [0, -40, 20, 0],
          scale: [0.9, 1.1, 0.95, 0.9],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="ambient-grid" />
      <div className="ambient-noise" />
      <div className="ambient-scanline" />
    </div>
  );
}

const features = [
  {
    icon: <Zap size={15} />,
    title: "Мгновенно",
    desc: "Пост готов за несколько секунд",
    tone: "cyan",
  },
  {
    icon: <History size={15} />,
    title: "Системно",
    desc: "История и идеи всегда под рукой",
    tone: "violet",
  },
  {
    icon: <Shield size={15} />,
    title: "Надёжно",
    desc: "Ваше пространство защищено",
    tone: "green",
  },
];

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!localStorage.getItem("access_token"),
  );
  const [tab, setTab] = useState("dash");
  const [username, setUsername] = useState(
    () => localStorage.getItem("username") || "Пользователь",
  );
  const [limits, setLimits] = useState({
    plan: "Загрузка...",
    generations_left: 0,
  });

  const fetchLimits = async () => {
    try {
      const response = await API.get("posts/user-limits/");
      setLimits(response.data);
    } catch (err) {
      console.error("Не удалось загрузить лимиты пользователя", err);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (isAuthenticated) fetchLimits();
  }, [isAuthenticated]);

  const handleAuthSuccess = (loggedUsername) => {
    setIsAuthenticated(true);
    if (loggedUsername) {
      setUsername(loggedUsername);
      localStorage.setItem("username", loggedUsername);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("username");
    setIsAuthenticated(false);
    setTab("dash");
  };

  if (isAuthenticated) {
    return (
      <div className="app-shell">
        <AmbientBackground compact />
        <div className="relative z-10 w-full min-h-screen">
          <MainLayout
            tab={tab}
            setTab={setTab}
            username={username}
            limits={limits}
            onLogout={handleLogout}
            fetchLimits={fetchLimits}
          />
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="auth-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="auth-page"
      >
        <AmbientBackground />
        <main className="auth-layout">
          <section className="auth-story order-1 lg:order-1">
            <div className="auth-brandline">
              <span className="brand-mark brand-mark-large">AI</span>
              <span>
                CONTENT <b>HELPER</b>
              </span>
            </div>
            <div className="auth-kicker">
              <span className="live-dot" /> Рабочее пространство для идей
            </div>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="auth-badge"
            >
              <Sparkles size={14} /> GPT-4o-mini внутри
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="auth-title"
            >
              Идеи, которые звучат{" "}
              <span className="gradient-text">сильнее.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 }}
              className="auth-description"
            >
              Превращайте сырые мысли в публикации для Telegram, VC.ru и X.
              Выберите настроение и позвольте нейросети собрать точную форму.
            </motion.p>
            <div className="auth-orbit" aria-hidden="true">
              <div className="orbit-ring orbit-ring-one" />
              <div className="orbit-ring orbit-ring-two" />
              <div className="orbit-core">
                <Sparkles size={21} />
              </div>
              <span className="orbit-node orbit-node-one">
                <Zap size={13} />
              </span>
              <span className="orbit-node orbit-node-two">
                <Shield size={13} />
              </span>
              <span className="orbit-node orbit-node-three">
                <History size={13} />
              </span>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="auth-feature-grid"
            >
              {features.map((item) => (
                <div
                  key={item.title}
                  className={`auth-feature auth-feature-${item.tone}`}
                >
                  <div className="auth-feature-icon">{item.icon}</div>
                  <div>
                    <h2 className="auth-feature-title">{item.title}</h2>
                    <p className="auth-feature-copy">{item.desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </section>
          <section className="auth-entry order-2 lg:order-2">
            <AuthForm onAuthSuccess={handleAuthSuccess} />
            <div className="auth-entry-note">
              <ArrowUpRight size={14} /> Ваше новое рабочее место начинается
              здесь
            </div>
          </section>
        </main>
      </motion.div>
    </AnimatePresence>
  );
}
