"use client";

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, X, AlertCircle, Info } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

const ICON_MAP: Record<ToastType, React.ReactNode> = {
  success: <Check size={18} strokeWidth={3} />,
  error: <X size={18} strokeWidth={3} />,
  info: <Info size={18} strokeWidth={2.5} />,
};

const STYLE_MAP: Record<ToastType, string> = {
  success: "bg-gray-900 text-white",
  error: "bg-red-600 text-white",
  info: "bg-gray-900 text-white",
};

const ICON_BG_MAP: Record<ToastType, string> = {
  success: "bg-green-500",
  error: "bg-white/20",
  info: "bg-white/20",
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    timerRef.current = setTimeout(() => onRemove(toast.id), 2800);
    return () => clearTimeout(timerRef.current);
  }, [toast.id, onRemove]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-lg ${STYLE_MAP[toast.type]}`}
    >
      <span className={`flex items-center justify-center w-6 h-6 rounded-full ${ICON_BG_MAP[toast.type]} shrink-0`}>
        {ICON_MAP[toast.type]}
      </span>
      <span className="text-sm font-semibold leading-snug">{toast.message}</span>
    </motion.div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: ToastType = "success") => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div className="fixed top-0 left-0 right-0 z-[9999] flex flex-col items-center pt-[env(safe-area-inset-top,0px)] pointer-events-none">
        <div className="pt-4 flex flex-col items-center gap-2 w-full max-w-sm px-4">
          <AnimatePresence mode="popLayout">
            {toasts.map((t) => (
              <ToastItem key={t.id} toast={t} onRemove={removeToast} />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </ToastContext.Provider>
  );
}
