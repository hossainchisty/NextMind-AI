"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { BrainNodeIcon } from "@/components/ui/Icons";

function CallbackInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { oauthLogin } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const access = params.get("access");
    const refresh = params.get("refresh");
    if (!access || !refresh) {
      setError("Sign-in failed. Please try again.");
      return;
    }
    oauthLogin(access, refresh)
      .then(() => router.replace("/chat"))
      .catch(() => setError("Sign-in failed. Please try again."));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <>
        <h1 className="text-[18px] font-semibold text-text-primary mb-2">Something went wrong</h1>
        <p className="text-[14px] text-text-secondary mb-6">{error}</p>
        <button
          onClick={() => router.push("/login")}
          className="h-10 px-5 rounded-[10px] bg-btn text-btn-text text-[13px] font-medium hover:bg-btn-hover transition-colors"
        >
          Back to sign in
        </button>
      </>
    );
  }

  return (
    <>
      <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
      <p className="text-[14px] text-text-secondary">Signing you in...</p>
    </>
  );
}

export default function OAuthCallbackPage() {
  return (
    <div className="flex h-screen bg-bg items-center justify-center px-6">
      <div className="text-center">
        <div className="w-12 h-12 rounded-xl bg-btn text-btn-text flex items-center justify-center mx-auto mb-5">
          <BrainNodeIcon className="w-6 h-6" />
        </div>
        <Suspense>
          <CallbackInner />
        </Suspense>
      </div>
    </div>
  );
}
