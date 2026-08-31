import React, { useState, useEffect } from "react";
import API from "../api";
import { Clipboard, Check, Calendar, MessageSquare } from "lucide-react";

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

  const getPlatformLabel = (platform) => {
    const labels = { tg: "Telegram", vc: "VC.ru", tw: "Twitter / X" };
    return labels[platform] || platform;
  };

  // Функция для очистки текста запроса от вшитых инструкций тональности [...]
  const cleanPrompt = (promptText) => {
    if (!promptText) return "";
    return promptText.replace(/\s*\[Тональность:.*?\]/, "");
  };

  if (loading)
    return (
      <div className="text-center py-12 text-slate-400">
        Загрузка истории генераций...
      </div>
    );

  if (posts.length === 0)
    return (
      <div className="text-center py-12 text-slate-400 bg-slate-900/30 rounded-2xl border border-slate-800">
        Вы еще ничего не создавали. Самое время начать!
      </div>
    );

  return (
    <div className="space-y-4 max-w-4xl mx-auto animate-fade-in px-2">
      <h2 className="text-xl font-bold tracking-tight text-slate-200 text-left">
        История публикаций
      </h2>
      <div className="grid grid-cols-1 gap-4">
        {posts.map((post) => (
          <div
            key={post.id}
            className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5 flex flex-col gap-4 relative hover:border-slate-700 transition-colors"
          >
            {/* ВЕРХНЯЯ ПАНЕЛЬ КАРТОЧКИ */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/50 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-xs px-2.5 py-0.5 bg-cyan-500/10 text-cyan-400 font-semibold rounded-md border border-cyan-500/10">
                  {getPlatformLabel(post.platform)}
                </span>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-md font-medium ${
                    post.status === "completed"
                      ? "bg-emerald-500/10 text-emerald-400"
                      : post.status === "failed"
                        ? "bg-red-500/10 text-red-400"
                        : "bg-amber-500/10 text-amber-400"
                  }`}
                >
                  {post.status === "completed"
                    ? "Готово"
                    : post.status === "failed"
                      ? "Ошибка"
                      : "В процессе"}
                </span>
              </div>

              {/* Фикс даты: добавили flex-shrink-0, чтобы не сжималась */}
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium flex-shrink-0">
                <Calendar size={13} />
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

            {/* ТЕКСТ ЗАПРОСА И РЕЗУЛЬТАТ */}
            <div className="space-y-2.5 text-left">
              <div className="text-xs font-semibold text-slate-400 flex items-start gap-1.5 leading-relaxed">
                <MessageSquare
                  size={13}
                  className="mt-0.5 flex-shrink-0 text-slate-500"
                />
                <span>
                  Запрос:{" "}
                  <span className="font-normal text-slate-300 italic">
                    "{cleanPrompt(post.prompt)}"
                  </span>
                </span>
              </div>

              <div className="relative group">
                <p className="text-sm text-slate-300 whitespace-pre-wrap bg-slate-950/40 p-4 rounded-xl border border-slate-800/40 leading-relaxed max-h-48 overflow-y-auto font-normal pr-12">
                  {post.text || "Текст генерируется..."}
                </p>

                {/* Кнопка копирования теперь аккуратно расположена внутри текстового поля справа вверху */}
                {post.status === "completed" && post.text && (
                  <button
                    onClick={() => handleCopy(post.id, post.text)}
                    className="absolute top-3 right-3 p-2 bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-slate-400 hover:text-cyan-400 rounded-lg transition-all cursor-pointer z-10"
                    title="Скопировать полученный текст"
                  >
                    {copiedId === post.id ? (
                      <Check size={13} className="text-emerald-400" />
                    ) : (
                      <Clipboard size={13} />
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
