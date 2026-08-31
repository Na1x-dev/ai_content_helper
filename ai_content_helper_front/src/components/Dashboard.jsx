import React, { useState, useEffect } from "react";
import { Loader2, Sparkles, Send, Layers, Copy, Check } from "lucide-react";
import API from "../api";
import CustomSelect from "./CustomSelect";

export default function Dashboard() {
  const [prompt, setPrompt] = useState("");
  const [platform, setPlatform] = useState("tg");
  const [statusText, setStatusText] = useState(
    "Заполните параметры для создания публикации",
  );
  const [generatedText, setGeneratedText] = useState("");
  const [limits, setLimits] = useState({
    plan: "Загрузка...",
    generations_left: 0,
  });
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [tone, setTone] = useState("neutral");

  const fetchLimits = async () => {
    try {
      const response = await API.get("posts/user-limits/");
      setLimits(response.data);
    } catch (err) {
      console.error("Не удалось загрузить лимиты пользователя", err);
    }
  };

  useEffect(() => {
    fetchLimits();
  }, []);

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
    setStatusText("ИИ пишет текст и подбирает структуру...");
    const interval = setInterval(async () => {
      try {
        const response = await API.get(`posts/${postId}/`);
        const post = response.data;
        if (post.status === "completed") {
          clearInterval(interval);
          setGeneratedText(post.text);
          setStatusText("Текст успешно написан");
          setLoading(false);
          fetchLimits();
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
    setStatusText("Подготовка запроса для нейросети...");
    try {
      const response = await API.post("posts/", { prompt, platform, tone });
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
    <div className="w-full flex flex-col items-stretch gap-6 min-h-[calc(100vh-9rem)]">
      {/* ИНФОРМАЦИОННЫЙ СТАТУС-БАР */}
      <div className="card-bg backdrop-blur-md px-5 py-4 rounded-2xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-sm">
        <div className="flex items-center gap-2.5">
          <Layers size={15} className="text-cyan-500" />
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-wide">
            Ваш уровень доступа:
          </span>
          <span className="px-2.5 py-0.5 bg-cyan-500/10 text-cyan-400 text-xs font-semibold rounded-lg border border-cyan-500/15">
            {limits.plan}
          </span>
        </div>
        <div className="text-xs text-slate-400 font-medium">
          Осталось ежедневных запросов:{" "}
          <span
            className={`font-bold ml-1 text-sm ${limits.generations_left > 0 ? "text-emerald-400" : "text-red-400"}`}
          >
            {limits.generations_left}
          </span>
        </div>
      </div>

      {/* ОСНОВНАЯ РАБОЧАЯ СЕТКА (Фикс наложений: items-stretch заменен на items-start) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start flex-grow">
        {/* ЛЕВАЯ ПАНЕЛЬ */}
        <div className="card-bg backdrop-blur-xl p-5 md:p-6 rounded-2xl border shadow-md w-full">
          <form onSubmit={handleGenerate} className="space-y-5">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2 tracking-tight">
              <Sparkles size={15} className="text-cyan-500" /> Настройки
              публикации
            </h3>

            <div className="space-y-1.5 text-left">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                О чем написать текст?
              </label>
              <textarea
                rows="6"
                className="w-full p-4 rounded-xl input-bg border border-slate-800 text-sm resize-none transition-all leading-relaxed shadow-sm focus:outline-none focus:border-cyan-500/80 focus:ring-4 focus:ring-cyan-500/10 text-slate-200"
                placeholder="Опишите ключевую мысль, тезисы или тему, которую ИИ должен раскрыть..."
                onChange={(e) => setPrompt(e.target.value)}
                value={prompt}
                required
              />
            </div>

            {/* Заменили на плавные селекты */}
            <CustomSelect
              label="Площадка"
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

            <button
              type="submit"
              disabled={loading || limits.generations_left <= 0}
              className="w-full mt-2 flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-slate-950 font-bold py-3.5 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 text-sm shadow-sm active:scale-[0.99] cursor-pointer"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <Send size={14} />
              )}
              {limits.generations_left <= 0
                ? "Лимит на сегодня исчерпан"
                : "Создать публикацию"}
            </button>
          </form>
        </div>

        {/* ПРАВАЯ ПАНЕЛЬ */}
        <div className="card-bg backdrop-blur-xl p-5 md:p-6 rounded-2xl border shadow-md flex flex-col min-h-[380px] lg:h-full w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4 w-full">
            <h3 className="text-sm font-semibold text-slate-200 tracking-tight">
              Готовый результат
            </h3>
            <span
              className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all font-medium ${
                loading
                  ? "bg-cyan-500/10 text-cyan-400 animate-pulse border-cyan-500/20"
                  : "bg-[#090d16] text-slate-400 border-slate-800"
              }`}
            >
              {statusText}
            </span>
          </div>

          <div className="flex-grow flex flex-col relative rounded-xl border border-slate-800 bg-[#090d16]/30 overflow-hidden min-h-[260px] h-full">
            {generatedText && (
              <button
                onClick={handleCopy}
                className="absolute top-3 right-3 p-2 rounded-lg border bg-slate-900 border-slate-800 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-all shadow-sm cursor-pointer z-20"
                title="Скопировать"
              >
                {copied ? (
                  <Check size={14} className="text-emerald-400" />
                ) : (
                  <Copy size={14} />
                )}
              </button>
            )}

            {loading && !generatedText && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 bg-[#090d16]/95 p-4 text-center z-10">
                <Loader2
                  size={28}
                  className="animate-spin text-cyan-500 mb-3"
                />
                <p className="text-xs font-semibold text-slate-300">
                  Интеллектуальный помощник пишет статью
                </p>
                <p className="text-[11px] text-slate-500 mt-1 max-w-[240px]">
                  Пожалуйста, подождите несколько секунд...
                </p>
              </div>
            )}

            <textarea
              readOnly
              className="w-full h-full flex-grow p-4 bg-transparent text-slate-300 font-normal text-sm leading-relaxed resize-none focus:outline-none pr-12 min-h-[260px]"
              placeholder="Здесь появится готовый текст от нейросети..."
              value={generatedText}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
