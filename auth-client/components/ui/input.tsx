"use client";

import { forwardRef, InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-[var(--foreground)]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full px-4 py-3 rounded-lg
            bg-[var(--card)] border border-[var(--border)]
            text-[var(--foreground)] placeholder:text-[var(--muted)]
            focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent
            transition-all duration-200
            ${error ? "border-[var(--error)] focus:ring-[var(--error)]" : ""}
            ${className}
          `}
          {...props}
        />
        {error && <p className="text-sm text-[var(--error)]">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

