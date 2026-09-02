import React, { useEffect, useState } from "react";

export default function StableGoogleButton({ clientId, onSuccess }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let checkInterval;

    const renderBtn = () => {
      if (typeof google !== "undefined" && google.accounts?.id) {
        clearInterval(checkInterval);

        try {
          google.accounts.id.initialize({
            client_id: clientId,
            callback: onSuccess,
          });

          const container = document.getElementById("stableGoogleBtn");
          if (container) {
            google.accounts.id.renderButton(container, {
              theme: "outline",
              size: "large",
              width: 400, // Максимально допустимая ширина в Google SDK (число)
              text: "signin_with",
              shape: "pill",
            });
            // Сигнализируем, что iframe от Google успешно встроен в DOM
            setTimeout(() => setIsReady(true), 100);
          }
        } catch (err) {
          console.error("Ошибка Google Auth:", err);
        }
      }
    };

    checkInterval = setInterval(renderBtn, 100);
    return () => clearInterval(checkInterval);
  }, [clientId, onSuccess]);

  return (
    <div className="w-full flex justify-center items-center min-h-[44px] relative">
      {/* Благородный лоадер, пока Google собирает свой iframe */}
      {!isReady && (
        <div className="absolute inset-0 max-w-[400px] w-full h-[44px] flex items-center justify-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full animate-pulse z-20">
          <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mr-2" />
          <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
            Загрузка Google Auth...
          </span>
        </div>
      )}

      {/* Контейнер кнопки (с зафиксированной шириной 400px по спецификации Google) */}
      <div
        id="stableGoogleBtn"
        className={`w-full max-w-[400px] flex justify-center transition-opacity duration-300 ${
          isReady ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />
    </div>
  );
}
