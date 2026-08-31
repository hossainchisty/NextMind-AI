import type { Chat, Msg } from "./types";

// ── Shared types for other pages ─────────────────────────────────────────────

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

export const CHATS: Chat[] = [
  { id: "1", title: "Project Architecture", lastMessage: "How is the system designed?", updatedAt: "2 min ago" },
  { id: "2", title: "Django Authentication", lastMessage: "Explain the auth flow", updatedAt: "15 min ago" },
  { id: "3", title: "Employee Handbook", lastMessage: "What is the leave policy?", updatedAt: "1 hour ago" },
  { id: "4", title: "AWS Infrastructure", lastMessage: "How are services deployed?", updatedAt: "3 hours ago" },
  { id: "5", title: "Database Design", lastMessage: "Show me the schema", updatedAt: "Yesterday" },
];

export const chats = CHATS;

export const documents: Document[] = [
  { id: "1", name: "Employee Handbook.pdf", type: "PDF", pages: 42, chunks: 2418, indexed: true, collection: "Work", updatedAt: "Aug 15, 2026", size: "4.2 MB" },
  { id: "2", name: "Architecture Overview.pdf", type: "PDF", pages: 28, chunks: 1654, indexed: true, collection: "Engineering", updatedAt: "Aug 12, 2026", size: "2.8 MB" },
  { id: "3", name: "API Documentation.md", type: "Markdown", pages: 12, chunks: 892, indexed: true, collection: "Engineering", updatedAt: "Aug 10, 2026", size: "156 KB" },
  { id: "4", name: "Security Policy.pdf", type: "PDF", pages: 18, chunks: 1102, indexed: true, collection: "Work", updatedAt: "Aug 8, 2026", size: "1.4 MB" },
  { id: "5", name: "Research Notes.md", type: "Markdown", pages: 8, chunks: 534, indexed: true, collection: "Research", updatedAt: "Aug 5, 2026", size: "89 KB" },
  { id: "6", name: "Brand Guidelines.pdf", type: "PDF", pages: 32, chunks: 1987, indexed: true, collection: "Personal", updatedAt: "Aug 1, 2026", size: "8.1 MB" },
  { id: "7", name: "Meeting Notes - Q3.md", type: "Markdown", pages: 4, chunks: 267, indexed: false, collection: "Work", updatedAt: "Jul 28, 2026", size: "34 KB" },
];

export const collections: Collection[] = [
  { id: "1", name: "Work", documentCount: 3, totalSize: "5.8 MB", updatedAt: "Aug 15, 2026" },
  { id: "2", name: "Engineering", documentCount: 2, totalSize: "3.0 MB", updatedAt: "Aug 12, 2026" },
  { id: "3", name: "Personal", documentCount: 1, totalSize: "8.1 MB", updatedAt: "Aug 1, 2026" },
  { id: "4", name: "Research", documentCount: 1, totalSize: "89 KB", updatedAt: "Aug 5, 2026" },
];

export const MESSAGES: Record<string, Msg[]> = {
  "1": [
    { id: "pa-1", role: "user", content: "How is the system architecture designed?", timestamp: "10:12 AM" },
    { id: "pa-2", role: "assistant", content: "Based on the Architecture Overview document, here's how the system is designed:\n\n## System Architecture\n\nThe platform follows a **microservices architecture** with event-driven communication between services. [1]\n\n### Core Components\n\n| Service | Technology | Purpose |\n|---------|-----------|----------|\n| API Gateway | Kong | Request routing, rate limiting |\n| Auth Service | Django + JWT | Authentication & authorization |\n| Knowledge Engine | Python + FastAPI | Document processing & RAG |\n| Vector Store | Qdrant | Embedding storage & retrieval |\n| LLM Runtime | Ollama | Local model inference |\n\n### Data Flow\n\n1. User submits a query through the frontend\n2. API Gateway routes to the Knowledge Engine\n3. Hybrid search retrieves relevant chunks from Qdrant\n4. Reranker scores and filters top results\n5. LLM generates an answer grounded in retrieved context [2]", sources: [
      { id: "pa-s1", documentName: "Architecture Overview.pdf", section: "System Design", page: 3, relevance: "High", preview: "The platform follows a microservices architecture with event-driven communication between core services." },
      { id: "pa-s2", documentName: "Architecture Overview.pdf", section: "Data Flow", page: 7, relevance: "High", preview: "Queries flow through the API Gateway to the Knowledge Engine, which performs hybrid search and reranking." },
    ], timestamp: "10:13 AM" },
  ],
  "2": [
    { id: "da-1", role: "user", content: "Explain the Django authentication flow", timestamp: "11:45 AM" },
    { id: "da-2", role: "assistant", content: "Here's how authentication works in the Django backend:\n\n## Authentication Flow\n\nThe system uses **JWT (JSON Web Tokens)** for stateless authentication. [1]\n\n### Login Process\n\n1. User submits credentials to `/api/auth/login/`\n2. Django validates credentials against the User model\n3. A JWT access token and refresh token are generated\n4. Tokens are returned to the client\n\n### Token Management\n\n- **Access Token**: Short-lived (15 minutes), used for API requests\n- **Refresh Token**: Long-lived (7 days), used to obtain new access tokens\n- Tokens are stored in HTTP-only cookies for security [2]\n\n### Password Security\n\n- Passwords are hashed using **PBKDF2** with SHA256\n- Salt is generated per-user during account creation\n- Password policy enforces minimum 12 characters", sources: [
      { id: "da-s1", documentName: "API Documentation.md", section: "Authentication", page: 2, relevance: "High", preview: "The system uses JWT for stateless authentication with short-lived access tokens and long-lived refresh tokens." },
      { id: "da-s2", documentName: "Security Policy.pdf", section: "Token Management", page: 5, relevance: "Medium", preview: "Tokens are stored in HTTP-only cookies to prevent XSS attacks and ensure secure token handling." },
    ], timestamp: "11:46 AM" },
  ],
  "3": [
    { id: "1", role: "user", content: "What is the annual leave policy for employees?", timestamp: "2:34 PM" },
    { id: "2", role: "assistant", content: "Based on the Employee Handbook, here's the annual leave policy:\n\n## Annual Leave Entitlement\n\nEmployees are entitled to **14 days** of annual leave per calendar year. [1]\n\n### Key Details\n\n- Leave must be requested at least **5 working days** in advance\n- Unused leave may be carried forward up to **5 days** to the next year, with manager approval [2]\n- Leave is accrued proportionally for part-time employees\n- New employees accrue leave from their start date\n\n### Public Holidays\n\nIn addition to annual leave, employees receive **10 public holidays** per year. [1]\n\n### Leave Request Process\n\n1. Submit request through the HR portal\n2. Await manager approval (typically within 48 hours)\n3. Approved leave is reflected in your next payslip", sources: [
      { id: "s1", documentName: "Employee Handbook.pdf", section: "Annual Leave Policy", page: 14, relevance: "High", preview: "Employees are entitled to 14 days of annual leave per calendar year. Unused leave may be carried forward with manager approval." },
      { id: "s2", documentName: "Employee Handbook.pdf", section: "Leave Carry Forward", page: 15, relevance: "High", preview: "Up to 5 days of unused annual leave may be carried forward to the following year subject to manager approval." },
      { id: "s3", documentName: "Employee Handbook.pdf", section: "Public Holidays", page: 16, relevance: "Medium", preview: "In addition to annual leave, the company observes 10 public holidays per year as outlined in the holiday calendar." },
    ], timestamp: "2:34 PM" },
  ],
  "4": [
    { id: "aws-1", role: "user", content: "How are services deployed on AWS?", timestamp: "3:20 PM" },
    { id: "aws-2", role: "assistant", content: "Here's an overview of the AWS infrastructure deployment:\n\n## Deployment Architecture\n\nServices are deployed on **AWS** using a combination of ECS Fargate and managed services. [1]\n\n### Infrastructure Stack\n\n| Resource | AWS Service | Configuration |\n|----------|------------|----------------|\n| Compute | ECS Fargate | Auto-scaling 2-10 tasks |\n| Database | RDS PostgreSQL | db.t3.large, Multi-AZ |\n| Cache | ElastiCache Redis | cache.t3.medium |\n| Storage | S3 | Versioned, encrypted |\n| CDN | CloudFront | Global edge caching |\n\n### CI/CD Pipeline\n\n1. Code pushed to GitHub repository\n2. GitHub Actions builds and tests the code\n3. Docker image pushed to ECR\n4. ECS service automatically rolls out the new task definition [2]", sources: [
      { id: "aws-s1", documentName: "Architecture Overview.pdf", section: "Cloud Infrastructure", page: 18, relevance: "High", preview: "Services are deployed on AWS using ECS Fargate with auto-scaling and managed database services." },
      { id: "aws-s2", documentName: "Architecture Overview.pdf", section: "CI/CD", page: 22, relevance: "Medium", preview: "GitHub Actions builds, tests, and deploys Docker images to ECR with automatic ECS rolling deployments." },
    ], timestamp: "3:21 PM" },
  ],
  "5": [
    { id: "db-1", role: "user", content: "Show me the database schema", timestamp: "Yesterday" },
    { id: "db-2", role: "assistant", content: "Here's the core database schema design:\n\n## Database Schema\n\nThe system uses **PostgreSQL** with the following core tables:\n\n### Users & Authentication\n\n| Table | Key Columns | Description |\n|-------|------------|-------------|\n| `users` | id, email, password_hash, created_at | Core user accounts |\n| `user_profiles` | user_id, display_name, avatar_url | Extended user info |\n| `refresh_tokens` | user_id, token, expires_at | JWT refresh tokens |\n\n### Knowledge Base\n\n| Table | Key Columns | Description |\n|-------|------------|-------------|\n| `documents` | id, user_id, name, type, status | Uploaded documents |\n| `chunks` | id, document_id, content, embedding | Processed text chunks |\n| `collections` | id, user_id, name | Document groupings |\n| `chat_history` | id, user_id, messages, created_at | Conversation logs |\n\n### Relationships\n\n- A **User** has many **Documents** and **Collections**\n- A **Document** has many **Chunks** (split during indexing)\n- **Chunks** are linked to **Documents** via foreign key\n- **Chat History** references **Documents** through citation links [1]", sources: [
      { id: "db-s1", documentName: "Architecture Overview.pdf", section: "Database Design", page: 12, relevance: "High", preview: "PostgreSQL is used as the primary database with tables for users, documents, chunks, and collections." },
    ], timestamp: "Yesterday" },
  ],
};
