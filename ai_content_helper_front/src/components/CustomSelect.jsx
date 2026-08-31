import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export default function CustomSelect({ label, value, onChange, options }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedOption = options.find((opt) => opt.value == value);

  // Закрытие при клике вне списка
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative space-y-1.5 w-full text-left" ref={dropdownRef}>
      {label && (
        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          {label}
        </label>
      )}

      {/* Кнопка селекта */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-800 bg-slate-950/40 text-sm text-slate-200 transition-all focus:outline-none focus:border-cyan-500/85 focus:ring-4 focus:ring-cyan-500/10 shadow-sm cursor-pointer"
      >
        <span>
          {selectedOption ? selectedOption.label : "Выберите значение..."}
        </span>
        <ChevronDown
          size={16}
          className={`text-slate-400 transition-transform duration-250 ${isOpen ? "rotate-180 text-cyan-400" : ""}`}
        />
      </button>

      {/* Выпадающее меню с плавной анимацией через Tailwind */}
      <div
        className={`absolute z-50 w-full mt-2 rounded-xl border border-slate-800/80 bg-[#0f1422] shadow-xl transition-all duration-200 origin-top ${
          isOpen
            ? "opacity-100 scale-100 pointer-events-auto transform translate-y-0"
            : "opacity-0 scale-95 pointer-events-none transform -translate-y-2"
        }`}
      >
        <div className="p-1.5 max-h-60 overflow-y-auto space-y-0.5">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-3.5 py-2.5 rounded-lg text-sm transition-colors cursor-pointer ${
                option.value === value
                  ? "bg-cyan-500/10 text-cyan-400 font-medium"
                  : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
