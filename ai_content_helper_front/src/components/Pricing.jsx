import React, { useState, useEffect } from "react";
import API from "../api";
import { Check, Sparkles, Loader2 } from "lucide-react";

export default function Pricing() {
  const [cards, setCards] = useState([]); // Тарифы из БД
  const [currentPlanCode, setCurrentPlanCode] = useState("free");
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [fetchingPlans, setFetchingPlans] = useState(true);

  useEffect(() => {
    // 1. Загружаем текущие лимиты и код плана пользователя для подсветки
    API.get("posts/user-limits/")
      .then((res) => {
        if (res.data.plan_code) setCurrentPlanCode(res.data.plan_code);
      })
      .catch((err) => console.error("Ошибка при загрузке лимитов:", err));

    // 2. Динамически загружаем тарифную сетку из базы данных
    API.get("plans/")
      .then((res) => {
        // Сортируем по весу на всякий случай, хотя бэкенд возвращает упорядоченно
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

  if (fetchingPlans) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
        <Loader2 className="animate-spin text-cyan-500" size={32} />
        <p className="text-sm">Загрузка тарифных планов...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto animate-fade-in space-y-8 py-4 px-2">
      <div className="text-center space-y-2">
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-200">
          Выберите тарифный план
        </h2>
        <p className="text-slate-400 text-sm max-w-md mx-auto">
          Вы можете свободно переключаться между тарифами в любой момент в
          зависимости от ваших задач.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch w-full mx-auto">
        {cards.map((card) => {
          const isActive = currentPlanCode === card.code;
          const isDowngrade = card.weight < currentCard.weight;

          return (
            <div
              key={card.code}
              className={`backdrop-blur-xl border rounded-3xl p-6 flex flex-col justify-between relative transition-all duration-300 ${
                isActive
                  ? "border-cyan-500/50 shadow-lg shadow-cyan-500/5 bg-slate-900/80"
                  : card.is_popular
                    ? "border-indigo-500/30 bg-gradient-to-b from-indigo-950/20 to-slate-900/50 hover:border-indigo-500/50"
                    : "border-slate-800 bg-slate-900/40 hover:border-slate-700"
              }`}
            >
              {card.is_popular && (
                <div className="absolute -top-3 right-6 inline-flex items-center gap-1 px-3 py-0.5 bg-gradient-to-r from-cyan-500 to-indigo-500 text-white font-bold text-[10px] uppercase tracking-wider rounded-full shadow-sm">
                  <Sparkles size={9} /> Популярно
                </div>
              )}

              {isActive && (
                <span className="absolute -top-3 left-6 px-3 py-0.5 bg-cyan-500 text-slate-950 font-bold text-[10px] uppercase tracking-wider rounded-full">
                  Ваш тариф
                </span>
              )}

              <div>
                <div className="space-y-4 flex-grow flex flex-col justify-between">
                  <h3
                    className={`text-base font-bold text-slate-200 ${card.code !== "free" && card.code !== "standard" ? "text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400" : ""}`}
                  >
                    {card.title}
                  </h3>
                  <p className="text-slate-500 text-[11px] mt-0.5 leading-tight min-h-[32px]">
                    {card.subtitle}
                  </p>
                </div>

                <div className="text-xl font-black text-slate-100 my-2">
                  {card.price === 0
                    ? "0 ₽"
                    : `${card.price.toLocaleString("ru-RU")} ₽`}
                  <span className="text-xs font-medium text-slate-500">
                    {" "}
                    {card.period}
                  </span>
                </div>

                <ul className="space-y-2 text-xs text-slate-300 pt-4 border-t border-slate-800/60 flex-grow">
                  {card.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check
                        size={14}
                        className="text-cyan-400 mt-0.5 flex-shrink-0"
                      />
                      <span className="text-left leading-normal">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => !isActive && handleBuyPlan(card.code)}
                  disabled={isActive || loadingPlan !== null}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                    isActive
                      ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 cursor-default"
                      : isDowngrade
                        ? "bg-slate-800 hover:bg-slate-700 text-slate-200 active:scale-[0.98]"
                        : "bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-slate-950 active:scale-[0.98]"
                  }`}
                >
                  {loadingPlan === card.code ? (
                    <Loader2 className="animate-spin" size={14} />
                  ) : isActive ? (
                    "Активен"
                  ) : isDowngrade ? (
                    "Перейти (Даунгрейд)"
                  ) : (
                    "Подключить тариф"
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
