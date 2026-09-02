import React from "react";
import { Zap, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion"; // Импортируем компоненты анимации
import HeaderButton from "./HeaderButton";

export default function MainLayout({
  tab,
  setTab,
  username,
  limits,
  onLogout,
  children,
}) {
  return (
    <div className="bg-[#0b0f19] min-h-screen flex flex-col relative overflow-x-hidden antialiased text-slate-200 selection:bg-cyan-500/30">
      {/* Декоративный свет */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[300px] bg-gradient-to-b from-cyan-500/5 to-indigo-500/0 blur-3xl pointer-events-none z-0"></div>

      {/* FIXED HEADER */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-[#0b0f19]/80 border-b border-slate-800/80 shadow-sm">
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

          {/* ПРАВАЯ ЧАСТЬ: Капсула пользователя с анимацией плавного появления */}
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex items-center bg-slate-100/80 dark:bg-slate-900/60 p-1 rounded-full backdrop-blur-md border border-slate-200/40 dark:border-slate-800/40 gap-1 text-xs"
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
            <div className="h-6 w-px bg-slate-800/60 mx-1"></div>

            {/* Лимиты с анимацией плавного изменения цифр */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 text-slate-300 font-medium overflow-hidden min-w-[90px] md:min-w-[125px]">
              <Zap className="w-3.5 h-3.5 text-cyan-400 animate-pulse flex-shrink-0" />
              <span className="hidden md:inline text-slate-400 flex-shrink-0">
                Осталось:
              </span>

              {/* AnimatePresence позволяет анимировать исчезающие/появляющиеся элементы */}
              <div className="relative h-4 w-6 flex items-center justify-start">
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={limits?.generations_left ?? 0} // Ключ заставляет фреймворк видеть изменение
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

            {/* Кнопка Выхода с микро-интерактивом */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onLogout}
              className="p-2 ml-1 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-colors duration-200 cursor-pointer outline-none focus:outline-none"
              title="Выйти из системы"
            >
              <LogOut size={14} />
            </motion.button>
          </motion.div>
        </div>
      </header>

      {/* ОСНОВНОЙ КОНТЕНТ */}
      <main className="flex-grow flex items-center justify-center relative z-10 w-full max-w-7xl mx-auto p-4 md:p-6">
        <div className="w-full pt-2">{children}</div>
      </main>
    </div>
  );
}
