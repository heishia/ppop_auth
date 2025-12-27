"use client";

import { motion, AnimatePresence } from "motion/react";
import React, { useState, useRef, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";

interface FloatingInputProps {
  label: string;
  placeholder?: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  onEnter?: () => void;
  autoFocus?: boolean;
  maxLength?: number;
  disabled?: boolean;
}

export const FloatingInput: React.FC<FloatingInputProps> = ({
  label,
  placeholder,
  type = "text",
  value,
  onChange,
  onEnter,
  autoFocus = false,
  maxLength,
  disabled = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [autoFocus]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && onEnter) {
      onEnter();
    }
  };

  const isActive = isFocused || value.length > 0;
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="relative w-full">
      <div
        className={`relative border-2 rounded-2xl transition-all duration-200 ${
          isFocused
            ? "border-blue-500 bg-white shadow-sm"
            : value.length > 0
              ? "border-gray-200 bg-gray-50"
              : "border-gray-100 bg-gray-50"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {/* Floating Label */}
        <AnimatePresence>
          {isActive && (
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.15 }}
              className={`absolute left-5 top-3 text-xs font-semibold ${
                isFocused ? "text-blue-600" : "text-gray-400"
              }`}
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>

        {/* Input */}
        <input
          ref={inputRef}
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          maxLength={maxLength}
          disabled={disabled}
          placeholder={isActive ? placeholder : label}
          className={`w-full bg-transparent outline-none text-lg font-semibold px-5 ${
            isActive ? "pt-8 pb-4" : "py-5"
          } text-gray-800 placeholder:text-gray-300 transition-all duration-200 ${
            isPassword ? "pr-14" : ""
          } ${disabled ? "cursor-not-allowed" : ""}`}
        />

        {/* Password Toggle */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? <Eye size={22} /> : <EyeOff size={22} />}
          </button>
        )}
      </div>
    </div>
  );
};
