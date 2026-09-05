"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, apiDownload } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/ui/Toast";

export default function AdvancedPage() {
  const router = useRouter();
  const { logout } = useAuth();
  const { toast, confirm } = useToast();
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleExport() {
    setExporting(true);
    try {
      await apiDownload("auth/me/export/", "nextmind-export.json");
      toast("Export downloaded", "success");
    } catch {
      toast("Failed to export data", "error");
    } finally {
      setExporting(false);
    }
  }

  function handleDelete() {
    confirm(
      "Permanently delete your account and all data? This cannot be undone.",
      async () => {
        setDeleting(true);
        try {
          await api("auth/me/", { method: "DELETE" });
          logout();
          router.push("/");
          toast("Account deletion started", "success");
        } catch {
          toast("Failed to delete account", "error");
        } finally {
          setDeleting(false);
        }
      },
      { confirmLabel: "Delete everything", type: "danger" }
    );
  }

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
          <button
            onClick={handleExport}
            disabled={exporting}
            className="px-5 py-2.5 rounded-lg border border-border text-[13px] font-medium text-text-primary hover:bg-bg transition-colors disabled:opacity-50"
          >
            {exporting ? "Exporting..." : "Export Data"}
          </button>
        </div>

        <div className="bg-surface border border-red-500/20 rounded-[12px] p-6">
          <h2 className="text-[15px] font-semibold text-red-500 mb-4">Danger Zone</h2>
          <p className="text-[13px] text-text-secondary mb-4">
            Permanently delete your account and all data. This action cannot be undone.
          </p>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-5 py-2.5 rounded-lg bg-red-500 text-white text-[13px] font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            {deleting ? "Deleting..." : "Delete Account"}
          </button>
        </div>
      </div>
    </div>
  );
}
