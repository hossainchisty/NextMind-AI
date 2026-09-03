"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/sidebar/Sidebar";
import { User, Settings, CreditCard, Wallet, KeyRound, Database } from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  user: User,
  settings: Settings,
  credit: CreditCard,
  wallet: Wallet,
  key: KeyRound,
  data: Database,
};

interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const sections: NavSection[] = [
  {
    title: "Account",
    items: [
      { label: "Profile", href: "/settings/account", icon: "user" },
      { label: "Preferences", href: "/settings/account/preferences", icon: "settings" },
      { label: "Billing and Plans", href: "/settings/account/billing", icon: "credit" },
      { label: "Credits", href: "/settings/account/credits", icon: "wallet" },
    ],
  },
  {
    title: "Provider",
    items: [
      { label: "Connected Providers", href: "/settings/providers", icon: "key", badge: "Active" },
    ],
  },
  {
    title: "Advanced",
    items: [
      { label: "Data & Export", href: "/settings/advanced", icon: "data" },
    ],
  },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-bg overflow-hidden">
      <Sidebar />
      <aside className="w-[240px] bg-surface border-r border-border flex flex-col shrink-0">
        <div className="px-4 py-5 border-b border-border">
          <Link
            href="/"
            className="flex items-center gap-2 text-[13px] text-text-secondary hover:text-text-primary transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Go Back to Chats
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {sections.map((section) => (
            <div key={section.title} className="mb-6">
              <h3 className="px-3 mb-2 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                {section.title}
              </h3>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = iconMap[item.icon] || User;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-colors ${
                        isActive
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-text-secondary hover:bg-bg hover:text-text-primary"
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-primary" : "text-text-secondary/60"}`} />
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary/10 text-primary">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-[800px] mx-auto px-8 py-10">
          {children}
        </div>
      </main>
    </div>
  );
}
