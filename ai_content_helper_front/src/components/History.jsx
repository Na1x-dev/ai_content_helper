import { useState, useEffect } from "react";
import API from "../api";
import {
  Clipboard,
  Check,
  Calendar,
  MessageSquare,
  Layers,
  Sparkles,
  AlertCircle,
  FileText,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  cleanPrompt,
  formatPostDate,
  getPlatformDetails,
} from "../utils/content";

const CONTAINER_VARIANTS = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const ITEM_VARIANTS = {
  hidden: {
    opacity: 0,
    y: 20,
    backgroundColor: "rgba(11, 15, 25, 0)",
    backdropFilter: "blur(0px)",
  },
  show: {
    opacity: 1,
    y: 0,
    backgroundColor: "rgba(11, 15, 25, 0.25)",
    backdropFilter: "blur(12px)",
    transition: {
      type: "spring",
      stiffness: 150,
      damping: 22,
      backgroundColor: { duration: 0.4, ease: "easeOut" },
      backdropFilter: { duration: 0.4, ease: "easeOut" },
    },
  },
};

export default function History() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    let isCurrent = true;

    API.get("posts/")
      .then((res) => {
        if (!isCurrent) return;
        setPosts(res.data);
        setLoading(false);
      })
      .catch((err) => {
        if (!isCurrent) return;
        console.error("Ошибка загрузки истории:", err);
        setLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  const handleCopy = async (id, text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="page-state-panel">
        <LoaderSpinner />
        <p className="page-state-label">Загрузка архива...</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="page-empty-state">
        <div className="page-empty-icon">
          <Layers size={24} />
        </div>
        <div className="space-y-1">
          <h3 className="page-empty-title">История публикаций пуста</h3>
          <p className="page-empty-copy">Перейдите в раздел «Генератор».</p>
        </div>
      </div>
    );
  }

  return (
    /* ФИКС: Ограничиваем высоту области истории и включаем внутренний скроллбара только здесь */
    <div className="history-page">
      <div className="page-heading">
        <div>
          <h2 className="page-title">
            <Layers size={18} className="text-cyan-500" /> Архив публикаций
          </h2>
          <p className="page-subtitle">
            Все сгенерированные тексты надёжно хранятся здесь
          </p>
        </div>
        <div className="page-count-chip">Всего генераций: {posts.length}</div>
      </div>

      <motion.div
        variants={CONTAINER_VARIANTS}
        initial="hidden"
        animate="show"
        className="history-list grid grid-cols-1 gap-6 w-full"
      >
        {posts.map((post) => {
          const platform = getPlatformDetails(post.platform);
          return (
            <motion.div
              key={post.id}
              variants={ITEM_VARIANTS}
              whileHover={{
                borderColor: "rgba(6, 182, 212, 0.25)",
                scale: 1.002,
                transition: { duration: 0.2 },
              }}
              className="history-item"
            >
              {/* ЛЕНТА СТАТУСА И ДАТЫ */}
              <div className="history-meta flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/20 pb-3.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-xl border ${platform.color}`}
                  >
                    {platform.label}
                  </span>
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-xl border ${
                      post.status === "completed"
                        ? "bg-emerald-500/5 text-emerald-400 border-emerald-500/20"
                        : post.status === "failed"
                          ? "bg-red-500/5 text-red-400 border-red-500/20"
                          : "bg-amber-500/5 text-amber-400 border-amber-500/20 animate-pulse"
                    }`}
                  >
                    {post.status === "completed"
                      ? "Готово"
                      : post.status === "failed"
                        ? "Сбой"
                        : "В процессе"}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium font-mono">
                  <Calendar size={13} className="text-slate-600" />
                  <span>{formatPostDate(post.created_at)}</span>
                </div>
              </div>

              {/* СЕТКА СТРУКТУРЫ */}
              <div className="history-content-grid grid grid-cols-1 md:grid-cols-12 gap-5 w-full">
                <div className="history-prompt md:col-span-4 space-y-2 bg-slate-950/15 border border-slate-900/30 p-4 rounded-2xl flex flex-col justify-start">
                  <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    <MessageSquare size={12} className="text-slate-500" /> Ваш
                    исходный запрос
                  </div>
                  <p className="text-xs text-slate-300 font-normal leading-relaxed italic wrap-break-word pr-2">
                    "{cleanPrompt(post.prompt)}"
                  </p>
                </div>

                <div className="history-text md:col-span-8 flex flex-col relative rounded-2xl border border-slate-800/20 bg-slate-950/20 p-4 min-h-25">
                  <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2 border-b border-slate-800/20 pb-2">
                    <FileText size={12} className="text-slate-500" />{" "}
                    Сгенерированный текст публикации
                  </div>

                  {post.status === "completed" && post.text && (
                    <button
                      onClick={() => handleCopy(post.id, post.text)}
                      className="absolute top-3 right-3 p-2 bg-slate-900/40 hover:bg-slate-800/80 border border-slate-800 text-slate-400 hover:text-cyan-400 rounded-xl transition-all cursor-pointer z-10 shadow-md"
                      title="Скопировать текст"
                    >
                      {copiedId === post.id ? (
                        <Check size={14} className="text-emerald-400" />
                      ) : (
                        <Clipboard size={14} />
                      )}
                    </button>
                  )}

                  <div className="text-sm text-slate-300 font-normal whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto pr-8 font-sans">
                    {post.text || (
                      <span className="text-slate-500 italic flex items-center gap-2 pt-1">
                        {post.status === "failed" ? (
                          <span className="flex items-center gap-2 text-xs">
                            <AlertCircle size={14} className="text-red-400" />{" "}
                            Ошибка генерации.
                          </span>
                        ) : (
                          <span className="flex items-center gap-2 text-xs">
                            <Sparkles
                              size={14}
                              className="animate-spin text-cyan-500"
                            />{" "}
                            Генерация контента...
                          </span>
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}

function LoaderSpinner() {
  return (
    <div className="relative flex items-center justify-center w-8 h-8 bg-transparent">
      <div className="absolute w-8 h-8 rounded-full border-2 border-cyan-500/20 animate-ping" />
      <Sparkles
        className="animate-spin text-cyan-400 relative z-10"
        size={20}
      />
    </div>
  );
}
