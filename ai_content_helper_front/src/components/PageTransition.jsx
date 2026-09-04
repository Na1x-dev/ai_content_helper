import { motion } from "framer-motion";

const pageVariants = {
  initial: {
    opacity: 0,
    y: 10, // Легкое смещение снизу вверх при появлении
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeInOut",
    },
  },
  exit: {
    opacity: 0,
    y: -10, // Легкое смещение вверх при уходе со страницы
    transition: {
      duration: 0.2,
      ease: "easeInOut",
    },
  },
};

export default function PageTransition({ children }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full h-full bg-transparent" /* <-- Явно указали прозрачность */
    >
      {children}
    </motion.div>
  );
}
