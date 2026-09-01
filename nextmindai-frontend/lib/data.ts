export interface Document {
  id: string;
  name: string;
  type: string;
  pages: number;
  chunks: number;
  indexed: boolean;
  collection: string;
  updatedAt: string;
  size: string;
}

export interface Collection {
  id: string;
  name: string;
  documentCount: number;
  totalSize: string;
  updatedAt: string;
}
