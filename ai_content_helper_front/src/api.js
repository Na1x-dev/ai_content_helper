import axios from "axios";

const API = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    process.env.VITE_API_URL ||
    "http://localhost:8000/api/",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Перехватчик для автоматического добавления JWT токена в заголовки
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Добавлено: Перехватчик ошибок 401 (сессия истекла)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Токен авторизации истек. Выход из системы...");
      localStorage.removeItem("access_token");
      localStorage.removeItem("username");
      // Принудительно перезагружаем страницу для возврата на экран логина
      window.location.reload();
    }
    return Promise.reject(error);
  },
);

export default API;
