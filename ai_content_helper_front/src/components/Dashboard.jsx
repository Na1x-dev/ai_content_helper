import React, { useState } from "react";
import {
  Loader2,
  Sparkles,
  Send,
  Copy,
  Check,
  AlignLeft,
  Type,
  FileText,
  Bot,
  HelpCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../api";
import CustomSelect from "./CustomSelect";

export default function Dashboard({ limits, fetchLimits }) {
  const [prompt, setPrompt] = useState("");
  const [platform, setPlatform] = useState("tg");
  const [tone, setTone] = useState("neutral");
  const [length, setLength] = useState("medium"); // Новый параметр длины текста

  const [loading, setLoading] = useState(false);
  const [generatedText, setGeneratedText] = useState("");
  const [statusText, setStatusText] = useState(
    "Заполните параметры для создания публикации",
  );
  const [copied, setCopied] = useState(false);

  // Варианты анимации для плавного появления карточек
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const handleCopy = async () => {
    if (!generatedText) return;
    try {
      await navigator.clipboard.writeText(generatedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Не удалось скопировать текст: ", err);
    }
  };

  const startPolling = (postId) => {
    setStatusText("ИИ анализирует тему и подбирает структуру...");
    const interval = setInterval(async () => {
      try {
        const response = await API.get(`posts/${postId}/`);
        const post = response.data;

        if (post.status === "completed") {
          clearInterval(interval);
          setGeneratedText(post.text);
          setStatusText("Текст успешно написан");
          setLoading(false);
          if (fetchLimits) fetchLimits();
        } else if (post.status === "failed") {
          setStatusText("Произошел сбой. Пожалуйста, попробуйте позже.");
          clearInterval(interval);
          setLoading(false);
        }
      } catch (err) {
        clearInterval(interval);
        setStatusText("Ошибка соединения с сервером.");
        setLoading(false);
      }
    }, 2000);
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!prompt) return;
    setLoading(true);
    setGeneratedText("");
    setStatusText("Отправка запроса в нейросеть...");

    try {
      const response = await API.post("posts/", {
        prompt,
        platform,
        tone,
        length,
      });
      startPolling(response.data.id);
    } catch (err) {
      setLoading(false);
      setStatusText("Не удалось начать генерацию.");
    }
  };

  const platformOptions = [
    { value: "tg", label: "Telegram (Информативный стиль + Эмодзи)" },
    { value: "vc", label: "VC.ru (Экспертная глубокая статья)" },
    { value: "tw", label: "X / Twitter (Краткая емкая мысль)" },
  ];

  const toneOptions = [
    { value: "neutral", label: "Нейтральный / Естественный" },
    { value: "friendly", label: "Дружелюбный и разговорный" },
    { value: "business", label: "Строгий и деловой" },
    { value: "funny", label: "Юмористический / Ироничный" },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-2 pb-12">
      {/* СЕКЦИЯ ПРИВЕТСТВИЯ С ИНФОРМАЦИЕЙ */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mb-8 p-6 rounded-3xl border border-slate-800/60 bg-gradient-to-r from-slate-900/80 via-slate-950/40 to-slate-900/80 backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-2xl shadow-inner">
            <Bot size={24} className="animate-pulse" />
          </div>
          <div className="text-left">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              ИИ-Лаборатория Контента
            </h2>
            <p className="text-xs text-slate-400 max-w-xl">
              Задайте тему, укажите настроение публикации и выберите желаемый
              объём. Нейросеть gpt-4o-mini сделает всю рутину за вас.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-950/60 border border-slate-800 px-4 py-2.5 rounded-2xl">
          <HelpCircle size={14} className="text-slate-500" />
          <span className="text-[11px] text-slate-400 font-medium">
            Доступный баланс обновится автоматически через сутки
          </span>
        </div>
      </motion.div>

      {/* ОСНОВНАЯ РАБОЧАЯ СЕТКА */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ЛЕВАЯ ПАНЕЛЬ: НАСТРОЙКИ ФОРМЫ (5 из 12 колонок) */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="lg:col-span-6 xl:col-span-5 card-bg backdrop-blur-xl p-6 rounded-3xl border shadow-xl w-full"
        >
          <form onSubmit={handleGenerate} className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 tracking-tight">
                <Sparkles size={16} className="text-cyan-400" /> Конфигуратор
                поста
              </h3>
            </div>

            {/* ПОЛЕ ВВОДА ТЕМЫ */}
            <div className="space-y-2 text-left">
              <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <AlignLeft size={12} className="text-slate-500" /> О чем
                написать text?
              </label>
              <div className="relative group">
                <textarea
                  rows="5"
                  className="w-full p-4 rounded-2xl input-bg border border-slate-800 text-sm resize-none transition-all leading-relaxed shadow-sm focus:outline-none focus:border-cyan-500/80 focus:ring-4 focus:ring-cyan-500/10 text-slate-200 group-hover:border-slate-700/80"
                  placeholder="Пример: Топ-5 фишек React 19 для middle разработчиков с акцентом на Server Actions..."
                  onChange={(e) => setPrompt(e.target.value)}
                  value={prompt}
                  required
                />
                <span className="absolute bottom-3 right-3 text-[10px] text-slate-600 font-mono">
                  {prompt.length}/255
                </span>
              </div>
            </div>

            <CustomSelect
              label="Целевая площадка"
              value={platform}
              onChange={setPlatform}
              options={platformOptions}
            />
            <CustomSelect
              label="Настроение текста"
              value={tone}
              onChange={setTone}
              options={toneOptions}
            />

            {/* СЕЛЕКТОР ОБЪЁМА ТЕКСТА */}
            <div className="space-y-2 text-left">
              <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <Type size={12} className="text-slate-500" /> Объём публикации
              </label>
              <div className="grid grid-cols-3 gap-2 bg-slate-950/40 border border-slate-800/80 p-1 rounded-xl">
                {[
                  { id: "short", label: "Ёмкий", desc: "~100 слов" },
                  { id: "medium", label: "Средний", desc: "~250 слов" },
                  { id: "long", label: "Лонгрид", desc: "~500 слов" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setLength(item.id)}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                      length === item.id
                        ? "bg-gradient-to-r from-cyan-500/15 to-indigo-500/15 border border-cyan-500/30 text-cyan-400"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/30 border border-transparent"
                    }`}
                  >
                    <span>{item.label}</span>
                    <span className="text-[9px] text-slate-600 font-normal">
                      {item.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={loading || !limits || limits.generations_left <= 0}
              className="w-full mt-4 flex items-center justify-center gap-2.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-slate-950 font-bold py-4 rounded-2xl disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-300 text-sm shadow-lg cursor-pointer"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : limits?.generations_left <= 0 ? (
                "Лимит генераций исчерпан"
              ) : (
                <>
                  <Send size={15} /> Запустить нейросеть
                </>
              )}
            </motion.button>
          </form>
        </motion.div>

        {/* ПРАВАЯ ПАНЕЛЬ: РЕЗУЛЬТАТ (7 из 12 колонок) */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="lg:col-span-6 xl:col-span-7 card-bg backdrop-blur-xl p-6 rounded-3xl border shadow-xl flex flex-col min-h-[460px] lg:h-full w-full relative"
        >
          {/* ЗАГОЛОВОК ПРАВОЙ ПАНЕЛИ С ЭЛЕМЕНТАМИ УПРАВЛЕНИЯ */}
          <div className="flex flex-row justify-between items-center gap-3 mb-5 border-b border-slate-800/60 pb-3 w-full pr-12 relative">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 tracking-tight whitespace-nowrap">
              <FileText size={16} className="text-slate-400" /> Результат
            </h3>

            {/* Статус-бар теперь автоматически сдвигается левее, если появляется кнопка */}
            <span
              className={`text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full border transition-all truncate max-w-[180px] sm:max-w-none ${
                loading
                  ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30 animate-pulse shadow-md"
                  : "bg-slate-950/60 text-slate-400 border-slate-800/80"
              }`}
            >
              {statusText}
            </span>
          </div>

          {/* КНОПКА КОПИРОВАНИЯ: Теперь она жестко зафиксирована в самом углу карточки, а pr-12 в блоке выше не дает статусу на нее налезть */}
          <AnimatePresence>
            {generatedText && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={handleCopy}
                className="absolute top-5 right-5 p-2 rounded-xl border bg-slate-900 border-slate-800 text-slate-400 hover:text-cyan-400 hover:bg-slate-800/80 transition-all shadow-lg cursor-pointer z-20"
                title="Скопировать готовый текст"
              >
                {copied ? (
                  <Check size={14} className="text-emerald-400" />
                ) : (
                  <Copy size={14} />
                )}
              </motion.button>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {loading && !generatedText && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 bg-slate-950/90 backdrop-blur-sm p-4 text-center rounded-3xl z-10"
              >
                <div className="relative mb-4 flex items-center justify-center">
                  <div className="absolute w-12 h-12 rounded-full border-2 border-cyan-500/20 animate-ping" />
                  <Loader2
                    size={32}
                    className="animate-spin text-cyan-400 relative z-10"
                  />
                </div>
                <h4 className="text-sm font-bold text-slate-200">
                  Ассистент формирует контент
                </h4>
                <p className="text-[11px] text-slate-500 mt-1.5 max-w-[280px] leading-relaxed">
                  Алгоритм распределяет абзацы, подбирает релевантные стили и
                  выстраивает структуру...
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="w-full h-full flex-grow relative">
            <textarea
              readOnly
              className="w-full h-full min-h-[300px] flex-grow p-2 bg-transparent text-slate-300 font-normal text-sm leading-relaxed resize-none focus:outline-none pr-14"
              placeholder="Сгенерированный нейросетью текст отобразится в этом окне..."
              value={generatedText}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
