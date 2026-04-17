"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useToast, Toast as ToastItem, ToastType } from "@/lib/useToast";
import { X } from "lucide-react";

const COLORS: Record<ToastType, string> = {
  success: "bg-green-700 text-white",
  error: "bg-red-700 text-white",
  info: "bg-blue-700 text-white",
  warning: "bg-amber-600 text-white",
};

interface ToastItemProps {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}

function ToastCard({ toast, onDismiss }: ToastItemProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.25 }}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium max-w-sm w-full ${COLORS[toast.type]}`}
    >
      <span className="flex-1">{toast.message}</span>
      <button
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 opacity-80 hover:opacity-100 transition-opacity"
        aria-label="Dismiss"
      >
        <X size={16} />
      </button>
    </motion.div>
  );
}

export function ToastProvider() {
  const { toasts, dismissToast } = useToast();

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 sm:left-auto sm:right-4 sm:translate-x-0 z-[200] flex flex-col gap-2 items-center sm:items-end">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onDismiss={dismissToast} />
        ))}
      </AnimatePresence>
    </div>
  );
}
