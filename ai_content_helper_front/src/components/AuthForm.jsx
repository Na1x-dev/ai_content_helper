import React, { useState } from "react";
import API from "../api";
import StableGoogleButton from "./StableGoogleButton";
import { motion, AnimatePresence } from "framer-motion";
import { LogIn, UserPlus, Key, User, Mail, ArrowRight } from "lucide-react";

export default function AuthForm({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    password2: "",
  });
  const [error, setError] = useState("");
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
        setError("Ошибка Google авторизации: сервер не вернул токен.");
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
      if (err.response && err.response.data) {
        const serverData = err.response.data;
        setError(
          isLogin
            ? "Неверный логин или пароль."
            : serverData.username
              ? "Пользователь существует."
              : "Проверьте данные.",
        );
      } else {
        setError("Не удалось связаться с сервером.");
      }
    }
  };

  return (
    <motion.div
      layout
      className="w-full max-w-md mx-auto z-10"
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="bg-[#090d22]/50 backdrop-blur-2xl border border-slate-800/40 shadow-2xl rounded-[32px] p-6 md:p-8 relative">
        {/* ХЕДЕР КАРТОЧКИ */}
        <div className="mb-6 text-center">
          <motion.h2
            layout="position"
            className="text-xl font-black tracking-tight mb-1 text-slate-100 flex items-center justify-center gap-2"
          >
            {isLogin ? (
              <LogIn size={18} className="text-cyan-400" />
            ) : (
              <UserPlus size={18} className="text-indigo-400" />
            )}
            {isLogin ? "Авторизация" : "Регистрация"}
          </motion.h2>
          <p className="text-xs text-slate-500">
            Добро пожаловать в ИИ-студию генерации контента
          </p>
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-3 bg-red-500/5 border border-red-500/20 text-red-400 rounded-xl text-xs font-semibold text-left"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* GOOGLE BUTTON */}
        <motion.div layout="position">
          <StableGoogleButton
            clientId={clientId}
            onSuccess={handleGoogleLoginSuccess}
          />
        </motion.div>

        <motion.div
          layout="position"
          className="relative flex py-2 items-center my-4"
        >
          <div className="flex-grow border-t border-slate-800/30"></div>
          <span className="flex-shrink mx-4 text-slate-600 text-[10px] uppercase font-bold tracking-widest">
            или
          </span>
          <div className="flex-grow border-t border-slate-800/30"></div>
        </motion.div>

        {/* ИНПУТЫ БЕЗ ЯРКИХ СВЕТЛЫХ БОРДЕРОВ */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <motion.div layout="position" className="relative">
            <User
              className="absolute left-4 top-3.5 text-slate-500"
              size={16}
            />
            <input
              type="text"
              placeholder="Имя пользователя"
              className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-950/40 border border-slate-800/30 focus:border-cyan-500/50 text-sm focus:outline-none focus:ring-4 focus:ring-cyan-500/5 transition-all text-slate-200"
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
                transition={{ duration: 0.2 }}
                className="relative overflow-hidden"
              >
                <Mail
                  className="absolute left-4 top-3.5 text-slate-500"
                  size={16}
                />
                <input
                  type="email"
                  placeholder="Электронная почта"
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-950/40 border border-slate-800/30 focus:border-cyan-500/50 text-sm focus:outline-none focus:ring-4 focus:ring-cyan-500/5 transition-all text-slate-200 mb-1"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div layout="position" className="relative">
            <Key className="absolute left-4 top-3.5 text-slate-500" size={16} />
            <input
              type="password"
              placeholder="Пароль"
              className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-950/40 border border-slate-800/30 focus:border-cyan-500/50 text-sm focus:outline-none focus:ring-4 focus:ring-cyan-500/5 transition-all text-slate-200"
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
                transition={{ duration: 0.2 }}
                className="relative overflow-hidden"
              >
                <Key
                  className="absolute left-4 top-3.5 text-slate-500"
                  size={16}
                />
                <input
                  type="password"
                  placeholder="Повторите пароль"
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-950/40 border border-slate-800/30 focus:border-cyan-500/50 text-sm focus:outline-none focus:ring-4 focus:ring-cyan-500/5 transition-all text-slate-200 mt-1"
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
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black py-3.5 rounded-xl transition duration-300 text-sm shadow-lg shadow-cyan-500/10 cursor-pointer flex items-center justify-center gap-2"
          >
            <span>{isLogin ? "Войти в кабинет" : "Создать аккаунт"}</span>
            <ArrowRight size={14} />
          </motion.button>
        </form>

        <motion.div
          layout="position"
          className="mt-5 text-center text-xs text-slate-500"
        >
          {isLogin ? "Нет аккаунта? " : "Уже зарегистрированы? "}
          <button
            onClick={() => {
              setError("");
              setIsLogin(!isLogin);
            }}
            className="text-cyan-400 hover:text-cyan-300 font-bold ml-1 transition underline decoration-cyan-500/30 underline-offset-4"
          >
            {isLogin ? "Зарегистрироваться" : "Войти"}
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
