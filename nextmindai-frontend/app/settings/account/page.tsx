"use client";

import { useState, useEffect, useRef } from "react";
import { api } from "@/lib/api";

interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar: string;
  avatar_url: string | null;
}

export default function AccountPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [name, setName] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api<{ data: UserProfile }>("auth/me/").then((res) => {
      setUser(res.data);
      setName(res.data.name || "");
    }).catch(() => {});
  }, []);

  async function handleSaveName() {
    setSaving(true);
    try {
      await api("auth/me/", { method: "PATCH", json: { name } });
      setUser((prev) => prev ? { ...prev, name } : null);
      setEditingName(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch {}
    setSaving(false);
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me/`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setUser((prev) => prev ? { ...prev, avatar: data.data.avatar, avatar_url: data.data.avatar_url } : null);
      }
    } catch {}
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-[22px] font-semibold text-text-primary mb-1">Profile</h1>
        <p className="text-[14px] text-text-secondary">Manage your account settings</p>
      </div>

      <div className="space-y-6">
        {/* Avatar Section */}
        <div className="bg-surface border border-border rounded-2xl p-6">
          <h2 className="text-[13px] font-semibold text-text-secondary uppercase tracking-wider mb-4">Avatar</h2>
          <div className="flex items-center gap-6">
            <div className="relative group">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-[28px] font-bold text-primary overflow-hidden">
                {user?.avatar_url ? (
                  <img src={user.avatar_url} className="w-full h-full object-cover" alt="" />
                ) : (
                  user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "?"
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity disabled:opacity-50"
              >
                {uploading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/gif,image/webp"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>
            <div>
              <p className="text-[14px] font-medium text-text-primary mb-1">Profile Photo</p>
              <p className="text-[12px] text-text-secondary">Min 200x200px, PNG or JPEG formats.</p>
            </div>
          </div>
        </div>

        {/* Full Name */}
        <div className="bg-surface border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[13px] font-semibold text-text-secondary uppercase tracking-wider">Full Name</h2>
            {!editingName && (
              <button
                onClick={() => setEditingName(true)}
                className="text-[13px] font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Edit
              </button>
            )}
          </div>
          {editingName ? (
            <div className="space-y-3">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full max-w-[400px] px-4 py-3 rounded-xl bg-bg border border-border text-[14px] text-text-primary focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
                autoFocus
              />
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSaveName}
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-btn text-btn-text text-[13px] font-medium disabled:opacity-50 hover:bg-btn-hover transition-colors"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={() => { setEditingName(false); setName(user?.name || ""); }}
                  className="px-4 py-2.5 rounded-xl text-[13px] font-medium text-text-secondary hover:text-text-primary transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between max-w-[400px]">
              <p className="text-[15px] text-text-primary">{user?.name || "No name set"}</p>
            </div>
          )}
          {success && <p className="mt-3 text-[13px] text-accent-green">Name updated!</p>}
        </div>

        {/* Email */}
        <div className="bg-surface border border-border rounded-2xl p-6">
          <h2 className="text-[13px] font-semibold text-text-secondary uppercase tracking-wider mb-4">Email</h2>
          <p className="text-[15px] text-text-primary">{user?.email}</p>
        </div>

        {/* Password */}
        <div className="bg-surface border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-[13px] font-semibold text-text-secondary uppercase tracking-wider">Password</h2>
            <button className="text-[13px] font-medium text-primary hover:text-primary/80 transition-colors">
              Change Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
