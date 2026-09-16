export const PLATFORM_OPTIONS = [
  { value: "tg", label: "Telegram (Информативный стиль + Эмодзи)" },
  { value: "vc", label: "VC.ru (Экспертная глубокая статья)" },
  { value: "tw", label: "X / Twitter (Краткая емкая мысль)" },
];

export const TONE_OPTIONS = [
  { value: "neutral", label: "Нейтральный / Естественный" },
  { value: "friendly", label: "Дружелюбный и разговорный" },
  { value: "business", label: "Строгий и деловой" },
  { value: "funny", label: "Юмористический / Ироничный" },
];

export const LENGTH_OPTIONS = [
  { id: "short", label: "Ёмкий", desc: "~100 слов" },
  { id: "medium", label: "Средний", desc: "~250 слов" },
  { id: "long", label: "Лонгрид", desc: "~500 слов" },
];

export const PLATFORM_DETAILS = {
  tg: {
    label: "Telegram",
    color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  },
  vc: {
    label: "VC.ru",
    color: "bg-slate-800/40 text-slate-300 border-slate-700",
  },
  tw: {
    label: "Twitter / X",
    color: "bg-violet-500/10 text-purple-400 border-violet-500/20",
  },
};
