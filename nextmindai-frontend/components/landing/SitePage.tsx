"use client";

import type { ReactNode } from "react";
import Navbar from "@/components/landing/Navbar";
import MegaFooter from "@/components/landing/MegaFooter";

export default function SitePage({ children }: { children: ReactNode }) {
  return (
    <div className="h-screen overflow-y-auto bg-[#F2FFEE] antialiased scroll-smooth">
      <Navbar />
      <main>{children}</main>
      <MegaFooter />
    </div>
  );
}
