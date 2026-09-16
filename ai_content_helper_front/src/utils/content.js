import { PLATFORM_DETAILS } from "../constants/contentOptions";

export function getPlatformDetails(platform) {
  return (
    PLATFORM_DETAILS[platform] || {
      label: platform,
      color: "bg-transparent text-slate-400 border-slate-800",
    }
  );
}

export function cleanPrompt(prompt = "") {
  return prompt
    .replace(/\s*\[Тональность:.*?\]/, "")
    .replace(/\s*\[Объём:.*?\]/, "");
}

export function formatPostDate(value) {
  return new Date(value).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
