import React, { useState, useEffect } from "react";
import AuthForm from "./components/AuthForm";
import Dashboard from "./components/Dashboard";
import History from "./components/History";
import Pricing from "./components/Pricing";
import MainLayout from "./components/MainLayout";
import { Sparkles, Zap, Shield, History as HistoryIcon } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import API from "./api";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("access_token"),
  );
  const [tab, setTab] = useState("dash");
  const [username, setUsername] = useState("Пользователь");
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
    if (isAuthenticated) {
      const storedUser = localStorage.getItem("username");
      if (storedUser) setUsername(storedUser);
      fetchLimits();
    }
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
      <div className="bg-[#040612] min-h-screen relative overflow-hidden text-slate-200">
        {/* КИНЕТИЧЕСКАЯ ИИ-ТУМАННОСТЬ (Глобальные сферы, видимые на ВСЕХ вкладках) */}
        <motion.div
          animate={{
            x: [0, 100, -50, 70, 0],
            y: [0, -80, 120, -50, 0],
            scale: [1, 1.3, 0.8, 1.15, 1],
            opacity: [0.08, 0.14, 0.05, 0.12, 0.08],
          }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          className="fixed top-[-15%] left-[-15%] w-[600px] h-[600px] bg-cyan-500 rounded-full blur-[140px] pointer-events-none z-0"
        />
        <motion.div
          animate={{
            x: [0, -120, 70, -60, 0],
            y: [0, 90, -100, 50, 0],
            scale: [1, 0.85, 1.25, 0.9, 1],
            opacity: [0.07, 0.12, 0.04, 0.1, 0.07],
          }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          className="fixed bottom-[-15%] right-[-15%] w-[700px] h-[700px] bg-indigo-600 rounded-full blur-[150px] pointer-events-none z-0"
        />
        <motion.div
          animate={{
            x: [0, -50, 90, -30, 0],
            y: [0, 100, -60, 80, 0],
            scale: [0.9, 1.2, 0.85, 1.1, 0.9],
            opacity: [0.04, 0.08, 0.03, 0.07, 0.04],
          }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
          className="fixed top-[20%] right-[10%] w-[450px] h-[450px] bg-purple-500 rounded-full blur-[120px] pointer-events-none z-0"
        />

        {/* Контент приложения монтируется поверх глобального фона */}
        <div className="relative z-10 w-full h-full">
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
        className="bg-[#040612] min-h-screen flex flex-col justify-center relative overflow-hidden antialiased text-slate-200"
      >
        {/* КИНЕТИЧЕСКАЯ ИИ-ТУМАННОСТЬ (4 активные сферы с глубоким движением) */}
        {/* Сфера 1: Циан (Верхний левый угол) */}
        <motion.div
          animate={{
            x: [0, 90, -40, 50, 0],
            y: [0, -60, 100, -40, 0],
            scale: [1, 1.25, 0.85, 1.1, 1],
            opacity: [0.12, 0.18, 0.08, 0.15, 0.12],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-[-15%] left-[-15%] w-[600px] h-[600px] bg-cyan-500 rounded-full blur-[130px] pointer-events-none"
        />

        {/* Сфера 2: Индиго (Нижний правый угол) */}
        <motion.div
          animate={{
            x: [0, -110, 60, -50, 0],
            y: [0, 80, -90, 40, 0],
            scale: [1, 0.8, 1.2, 0.9, 1],
            opacity: [0.1, 0.15, 0.07, 0.13, 0.1],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-[-15%] right-[-15%] w-[700px] h-[700px] bg-indigo-600 rounded-full blur-[150px] pointer-events-none"
        />

        {/* Сфера 3: Пурпур (Центрально-правая зона для подсветки карточки авторизации) */}
        <motion.div
          animate={{
            x: [0, -40, 80, -30, 0],
            y: [0, 90, -50, 70, 0],
            scale: [0.9, 1.15, 0.8, 1.05, 0.9],
            opacity: [0.05, 0.09, 0.04, 0.08, 0.05],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-[20%] right-[10%] w-[450px] h-[450px] bg-purple-500 rounded-full blur-[110px] pointer-events-none"
        />

        {/* Сфера 4: Королевский синий (Нижний левый угол для баланса) */}
        <motion.div
          animate={{
            x: [0, 70, -50, 30, 0],
            y: [0, -40, 60, -80, 0],
            scale: [1.1, 0.9, 1.15, 0.95, 1.1],
            opacity: [0.06, 0.1, 0.05, 0.12, 0.06],
          }}
          transition={{
            duration: 16,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-600 rounded-full blur-[120px] pointer-events-none"
        />

        <main className="w-full max-w-7xl mx-auto p-4 md:p-8 flex items-center justify-center relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-16 items-center w-full py-8 md:py-16">
            {/* ЛЕВАЯ СТОРОНА: МАРКЕТИНГОВЫЙ БЛОК */}
            <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/5 border border-cyan-500/10 text-cyan-400/90 text-xs font-medium backdrop-blur-md self-center lg:self-start"
              >
                <Sparkles size={12} className="text-cyan-400" />{" "}
                <span>Нейросеть нового поколения GPT-4o-Mini</span>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl sm:text-5xl xl:text-6xl font-black tracking-tight leading-[1.1] text-slate-100"
              >
                Создавайте публикации с помощью{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">
                  Искусственного Интеллекта
                </span>{" "}
                в один клик
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal"
              >
                Умный ассистент мгновенно адаптирует идеи под разные форматы:
                пишет вовлекающие посты для Telegram, глубокие экспертные
                лонгриды для VC.ru и короткие цепляющие мысли для X (Twitter).
              </motion.p>

              {/* ИСПРАВЛЕННЫЕ КАРТОЧКИ ПРЕИМУЩЕСТВ */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 max-w-2xl mx-auto lg:mx-0 text-left"
              >
                {[
                  {
                    icon: <Zap size={16} />,
                    title: "Мгновенно",
                    desc: "Генерация текста до 5 секунд",
                    color: "text-cyan-400",
                    border: "hover:border-cyan-500/20",
                  },
                  {
                    icon: <HistoryIcon size={16} />,
                    title: "Удобно",
                    desc: "Умный архив и вся история",
                    color: "text-indigo-400",
                    border: "hover:border-indigo-500/20",
                  },
                  {
                    icon: <Shield size={16} />,
                    title: "Безопасно",
                    desc: "Вход по OAuth 2.0 без паролей",
                    color: "text-emerald-400",
                    border: "hover:border-emerald-500/20",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className={`bg-slate-900/20 backdrop-blur-md border border-slate-800/40 p-5 rounded-2xl flex flex-col gap-3 transition-colors duration-300 shadow-lg ${item.border}`}
                  >
                    <div
                      className={`p-2 rounded-xl bg-slate-950 border border-slate-800/40 w-fit ${item.color}`}
                    >
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-200">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium mt-1 leading-normal">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* ПРАВАЯ СТОРОНА: ФОРМА АВТОРИЗАЦИИ */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end w-full">
              <AuthForm onAuthSuccess={handleAuthSuccess} />
            </div>
          </div>
        </main>
      </motion.div>
    </AnimatePresence>
  );
}
