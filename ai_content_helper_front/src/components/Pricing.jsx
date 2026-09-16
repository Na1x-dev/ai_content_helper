import { useState, useEffect } from "react";
import API from "../api";
import {
  Check,
  Sparkles,
  Loader2,
  CreditCard,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";

export default function Pricing() {
  const [cards, setCards] = useState([]);
  const [currentPlanCode, setCurrentPlanCode] = useState("free");
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [fetchingPlans, setFetchingPlans] = useState(true);

  useEffect(() => {
    let isCurrent = true;

    Promise.all([API.get("posts/user-limits/"), API.get("plans/")])
      .then(([limitsResponse, plansResponse]) => {
        if (!isCurrent) return;
        if (limitsResponse.data.plan_code) {
          setCurrentPlanCode(limitsResponse.data.plan_code);
        }
        setCards([...plansResponse.data].sort((a, b) => a.weight - b.weight));
        setFetchingPlans(false);
      })
      .catch((err) => {
        if (!isCurrent) return;
        console.error("Ошибка при загрузке тарифов:", err);
        setFetchingPlans(false);
      });

    return () => {
      isCurrent = false;
    };
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

  if (fetchingPlans) {
    return (
      <div className="page-state-panel pricing-loading">
        <div className="generation-loader-orbit">
          <span className="generation-loader-ring generation-loader-ring-one" />
          <span className="generation-loader-ring generation-loader-ring-two" />
          <span className="generation-loader-core">
            <Loader2 size={22} />
          </span>
        </div>
        <p className="page-state-label">Загрузка тарифных планов...</p>
      </div>
    );
  }

  return (
    <div className="pricing-page">
      {/* СЕКЦИЯ ЗАГОЛОВКА */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="pricing-heading"
      >
        <div className="pricing-kicker">
          <CreditCard size={12} /> Гибкое управление подпиской
        </div>
        <h2 className="page-title pricing-title">Выберите тарифный план</h2>
        <p className="page-subtitle pricing-subtitle">
          Переключайтесь между уровнями доступа в любой момент. Дневные лимиты
          обновляются мгновенно.
        </p>
      </motion.div>

      {/* СЕТКА ТАРИФНЫХ КАРТОЧЕК */}
      <div className="pricing-grid">
        {cards.map((card) => {
          const isActive = currentPlanCode === card.code;
          const isDowngrade = card.weight < currentCard.weight;

          return (
            <motion.div
              key={card.code}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className={`pricing-card ${
                isActive
                  ? "pricing-card-active"
                  : card.is_popular
                    ? "pricing-card-popular"
                    : "pricing-card-muted"
              }`}
            >
              {/* ХЕДЕР МЕТКИ: Популярно / Ваш Тариф */}
              {card.is_popular && !isActive && (
                <div className="absolute -top-3 right-6 inline-flex items-center gap-1 px-3 py-0.5 bg-linear-to-r from-cyan-500 to-indigo-500 text-slate-950 font-black text-[9px] uppercase tracking-wider rounded-full shadow-md shadow-indigo-500/20">
                  <Sparkles size={10} className="fill-current" /> Популярно
                </div>
              )}
              {isActive && (
                <span className="absolute -top-3 left-6 px-3 py-0.5 bg-linear-to-r from-cyan-500 to-blue-500 text-slate-950 font-black text-[9px] uppercase tracking-wider rounded-full shadow-md shadow-cyan-500/20">
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
                        ? "text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-indigo-400"
                        : "text-slate-100"
                    }`}
                  >
                    {card.title}
                  </h3>
                  <p className="text-slate-400 text-[11px] leading-snug min-h-8 text-left">
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
                <ul className="space-y-3 text-xs text-slate-300 pt-5 grow">
                  {card.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 group">
                      <div className="p-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mt-0.5 shrink-0 group-hover:bg-cyan-500/20 transition-colors">
                        <Check size={11} className="stroke-3" />
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
                        : "bg-linear-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-slate-950 font-black active:scale-[0.98] cursor-pointer shadow-lg shadow-cyan-500/5"
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
