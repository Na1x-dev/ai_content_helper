import React, { useState, useEffect } from "react";
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
import { motion, AnimatePresence } from "framer-motion";

export default function History() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    API.get("posts/")
      .then((res) => {
        setPosts(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Ошибка загрузки истории:", err);
        setLoading(false);
      });
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

  const getPlatformDetails = (platform) => {
    const data = {
      tg: {
        label: "Telegram",
        color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
      },
      vc: {
        label: "VC.ru",
        color: "bg-slate-800/40 text-slate-300 border-slate-700",
      },
      tw: {
        label: "Twitter / X",
        color: "bg-violet-500/10 text-purple-400 border-violet-500/20",
      },
    };
    return (
      data[platform] || {
        label: platform,
        color: "bg-transparent text-slate-400 border-slate-800",
      }
    );
  };

  const cleanPrompt = (promptText) => {
    if (!promptText) return "";
    return promptText
      .replace(/\s*\[Тональность:.*?\]/, "")
      .replace(/\s*\[Объём:.*?\]/, "");
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.06 }, // Каскадный шаг появления
    },
  };

  // НАСТРОЙКА ПЛАВНОГО ПРОЯВЛЕНИЯ СТЕКЛА И ЗАДНЕГО ФОНА
  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      backgroundColor: "rgba(11, 15, 25, 0)", // Стартуем с абсолютно прозрачного фона
      backdropFilter: "blur(0px)", // Без размытия
    },
    show: {
      opacity: 1,
      y: 0,
      backgroundColor: "rgba(11, 15, 25, 0.25)", // Плавное сгущение подложки
      backdropFilter: "blur(12px)", // Плавное проявление размытия
      transition: {
        type: "spring",
        stiffness: 150,
        damping: 22,
        /* Заставляем цвета и размытие переливаться мягко в течение 0.4 сек */
        backgroundColor: { duration: 0.4, ease: "easeOut" },
        backdropFilter: { duration: 0.4, ease: "easeOut" },
      },
    },
  };

  if (loading) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-32 text-slate-400 gap-3 bg-transparent">
        <LoaderSpinner />
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Загрузка архива...
        </p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-16 px-4 max-w-xl mx-auto rounded-3xl border border-slate-800/30 bg-slate-950/10 backdrop-blur-md space-y-4 mt-8">
        <div className="p-4 bg-slate-950/20 border border-slate-800/20 text-slate-500 w-14 h-14 rounded-2xl mx-auto flex items-center justify-center">
          <Layers size={24} />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-200">
            История публикаций пуста
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Перейдите в раздел «Генератор».
          </p>
        </div>
      </div>
    );
  }

  return (
    /* ФИКС: Ограничиваем высоту области истории и включаем внутренний скроллбара только здесь */
    <div className="space-y-6 w-full max-h-[calc(100vh-120px)] overflow-y-auto pt-8 pr-2 bg-transparent relative z-10 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/40 pb-4 sticky top-0 bg-[#040612]/10 backdrop-blur-sm z-30 pt-1">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-slate-100 flex items-center gap-2">
            <Layers size={18} className="text-cyan-500" /> Архив публикаций
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Все сгенерированные тексты надёжно хранятся здесь
          </p>
        </div>
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-950/20 border border-slate-800/30 px-3 py-1.5 rounded-xl self-start sm:self-auto">
          Всего генераций: {posts.length}
        </div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-6 w-full"
      >
        {posts.map((post) => {
          const platform = getPlatformDetails(post.platform);
          return (
            <motion.div
              key={post.id}
              variants={itemVariants}
              whileHover={{
                borderColor: "rgba(6, 182, 212, 0.25)",
                scale: 1.002,
                transition: { duration: 0.2 },
              }}
              className="border border-slate-800/30 rounded-3xl p-5 md:p-6 flex flex-col gap-4 relative shadow-lg overflow-hidden w-full"
            >
              {/* ЛЕНТА СТАТУСА И ДАТЫ */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/20 pb-3.5">
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
                  <span>
                    {new Date(post.created_at).toLocaleString("ru-RU", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>

              {/* СЕТКА СТРУКТУРЫ */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 w-full">
                <div className="md:col-span-4 space-y-2 bg-slate-950/15 border border-slate-900/30 p-4 rounded-2xl flex flex-col justify-start">
                  <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    <MessageSquare size={12} className="text-slate-500" /> Ваш
                    исходный запрос
                  </div>
                  <p className="text-xs text-slate-300 font-normal leading-relaxed italic break-words pr-2">
                    "{cleanPrompt(post.prompt)}"
                  </p>
                </div>

                <div className="md:col-span-8 flex flex-col relative rounded-2xl border border-slate-800/20 bg-slate-950/20 p-4 min-h-[100px]">
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
