"use client";

import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import Workflow from "@/components/landing/Workflow";
import Security from "@/components/landing/Security";
import CtaBanner from "@/components/landing/CtaBanner";
import MegaFooter from "@/components/landing/MegaFooter";

export default function LandingPage() {
  return (
    <div className="h-screen overflow-y-auto overscroll-none bg-[#060F0C] antialiased scroll-smooth">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Workflow />
        <Security />
        <CtaBanner />
      </main>
      <MegaFooter />
    </div>
  );
}
