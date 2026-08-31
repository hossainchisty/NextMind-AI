export interface Chat { id: string; title: string; lastMessage: string; updatedAt: string }
export interface Source { id: string; documentName: string; section: string; page: number; relevance: "High" | "Medium" | "Low"; preview: string }
export interface Msg { id: string; role: "user" | "assistant"; content: string; sources?: Source[]; timestamp: string }
