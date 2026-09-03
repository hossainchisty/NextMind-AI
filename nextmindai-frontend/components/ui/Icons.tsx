"use client";

// Custom logo icons (not from lucide)
export function BrainIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a7 7 0 0 0-7 7c0 2.5 1.5 4.5 3 6 .5.5 1 1.2 1 2v3h6v-3c0-.8.5-1.5 1-2 1.5-1.5 3-3.5 3-6a7 7 0 0 0-7-7z" />
      <path d="M9 21h6" />
      <circle cx="12" cy="9" r="1.5" fill="currentColor" opacity="0.5" />
      <path d="M12 9v3" />
      <circle cx="9" cy="8" r="1" fill="currentColor" opacity="0.3" />
      <circle cx="15" cy="8" r="1" fill="currentColor" opacity="0.3" />
      <path d="M9 8L10.5 9.5" opacity="0.3" />
      <path d="M15 8L13.5 9.5" opacity="0.3" />
    </svg>
  );
}

export function BrainNodeIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.1" />
      <circle cx="6" cy="14" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.1" />
      <circle cx="18" cy="14" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.1" />
      <circle cx="12" cy="20" r="2" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.15" />
      <line x1="12" y1="8.5" x2="7.5" y2="12" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      <line x1="12" y1="8.5" x2="16.5" y2="12" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      <line x1="6" y1="16.5" x2="10.5" y2="19" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      <line x1="18" y1="16.5" x2="13.5" y2="19" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
    </svg>
  );
}

// Shared component
export function ProviderLogo({ logo_url, color, label, size = "md" }: { logo_url: string | null; color: string; label: string; size?: "sm" | "md" | "lg" }) {
  const s = size === "lg" ? "w-10 h-10" : size === "md" ? "w-8 h-8" : "w-6 h-6";
  const t = size === "lg" ? "text-[14px]" : size === "md" ? "text-[12px]" : "text-[10px]";
  if (logo_url) return <img src={logo_url} className={`${s} rounded-lg`} alt="" />;
  return <span className={`${s} rounded-lg flex items-center justify-center ${t} font-bold text-white`} style={{ backgroundColor: color }}>{label[0]}</span>;
}

// Re-export lucide-react icons with friendly names
export {
  Plus as PlusIcon,
  MessageSquare as ChatIcon,
  FileText as DocumentIcon,
  Folder as FolderIcon,
  Settings as SettingsIcon,
  Search as SearchIcon,
  Send as SendIcon,
  Paperclip as AttachIcon,
  ChevronRight as ChevronIcon,
  Check as CheckIcon,
  Shield as ShieldIcon,
  Globe as GlobeIcon,
  Upload as UploadIcon,
  MoreVertical as MoreIcon,
  Share2 as ShareIcon,
  Cpu as CpuIcon,
  Layers as LayersIcon,
  BookOpen as BookIcon,
  File as FileTextIcon,
  X as XIcon,
  Filter as FilterIcon,
  Menu as MenuIcon,
  Key as KeyIcon,
  Trash2 as TrashIcon,
  Edit as EditIcon,
  LogOut as LogoutIcon,
  MoreVertical as VerticalDotsIcon,
} from "lucide-react";
