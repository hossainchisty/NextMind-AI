"use client";

export default function CreditsPage() {
  return (
    <div className="animate-fade-in">
      <h1 className="text-[22px] font-semibold text-text-primary mb-1">Credits</h1>
      <p className="text-[14px] text-text-secondary mb-8">View your credit balance and usage.</p>

      <div className="space-y-6">
        <div className="bg-surface border border-border rounded-[12px] p-6">
          <h2 className="text-[15px] font-semibold text-text-primary mb-4">Credit Balance</h2>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-[36px] font-bold text-text-primary">0</span>
            <span className="text-[14px] text-text-secondary">credits</span>
          </div>
          <p className="text-[13px] text-text-secondary">
            Credits are used when you use NextMind-provided models. Add your own API keys to avoid using credits.
          </p>
        </div>

        <div className="bg-surface border border-border rounded-[12px] p-6">
          <h2 className="text-[15px] font-semibold text-text-primary mb-4">Usage History</h2>
          <p className="text-[13px] text-text-secondary">
            No usage yet. Start a conversation to see your credit usage.
          </p>
        </div>
      </div>
    </div>
  );
}
