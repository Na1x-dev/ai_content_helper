import React, { useState, useEffect } from 'react';
import API from '../api';
import { Check, Sparkles, Loader2 } from 'lucide-react';

export default function Pricing() {
  const [currentPlan, setCurrentPlan] = useState('free');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    API.get('posts/user-limits/')
      .then(res => {
        if (res.data.plan === 'Премиум') setCurrentPlan('premium');
      })
      .catch(err => console.error(err));
  }, []);

  const handleBuyPremium = async () => {
    setLoading(true);
    try {
      const res = await API.post('posts/buy-premium/');
      if (res.data.success) {
        alert(res.data.message);
        window.location.reload(); // Перезагружаем для обновления лимитов в шапке
      }
    } catch (err) {
      alert('Ошибка при обработке платежа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in space-y-8 py-4">
      <div className="text-center space-y-2">
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Выберите свой тарифный план</h2>
        <p className="text-slate-400 text-sm max-w-md mx-auto">Увеличьте количество ежедневных генераций и получите доступ к мощным ИИ-моделям</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch max-w-2xl mx-auto">
        {/* FREE PLAN */}
        <div className={`bg-slate-900/50 backdrop-blur-xl border rounded-3xl p-6 flex flex-col justify-between relative transition ${currentPlan === 'free' ? 'border-cyan-500/40 shadow-lg shadow-cyan-500/5' : 'border-slate-800'}`}>
          {currentPlan === 'free' && (
            <span className="absolute -top-3 left-6 px-3 py-0.5 bg-cyan-500 text-slate-950 font-bold text-[10px] uppercase tracking-wider rounded-full">Ваш текущий тариф</span>
          )}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold">Базовый</h3>
              <p className="text-slate-500 text-xs">Для личного тестирования</p>
            </div>
            <div className="text-2xl font-black">0 ₽ <span className="text-xs font-medium text-slate-500">/ навсегда</span></div>
            <ul className="space-y-2.5 text-xs text-slate-300 pt-2">
              <li className="flex items-center gap-2"><Check size={14} className="text-cyan-400" /> 3 генерации в сутки</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-cyan-400" /> Поддержка Telegram, VC.ru, X</li>
            </ul>
          </div>
          <button disabled className="w-full mt-6 py-2.5 rounded-xl border border-slate-800 text-xs font-semibold text-slate-500 bg-slate-950/40">
            {currentPlan === 'free' ? 'Активен' : 'Бесплатно'}
          </button>
        </div>

        {/* PREMIUM PLAN */}
        <div className={`bg-gradient-to-b from-indigo-950/30 to-slate-900/50 backdrop-blur-xl border rounded-3xl p-6 flex flex-col justify-between relative transition ${currentPlan === 'premium' ? 'border-cyan-500/40 shadow-lg shadow-cyan-500/5' : 'border-slate-800 hover:border-slate-700'}`}>
          <div className="absolute -top-3 right-6 inline-flex items-center gap-1 px-3 py-0.5 bg-gradient-to-r from-cyan-500 to-indigo-500 text-white font-bold text-[10px] uppercase tracking-wider rounded-full shadow-sm"><Sparkles size={9} /> Популярно</div>
          {currentPlan === 'premium' && (
            <span className="absolute -top-3 left-6 px-3 py-0.5 bg-cyan-500 text-slate-950 font-bold text-[10px] uppercase tracking-wider rounded-full">Ваш текущий тариф</span>
          )}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">Премиум PRO</h3>
              <p className="text-slate-500 text-xs">Для профессиональных блогеров</p>
            </div>
            <div className="text-2xl font-black">490 ₽ <span className="text-xs font-medium text-slate-500">/ месяц</span></div>
            <ul className="space-y-2.5 text-xs text-slate-300 pt-2">
              <li className="flex items-center gap-2"><Check size={14} className="text-cyan-400" /> 100 генераций в сутки</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-cyan-400" /> Приоритетная очередь Celery</li>
              <li className="flex items-center gap-2"><Check size={14} className="text-cyan-400" /> Улучшенное качество и стилистика</li>
            </ul>
          </div>
          <button 
            onClick={handleBuyPremium}
            disabled={currentPlan === 'premium' || loading}
            className="w-full mt-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-slate-950 font-bold text-xs transition active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-white flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={14} /> : currentPlan === 'premium' ? 'Активен' : 'Оформить подписку'}
          </button>
        </div>
      </div>
    </div>
  );
}
