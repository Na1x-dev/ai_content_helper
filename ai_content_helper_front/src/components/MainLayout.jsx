import React from "react";
import { Zap, LogOut, Layers } from "lucide-react";
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
    <div className="bg-transparent min-h-screen h-screen overflow-hidden flex flex-col relative overflow-x-hidden antialiased text-slate-200 selection:bg-cyan-500/30">
      {/* КИНЕТИЧЕСКАЯ ИИ-ТУМАННОСТЬ ДЛЯ ВСЕГО ПРИЛОЖЕНИЯ */}
      {/* Сфера 1: Циан (Верхний левый угол) */}
      <motion.div
        animate={{
          x: [0, 60, -30, 40, 0],
          y: [0, -40, 70, -30, 0],
          scale: [1, 1.15, 0.9, 1.05, 1],
          opacity: [0.08, 0.12, 0.06, 0.1, 0.08],
        }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyan-500 rounded-full blur-[120px] pointer-events-none z-0"
      />
      {/* Сфера 2: Индиго (Нижний правый угол) */}
      <motion.div
        animate={{
          x: [0, -80, 40, -30, 0],
          y: [0, 50, -60, 30, 0],
          scale: [1, 0.85, 1.1, 0.95, 1],
          opacity: [0.06, 0.1, 0.05, 0.09, 0.06],
        }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-600 rounded-full blur-[130px] pointer-events-none z-0"
      />
      {/* Сфера 3: Пурпур (Левый нижний угол) */}
      <motion.div
        animate={{
          x: [0, 50, -40, 20, 0],
          y: [0, -30, 40, -50, 0],
          scale: [0.95, 1.1, 0.85, 1.02, 0.95],
          opacity: [0.04, 0.07, 0.03, 0.06, 0.04],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[10%] left-[-5%] w-[400px] h-[400px] bg-purple-500 rounded-full blur-[110px] pointer-events-none z-0"
      />
      {/* FIXED HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 w-full backdrop-blur-md bg-[#040612]/75 border-b border-slate-800/40 shadow-sm">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 h-16 flex justify-between items-center relative z-10">
          {/* ЛЕВАЯ ЧАСТЬ: Логотип и вкладки */}
          <div className="flex items-center gap-6 md:gap-10">
            <div
              className="flex items-center gap-2.5 cursor-pointer"
              onClick={() => setTab("dash")}
            >
              <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center shadow-md shadow-cyan-500/10">
                <span className="text-white font-bold text-xs">AI</span>
              </div>
              <h1 className="text-sm font-semibold tracking-tight text-slate-200">
                Content{" "}
                <span className="text-cyan-400 font-medium">Helper</span>
              </h1>
            </div>

            <nav className="flex space-x-1 p-1">
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
            className="flex items-center bg-slate-900/40 p-1 rounded-full backdrop-blur-md border border-slate-800/40 gap-1 text-xs"
          >
            {/* Никнейм и Тариф */}
            <div className="flex items-center gap-3 pl-3.5 pr-2 h-7">
              <span className="font-semibold text-slate-200 max-w-[100px] truncate leading-none">
                {username}
              </span>
              <span className="text-[10px] text-cyan-400 font-semibold tracking-wide bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20 leading-none">
                {limits?.plan || "Загрузка..."}
              </span>
            </div>

            {/* Разделитель */}
            <div className="h-6 w-px bg-slate-800/40 mx-1"></div>

            {/* Лимиты с анимацией изменений */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 text-slate-300 font-medium overflow-hidden min-w-[90px] md:min-w-[125px]">
              <Zap className="w-3.5 h-3.5 text-cyan-400 animate-pulse flex-shrink-0" />
              <span className="hidden md:inline text-slate-400 flex-shrink-0">
                Осталось:
              </span>
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
              className="p-2 ml-1 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-colors duration-200 cursor-pointer outline-none shadow-none"
              title="Выйти из системы"
            >
              <LogOut size={14} />
            </motion.button>
          </motion.div>
        </div>
      </header>
      {/* АНИМИРОВАННЫЙ ВЫВОД СТРАНИЦ */}
      <main className="flex-grow flex items-center justify-center relative z-10 w-full max-w-7xl mx-auto p-4 md:p-6 pt-20">
        <div className="w-full pt-2">
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
