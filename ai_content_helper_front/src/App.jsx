import React, { useState, useEffect } from 'react';
import AuthForm from './components/AuthForm';
import Dashboard from './components/Dashboard';
import { Sparkles, Zap, Shield, History as HistoryIcon, CreditCard } from 'lucide-react';

import History from './components/History';
import Pricing from './components/Pricing';




export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentTab, setCurrentTab] = useState('studio'); // studio, history, pricing

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) setIsAuthenticated(true);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    setIsAuthenticated(false);
    setCurrentTab('studio');
  };

  return (
    <div className="bg-[#0b0f19] min-h-screen flex flex-col relative overflow-x-hidden antialiased text-slate-200 selection:bg-cyan-500/30">
      {/* Декоративный свет сверху */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[300px] bg-gradient-to-b from-cyan-500/10 to-indigo-500/0 blur-3xl pointer-events-none z-0"></div>

      {/* HEADER */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-[#0b0f19]/75 border-b border-slate-800/80">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 h-16 flex justify-between items-center relative z-10">
          <div className="flex items-center gap-6 md:gap-10">
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setCurrentTab('studio')}>
              <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center shadow-md shadow-cyan-500/10">
                <span className="text-white font-bold text-xs">AI</span>
              </div>
              <h1 className="text-md font-semibold tracking-tight text-slate-200">
                SaaS <span className="text-cyan-400 font-medium">Studio</span>
              </h1>
            </div>
            
            {isAuthenticated && (
              <nav className="hidden md:flex items-center gap-2 text-sm font-medium">
                <button 
                  onClick={() => setCurrentTab('studio')} 
                  className={`px-3 py-1.5 rounded-lg transition ${currentTab === 'studio' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400 hover:text-slate-200'}`}>
                  Студия
                </button>
                <button 
                  onClick={() => setCurrentTab('history')} 
                  className={`px-3 py-1.5 rounded-lg transition ${currentTab === 'history' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400 hover:text-slate-200'}`}>
                  История
                </button>
                <button 
                  onClick={() => setCurrentTab('pricing')} 
                  className={`px-3 py-1.5 rounded-lg transition ${currentTab === 'pricing' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400 hover:text-slate-200'}`}>
                  Тарифы
                </button>
              </nav>
            )}
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="px-3.5 py-1.5 border border-slate-800 hover:border-red-500/30 bg-slate-900/40 hover:bg-red-500/10 text-slate-400 hover:text-red-400 text-xs font-medium rounded-xl transition-all duration-200 cursor-pointer"
              >
                Выйти
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ОСНОВНОЙ БЛОК */}
      <main className="flex-grow flex items-center justify-center relative z-10 w-full max-w-7xl mx-auto p-4 md:p-6">
        {isAuthenticated ? (
          <div className="w-full">
            {currentTab === 'studio' && <Dashboard />}
            {currentTab === 'history' && <History />}
            {currentTab === 'pricing' && <Pricing />}
          </div>
        ) : (
          /* ЛЕНДИНГ ДЛЯ НЕАВТОРИЗОВАННЫХ ПОЛЬЗОВАТЕЛЕЙ */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full py-8 md:py-16">
            {/* Левая сторона: Маркетинговый текст */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium">
                <Sparkles size={12} /> Мультиплатформенная генерация контента
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
                Создавайте контент с помощью <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">Искусственного Интеллекта</span> в один клик
              </h2>
              <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto lg:mx-0">
                Пишите идеальные посты для Telegram, экспертные лонгриды для VC.ru и вирусные треды для X (Twitter). Автоматизируйте рутину SMM прямо сейчас.
              </p>
              
              {/* Преимущества */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 max-w-xl mx-auto lg:mx-0 text-left">
                <div className="flex items-start gap-2.5">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-cyan-400"><Zap size={16} /></div>
                  <div><h4 className="text-xs font-bold uppercase tracking-wider">Быстро</h4><p className="text-xs text-slate-400">Генерация за 5 секунд через Celery</p></div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-indigo-400"><HistoryIcon size={16} /></div>
                  <div><h4 className="text-xs font-bold uppercase tracking-wider">История</h4><p className="text-xs text-slate-400">Все ваши посты всегда под рукой</p></div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-emerald-400"><Shield size={16} /></div>
                  <div><h4 className="text-xs font-bold uppercase tracking-wider">Безопасно</h4><p className="text-xs text-slate-400">Надежная интеграция Google Auth</p></div>
                </div>
              </div>
            </div>

            {/* Правая сторона: Форма авторизации */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <AuthForm onAuthSuccess={() => setIsAuthenticated(true)} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
