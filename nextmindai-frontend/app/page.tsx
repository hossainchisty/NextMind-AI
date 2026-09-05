"use client";

import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import Workflow from "@/components/landing/Workflow";
import CtaBanner from "@/components/landing/CtaBanner";
import MegaFooter from "@/components/landing/MegaFooter";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#060F0C] antialiased">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Workflow />
        <CtaBanner />
      </main>
      <MegaFooter />
    </div>
  );
}
