import { motion } from "framer-motion";

export default function HeaderButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`nav-pill ${active ? "nav-pill-active" : "nav-pill-muted"}
      focus:outline-none`}
    >
      {/* Анимированная фоновая подложка для премиального эффекта скольжения */}
      {active && (
        <motion.div
          layoutId="activeTabBackground"
          className="nav-pill-background"
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}

      <span className="relative z-10">{children}</span>

      {/* Световой индикатор активной вкладки */}
      {active && (
        <motion.div
          layoutId="activeTabGlow"
          className="nav-pill-dot"
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}
    </button>
  );
}
