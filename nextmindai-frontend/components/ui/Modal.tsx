"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}

export default function Modal({ open, onClose, title, children, className = "" }: Props) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-start justify-center z-50 p-4 pt-12 overflow-y-auto animate-fade-in" onClick={onClose}>
      <div
        className={`bg-surface border border-border rounded-2xl w-full max-w-[440px] shadow-xl overflow-hidden animate-fade-in ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <>
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
              <h2 className="text-[16px] font-semibold text-text-primary">{title}</h2>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-bg border border-border flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-primary/20 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="h-px bg-border" />
          </>
        )}
        {children}
      </div>
    </div>
  );
}
