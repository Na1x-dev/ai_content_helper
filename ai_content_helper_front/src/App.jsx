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

  // 1. Экран для авторизованных пользователей (Обернут в MainLayout)
  if (isAuthenticated) {
    return (
      <MainLayout
        tab={tab}
        setTab={setTab}
        username={username}
        limits={limits}
        onLogout={handleLogout}
        fetchLimits={fetchLimits} // Передаем функцию на уровень ниже
      />
    );
  }

  // 2. Экран для гостей (Авторизация)
  return (
    <AnimatePresence mode="wait">
      {isAuthenticated ? (
        // ЭКРАН ПРИЛОЖЕНИЯ
        <motion.div
          key="app-workspace"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="w-full"
        >
          <MainLayout
            tab={tab}
            setTab={setTab}
            username={username}
            limits={limits}
            onLogout={handleLogout}
            fetchLimits={fetchLimits}
          />
        </motion.div>
      ) : (
        // ЭКРАН АВТОРИЗАЦИИ (ГОСТЬ)
        <motion.div
          key="auth-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="bg-[#0b0f19] min-h-screen flex flex-col justify-center relative overflow-x-hidden antialiased text-slate-200"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[300px] bg-gradient-to-b from-cyan-500/5 to-indigo-500/0 blur-3xl pointer-events-none"></div>
          <main className="w-full max-w-7xl mx-auto p-4 md:p-6 flex items-center justify-center">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full py-8 md:py-12">
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium">
                  <Sparkles size={12} /> Автоматическое создание публикаций
                </div>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
                  Создавайте публикации с помощью{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">
                    ИИ
                  </span>{" "}
                  в один клик
                </h2>
                <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                  Пишите вовлекающие посты для Telegram, структурированные
                  статьи для VC.ru и емкие мысли для X (Twitter).
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 max-w-xl mx-auto lg:mx-0 text-left">
                  <div className="flex items-start gap-2.5">
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-cyan-400">
                      <Zap size={14} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                        Мгновенно
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Генерация до 5 секунд
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-indigo-400">
                      <HistoryIcon size={14} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                        Удобно
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Все тексты в истории
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-emerald-400">
                      <Shield size={14} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                        Безопасно
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Вход через Google
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 flex justify-center lg:justify-end w-full">
                <AuthForm onAuthSuccess={handleAuthSuccess} />
              </div>
            </div>
          </main>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
