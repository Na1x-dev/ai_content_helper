import { useCallback, useState } from "react";
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

  const handleGoogleLoginSuccess = useCallback(
    async (googleResponse) => {
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
    },
    [onAuthSuccess],
  );

  const handleSubmit = useCallback(
    async (e) => {
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
    },
    [formData, isLogin, onAuthSuccess],
  );

  const updateField = (field) => (event) => {
    setFormData((current) => ({ ...current, [field]: event.target.value }));
  };

  return (
    <motion.div
      layout
      className="auth-form-wrap"
      transition={{
        layout: { type: "spring", stiffness: 220, damping: 30, mass: 0.8 },
      }}
    >
      <motion.div
        layout
        transition={{
          layout: { type: "spring", stiffness: 220, damping: 30, mass: 0.8 },
        }}
        className="auth-card"
      >
        {/* ХЕДЕР КАРТОЧКИ */}
        <div className="auth-card-header">
          <motion.h2 className="auth-card-title">
            {isLogin ? (
              <LogIn size={18} className="text-cyan-400" />
            ) : (
              <UserPlus size={18} className="text-indigo-400" />
            )}
            {isLogin ? "Авторизация" : "Регистрация"}
          </motion.h2>
          <p className="auth-card-subtitle">
            Войдите, чтобы продолжить работу с идеями
          </p>
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="auth-error"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* GOOGLE BUTTON */}
        <motion.div className="auth-google-wrap">
          <StableGoogleButton
            clientId={clientId}
            onSuccess={handleGoogleLoginSuccess}
          />
        </motion.div>

        <motion.div className="auth-divider">
          <div />
          <span>или</span>
          <div />
        </motion.div>

        {/* ИНПУТЫ БЕЗ ЯРКИХ СВЕТЛЫХ БОРДЕРОВ */}
        <form onSubmit={handleSubmit} className="auth-fields space-y-4">
          <motion.div className="relative">
            <User
              className="absolute left-4 top-3.5 text-slate-500"
              size={16}
            />
            <input
              type="text"
              placeholder="Имя пользователя"
              className="auth-input"
              value={formData.username}
              onChange={updateField("username")}
              required
            />
          </motion.div>

          <AnimatePresence initial={false} mode="sync">
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="relative overflow-hidden"
              >
                <Mail
                  className="absolute left-4 top-3.5 text-slate-500"
                  size={16}
                />
                <input
                  type="email"
                  placeholder="Электронная почта"
                  className="auth-input mb-1"
                  value={formData.email}
                  onChange={updateField("email")}
                  required
                />
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div className="relative">
            <Key className="absolute left-4 top-3.5 text-slate-500" size={16} />
            <input
              type="password"
              placeholder="Пароль"
              className="auth-input"
              value={formData.password}
              onChange={updateField("password")}
              required
            />
          </motion.div>

          <AnimatePresence initial={false} mode="sync">
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="relative overflow-hidden"
              >
                <Key
                  className="absolute left-4 top-3.5 text-slate-500"
                  size={16}
                />
                <input
                  type="password"
                  placeholder="Повторите пароль"
                  className="auth-input mt-1"
                  value={formData.password2}
                  onChange={updateField("password2")}
                  required
                />
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button type="submit" className="auth-submit">
            <span>{isLogin ? "Войти в кабинет" : "Создать аккаунт"}</span>
            <ArrowRight size={14} />
          </motion.button>
        </form>

        <motion.div className="auth-switch">
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
      </motion.div>
    </motion.div>
  );
}
