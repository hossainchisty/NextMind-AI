"use client";

import { useTheme } from "@/lib/theme";
import { Sun, Moon, Monitor } from "lucide-react";

const options = [
  { value: "light" as const, label: "Light", icon: Sun, description: "Light appearance" },
  { value: "dark" as const, label: "Dark", icon: Moon, description: "Dark appearance" },
  { value: "system" as const, label: "System", icon: Monitor, description: "Match your device" },
];

export default function PreferencesPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="animate-fade-in">
      <h1 className="text-[22px] font-semibold text-text-primary mb-1">Preferences</h1>
      <p className="text-[14px] text-text-secondary mb-8">Customize your experience.</p>

      <div className="space-y-6">
        <div className="bg-surface border border-border rounded-[12px] p-6">
          <h2 className="text-[15px] font-semibold text-text-primary mb-4">Appearance</h2>
          <div className="flex items-center gap-3">
            {options.map(({ value, label, icon: Icon, description }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                title={description}
                className={`flex items-center gap-3 px-5 py-3.5 rounded-xl border transition-all duration-200 ${
                  theme === value
                    ? "bg-primary/10 border-primary/30 text-primary shadow-sm"
                    : "bg-bg border-border text-text-secondary hover:border-primary/15 hover:text-text-primary"
                }`}
              >
                <Icon className="w-[18px] h-[18px]" strokeWidth={1.8} />
                <span className="text-[13px] font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-surface border border-border rounded-[12px] p-6">
          <h2 className="text-[15px] font-semibold text-text-primary mb-4">Language</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-medium text-text-primary">Interface Language</p>
              <p className="text-[12px] text-text-secondary">Choose your preferred language</p>
            </div>
            <select className="px-3 py-2 rounded-lg bg-bg border border-border text-[13px] text-text-primary focus:outline-none focus:border-primary/40">
              <option>English</option>
              <option>Bangla</option>
              <option>Español</option>
              <option>Français</option>
            </select>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-[12px] p-6">
          <h2 className="text-[15px] font-semibold text-text-primary mb-4">Notifications</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13px] font-medium text-text-primary">Email Notifications</p>
                <p className="text-[12px] text-text-secondary">Receive email updates about your account</p>
              </div>
              <button className="w-10 h-6 rounded-full bg-primary/20 relative transition-colors">
                <div className="w-4 h-4 rounded-full bg-primary absolute top-1 left-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
