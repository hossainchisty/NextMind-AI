# NextMind AI

> A privacy-first, AI-powered knowledge workspace. Upload documents, build knowledge bases, and chat with your data using a full RAG pipeline.

![Django](https://img.shields.io/badge/Django-4.2-0D2B23?style=flat-square&logo=django)
![Next.js](https://img.shields.io/badge/Next.js-16-0D2B23?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19-2A7D5F?style=flat-square&logo=react)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-2A7D5F?style=flat-square&logo=postgresql)
![pgvector](https://img.shields.io/badge/pgvector-vector_search-164235?style=flat-square)
![Celery](https://img.shields.io/badge/Celery-async_tasks-0D2B23?style=flat-square)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-2A7D5F?style=flat-square&logo=tailwindcss)

---

## Architecture

```mermaid
graph TB
    subgraph CLIENT["Frontend — Next.js 16 + React 19 + Tailwind 4"]
        direction LR
        UI["UI Components<br/><i>ChatSidebar, ChatMessages,<br/>ChatInput, SourcesPanel</i>"]
        AUTH_C["AuthProvider<br/><i>JWT tokens, login,<br/>register, logout</i>"]
        API_C["API Client<br/><i>fetch wrapper,<br/>auto-refresh JWT</i>"]
        ROUTER["App Router<br/><i>/login, /register,<br/>/knowledge, /collections</i>"]
    end

    subgraph BACKEND["Backend — Django 4.2 + DRF + Celery"]
        direction TB

        subgraph AUTH["Authentication"]
            JWT["JWT Auth<br/><i>SimpleJWT<br/>30min access / 7d refresh</i>"]
            VIEWS_A["Accounts Views<br/><i>Register, Login,<br/>TokenRefresh, Me</i>"]
        end

        subgraph DOCS["Document Ingestion"]
            UPLOAD["Upload API<br/><i>DocumentListCreateView</i>"]
            CELERY["Celery Worker<br/><i>process_document_task</i>"]
            PARSERS["Parsers<br/><i>PDF (PyMuPDF)<br/>DOCX, Markdown, TXT</i>"]
            CHUNK["Chunking<br/><i>Recursive text splitter<br/>~500 tokens/chunk</i>"]
        end

        subgraph EMBED["Embedding & Indexing"]
            ST_MODEL["SentenceTransformer<br/><i>BAAI/bge-base-en-v1.5<br/>768 dimensions</i>"]
            PGVEC["pgvector<br/><i>Cosine similarity<br/>IVFFlat index</i>"]
        end

        subgraph RAG["RAG Retrieval Pipeline"]
            DENSE["Dense Search<br/><i>pgvector cosine<br/>top-k candidates</i>"]
            BM25["BM25 Search<br/><i>rank-bm25<br/>sparse retrieval</i>"]
            FUSION["RRF Fusion<br/><i>Reciprocal Rank<br/>Fusion scoring</i>"]
            RERANK["Reranker<br/><i>cross-encoder/<br/>ms-marco-MiniLM-L-6-v2</i>"]
        end

        subgraph CHAT["Chat Pipeline"]
            QR["Query Rewriter<br/><i>Follow-up detection<br/>via LLM</i>"]
            CB["Context Builder<br/><i>Formats source chunks<br/>with citations</i>"]
            LLM["LLM Provider<br/><i>OpenAI / Anthropic /<br/>Gemini / Local</i>"]
            CITE["Citation Extractor<br/><i>[1], [2] pattern<br/>matching</i>"]
        end

        subgraph DB["Data Layer"]
            PG["PostgreSQL (Neon)<br/><i>Users, Documents,<br/>Chunks, Collections,<br/>Conversations, Messages</i>"]
            REDIS["Redis<br/><i>Celery broker,<br/>cache</i>"]
        end
    end

    subgraph EXTERNAL["External Services"]
        LLM_EXT["LLM API<br/><i>OpenAI, Anthropic,<br/>Gemini, Local</i>"]
        HUG["Hugging Face Hub<br/><i>Model downloads<br/>(cached locally)</i>"]
    end

    UI --> API_C
    API_C -->|HTTP| UPLOAD
    API_C -->|HTTP| VIEWS_A
    API_C -->|HTTP| CHAT

    AUTH_C --> JWT
    VIEWS_A --> JWT
    JWT --> PG

    UPLOAD --> CELERY
    CELERY --> PARSERS
    PARSERS --> CHUNK
    CHUNK --> ST_MODEL
    ST_MODEL --> PGVEC
    PGVEC --> PG

    DENSE --> PGVEC
    BM25 --> PG
    DENSE --> FUSION
    BM25 --> FUSION
    FUSION --> RERANK
    RERANK --> CB

    QR --> LLM
    CB --> LLM
    LLM --> LLM_EXT
    CITE --> CB

    ST_MODEL -.->|download| HUG

    PGVEC -.-> PG
    CELERY -.-> REDIS

    classDef clientStyle fill:#EDF5ED,stroke:#0D2B23,stroke-width:2px,color:#0D2B23
    classDef backendStyle fill:#F7F8F5,stroke:#2A7D5F,stroke-width:2px,color:#12201B
    classDef authStyle fill:#DCE8D7,stroke:#2A7D5F,stroke-width:1px,color:#12201B
    classDef docStyle fill:#EDF5ED,stroke:#164235,stroke-width:1px,color:#12201B
    classDef embedStyle fill:#DCE8D7,stroke:#0D2B23,stroke-width:1px,color:#12201B
    classDef ragStyle fill:#EDF5ED,stroke:#2A7D5F,stroke-width:1px,color:#12201B
    classDef chatStyle fill:#F0F7F4,stroke:#0D2B23,stroke-width:1px,color:#12201B
    classDef dbStyle fill:#D4EDDA,stroke:#2A7D5F,stroke-width:1px,color:#12201B
    classDef extStyle fill:#E5E8E4,stroke:#66706C,stroke-width:1px,color:#12201B

    class UI,AUTH_C,API_C,ROUTER clientStyle
    class JWT,VIEWS_A authStyle
    class UPLOAD,CELERY,PARSERS,CHUNK docStyle
    class ST_MODEL,PGVEC embedStyle
    class DENSE,BM25,FUSION,RERANK ragStyle
    class QR,CB,LLM,CITE chatStyle
    class PG,REDIS dbStyle
    class LLM_EXT,HUG extStyle
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 16, React 19, Tailwind CSS 4, TypeScript 5 |
| **Backend** | Django 4.2, Django REST Framework 3.16 |
| **Database** | PostgreSQL (Neon) + pgvector extension |
| **Vector Search** | pgvector (cosine similarity), IVFFlat indexing |
| **Sparse Search** | BM25Okapi (rank-bm25) |
| **Hybrid Fusion** | Reciprocal Rank Fusion (RRF) |
| **Reranking** | cross-encoder/ms-marco-MiniLM-L-6-v2 |
| **Embeddings** | BAAI/bge-base-en-v1.5 (768-dim) |
| **Task Queue** | Celery + Redis |
| **LLM Providers** | OpenAI, Anthropic, Gemini, Local (swappable) |
| **Auth** | JWT (SimpleJWT) — 30min access, 7-day refresh |
| **Document Parsing** | PyMuPDF (PDF), python-docx, Markdown, plain text |

---

## Project Structure

```
NextMind-AI/
├── nextmindai-backend/
│   ├── config/
│   │   ├── settings/          # base.py, development.py
│   │   ├── urls.py            # API v1 routing
│   │   └── __init__.py        # Celery app
│   ├── apps/
│   │   ├── accounts/          # User model, JWT auth
│   │   ├── documents/         # Upload, parse, chunk, embed
│   │   ├── knowledge/         # Collections, embedding service
│   │   ├── retrieval/         # Dense, BM25, fusion, reranker
│   │   ├── conversations/     # Chat orchestration
│   │   ├── ai/                # LLM providers, context builder
│   │   └── core/              # Models, pagination, exceptions
│   ├── requirements.txt
│   ├── .env                   # Secrets (not committed)
│   └── .env.example
├── nextmindai-frontend/
│   ├── app/
│   │   ├── page.tsx           # Chat (main)
│   │   ├── login/             # Login page
│   │   ├── register/          # Register page
│   │   ├── knowledge/         # Document manager
│   │   ├── collections/       # Knowledge collections
│   │   └── settings/          # Settings page
│   ├── components/
│   │   ├── App.tsx            # Chat orchestrator
│   │   ├── ClientLayout.tsx   # Auth gate + Toast
│   │   ├── chat/              # ChatSidebar, ChatMessages, etc.
│   │   ├── sidebar/           # Knowledge sidebar
│   │   ├── sources/           # Source citation panel
│   │   └── ui/                # Icons, Markdown, Toast
│   ├── lib/
│   │   ├── api.ts             # Fetch wrapper + JWT refresh
│   │   ├── auth.tsx           # AuthProvider + useAuth
│   │   └── types.ts           # TypeScript interfaces
│   └── package.json
└── README.md
```

---

## How the RAG Pipeline Works

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant API as Django API
    participant RETRIEVAL as Retrieval Pipeline
    participant LLM as LLM Provider
    participant DB as PostgreSQL + pgvector

    U->>FE: Type message
    FE->>API: POST /api/v1/chat/

    API->>API: Rewrite query (detect follow-up)
    API->>DB: Dense search (pgvector cosine)
    API->>DB: BM25 sparse search
    API->>API: Fuse results (RRF)
    API->>API: Rerank top candidates (cross-encoder)
    API->>API: Build context from top-5 chunks

    API->>LLM: Generate answer with context
    LLM-->>API: Answer + citations

    API->>DB: Save message + metadata
    API-->>FE: { conversation_id, message, citations }
    FE-->>U: Display answer with sources
```

---

## Getting Started

### Prerequisites

- Python 3.9+
- Node.js 18+
- PostgreSQL 14+ with pgvector extension
- Redis 7+

### Backend Setup

```bash
cd nextmindai-backend

# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your database, Redis, and LLM API keys

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Start Django
python manage.py runserver 0.0.0.0:8000

# Start Celery worker (separate terminal)
celery -A config worker -l info
```

### Frontend Setup

```bash
cd nextmindai-frontend

# Install dependencies
yarn install

# Start development server
yarn dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

### Backend (`.env`)

| Variable | Description | Example |
|---|---|---|
| `DATABASE_NAME` | PostgreSQL database name | `neondb` |
| `DATABASE_USER` | PostgreSQL username | `neondb_owner` |
| `DATABASE_PASSWORD` | PostgreSQL password | — |
| `DATABASE_HOST` | PostgreSQL host | `ep-xxx.neon.tech` |
| `DATABASE_PORT` | PostgreSQL port | `5432` |
| `REDIS_URL` | Redis connection URL | `redis://localhost:6379/0` |
| `LLM_PROVIDER` | LLM backend | `openai` |
| `LLM_MODEL` | Model identifier | `gemini-2.5-flash` |
| `LLM_BASE_URL` | LLM API base URL | — |
| `OPENAI_API_KEY` | OpenAI / compatible API key | — |
| `ANTHROPIC_API_KEY` | Anthropic API key | — |
| `GEMINI_API_KEY` | Google Gemini API key | — |
| `EMBEDDING_MODEL` | Sentence-transformer model | `BAAI/bge-base-en-v1.5` |
| `RERANKER_MODEL` | Cross-encoder model | `cross-encoder/ms-marco-MiniLM-L-6-v2` |
| `MAX_UPLOAD_SIZE` | Max file upload (bytes) | `52428800` (50MB) |
| `CORS_ALLOWED_ORIGINS` | Allowed CORS origins | `http://localhost:3000` |

### Frontend (`.env.local`)

| Variable | Description | Example |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:8000/api/v1` |

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/auth/register/` | Register new account |
| `POST` | `/api/v1/auth/login/` | Login, returns JWT |
| `POST` | `/api/v1/auth/token/refresh/` | Refresh access token |
| `GET` | `/api/v1/auth/me/` | Get current user profile |
| `GET` | `/api/v1/documents/` | List documents |
| `POST` | `/api/v1/documents/` | Upload document |
| `GET` | `/api/v1/documents/:id/` | Get document detail |
| `DELETE` | `/api/v1/documents/:id/` | Delete document |
| `GET` | `/api/v1/collections/` | List collections |
| `POST` | `/api/v1/collections/` | Create collection |
| `GET` | `/api/v1/collections/:id/` | Get collection with documents |
| `PATCH` | `/api/v1/collections/:id/` | Update collection |
| `DELETE` | `/api/v1/collections/:id/` | Delete collection |
| `GET` | `/api/v1/conversations/` | List conversations |
| `GET` | `/api/v1/conversations/:id/` | Get conversation with messages |
| `PATCH` | `/api/v1/conversations/:id/` | Rename conversation |
| `DELETE` | `/api/v1/conversations/:id/` | Delete conversation |
| `POST` | `/api/v1/chat/` | Send chat message (RAG) |

---

## Database Schema

```mermaid
erDiagram
    User {
        uuid id PK
        string email UK
        string name
        string password
        string avatar
        datetime created_at
        datetime updated_at
    }

    Document {
        uuid id PK
        uuid user_id FK
        string name
        string original_filename
        string file_type
        bigint file_size
        string status
        string error_message
        int page_count
        uuid collection_id FK
        datetime created_at
        datetime updated_at
    }

    DocumentChunk {
        uuid id PK
        uuid document_id FK
        text content
        int chunk_index
        int page_number
        string section_title
        vector embedding
        jsonb metadata
    }

    Collection {
        uuid id PK
        uuid user_id FK
        string name
        string description
        datetime created_at
        datetime updated_at
    }

    Conversation {
        uuid id PK
        uuid user_id FK
        uuid collection_id FK
        string title
        datetime created_at
        datetime updated_at
    }

    Message {
        uuid id PK
        uuid conversation_id FK
        string role
        text content
        jsonb metadata
        datetime created_at
    }

    User ||--o{ Document : owns
    User ||--o{ Collection : owns
    User ||--o{ Conversation : owns
    Collection ||--o{ Document : contains
    Document ||--o{ DocumentChunk : has
    Conversation ||--o{ Message : has
```

---

## Key Design Decisions

| Decision | Rationale |
|---|---|
| **pgvector over Pinecone/Weaviate** | Zero external dependencies, runs on Neon free tier |
| **Hybrid search (Dense + BM25 + RRF)** | Dense captures semantic meaning, BM25 catches exact keywords, RRF combines both without tuning |
| **Cross-encoder reranking** | Re-ranks top-30 candidates to top-5 for higher precision |
| **Celery for document processing** | Non-blocking ingestion — upload returns immediately, embedding runs async |
| **JWT with 30min expiry** | Stateless auth with auto-refresh for seamless UX |
| **Multi-provider LLM** | Swap between OpenAI, Anthropic, Gemini, or local models via env variable |
| **LimitOffset pagination** | Consistent `{success, data, pagination}` response format |

---

## License

Private — NextMind AI
