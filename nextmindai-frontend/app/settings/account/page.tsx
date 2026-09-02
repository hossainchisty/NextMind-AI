"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";

interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
}

export default function AccountPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    api<{ data: UserProfile }>("auth/me/").then((res) => {
      setUser(res.data);
      setName(res.data.name || "");
    }).catch(() => {});
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      await api("auth/me/", { method: "PATCH", json: { name } });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch {}
    setSaving(false);
  }

  return (
    <div className="animate-fade-in">
      <h1 className="text-[22px] font-semibold text-text-primary mb-1">Profile</h1>
      <p className="text-[14px] text-text-secondary mb-8">Manage your personal information.</p>

      <div className="bg-surface border border-border rounded-[12px] p-6 space-y-5">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-[24px] font-semibold text-primary">
            {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "?"}
          </div>
          <div>
            <p className="text-[15px] font-medium text-text-primary">{user?.name || "No name set"}</p>
            <p className="text-[13px] text-text-secondary">{user?.email}</p>
          </div>
        </div>

        <div>
          <label className="block text-[13px] font-medium text-text-primary mb-1.5">Display Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full max-w-[320px] px-4 py-2.5 rounded-lg bg-bg border border-border text-[13px] text-text-primary focus:outline-none focus:border-primary/40 transition-colors"
            placeholder="Your name"
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 rounded-lg bg-primary text-white text-[13px] font-medium disabled:opacity-50 hover:bg-primary/90 transition-colors"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          {success && <span className="text-[13px] text-accent-green">Saved!</span>}
        </div>
      </div>
    </div>
  );
}
