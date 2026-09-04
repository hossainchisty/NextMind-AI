"use client";

export default function BillingPage() {
  return (
    <div className="animate-fade-in">
      <h1 className="text-[22px] font-semibold text-text-primary mb-1">Billing and Plans</h1>
      <p className="text-[14px] text-text-secondary mb-8">Manage your subscription and payment methods.</p>

      <div className="space-y-6">
        <div className="bg-surface border border-border rounded-[12px] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[15px] font-semibold text-text-primary">Current Plan</h2>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-primary/10 text-primary">Free</span>
          </div>
          <p className="text-[13px] text-text-secondary mb-4">
            You are on the free plan. Add your own API keys to use AI features.
          </p>
          <button className="px-5 py-2.5 rounded-lg bg-btn text-btn-text text-[13px] font-medium hover:bg-btn-hover transition-colors">
            Upgrade Plan
          </button>
        </div>

        <div className="bg-surface border border-border rounded-[12px] p-6">
          <h2 className="text-[15px] font-semibold text-text-primary mb-4">Payment Method</h2>
          <p className="text-[13px] text-text-secondary">
            No payment method added. Add a plan to set up billing.
          </p>
        </div>

        <div className="bg-surface border border-border rounded-[12px] p-6">
          <h2 className="text-[15px] font-semibold text-text-primary mb-4">Billing History</h2>
          <p className="text-[13px] text-text-secondary">
            No billing history yet.
          </p>
        </div>
      </div>
    </div>
  );
}
