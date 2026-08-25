import React, { useState, useEffect } from 'react';
import AuthForm from './components/AuthForm';
import Dashboard from './components/Dashboard';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) setIsAuthenticated(true);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    setIsAuthenticated(false);
  };

  return (
    <div className="bg-[#0b0f19] min-h-screen flex flex-col relative overflow-x-hidden antialiased selection:bg-cyan-500/30">
      {/* Декоративный свет сверху */}
      <div className="app-bg-glow"></div>
      
      {/* МАСШТАБИРУЕМЫЙ HEADER */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-[#0b0f19]/75 border-b border-slate-800/80">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 h-16 flex justify-between items-center">
          
          {/* Логотип и будущие табы навигации */}
          <div className="flex items-center gap-6 md:gap-10">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center shadow-md shadow-cyan-500/10">
                <span className="text-white font-bold text-xs">AI</span>
              </div>
              <h1 className="text-md font-semibold tracking-tight text-slate-200">
                SaaS <span className="text-cyan-400 font-medium">Studio</span>
              </h1>
            </div>
            
            {/* Сюда в будущем ты добавишь новые ссылки (например: История, Настройки, Аналитика) */}
            {isAuthenticated && (
              <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-400">
                <span className="px-3 py-1.5 bg-slate-800/50 text-slate-200 rounded-lg cursor-pointer">Студия</span>
                <span className="px-3 py-1.5 hover:text-slate-200 rounded-lg cursor-not-allowed opacity-40">История</span>
                <span className="px-3 py-1.5 hover:text-slate-200 rounded-lg cursor-not-allowed opacity-40">Тарифы</span>
              </nav>
            )}
          </div>
          
          {/* Блок пользователя и Кнопка Выйти */}
          {isAuthenticated && (
            <div className="flex items-center gap-4">
              <button 
                onClick={handleLogout} 
                className="px-3.5 py-1.5 border border-slate-800 hover:border-red-500/30 bg-slate-900/40 hover:bg-red-500/10 text-slate-400 hover:text-red-400 text-xs font-medium rounded-xl transition-all duration-200 cursor-pointer"
              >
                Выйти
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ОСНОВНОЙ КОНТЕНТНЫЙ БЛОК НА ВСЮ СТРАНИЦУ */}
      <main className="flex-grow flex items-center justify-center relative z-10 w-full max-w-7xl mx-auto p-4 md:p-6">
        {isAuthenticated ? <Dashboard /> : <AuthForm onAuthSuccess={() => setIsAuthenticated(true)} />}
      </main>
    </div>
  );
}
