import React, { useState } from "react";
import API from "../api";
import StableGoogleButton from "./StableGoogleButton";
import { motion, AnimatePresence } from "framer-motion";

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

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const handleGoogleLoginSuccess = async (googleResponse) => {
    setError("");
    try {
      const response = await API.post("auth/google/", {
        access_token: googleResponse.credential,
      });
      if (response.data && response.data.access) {
        localStorage.setItem("access_token", response.data.access);
        let googleUsername =
          response.data.user?.username ||
          response.data.username ||
          "Пользователь Google";
        localStorage.setItem("username", googleUsername);
        onAuthSuccess(googleUsername);
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
        const user = response.data.user?.username || formData.username;
        localStorage.setItem("username", user);
        onAuthSuccess(user);
      } else {
        setError("Ошибка авторизации: сервер не вернул токен доступа.");
      }
    } catch (err) {
      // Ваша текущая аккуратная обработка ошибок (сжато для краткости)
      if (err.response && err.response.data) {
        const serverData = err.response.data;
        if (typeof serverData === "object" && !serverData.error) {
          if (isLogin) {
            setError("Неверный логин или пароль.");
          } else {
            setError(
              serverData.username
                ? "Пользователь существует."
                : "Проверьте корректность заполнения.",
            );
          }
        } else {
          setError(serverData.error || "Произошла ошибка.");
        }
      } else {
        setError("Не удалось связаться с сервером.");
      }
    }
  };

  return (
    // motion.div с атрибутом layout заставит карточку плавно менять высоту
    <motion.div
      layout
      className="w-full max-w-md mx-4 z-10"
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="card-bg backdrop-blur-xl border shadow-xl rounded-3xl p-8 md:p-10 transition-colors duration-200">
        {/* Заголовок */}
        <div className="mb-6 text-center">
          <motion.h2
            layout="position"
            className="text-xl font-bold tracking-tight mb-1.5 dark:text-white text-slate-900"
          >
            {isLogin ? "Войти в личный кабинет" : "Регистрация в SaaS"}
          </motion.h2>
          <p className="text-xs dark:text-slate-400 text-slate-500">
            Добро пожаловать в ИИ-студию генерации контента
          </p>
        </div>

        {/* Ошибки */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-5 p-3.5 bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 rounded-2xl text-xs font-medium"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* КНОПКА GOOGLE: вынесена из условий, теперь она статична и никогда не перерисовывается */}
        <motion.div layout="position">
          <StableGoogleButton
            clientId={clientId}
            onSuccess={handleGoogleLoginSuccess}
          />
        </motion.div>

        {/* Разделитель */}
        <motion.div
          layout="position"
          className="relative flex py-2 items-center my-4"
        >
          <div className="flex-grow border-t dark:border-slate-800 border-slate-200"></div>
          <span className="flex-shrink mx-4 dark:text-slate-500 text-slate-400 text-[11px] uppercase font-bold tracking-wider">
            или
          </span>
          <div className="flex-grow border-t dark:border-slate-800 border-slate-200"></div>
        </motion.div>

        {/* Форма с анимированными полями */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <motion.div layout="position">
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
          </motion.div>

          <AnimatePresence mode="popLayout">
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0, scale: 0.95 }}
                animate={{ opacity: 1, height: "auto", scale: 1 }}
                exit={{ opacity: 0, height: 0, scale: 0.95 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <input
                  type="email"
                  placeholder="Электронная почта"
                  className="w-full px-4 py-3 rounded-xl input-bg border text-sm focus:outline-none focus:border-cyan-500/80 focus:ring-4 focus:ring-cyan-500/10 transition-all mb-4"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div layout="position">
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
          </motion.div>

          <AnimatePresence mode="popLayout">
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0, scale: 0.95 }}
                animate={{ opacity: 1, height: "auto", scale: 1 }}
                exit={{ opacity: 0, height: 0, scale: 0.95 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <input
                  type="password"
                  placeholder="Повторите пароль"
                  className="w-full px-4 py-3 rounded-xl input-bg border text-sm focus:outline-none focus:border-cyan-500/80 focus:ring-4 focus:ring-cyan-500/10 transition-all mt-4"
                  value={formData.password2}
                  onChange={(e) =>
                    setFormData({ ...formData, password2: e.target.value })
                  }
                  required
                />
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            layout="position"
            type="submit"
            className="w-full bg-slate-900 dark:bg-cyan-600 hover:bg-slate-800 dark:hover:bg-cyan-500 text-white font-medium py-3 rounded-xl transition duration-200 text-sm shadow-sm cursor-pointer"
          >
            {isLogin ? "Авторизоваться" : "Создать аккаунт"}
          </motion.button>
        </form>

        {/* Переключатель режима */}
        <motion.div
          layout="position"
          className="mt-6 text-center text-xs dark:text-slate-500 text-slate-400"
        >
          {isLogin ? "Нет аккаунта? " : "Уже зарегистрированы? "}
          <button
            onClick={() => {
              setError("");
              setIsLogin(!isLogin);
            }}
            className="text-cyan-600 dark:text-cyan-400 hover:underline font-semibold ml-1 transition"
          >
            {isLogin ? "Зарегистрироваться" : "Войти"}
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
