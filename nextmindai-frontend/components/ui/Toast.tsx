"use client";

import { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from "react";

interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "info";
  action?: { label: string; onClick: () => void };
}

interface ToastContextType {
  toast: (message: string, type?: Toast["type"]) => void;
  confirm: (message: string, onConfirm: () => void, opts?: { confirmLabel?: string; type?: "danger" | "default" }) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [pendingConfirm, setPendingConfirm] = useState<{
    message: string;
    onConfirm: () => void;
    confirmLabel?: string;
    type?: "danger" | "default";
  } | null>(null);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((message: string, type: Toast["type"] = "info") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => remove(id), 3000);
  }, [remove]);

  const confirm = useCallback((message: string, onConfirm: () => void, opts?: { confirmLabel?: string; type?: "danger" | "default" }) => {
    setPendingConfirm({ message, onConfirm, confirmLabel: opts?.confirmLabel, type: opts?.type });
  }, []);

  function handleConfirm() {
    if (pendingConfirm) {
      pendingConfirm.onConfirm();
      setPendingConfirm(null);
    }
  }

  return (
    <ToastContext.Provider value={{ toast, confirm }}>
      {children}
      {toasts.length > 0 && (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`px-4 py-2.5 rounded-lg text-[13px] font-medium shadow-lg animate-slide-up ${
                t.type === "success" ? "bg-accent-green text-white" :
                t.type === "error" ? "bg-red-500 dark:bg-red-600 text-white" :
                "bg-surface border border-border text-text-primary"
              }`}
            >
              {t.message}
            </div>
          ))}
        </div>
      )}
      {pendingConfirm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/30" onClick={() => setPendingConfirm(null)}>
          <div className="w-[320px] bg-surface border border-border rounded-xl p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <p className="text-[14px] text-text-primary mb-5">{pendingConfirm.message}</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setPendingConfirm(null)} className="px-3.5 py-2 rounded-lg text-[13px] text-text-secondary hover:bg-bg transition-colors">
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className={`px-3.5 py-2 rounded-lg text-[13px] font-medium text-white transition-colors ${
                  pendingConfirm.type === "danger" ? "bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700" : "bg-primary hover:bg-primary-light"
                }`}
              >
                {pendingConfirm.confirmLabel || "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}
