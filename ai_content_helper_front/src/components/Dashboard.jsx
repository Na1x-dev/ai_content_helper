import React, { useState, useEffect } from 'react';
import API from '../api';
import { Loader2, Sparkles, Send, Layers, Copy, Check } from 'lucide-react';

export default function Dashboard() {
  const [prompt, setPrompt] = useState('');
  const [platform, setPlatform] = useState('tg');
  const [statusText, setStatusText] = useState('Заполните параметры для генерации контента');
  const [generatedText, setGeneratedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [limits, setLimits] = useState({ plan: 'Загрузка...', generations_left: 0 });
  const [copied, setCopied] = useState(false);
  const [tone, setTone] = useState('neutral');

  const fetchLimits = async () => {
    try {
      const response = await API.get('posts/user-limits/');
      setLimits(response.data);
    } catch (err) {
      console.error('Не удалось загрузить лимиты пользователя', err);
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
      console.error('Не удалось скопировать текст: ', err);
    }
  };

  const startPolling = (postId) => {
    setStatusText('ИИ обрабатывает запрос и формирует структуру текста...');
    const interval = setInterval(async () => {
      try {
        const response = await API.get(`posts/${postId}/`);
        const post = response.data;
        if (post.status === 'completed') {
          clearInterval(interval);
          setGeneratedText(post.text);
          setStatusText('Текст успешно сгенерирован');
          setLoading(false);
          fetchLimits();
        } else if (post.status === 'failed') {
          setStatusText('Ошибка на стороне нейросети. Попробуйте позже.');
          clearInterval(interval);
          setLoading(false);
        }
      } catch (err) {
        clearInterval(interval);
        setStatusText('Ошибка соединения со студией.');
        setLoading(false);
      }
    }, 2000);
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!prompt) return;
    setLoading(true);
    setGeneratedText('');
    setStatusText('Постановка задачи в асинхронную очередь Celery...');
    try {
      const response = await API.post('posts/', { prompt, platform, tone });
      const createdPost = response.data;
      startPolling(createdPost.id);
    } catch (err) {
      setLoading(false);
      setStatusText(`Ошибка генерации: ${err.response?.data?.error || 'неизвестный сбой'}`);
    }
  };

  return (
    <div className="w-full flex flex-col justify-between items-stretch gap-6 self-stretch min-h-[calc(100vh-8rem)]">

      {/* ИНФОРМАЦИОННЫЙ СТАТУС-БАР */}
      <div className="card-bg backdrop-blur-md px-4 py-3 rounded-2xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-sm transition-colors">
        <div className="flex items-center gap-2.5">
          <Layers size={15} className="text-cyan-500" />
          <span className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wide">Ваш тарифный план:</span>
          <span className="px-2.5 py-0.5 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-xs font-semibold rounded-lg border border-cyan-500/15">
            {limits.plan}
          </span>
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Осталось ежедневных лимитов:{' '}
          <span className={`font-bold ml-1 text-sm ${limits.generations_left > 0 ? 'text-emerald-500 dark:text-emerald-400' : 'text-red-500'}`}>
            {limits.generations_left}
          </span>
        </div>
      </div>

      {/* ОСНОВНАЯ РАБОЧАЯ СЕТКА */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow items-stretch">

        {/* ЛЕВАЯ ПАНЕЛЬ: Форма параметров */}
        <div className="card-bg backdrop-blur-xl p-5 md:p-6 rounded-2xl border shadow-md flex flex-col justify-between transition-colors">
          <form onSubmit={handleGenerate} className="space-y-5 h-full flex flex-col justify-between">
            <div className="space-y-5">
              <h3 className="text-sm font-semibold dark:text-slate-200 text-slate-800 flex items-center gap-2 tracking-tight">
                <Sparkles size={15} className="text-cyan-500" /> Параметры генерации
              </h3>

              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">О чем написать пост?</label>
                <textarea
                  rows="6"
                  className="w-full p-4 rounded-xl input-bg border text-sm resize-none transition-all leading-relaxed shadow-sm focus:outline-none focus:border-cyan-500/80 focus:ring-4 focus:ring-cyan-500/10"
                  placeholder="Опишите ключевую мысль, тезисы или тему, которую ИИ должен раскрыть..."
                  onChange={(e) => setPrompt(e.target.value)}
                  value={prompt}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Целевая платформа</label>
                <div className="relative">
                  <select
                    className="w-full p-3.5 rounded-xl input-bg border text-sm transition-all appearance-none cursor-pointer pr-10 shadow-sm focus:outline-none focus:border-cyan-500/80 focus:ring-4 focus:ring-cyan-500/10"
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                  >
                    <option value="tg">Telegram (Информативный стиль + Эмодзи)</option>
                    <option value="vc">VC.ru (Экспертный структурированный лонгрид)</option>
                    <option value="tw">Twitter / X (Краткий цепляющий кликбейт)</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400 dark:text-slate-500">
                    <svg className="fill-current h-4 w-4" xmlns="http://w3.org" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Тональность текста</label>
                <div className="relative">
                  <select
                    className="w-full p-3.5 rounded-xl input-bg border text-sm transition-all appearance-none cursor-pointer pr-10 shadow-sm focus:outline-none focus:border-cyan-500/80 focus:ring-4 focus:ring-cyan-500/10"
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                  >
                    <option value="neutral">Нейтральный/Естественный</option>
                    <option value="friendly">Дружелюбный и разговорный</option>
                    <option value="business">Строгий и экспертный</option>
                    <option value="funny">Юмористический/Саркастичный</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || limits.generations_left <= 0}
              className="w-full mt-6 flex items-center justify-center gap-2 bg-slate-900 dark:bg-cyan-600 hover:bg-slate-800 dark:hover:bg-cyan-500 text-white font-medium py-3.5 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 text-sm shadow-sm active:scale-[0.99] cursor-pointer"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : <Send size={14} />}
              {limits.generations_left <= 0 ? 'Дневной лимит исчерпан' : 'Сгенерировать контент'}
            </button>
          </form>
        </div>

        {/* ПРАВАЯ ПАНЕЛЬ: Вывод готового результата */}
        <div className="card-bg backdrop-blur-xl p-5 md:p-6 rounded-2xl border shadow-md flex flex-col min-h-[350px] lg:min-h-full transition-colors">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4 w-full">
            <h3 className="text-sm font-semibold dark:text-slate-200 text-slate-800 tracking-tight">Сгенерированный текст</h3>
            <span className={`text-[11px] px-2.5 py-1 rounded-lg transition-all font-medium border ${loading ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 animate-pulse border-cyan-500/20' : 'bg-slate-100 dark:bg-[#090d16] text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800'}`}>
              {statusText}
            </span>
          </div>

          <div className="flex-grow flex flex-col relative rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#090d16]/30 overflow-hidden min-h-[240px]">
            {/* КНОПКА СКОПИРОВАТЬ */}
            {generatedText && (
              <button
                onClick={handleCopy}
                className="absolute top-3 right-3 p-2 rounded-lg border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm cursor-pointer z-20"
                title="Скопировать текст"
              >
                {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
              </button>
            )}

            {loading && !generatedText && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 bg-slate-50/95 dark:bg-[#090d16]/95 p-4 text-center z-10">
                <Loader2 size={28} className="animate-spin text-cyan-500 mb-3" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Служба Celery обрабатывает задачу</p>
                <p className="text-[11px] text-slate-500 mt-1 max-w-[240px]">Опрашиваем бэкенд-сервер на готовность поста</p>
              </div>
            )}

            <textarea
              readOnly
              className="w-full h-full flex-grow p-4 bg-transparent text-slate-800 dark:text-slate-300 font-normal text-sm leading-relaxed resize-none focus:outline-none pr-12"
              placeholder="Готовый результат от нейросети появится в этом окне..."
              value={generatedText}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
