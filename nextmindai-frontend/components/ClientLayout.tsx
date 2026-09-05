"use client";

import { AuthProvider, useAuth } from "@/lib/auth";
import { ToastProvider } from "@/components/ui/Toast";
import { ThemeProvider } from "@/lib/theme";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const publicPaths = ["/", "/login", "/register", "/about", "/leadership", "/blog", "/contact", "/privacy", "/terms", "/gdpr", "/changelog", "/security"];
  const isPublic = publicPaths.includes(pathname) || pathname.startsWith("/blog/");

  useEffect(() => {
    if (!loading && !user && !isPublic) {
      router.push("/login");
    }
  }, [user, loading, isPublic, router]);

  if (loading) {
    return (
      <div className="flex h-screen bg-bg items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user && !isPublic) return null;

  return <>{children}</>;
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <AuthGate>{children}</AuthGate>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
