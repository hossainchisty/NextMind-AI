"use client";

import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export default function Card({ children, className = "", hover = false, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      className={`bg-surface border border-border rounded-xl p-4 ${
        hover ? "hover:border-primary/20 hover:shadow-[0_4px_20px_rgba(13,43,35,0.06)] cursor-pointer transition-all" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
