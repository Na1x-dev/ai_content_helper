import React, { useState } from 'react';
import API from '../api';

export default function AuthForm({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', email: '', password: '', password2: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const endpoint = isLogin ? 'auth/login/' : 'auth/registration/';
    const payload = isLogin 
      ? { username: formData.username, password: formData.password }
      : formData;

    try {
      const response = await API.post(endpoint, payload);
  
      // Проверяем, что бэкенд прислал ключ access
      if (response.data && response.data.access) {
        localStorage.setItem('access_token', response.data.access);
        onAuthSuccess();
      } else {
        console.error("Бэкенд не прислал access-токен. Ответ сервера:", response.data);
        setError("Ошибка сервера: не получен токен авторизации.");
      }
    } catch (err) {
  setError(err.response?.data?.error || 'Произошла ошибка. Проверьте данные.');
}

  };

  return (
    <div className="max-w-md w-full bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-xl">
      <h2 className="text-2xl font-bold mb-6 text-center text-white">
        {isLogin ? 'Войти в SaaS' : 'Регистрация'}
      </h2>
      
      {error && <div className="mb-4 p-3 bg-red-500/20 border border-red-500 text-red-400 rounded-lg text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Имя пользователя"
          className="w-full p-3 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
          value={formData.username}
          onChange={(e) => setFormData({...formData, username: e.target.value})}
          required
        />
        {!isLogin && (
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />
        )}
        <input
          type="password"
          placeholder="Пароль"
          className="w-full p-3 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          required
        />
        {!isLogin && (
          <input
            type="password"
            placeholder="Повторите пароль"
            className="w-full p-3 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
            value={formData.password2}
            onChange={(e) => setFormData({...formData, password2: e.target.value})}
            required
          />
        )}
        <button type="submit" className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold py-3 rounded-lg transition duration-200">
          {isLogin ? 'Войти' : 'Создать аккаунт'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-slate-400">
        {isLogin ? 'Нет аккаунта?' : 'Уже есть аккаунт?'} {' '}
        <button onClick={() => setIsLogin(!isLogin)} className="text-cyan-400 hover:underline font-medium">
          {isLogin ? 'Зарегистрироваться' : 'Войти'}
        </button>
      </div>
    </div>
  );
}
