# NextMind AI

> একটি প্রাইভেসি-ফার্স্ট, AI-চালিত জ্ঞান কর্মক্ষেত্র। ডকুমেন্ট আপলোড করুন, জ্ঞান বেস তৈরি করুন, এবং আপনার ডেটার সাথে RAG পাইপলাইন ব্যবহার করে চ্যাট করুন।

![Django](https://img.shields.io/badge/Django-4.2-0D2B23?style=flat-square&logo=django)
![Next.js](https://img.shields.io/badge/Next.js-16-0D2B23?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19-2A7D5F?style=flat-square&logo=react)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-2A7D5F?style=flat-square&logo=postgresql)
![pgvector](https://img.shields.io/badge/pgvector-vector_search-164235?style=flat-square)
![Celery](https://img.shields.io/badge/Celery-async_tasks-0D2B23?style=flat-square)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-2A7D5F?style=flat-square&logo=tailwindcss)

---

## স্থাপত্য (Architecture)

```mermaid
graph TB
    subgraph CLIENT["ফ্রন্টএন্ড — Next.js 16 + React 19 + Tailwind 4"]
        direction LR
        UI["UI কম্পোনেন্ট<br/><i>ChatSidebar, ChatMessages,<br/>ChatInput, SourcesPanel</i>"]
        AUTH_C["Auth প্রোভাইডার<br/><i>JWT টোকেন, লগইন,<br/>রেজিস্টার, লগআউট</i>"]
        API_C["API ক্লায়েন্ট<br/><i>fetch র‍্যাপার,<br/>স্বয়ংক্রিয় JWT রিফ্রেশ</i>"]
        ROUTER["App Router<br/><i>/login, /register,<br/>/knowledge, /collections</i>"]
    end

    subgraph BACKEND["ব্যাকএন্ড — Django 4.2 + DRF + Celery"]
        direction TB

        subgraph AUTH["প্রমাণীকরণ (Authentication)"]
            JWT["JWT প্রমাণীকরণ<br/><i>SimpleJWT<br/>৩০ মিনিট অ্যাক্সেস / ৭ দিন রিফ্রেশ</i>"]
            VIEWS_A["অ্যাকাউন্টস ভিউ<br/><i>রেজিস্টার, লগইন,<br/>টোকেন রিফ্রেশ, প্রোফাইল</i>"]
        end

        subgraph DOCS["ডকুমেন্ট ইনজেশন"]
            UPLOAD["আপলোড API<br/><i>DocumentListCreateView</i>"]
            CELERY["Celery ওয়ার্কার<br/><i>process_document_task</i>"]
            PARSERS["পার্সার<br/><i>PDF (PyMuPDF)<br/>DOCX, Markdown, TXT</i>"]
            CHUNK["চাঙ্কিং<br/><i>পুনরাবৃত্ত টেক্সট স্প্লিটার<br/>~৫০০ টোকেন/চাঙ্ক</i>"]
        end

        subgraph EMBED["এম্বেডিং এবং ইন্ডেক্সিং"]
            ST_MODEL["SentenceTransformer<br/><i>BAAI/bge-base-en-v1.5<br/>৭৬৮ মাত্রা</i>"]
            PGVEC["pgvector<br/><i>কোসাইন সাম্যতা<br/>IVFFlat ইন্ডেক্স</i>"]
        end

        subgraph RAG["RAG রিট্রিভাল পাইপলাইন"]
            DENSE["ডেন্স সার্চ<br/><i>pgvector কোসাইন<br/>শীর্ষ-k প্রার্থী</i>"]
            BM25["BM25 সার্চ<br/><i>rank-bm25<br/>স্পার্স রিট্রিভাল</i>"]
            FUSION["RRF ফিউশন<br/><i>Reciprocal Rank<br/>Fusion স্কোরিং</i>"]
            RERANK["রির‍্যাঙ্কার<br/><i>cross-encoder/<br/>ms-marco-MiniLM-L-6-v2</i>"]
        end

        subgraph CHAT["চ্যাট পাইপলাইন"]
            QR["ক্যুয়েরি রিরাইটার<br/><i>ফলো-আপ সনাক্তকরণ<br/>LLM এর মাধ্যমে</i>"]
            CB["কন্টেক্সট বিল্ডার<br/><i>উৎস চাঙ্ক ফরম্যাট<br/>উদ্ধৃতি সহ</i>"]
            LLM["LLM প্রোভাইডার<br/><i>OpenAI / Anthropic /<br/>Gemini / স্থানীয়</i>"]
            CITE["উদ্ধৃতি এক্সট্র্যাক্টার<br/><i>[1], [2] প্যাটার্ন<br/>ম্যাচিং</i>"]
        end

        subgraph DB["ডেটা লেয়ার"]
            PG["PostgreSQL (Neon)<br/><i>ব্যবহারকারী, ডকুমেন্ট,<br/>চাঙ্ক, কালেকশন,<br/>কথোপকথন, বার্তা</i>"]
            REDIS["Redis<br/><i>Celery ব্রোকার,<br/>ক্যাশ</i>"]
        end
    end

    subgraph EXTERNAL["বহিঃসেবা"]
        LLM_EXT["LLM API<br/><i>OpenAI, Anthropic,<br/>Gemini, স্থানীয়</i>"]
        HUG["Hugging Face Hub<br/><i>মডেল ডাউনলোড<br/>(স্থানীয়ভাবে ক্যাশ)</i>"]
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

    ST_MODEL -.->|ডাউনলোড| HUG

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

## প্রযুক্তি স্ট্যাক

| স্তর | প্রযুক্তি |
|---|---|
| **ফ্রন্টএন্ড** | Next.js 16, React 19, Tailwind CSS 4, TypeScript 5 |
| **ব্যাকএন্ড** | Django 4.2, Django REST Framework 3.16 |
| **ডেটাবেস** | PostgreSQL (Neon) + pgvector এক্সটেনশন |
| **ভেক্টর সার্চ** | pgvector (কোসাইন সাম্যতা), IVFFlat ইন্ডেক্সিং |
| **স্পার্স সার্চ** | BM25Okapi (rank-bm25) |
| **হাইব্রিড ফিউশন** | Reciprocal Rank Fusion (RRF) |
| **রির‍্যাঙ্কিং** | cross-encoder/ms-marco-MiniLM-L-6-v2 |
| **এম্বেডিং** | BAAI/bge-base-en-v1.5 (৭৬৮-মাত্রা) |
| **টাস্ক কিউ** | Celery + Redis |
| **LLM প্রোভাইডার** | OpenAI, Anthropic, Gemini, স্থানীয় (পরিবর্তনযোগ্য) |
| **প্রমাণীকরণ** | JWT (SimpleJWT) — ৩০ মিনিট অ্যাক্সেস, ৭ দিন রিফ্রেশ |
| **ডকুমেন্ট পার্সিং** | PyMuPDF (PDF), python-docx, Markdown, প্লেইন টেক্সট |

---

## প্রজেক্ট গঠন

```
NextMind-AI/
├── nextmindai-backend/
│   ├── config/
│   │   ├── settings/          # base.py, development.py
│   │   ├── urls.py            # API v1 রাউটিং
│   │   └── __init__.py        # Celery অ্যাপ
│   ├── apps/
│   │   ├── accounts/          # ব্যবহারকারী মডেল, JWT প্রমাণীকরণ
│   │   ├── documents/         # আপলোড, পার্সিং, চাঙ্কিং, এম্বেডিং
│   │   ├── knowledge/         # কালেকশন, এম্বেডিং সেবা
│   │   ├── retrieval/         # ডেন্স, BM25, ফিউশন, রির‍্যাঙ্কার
│   │   ├── conversations/     # চ্যাট অর্কেস্ট্রেশন
│   │   ├── ai/                # LLM প্রোভাইডার, কন্টেক্সট বিল্ডার
│   │   └── core/              # মডেল, পেজিনেশন, এক্সেপশন
│   ├── requirements.txt
│   ├── .env                   # সিক্রেট (কমিট হয় না)
│   └── .env.example
├── nextmindai-frontend/
│   ├── app/
│   │   ├── page.tsx           # চ্যাট (মূল)
│   │   ├── login/             # লগইন পৃষ্ঠা
│   │   ├── register/          # রেজিস্টার পৃষ্ঠা
│   │   ├── knowledge/         # ডকুমেন্ট ম্যানেজার
│   │   ├── collections/       # জ্ঞান কালেকশন
│   │   └── settings/          # সেটিংস পৃষ্ঠা
│   ├── components/
│   │   ├── App.tsx            # চ্যাট অর্কেস্ট্রেটর
│   │   ├── ClientLayout.tsx   # Auth গেট + Toast
│   │   ├── chat/              # ChatSidebar, ChatMessages ইত্যাদি
│   │   ├── sidebar/           # জ্ঞান সাইডবার
│   │   ├── sources/           # উৎস উদ্ধৃতি প্যানেল
│   │   └── ui/                # আইকন, Markdown, Toast
│   ├── lib/
│   │   ├── api.ts             # fetch র‍্যাপার + JWT রিফ্রেশ
│   │   ├── auth.tsx           # AuthProvider + useAuth
│   │   └── types.ts           # TypeScript ইন্টারফেস
│   └── package.json
└── README.md
```

---

## RAG পাইপলাইন কীভাবে কাজ করে

```mermaid
sequenceDiagram
    participant U as ব্যবহারকারী
    participant FE as ফ্রন্টএন্ড
    participant API as Django API
    participant RETRIEVAL as রিট্রিভাল পাইপলাইন
    participant LLM as LLM প্রোভাইডার
    participant DB as PostgreSQL + pgvector

    U->>FE: বার্তা টাইপ করুন
    FE->>API: POST /api/v1/chat/

    API->>API: ক্যুয়েরি পুনর্লেখন (ফলো-আপ সনাক্তকরণ)
    API->>DB: ডেন্স সার্চ (pgvector কোসাইন)
    API->>DB: BM25 স্পার্স সার্চ
    API->>API: ফলাফল ফিউশন (RRF)
    API->>API: শীর্ষ প্রার্থীদের রির‍্যাঙ্ক (cross-encoder)
    API->>API: শীর্ষ-৫ চাঙ্ক থেকে কন্টেক্সট তৈরি

    API->>LLM: কন্টেক্সট সহ উত্তর তৈরি
    LLM-->>API: উত্তর + উদ্ধৃতি

    API->>DB: বার্তা + মেটাডেটা সংরক্ষণ
    API-->>FE: { conversation_id, message, citations }
    FE-->>U: উত্তর এবং উৎসসহ প্রদর্শন
```

---

## শুরু করুন

### পূর্বশর্ত

- Python 3.9+
- Node.js 18+
- PostgreSQL 14+ pgvector এক্সটেনশন সহ
- Redis 7+

### ব্যাকএন্ড সেটআপ

```bash
cd nextmindai-backend

# ভার্চুয়াল এনভায়রনমেন্ট তৈরি
python -m venv venv
source venv/bin/activate

# নির্ভরতা ইনস্টল
pip install -r requirements.txt

# এনভায়রনমেন্ট কনফিগার
cp .env.example .env
# আপনার ডেটাবেস, Redis, এবং LLM API কী দিয়ে .env সম্পাদনা করুন

# মাইগ্রেশন চালান
python manage.py migrate

# সুপারইউজার তৈরি
python manage.py createsuperuser

# Django চালু করুন
python manage.py runserver 0.0.0.0:8000

# Celery ওয়ার্কার (আলাদা টার্মিনাল)
celery -A config worker -l info
```

### ফ্রন্টএন্ড সেটআপ

```bash
cd nextmindai-frontend

# নির্ভরতা ইনস্টল
yarn install

# ডেভেলপমেন্ট সার্ভার চালু
yarn dev
```

[http://localhost:3000](http://localhost:3000) খুলুন।

---

## এনভায়রনমেন্ট ভ্যারিয়েবল

### ব্যাকএন্ড (`.env`)

| ভ্যারিয়েবল | বিবরণ | উদাহরণ |
|---|---|---|
| `DATABASE_NAME` | PostgreSQL ডেটাবেসের নাম | `neondb` |
| `DATABASE_USER` | PostgreSQL ব্যবহারকারীর নাম | `neondb_owner` |
| `DATABASE_PASSWORD` | PostgreSQL পাসওয়ার্ড | — |
| `DATABASE_HOST` | PostgreSQL হোস্ট | `ep-xxx.neon.tech` |
| `DATABASE_PORT` | PostgreSQL পোর্ট | `5432` |
| `REDIS_URL` | Redis সংযোগ URL | `redis://localhost:6379/0` |
| `LLM_PROVIDER` | LLM ব্যাকএন্ড | `openai` |
| `LLM_MODEL` | মডেল আইডেন্টিফায়ার | `gemini-2.5-flash` |
| `LLM_BASE_URL` | LLM API বেস URL | — |
| `OPENAI_API_KEY` | OpenAI / সামঞ্জস্যপূর্ণ API কী | — |
| `ANTHROPIC_API_KEY` | Anthropic API কী | — |
| `GEMINI_API_KEY` | Google Gemini API কী | — |
| `EMBEDDING_MODEL` | Sentence-transformer মডেল | `BAAI/bge-base-en-v1.5` |
| `RERANKER_MODEL` | Cross-encoder মডেল | `cross-encoder/ms-marco-MiniLM-L-6-v2` |
| `MAX_UPLOAD_SIZE` | সর্বোচ্চ ফাইল আপলোড (বাইট) | `52428800` (50MB) |
| `CORS_ALLOWED_ORIGINS` | অনুমোদিত CORS উৎস | `http://localhost:3000` |

### ফ্রন্টএন্ড (`.env.local`)

| ভ্যারিয়েবল | বিবরণ | উদাহরণ |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | ব্যাকএন্ড API বেস URL | `http://localhost:8000/api/v1` |

---

## API এন্ডপয়েন্ট

| মেথড | এন্ডপয়েন্ট | বিবরণ |
|---|---|---|
| `POST` | `/api/v1/auth/register/` | নতুন অ্যাকাউন্ট রেজিস্টার |
| `POST` | `/api/v1/auth/login/` | লগইন, JWT প্রদান করে |
| `POST` | `/api/v1/auth/token/refresh/` | অ্যাক্সেস টোকেন রিফ্রেশ |
| `GET` | `/api/v1/auth/me/` | বর্তমান ব্যবহারকারীর প্রোফাইল |
| `GET` | `/api/v1/documents/` | ডকুমেন্ট তালিকা |
| `POST` | `/api/v1/documents/` | ডকুমেন্ট আপলোড |
| `GET` | `/api/v1/documents/:id/` | ডকুমেন্টের বিস্তারিত |
| `DELETE` | `/api/v1/documents/:id/` | ডকুমেন্ট মুছুন |
| `GET` | `/api/v1/collections/` | কালেকশন তালিকা |
| `POST` | `/api/v1/collections/` | কালেকশন তৈরি |
| `GET` | `/api/v1/collections/:id/` | ডকুমেন্টসহ কালেকশন |
| `PATCH` | `/api/v1/collections/:id/` | কালেকশন আপডেট |
| `DELETE` | `/api/v1/collections/:id/` | কালেকশন মুছুন |
| `GET` | `/api/v1/conversations/` | কথোপকথন তালিকা |
| `GET` | `/api/v1/conversations/:id/` | বার্তাসহ কথোপকথন |
| `PATCH` | `/api/v1/conversations/:id/` | কথোপকথন পুনরাম দিন |
| `DELETE` | `/api/v1/conversations/:id/` | কথোপকথন মুছুন |
| `POST` | `/api/v1/chat/` | চ্যাট বার্তা পাঠান (RAG) |

---

## ডেটাবেস স্কিমা

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

## মূল স্থাপত্যিক সিদ্ধান্ত

| সিদ্ধান্ত | যুক্তি |
|---|---|
| **pgvector, Pinecone/Weaviate এর পরিবর্তে** | কোনো বহিঃসেবা নির্ভরতা নেই, Neon ফ্রি টিয়ারে চলে |
| **হাইব্রিড সার্চ (ডেন্স + BM25 + RRF)** | ডেন্স অর্থগত অর্থ ধরে, BM25 সঠিক কীওয়ার্ড ধরে, RRF উভয়কে টিউনিং ছাড়া একত্রিত করে |
| **Cross-encoder রির‍্যাঙ্কিং** | শীর্ষ-৩০ প্রার্থীকে শীর্ষ-৫ পর্যন্ত রির‍্যাঙ্ক করে উচ্চতর নির্ভুলতা নিশ্চিত করে |
| **ডকুমেন্ট প্রক্রিয়াকরণের জন্য Celery** | অ-ব্লকিং ইনজেশন — আপলোড তাৎক্ষণিকভাবে ফিরে আসে, এম্বেডিং অ্যাঙ্কর চলে |
| **৩০ মিনিট মেয়াদের JWT** | নির্বিঘ্ন UX এর জন্য স্বয়ংক্রিয় রিফ্রেশ সহ স্টেটলেস প্রমাণীকরণ |
| **মাল্টি-প্রোভাইডার LLM** | এনভায়রনমেন্ট ভ্যারিয়েবলের মাধ্যমে OpenAI, Anthropic, Gemini, বা স্থানীয় মডেল পরিবর্তন |
| **LimitOffset পেজিনেশন** | ধারাবাহিক `{success, data, pagination}` প্রতিক্রিয়া ফরম্যাট |

---

## লাইসেন্স

ব্যক্তিগত — NextMind AI
