import React from "react";

export default function SkeletonLoader() {
  return (
    <div className="w-full space-y-4 animate-pulse p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-800/60">
      {/* Имитация заголовка */}
      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-1/3" />

      {/* Строки текста */}
      <div className="space-y-2.5">
        <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded-md w-full" />
        <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded-md w-5/6" />
        <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded-md w-11/12" />
        <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded-md w-4/5" />
      </div>

      {/* Нижняя декоративная плашка (теги или метаданные) */}
      <div className="flex gap-2 pt-2">
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-full w-16" />
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-full w-20" />
      </div>
    </div>
  );
}
