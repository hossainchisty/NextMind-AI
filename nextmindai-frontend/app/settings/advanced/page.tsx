"use client";

export default function AdvancedPage() {
  return (
    <div className="animate-fade-in">
      <h1 className="text-[22px] font-semibold text-text-primary mb-1">Advanced</h1>
      <p className="text-[14px] text-text-secondary mb-8">Data export and advanced settings.</p>

      <div className="space-y-6">
        <div className="bg-surface border border-border rounded-[12px] p-6">
          <h2 className="text-[15px] font-semibold text-text-primary mb-4">Data Export</h2>
          <p className="text-[13px] text-text-secondary mb-4">
            Export all your data including conversations, documents, and settings.
          </p>
          <button className="px-5 py-2.5 rounded-lg border border-border text-[13px] font-medium text-text-primary hover:bg-bg transition-colors">
            Export Data
          </button>
        </div>

        <div className="bg-surface border border-red-500/20 rounded-[12px] p-6">
          <h2 className="text-[15px] font-semibold text-red-500 mb-4">Danger Zone</h2>
          <p className="text-[13px] text-text-secondary mb-4">
            Permanently delete your account and all data. This action cannot be undone.
          </p>
          <button className="px-5 py-2.5 rounded-lg bg-red-500 text-white text-[13px] font-medium hover:bg-red-600 transition-colors">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}
