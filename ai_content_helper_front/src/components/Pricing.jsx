import React, { useState, useEffect } from "react";
import API from "../api";
import {
  Check,
  Sparkles,
  Loader2,
  CreditCard,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Pricing() {
  const [cards, setCards] = useState([]); // Тарифы из БД
  const [currentPlanCode, setCurrentPlanCode] = useState("free");
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [fetchingPlans, setFetchingPlans] = useState(true);

  useEffect(() => {
    // 1. Загружаем текущие лимиты и код плана пользователя
    API.get("posts/user-limits/")
      .then((res) => {
        if (res.data.plan_code) setCurrentPlanCode(res.data.plan_code);
      })
      .catch((err) => console.error("Ошибка при загрузке лимитов:", err));

    // 2. Динамически загружаем тарифную сетку из базы данных
    API.get("plans/")
      .then((res) => {
        const sortedPlans = res.data.sort((a, b) => a.weight - b.weight);
        setCards(sortedPlans);
        setFetchingPlans(false);
      })
      .catch((err) => {
        console.error("Ошибка при загрузке тарифов из БД:", err);
        setFetchingPlans(false);
      });
  }, []);

  const handleBuyPlan = async (planCode) => {
    setLoadingPlan(planCode);
    try {
      const res = await API.post("posts/buy-premium/", { plan: planCode });
      if (res.data.success) {
        alert(res.data.message);
        window.location.reload(); // Перезапуск для синхронизации шапки
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Ошибка при изменении тарифного плана";
      alert(errorMessage);
    } finally {
      setLoadingPlan(null);
    }
  };

  const currentCard = cards.find((c) => c.code === currentPlanCode) || {
    weight: 0,
  };

  // Лоадер при первоначальной загрузке страниц
  if (fetchingPlans) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-slate-400 gap-4">
        <div className="relative flex items-center justify-center">
          <div className="absolute w-12 h-12 rounded-full border-2 border-cyan-500/20 animate-ping" />
          <Loader2
            className="animate-spin text-cyan-400 relative z-10"
            size={32}
          />
        </div>
        <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
          Загрузка тарифных планов...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-2 pb-16">
      {/* СЕКЦИЯ ЗАГОЛОВКА */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-3 mb-12"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
          <CreditCard size={12} /> Гибкое управление подпиской
        </div>
        <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-slate-200 to-slate-400">
          Выберите тарифный план
        </h2>
        <p className="text-slate-400 text-xs md:text-sm max-w-md mx-auto leading-relaxed">
          Переключайтесь между уровнями доступа в любой момент. Дневные лимиты
          обновляются мгновенно.
        </p>
      </motion.div>

      {/* СЕТКА ТАРИФНЫХ КАРТОЧЕК */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch w-full mx-auto">
        {cards.map((card) => {
          const isActive = currentPlanCode === card.code;
          const isDowngrade = card.weight < currentCard.weight;

          return (
            <motion.div
              key={card.code}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className={`backdrop-blur-xl border rounded-3xl p-6 flex flex-col justify-between relative transition-all duration-300 shadow-xl ${
                isActive
                  ? "border-cyan-500/60 shadow-lg shadow-cyan-500/5 bg-[#11192e]/90"
                  : card.is_popular
                    ? "border-indigo-500/40 bg-gradient-to-b from-[#161233]/70 to-[#0e1224]/90 shadow-indigo-500/5"
                    : "border-slate-800/80 bg-slate-900/40 hover:border-slate-700/80"
              }`}
            >
              {/* ХЕДЕР МЕТКИ: Популярно / Ваш Тариф */}
              {card.is_popular && !isActive && (
                <div className="absolute -top-3 right-6 inline-flex items-center gap-1 px-3 py-0.5 bg-gradient-to-r from-cyan-500 to-indigo-500 text-slate-950 font-black text-[9px] uppercase tracking-wider rounded-full shadow-md shadow-indigo-500/20">
                  <Sparkles size={10} className="fill-current" /> Популярно
                </div>
              )}
              {isActive && (
                <span className="absolute -top-3 left-6 px-3 py-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 font-black text-[9px] uppercase tracking-wider rounded-full shadow-md shadow-cyan-500/20">
                  <ShieldCheck size={10} className="inline mr-1" /> Активный
                  профиль
                </span>
              )}

              {/* ОСНОВНОЙ КОНТЕНТ КАРТОЧКИ */}
              <div>
                <div className="space-y-2 border-b border-slate-800/50 pb-4">
                  <h3
                    className={`text-base font-extrabold ${
                      card.code !== "free" && card.code !== "standard"
                        ? "text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400"
                        : "text-slate-100"
                    }`}
                  >
                    {card.title}
                  </h3>
                  <p className="text-slate-400 text-[11px] leading-snug min-h-[32px] text-left">
                    {card.subtitle}
                  </p>

                  {/* ЦЕНОВАЯ БЛОК-МАТРИЦА */}
                  <div className="text-2xl font-black text-slate-50 font-mono pt-2 flex items-baseline gap-1">
                    {card.price === 0
                      ? "0 ₽"
                      : `${card.price.toLocaleString("ru-RU")} ₽`}
                    <span className="text-[11px] font-medium text-slate-500 font-sans">
                      {card.period}
                    </span>
                  </div>
                </div>

                {/* СПИСОК ФИЧЕЙ С КРАСИВЫМИ ЧЕКБОКСАМИ */}
                <ul className="space-y-3 text-xs text-slate-300 pt-5 flex-grow">
                  {card.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 group">
                      <div className="p-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mt-0.5 flex-shrink-0 group-hover:bg-cyan-500/20 transition-colors">
                        <Check size={11} className="stroke-[3]" />
                      </div>
                      <span className="text-left leading-normal text-slate-300 group-hover:text-slate-100 transition-colors">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* УПРАВЛЯЮЩАЯ КНОПКА С ТРИГГЕРАМИ ИНТЕРАКТИВНОСТИ */}
              <div className="mt-8">
                <button
                  onClick={() => !isActive && handleBuyPlan(card.code)}
                  disabled={isActive || loadingPlan !== null}
                  className={`w-full py-3 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 shadow-sm ${
                    isActive
                      ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 cursor-default"
                      : isDowngrade
                        ? "bg-slate-800/80 hover:bg-slate-700 text-slate-200 active:scale-[0.98] border border-slate-700/50 cursor-pointer"
                        : "bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-slate-950 font-black active:scale-[0.98] cursor-pointer shadow-lg shadow-cyan-500/5"
                  }`}
                >
                  {loadingPlan === card.code ? (
                    <Loader2 className="animate-spin" size={14} />
                  ) : isActive ? (
                    "Подключен"
                  ) : isDowngrade ? (
                    "Перейти (Даунгрейд)"
                  ) : (
                    <>
                      <Zap size={12} className="fill-current" /> Активировать
                      тариф
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
