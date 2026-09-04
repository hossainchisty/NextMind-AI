// Chat types
export interface Chat { id: string; title: string; lastMessage: string; updatedAt: string }
export interface Source { id: string; documentName: string; section: string; page: number; relevance: "High" | "Medium" | "Low"; preview: string }
export interface Msg { id: string; role: "user" | "assistant"; content: string; sources?: Source[]; timestamp: string }

// Document types
export interface Document {
  id: string;
  name: string;
  file_type: string;
  file_size: number;
  page_count: number;
  status: string;
  collection: string | null;
  file_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  document_count: number;
  created_at: string;
  updated_at: string;
}

export interface CollectionDetail extends Collection {
  documents: Document[];
}

// Provider types
export interface Provider {
  id: string;
  value: string;
  label: string;
  endpoint: string;
  placeholder: string;
  logo: string;
  logo_url: string;
  color: string;
}

export interface APIKey {
  id: string;
  provider: { value: string; label: string };
  provider_detail: Provider;
  api_key: string;
  api_key_masked: string;
  is_active: boolean;
  created_at: string;
}

// Model types
export interface ModelInfo {
  id: string;
  name: string;
  context: string;
  input_price: string;
  output_price: string;
  pricing_type: "free" | "freemium" | "paid";
  capabilities: string[];
  description: string;
}

export interface ProviderModel {
  provider: { value: string; label: string; color: string; logo_url: string | null };
  models: ModelInfo[];
}

// User types
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
}
