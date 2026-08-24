import React, { useState, useEffect } from 'react';
import API from '../api';
import { Loader2, Sparkles, Send, ShieldAlert } from 'lucide-react';

export default function Dashboard() {
  const [prompt, setPrompt] = useState('');
  const [platform, setPlatform] = useState('tg');
  const [statusText, setStatusText] = useState('Заполните форму для генерации...');
  const [generatedText, setGeneratedText] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Состояние для хранения лимитов подписки
  const [limits, setLimits] = useState({ plan: 'Загрузка...', generations_left: 0 });

  // Функция для запроса лимитов с бэкенда
  const fetchLimits = async () => {
    try {
      const response = await API.get('posts/user-limits/');
      setLimits(response.data);
    } catch (err) {
      console.error('Не удалось загрузить лимиты пользователя', err);
    }
  };

  // Загружаем лимиты при первом рендере дашборда
  useEffect(() => {
    fetchLimits();
  }, []);

  // Функция для запуска опроса статуса (Polling)
  const startPolling = (postId) => {
    setStatusText('ИИ генерирует текст поста в фоне...');
    
    const interval = setInterval(async () => {
      try {
        const response = await API.get(`posts/${postId}/`);
        const post = response.data;

        if (post.status === 'completed') {
          clearInterval(interval);
          setGeneratedText(post.text);
          setStatusText('Готово! ✨');
          setLoading(false);
          fetchLimits(); // Обновляем счетчик лимитов, так как один внутренний лимит списался!
        } else if (post.status === 'failed') {
          clearInterval(interval);
          setStatusText('Ошибка генерации на стороне ИИ.');
          setLoading(false);
        }
      } catch (err) {
        clearInterval(interval);
        setStatusText('Ошибка соединения с сервером.');
        setLoading(false);
      }
    }, 2000);
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!prompt) return;

    setLoading(true);
    setGeneratedText('');
    setStatusText('Отправка задачи в очередь Celery...');

    try {
      const response = await API.post('posts/', { prompt, platform });
      const createdPost = response.data;
      
      startPolling(createdPost.id);
    } catch (err) {
      setLoading(false);
      setStatusText(`Ошибка: ${err.response?.data?.error || 'Не удалось запустить генерацию'}`);
    }
  };

  return (
    <div className="w-full max-w-5xl space-y-6">
      
      {/* ПАНЕЛЬ ТАРИФА И ЛИМИТОВ */}
      <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-sm">Ваш тариф:</span>
          <span className="px-2.5 py-0.5 bg-cyan-500/10 text-cyan-400 text-xs font-semibold rounded-full border border-cyan-500/20">
            {limits.plan}
          </span>
        </div>
        <div className="text-sm">
          Осталось генераций на сегодня: {' '}
          <span className={`font-bold ${limits.generations_left > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {limits.generations_left}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Левая панель управления */}
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Sparkles className="text-cyan-400" /> Параметры генерации
          </h3>
          <form onSubmit={handleGenerate} className="space-y-5">
            <div>
              <label className="block text-sm text-slate-400 mb-2">О чем написать пост?</label>
              <textarea
                rows="4"
                className="w-full p-3 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-500 resize-none"
                placeholder="Например: Опиши главные тренды в архитектуре веб-приложений на 2026 год..."
                onChange={(e) => setPrompt(e.target.value)}
                value={prompt}
                required
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Целевая платформа</label>
              <select
                className="w-full p-3 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
              >
                <option value="tg">Telegram (Информативный + Эмодзи)</option>
                <option value="vc">VC.ru (Экспертный лонгрид)</option>
                <option value="tw">Twitter / X (Краткий кликбейт)</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={loading || limits.generations_left <= 0}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold py-3 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Send size={18} />}
              {limits.generations_left <= 0 ? 'Лимит исчерпан 🛑' : 'Сгенерировать контент'}
            </button>
          </form>
        </div>

        {/* Правая панель вывода результатов */}
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg flex flex-col min-h-[350px]">
          <h3 className="text-xl font-bold text-white mb-4">Результат</h3>
          <div className={`text-sm mb-4 px-3 py-1.5 rounded-md ${loading ? 'bg-cyan-500/10 text-cyan-400 animate-pulse' : 'bg-slate-900 text-slate-400'}`}>
            {statusText}
          </div>
          
          {loading && !generatedText && (
            <div className="flex flex-col items-center justify-center flex-grow text-slate-500">
              <Loader2 size={40} className="animate-spin text-cyan-500 mb-2" />
              <span>Воркер Celery обрабатывает запрос...</span>
            </div>
          )}

          {generatedText && (
            <textarea
              className="w-full flex-grow p-4 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 font-mono text-sm resize-none focus:outline-none h-full min-h-[250px]"
              readOnly
              value={generatedText}
            />
          )}
        </div>
      </div>
    </div>
  );
}
