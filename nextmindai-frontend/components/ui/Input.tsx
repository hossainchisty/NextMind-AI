"use client";

import { forwardRef, type InputHTMLAttributes } from "react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, Props>(
  ({ label, hint, error, className = "", ...props }, ref) => {
    return (
      <div>
        {label && (
          <label className="block text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full px-4 py-3 rounded-xl bg-bg border text-[13px] font-mono text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:ring-2 transition-all ${
            error
              ? "border-red-300 focus:border-red-400 focus:ring-red-100"
              : "border-border focus:border-primary/40 focus:ring-primary/10"
          } ${className}`}
          {...props}
        />
        {hint && !error && (
          <p className="text-[11px] text-text-secondary mt-2">{hint}</p>
        )}
        {error && (
          <p className="text-[11px] text-red-500 mt-2">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
