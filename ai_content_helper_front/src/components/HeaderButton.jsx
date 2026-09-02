import React from "react";
import { motion } from "framer-motion";

export default function HeaderButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`relative px-5 py-2.5 rounded-full text-sm font-medium transition-colors duration-200 cursor-pointer border outline-none ${
        active
          ? "text-cyan-600 dark:text-cyan-400 bg-cyan-50/80 dark:bg-cyan-950/30 border-cyan-500/20 shadow-sm"
          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/60 dark:hover:bg-slate-800/40 border-transparent"
      }
      focus:outline-none focus-visible:outline-none`}
    >
      {/* Анимированная фоновая подложка для премиального эффекта скольжения */}
      {active && (
        <motion.div
          layoutId="activeTabBackground"
          className="absolute inset-0 rounded-full bg-cyan-50/80 dark:bg-cyan-950/30 -z-0"
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}

      <span className="relative z-10">{children}</span>

      {/* Световой индикатор активной вкладки */}
      {active && (
        <motion.div
          layoutId="activeTabGlow"
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-cyan-500 dark:bg-cyan-400 rounded-full shadow-[0_0_10px_#06b6d4] z-10"
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}
    </button>
  );
}
