"use client";

export default function OrganizationPage() {
  return (
    <div className="animate-fade-in">
      <h1 className="text-[22px] font-semibold text-text-primary mb-1">Organization Settings</h1>
      <p className="text-[14px] text-text-secondary mb-8">Manage your organization's settings and preferences.</p>

      <div className="space-y-6">
        <div className="bg-surface border border-border rounded-[12px] p-6">
          <h2 className="text-[15px] font-semibold text-text-primary mb-4">Organization Info</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-[13px] font-medium text-text-primary mb-1.5">Organization Name</label>
              <input
                type="text"
                defaultValue="My Organization"
                className="w-full max-w-[320px] px-4 py-2.5 rounded-lg bg-bg border border-border text-[13px] text-text-primary focus:outline-none focus:border-primary/40 transition-colors"
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-text-primary mb-1.5">Website</label>
              <input
                type="url"
                placeholder="https://example.com"
                className="w-full max-w-[320px] px-4 py-2.5 rounded-lg bg-bg border border-border text-[13px] text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-primary/40 transition-colors"
              />
            </div>
          </div>
          <button className="mt-4 px-5 py-2.5 rounded-lg bg-primary text-white text-[13px] font-medium hover:bg-primary/90 transition-colors">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
