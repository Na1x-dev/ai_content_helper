import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import AuthForm from "./AuthForm";
import API from "../api";

// Обнуляем localStorage перед каждым тестом
beforeEach(() => {
  localStorage.clear();
});

// Перехватываем запросы к нашему axios-клиенту API, чтобы не ходить в реальный интернет
vi.mock("../api", () => ({
  default: {
    post: vi.fn(),
  },
}));

describe("Компонент AuthForm", () => {
  test("Успешный вход пользователя (Login) заполняет localStorage", async () => {
    // 1. ARRANGE (Подготовка)
    // Настраиваем фейковый успешный ответ от бэкенда
    API.post.mockResolvedValue({
      data: {
        access: "fake-jwt-token",
        user: { username: "na1x_user" },
      },
    });

    const mockOnAuthSuccess = vi.fn();

    // Рендерим форму в виртуальный браузер теста
    render(<AuthForm onAuthSuccess={mockOnAuthSuccess} />);

    // Находим инпуты и кнопку на экране
    const usernameInput = screen.getByPlaceholderText("Имя пользователя");
    const passwordInput = screen.getByPlaceholderText("Пароль");
    const loginButton = screen.getByRole("button", {
      name: /Войти в кабинет/i,
    });

    // 2. ACT (Действие — имитируем человека)
    fireEvent.change(usernameInput, { target: { value: "na1x_user" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(loginButton);

    // 3. ASSERT (Проверка результатов)
    // Проверяем, что фронтенд дернул правильный url с правильными данными
    expect(API.post).toHaveBeenCalledWith("auth/login/", {
      username: "na1x_user",
      password: "password123",
    });

    // Ждем выполнения асинхронных операций и проверяем изменения в браузере
    await waitFor(() => {
      expect(localStorage.getItem("access_token")).toBe("fake-jwt-token");
      expect(localStorage.getItem("username")).toBe("na1x_user");
      expect(mockOnAuthSuccess).toHaveBeenCalledWith("na1x_user");
    });
  });

  test("Показывает ошибку, если бэкенд вернул статус 400", async () => {
    // 1. ARRANGE
    // Имитируем ошибку 400 Bad Request от сервера
    API.post.mockRejectedValue({
      response: {
        status: 400,
        data: { detail: "Неверные учетные данные" },
      },
    });

    render(<AuthForm onAuthSuccess={vi.fn()} />);

    // Обязательно заполняем инпуты, чтобы пройти HTML-валидацию required
    const usernameInput = screen.getByPlaceholderText("Имя пользователя");
    const passwordInput = screen.getByPlaceholderText("Пароль");
    const loginButton = screen.getByRole("button", {
      name: /Войти в кабинет/i,
    });

    // 2. ACT
    fireEvent.change(usernameInput, { target: { value: "wrong_user" } });
    fireEvent.change(passwordInput, { target: { value: "wrong_password" } });
    fireEvent.click(loginButton);

    // 3. ASSERT
    // Теперь, когда форма заполнена и isLogin = true, код гарантированно
    // зайдет в ветку setError("Неверный логин или пароль.")
    await waitFor(() => {
      const errorAlert = screen.getByText("Неверный логин или пароль.");
      expect(errorAlert).toBeInTheDocument();
    });
  });
});
