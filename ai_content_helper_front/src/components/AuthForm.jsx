import React, { useState, useEffect } from "react";
import API from "../api";

export default function AuthForm({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    password2: "",
  });
  const [error, setError] = useState("");
  const [googleStatus, setGoogleStatus] = useState(
    "Инициализация Google Auth...",
  );

  // Извлекаем клиентский ID напрямую из окружения Vite
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    let checkInterval;
    // console.log(clientId);
    const initGoogleAuth = () => {
      if (
        typeof google !== "undefined" &&
        google.accounts &&
        google.accounts.id
      ) {
        if (checkInterval) clearInterval(checkInterval);

        if (!clientId) {
          setGoogleStatus("Ошибка: Проверьте GOOGLE_CLIENT_ID в файле .env");
          return;
        }

        try {
          google.accounts.id.initialize({
            client_id: clientId,
            callback: handleGoogleLoginSuccess,
          });

          const btnContainer = document.getElementById("googleBtn");
          if (btnContainer) {
            google.accounts.id.renderButton(btnContainer, {
              theme: "outline",
              size: "large",
              width: btnContainer.offsetWidth || 340,
              text: "signin_with",
              shape: "rectangular",
            });
          }
          setGoogleStatus(""); // Успешно отрендерено, убираем лог загрузки
        } catch (err) {
          console.error("Ошибка при рендере кнопки Google:", err);
          setGoogleStatus("Не удалось отобразить кнопку Google");
        }
      }
    };

    // Проверяем доступность объекта google каждые 300мс
    checkInterval = setInterval(initGoogleAuth, 300);

    return () => {
      if (checkInterval) clearInterval(checkInterval);
    };
  }, [isLogin, clientId]);

  const handleGoogleLoginSuccess = async (googleResponse) => {
    setError("");
    try {
      const response = await API.post("auth/google/", {
        access_token: googleResponse.credential,
      });

      if (response.data && response.data.access) {
        localStorage.setItem("access_token", response.data.access);
        let googleUsername = "Пользователь Google";

        if (response.data.user && response.data.user.username) {
          googleUsername = response.data.user.username;
        } else if (response.data.username) {
          googleUsername = response.data.username;
        }

        localStorage.setItem("username", googleUsername);
        onAuthSuccess();
      } else {
        setError("Ошибка Google авторизации: сервер не вернул JWT-токен.");
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Не удалось авторизоваться через Google-аккаунт.",
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const endpoint = isLogin ? "auth/login/" : "auth/registration/";
    const payload = isLogin
      ? { username: formData.username, password: formData.password }
      : {
          username: formData.username,
          email: formData.email,
          password1: formData.password,
          password2: formData.password2,
        };

    try {
      const response = await API.post(endpoint, payload);
      if (response.data && response.data.access) {
        localStorage.setItem("access_token", response.data.access);
        if (response.data.user && response.data.user.username) {
          localStorage.setItem("username", response.data.user.username);
          onAuthSuccess(response.data.user.username);
        } else {
          onAuthSuccess(formData.username);
        }
      } else {
        setError("Ошибка авторизации: сервер не вернул токен доступа.");
      }
    } catch (err) {
      if (err.response && err.response.data) {
        const serverData = err.response.data;

        // Если это словарь с ошибками валидации полей (ошибки 400)
        if (typeof serverData === "object" && !serverData.error) {
          // 1. Обработка ошибок ВХОДА (Неверный логин/пароль)
          if (isLogin) {
            setError("Неверный логин или пароль.");
            return;
          }

          // 2. Обработка ошибок РЕГИСТРАЦИИ (Берем только ПЕРВУЮ ошибку для аккуратности)
          // Определяем приоритет показа: сначала имя, потом почта, потом пароли
          const fieldsOrder = [
            "username",
            "email",
            "password1",
            "password",
            "password2",
            "non_field_errors",
          ];
          let activeKey = Object.keys(serverData)[0];

          for (const key of fieldsOrder) {
            if (serverData[key]) {
              activeKey = key;
              break;
            }
          }

          const rawError = Array.isArray(serverData[activeKey])
            ? serverData[activeKey][0]
            : serverData[activeKey];

          // Справочник красивых «человеческих» переходов
          if (activeKey === "username") {
            setError("Пользователь с таким именем уже существует.");
          } else if (activeKey === "email") {
            setError("Этот Email уже зарегистрирован в системе.");
          } else if (activeKey === "password1" || activeKey === "password") {
            // Переводим стандартные технические придирки Django к паролям
            if (
              rawError.includes("too short") ||
              rawError.includes("короткий")
            ) {
              setError("Пароль слишком короткий (минимум 8 символов).");
            } else if (
              rawError.includes("numeric") ||
              rawError.includes("цифр")
            ) {
              setError("Пароль не должен состоять только из цифр.");
            } else if (
              rawError.includes("common") ||
              rawError.includes("распространен")
            ) {
              setError("Этот пароль слишком простой. Придумайте другой.");
            } else {
              setError("Введенные пароли не совпадают.");
            }
          } else if (activeKey === "password2") {
            setError("Пароли не совпадают.");
          } else {
            setError(rawError || "Проверьте корректность заполнения формы.");
          }
        } else {
          // Если бэкенд передал кастомную ошибку одной строкой
          setError(
            serverData.error || "Произошла ошибка при обработке запроса.",
          );
        }
      } else {
        setError(
          "Не удалось связаться с сервером. Проверьте интернет-соединение.",
        );
      }
    }
  };

  return (
    <div className="w-full max-w-md mx-4 animate-fade-in z-10">
      <div className="card-bg backdrop-blur-xl border shadow-xl rounded-3xl p-8 md:p-10 transition-colors duration-200">
        <div className="mb-6 text-center">
          <h2 className="text-xl font-bold tracking-tight mb-1.5 dark:text-white text-slate-900">
            {isLogin ? "Войти в личный кабинет" : "Регистрация в SaaS"}
          </h2>
          <p className="text-xs dark:text-slate-400 text-slate-500">
            Добро пожаловать в ИИ-студию генерации контента
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 rounded-2xl text-xs font-medium">
            {error}
          </div>
        )}

        {/* СЕКЦИЯ КНОПКИ GOOGLE */}
        <div className="mb-5 w-full flex flex-col items-center justify-center min-h-[44px]">
          {googleStatus && (
            <p className="text-[11px] text-slate-400 dark:text-slate-500 animate-pulse font-mono">
              {googleStatus}
            </p>
          )}
          <div id="googleBtn" className="w-full"></div>
        </div>

        <div className="relative flex py-2 items-center my-4">
          <div className="flex-grow border-t dark:border-slate-800 border-slate-200"></div>
          <span className="flex-shrink mx-4 dark:text-slate-500 text-slate-400 text-[11px] uppercase font-bold tracking-wider">
            или
          </span>
          <div className="flex-grow border-t dark:border-slate-800 border-slate-200"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Имя пользователя"
              className="w-full px-4 py-3 rounded-xl input-bg border text-sm focus:outline-none focus:border-cyan-500/80 focus:ring-4 focus:ring-cyan-500/10 transition-all"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              required
            />
          </div>

          {!isLogin && (
            <div>
              <input
                type="email"
                placeholder="Электронная почта"
                className="w-full px-4 py-3 rounded-xl input-bg border text-sm focus:outline-none focus:border-cyan-500/80 focus:ring-4 focus:ring-cyan-500/10 transition-all"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>
          )}

          <div>
            <input
              type="password"
              placeholder="Пароль"
              className="w-full px-4 py-3 rounded-xl input-bg border text-sm focus:outline-none focus:border-cyan-500/80 focus:ring-4 focus:ring-cyan-500/10 transition-all"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
            />
          </div>

          {!isLogin && (
            <div>
              <input
                type="password"
                placeholder="Повторите пароль"
                className="w-full px-4 py-3 rounded-xl input-bg border text-sm focus:outline-none focus:border-cyan-500/80 focus:ring-4 focus:ring-cyan-500/10 transition-all"
                value={formData.password2}
                onChange={(e) =>
                  setFormData({ ...formData, password2: e.target.value })
                }
                required
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-slate-900 dark:bg-cyan-600 hover:bg-slate-800 dark:hover:bg-cyan-500 text-white font-medium py-3 rounded-xl transition duration-200 text-sm shadow-sm cursor-pointer"
          >
            {isLogin ? "Авторизоваться" : "Создать аккаунт"}
          </button>
        </form>

        <div className="mt-6 text-center text-xs dark:text-slate-500 text-slate-400">
          {isLogin ? "Нет аккаунта? " : "Уже зарегистрированы? "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-cyan-600 dark:text-cyan-400 hover:underline font-semibold ml-1 transition"
          >
            {isLogin ? "Зарегистрироваться" : "Войти"}
          </button>
        </div>
      </div>
    </div>
  );
}
