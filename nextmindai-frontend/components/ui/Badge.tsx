"use client";

import type { ReactNode } from "react";

type Variant = "default" | "success" | "warning" | "error" | "primary";

interface Props {
  children: ReactNode;
  variant?: Variant;
  dot?: boolean;
  className?: string;
}

const variantStyles: Record<Variant, string> = {
  default: "bg-bg text-text-secondary",
  success: "bg-accent-green/10 text-accent-green",
  warning: "bg-amber-500/10 text-amber-600",
  error: "bg-red-500/10 text-red-500",
  primary: "bg-primary/10 text-primary",
};

export default function Badge({ children, variant = "default", dot = false, className = "" }: Props) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold ${variantStyles[variant]} ${className}`}>
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}
