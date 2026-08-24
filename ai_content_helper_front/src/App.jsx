import React, { useState, useEffect } from 'react';
import AuthForm from './components/AuthForm';
import Dashboard from './components/Dashboard';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Проверяем наличие токена при инициализации приложения [упомянуто официально]
    const token = localStorage.getItem('access_token');
    if (token) setIsAuthenticated(true);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    setIsAuthenticated(false);
  };

  return (
    <div className="bg-slate-900 text-slate-100 font-sans min-h-screen flex flex-col">
      <header className="w-full max-w-6xl mx-auto px-6 py-6 flex justify-between items-center border-b border-slate-800">
        <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
          AI-Content SaaS Studio 🚀
        </h1>
        {isAuthenticated && (
          <button onClick={handleLogout} className="px-4 py-2 border border-red-500/30 hover:bg-red-500/10 text-red-400 text-sm font-medium rounded-xl transition">
            Выйти
          </button>
        )}
      </header>

      <main className="flex-grow flex items-center justify-center p-6">
        {isAuthenticated ? <Dashboard /> : <AuthForm onAuthSuccess={() => setIsAuthenticated(true)} />}
      </main>
    </div>
  );
}
