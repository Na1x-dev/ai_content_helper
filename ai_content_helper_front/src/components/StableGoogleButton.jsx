import React, { useEffect, useState } from "react";

export default function StableGoogleButton({ clientId, onSuccess }) {
  const [isSdkLoaded, setIsSdkLoaded] = useState(false);

  useEffect(() => {
    let checkInterval;

    const initGoogleAuth = () => {
      if (typeof google !== "undefined" && google.accounts?.id) {
        clearInterval(checkInterval);

        try {
          google.accounts.id.initialize({
            client_id: clientId,
            callback: (response) => {
              if (response && response.credential) {
                // Передаем бэкенду ожидаемый id_token
                onSuccess({ credential: response.credential });
              }
            },
            auto_select: false,
          });

          setIsSdkLoaded(true);
        } catch (err) {
          console.error("Ошибка инициализации Google Identity SDK:", err);
        }
      }
    };

    checkInterval = setInterval(initGoogleAuth, 100);
    return () => clearInterval(checkInterval);
  }, [clientId, onSuccess]);

  const handleLoginClick = () => {
    if (!isSdkLoaded) return;

    try {
      // СОЗДАЕМ НЕВИДИМЫЙ КОНТЕЙНЕР
      let hiddenContainer = document.getElementById(
        "hiddenGoogleRenderContainer",
      );
      if (!hiddenContainer) {
        hiddenContainer = document.createElement("div");
        hiddenContainer.id = "hiddenGoogleRenderContainer";
        hiddenContainer.style.display = "none";
        document.body.appendChild(hiddenContainer);
      }

      // ПРИНУДИТЕЛЬНО РЕНДЕРИМ СТАНДАРТНУЮ КНОПКУ GOOGLE ВНУТРИ НЕВИДИМОГО БЛОКА
      google.accounts.id.renderButton(hiddenContainer, {
        type: "standard",
        ux_mode: "popup", // Принудительный вызов центрального окна
      });

      // ИМИТИРУЕМ КЛИК ПО ВНУТРЕННЕМУ ЭЛЕМЕНТУ GOOGLE КНОПКИ
      // Это заставляет SDK мгновенно выкинуть центральный Pop-up, минуя One Tap логику
      const googleClickableElement =
        hiddenContainer.querySelector('[role="button"]');
      if (googleClickableElement) {
        googleClickableElement.click();
      } else {
        // Фоллбек, если селектор изменился
        google.accounts.id.prompt();
      }
    } catch (e) {
      console.error("Не удалось вызвать окно авторизации:", e);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      <button
        type="button"
        onClick={handleLoginClick}
        disabled={!isSdkLoaded}
        className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-900 font-semibold py-3 px-4 rounded-xl border border-slate-200 transition-all duration-200 text-sm shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
      >
        <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
          <path
            fill="#EA4335"
            d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582l3.51-3.51C17.642 1.054 14.982 0 12 0 7.354 0 3.307 2.67 1.242 6.554l4.024 3.211z"
          />
          <path
            fill="#4285F4"
            d="M23.605 12.3c0-.828-.074-1.625-.213-2.3H12v4.343h6.505a5.556 5.556 0 0 1-2.414 3.648l3.77 2.923c2.205-2.03 3.744-5.02 3.744-8.614z"
          />
          <path
            fill="#FBBC05"
            d="M5.266 14.235L1.242 17.446A11.947 11.947 0 0 0 12 24c2.937 0 5.645-1.012 7.645-2.733l-3.77-2.923a7.147 7.147 0 0 1-3.875 1.084 7.079 7.079 0 0 1-6.734-4.854z"
          />
          <path
            fill="#34A853"
            d="M5.266 9.765a7.03 7.03 0 0 1 0 4.47l-4.024 3.211a11.934 11.934 0 0 1 0-10.892l4.024 3.211z"
          />
        </svg>
        <span>Войти через Google</span>
      </button>
    </div>
  );
}
