import { Zap, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import HeaderButton from "./HeaderButton";
import Dashboard from "./Dashboard";
import History from "./History";
import Pricing from "./Pricing";
import PageTransition from "./PageTransition";

export default function MainLayout({
  tab,
  setTab,
  username,
  limits,
  onLogout,
  fetchLimits,
}) {
  return (
    <div className="app-layout">
      {/* FIXED HEADER */}
      <header className="app-header">
        <div className="app-header-inner">
          {/* ЛЕВАЯ ЧАСТЬ: Логотип и вкладки */}
          <div className="app-header-left">
            <div
              className="app-brand cursor-pointer"
              onClick={() => setTab("dash")}
            >
              <span className="brand-mark">AI</span>
              <h1>
                Content <span>Helper</span>
              </h1>
            </div>

            <nav className="app-nav">
              <HeaderButton
                active={tab === "dash"}
                onClick={() => setTab("dash")}
              >
                Генератор
              </HeaderButton>
              <HeaderButton
                active={tab === "history"}
                onClick={() => setTab("history")}
              >
                История
              </HeaderButton>
              <HeaderButton
                active={tab === "pricing"}
                onClick={() => setTab("pricing")}
              >
                Тарифы
              </HeaderButton>
            </nav>
          </div>

          {/* ПРАВАЯ ЧАСТЬ: Капсула пользователя */}
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="user-dock"
          >
            {/* Никнейм и Тариф */}
            <div className="user-profile hidden sm:flex">
              <span className="user-name">{username}</span>
              <span className="plan-chip">{limits?.plan || "Загрузка..."}</span>
            </div>

            {/* Разделитель */}
            <div className="user-divider hidden sm:block"></div>

            {/* Лимиты с анимацией изменений */}
            <div className="limit-dock">
              <Zap className="w-3.5 h-3.5 text-cyan-400 animate-pulse shrink-0" />
              <span className="hidden md:inline">Осталось:</span>
              <div className="relative h-4 w-6 flex items-center justify-start">
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={limits?.generations_left ?? 0}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="font-bold text-cyan-400 absolute"
                  >
                    {limits?.generations_left ?? 0}
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>

            {/* Кнопка Выхода */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onLogout}
              className="logout-button"
              title="Выйти из системы"
            >
              <LogOut size={14} />
            </motion.button>
          </motion.div>
        </div>
      </header>
      {/* АНИМИРОВАННЫЙ ВЫВОД СТРАНИЦ */}
      <main className="app-main">
        <div className="app-main-inner">
          <AnimatePresence mode="wait">
            {tab === "dash" && (
              <PageTransition key="dash">
                <Dashboard limits={limits} fetchLimits={fetchLimits} />
              </PageTransition>
            )}
            {tab === "history" && (
              <PageTransition key="history">
                <History />
              </PageTransition>
            )}
            {tab === "pricing" && (
              <PageTransition key="pricing">
                <Pricing />
              </PageTransition>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
