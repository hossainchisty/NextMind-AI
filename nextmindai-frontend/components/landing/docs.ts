export interface DocArticle {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  body: { heading?: string; paragraphs: string[] }[];
}

export const docCategories = ["Getting started", "Knowledge", "AI & providers", "Account & data"];

export const docs: DocArticle[] = [
  {
    slug: "quickstart",
    title: "Quickstart: from signup to first answer",
    excerpt: "Create an account, upload files, and ask your first question in minutes.",
    category: "Getting started",
    body: [
      {
        paragraphs: [
          "Sign up with your email, then open My Knowledge and upload your first files with New Knowledge Base. Parsing and indexing start automatically — each document shows Pending, then Processing, then Success.",
          "Once a document shows Success, open Chat and ask a question about it. Answers stream back with citations naming the exact document and page.",
        ],
      },
      {
        heading: "Tips for great answers",
        paragraphs: [
          "Ask specific questions referencing names, dates, or terms from your files. If an answer feels thin, narrow the chat to the right collection or upload the missing source.",
        ],
      },
    ],
  },
  {
    slug: "uploading-files",
    title: "Uploading files & limits",
    excerpt: "Supported types, size caps, batch uploads, and progress tracking.",
    category: "Getting started",
    body: [
      {
        paragraphs: [
          "Supported file types: PDF, DOCX, TXT, CSV, MD, XLSX, JSON, HTML. Maximum file size is 100 MB per file, and you can upload up to 40 files in one batch.",
        ],
      },
      {
        heading: "How to upload",
        paragraphs: [
          "Open the upload popup from My Knowledge, then drag files anywhere onto the page or into the dropzone — or click browse files. Invalid files are flagged inline before anything uploads, and a progress bar tracks the transfer.",
          "You can assign the whole batch to a collection, and rename a single file's display name before uploading.",
        ],
      },
      {
        heading: "If a source file changes",
        paragraphs: [
          "NextMind does not watch your originals. Hover any document and use the re-upload action to replace its file — the old chunks are discarded and the new content is reprocessed automatically.",
        ],
      },
    ],
  },
  {
    slug: "supported-file-types",
    title: "Supported file types",
    excerpt: "What each format is good for and how it gets indexed.",
    category: "Knowledge",
    body: [
      {
        paragraphs: [
          "PDF keeps page structure, so citations point at exact pages. DOCX, TXT, and Markdown are treated as single flowing documents. CSV and XLSX are read row-by-row with headers preserved, so questions like totals or lookups work. JSON (including JSON-lines) and HTML are converted to clean readable text with scripts and styling stripped.",
        ],
      },
    ],
  },
  {
    slug: "collections",
    title: "Organizing with collections",
    excerpt: "Split your workspace into focused, searchable knowledge bases.",
    category: "Knowledge",
    body: [
      {
        paragraphs: [
          "Create collections such as Engineering, Legal, or Research from the Collections page, then assign documents to them — at upload time, from the document list, or in bulk with checkboxes.",
        ],
      },
      {
        heading: "Scoped chats",
        paragraphs: [
          "A collection is a retrieval boundary: dense search, keyword search, and reranking all run only on that collection's chunks. Scope a chat to the right collection and answers stop mixing domains.",
        ],
      },
    ],
  },
  {
    slug: "re-uploading",
    title: "Re-uploading changed files",
    excerpt: "Keep indexed content in sync when originals change.",
    category: "Knowledge",
    body: [
      {
        paragraphs: [
          "Use the re-upload action on any document row and pick the updated file. The replacement is validated like a fresh upload, old chunks are deleted, and reprocessing starts immediately — the document keeps its name, collection, and place in chats.",
        ],
      },
    ],
  },
  {
    slug: "connecting-providers",
    title: "Connecting an AI provider",
    excerpt: "Add your own API keys across 23+ providers, including free tiers.",
    category: "AI & providers",
    body: [
      {
        paragraphs: [
          "Open Settings → Providers → Add provider, pick a provider, paste your key, and test it before saving. Keys are encrypted at rest and only ever shown back masked.",
          "Free options include Gemini Flash and GLM Flash tiers — ideal for everyday questions.",
        ],
      },
    ],
  },
  {
    slug: "choosing-models",
    title: "Choosing a model per chat",
    excerpt: "Match the model to the task, conversation by conversation.",
    category: "AI & providers",
    body: [
      {
        paragraphs: [
          "The model picker in every chat lists your connected providers' models with context size and pricing. Use a frontier model for tricky analysis, a flash model for daily Q&A, and a long-context model for huge manuals.",
          "Your choice is remembered per conversation, so different chats can run different models side by side.",
        ],
      },
    ],
  },
  {
    slug: "citations",
    title: "Understanding citations",
    excerpt: "How answers trace back to your files — and when to double-check.",
    category: "AI & providers",
    body: [
      {
        paragraphs: [
          "Every answer is built from the top-ranked passages (hybrid search plus reranking) and carries citations naming the document and page. Click through to verify anything important.",
          "AI answers can still be wrong when sources are ambiguous or missing — if citations look thin, narrow the collection or add the missing source.",
        ],
      },
    ],
  },
  {
    slug: "exporting-data",
    title: "Exporting your data",
    excerpt: "Download everything you own as JSON, any time.",
    category: "Account & data",
    body: [
      {
        paragraphs: [
          "Settings → Advanced → Export Data downloads a JSON file with your profile, collections, document metadata, conversations with messages, and connected providers. Provider secret keys are never included.",
          "Your original files remain downloadable individually from their document entries.",
        ],
      },
    ],
  },
  {
    slug: "deleting-data",
    title: "Deleting documents & your account",
    excerpt: "What gets removed, and what really gone means.",
    category: "Account & data",
    body: [
      {
        paragraphs: [
          "Deleting a document removes its stored file, its search chunks, and its embeddings. Removing a collection keeps the documents — reassign or delete them separately.",
          "Deleting your account (Settings → Advanced → Danger Zone) queues a full purge: every stored file plus all rows across documents, collections, conversations, and keys.",
        ],
      },
    ],
  },
  {
    slug: "api-reference",
    title: "API reference",
    excerpt: "The REST endpoints behind the workspace.",
    category: "Account & data",
    body: [
      {
        heading: "Authentication",
        paragraphs: [
          "POST /api/v1/auth/register/ and POST /api/v1/auth/login/ issue access and refresh tokens (Bearer). POST /api/v1/auth/token/refresh/ rotates them; POST /api/v1/auth/logout/ revokes the refresh token.",
        ],
      },
      {
        heading: "Documents & collections",
        paragraphs: [
          "GET/POST /api/v1/documents/ (batch upload up to 40 files via the files field), PATCH /api/v1/documents/{id}/ with a file to re-upload, DELETE to remove. GET/POST /api/v1/collections/ with PATCH/DELETE on /api/v1/collections/{id}/.",
        ],
      },
      {
        heading: "Chat & account",
        paragraphs: [
          "Conversations live under /api/v1/conversations/, chat runs through POST /api/v1/chat/, and search through POST /api/v1/retrieval/. Your profile is at /api/v1/auth/me/ with GET /api/v1/auth/me/export/ for a full JSON export and DELETE for account removal. Service health is public at GET /api/v1/health/.",
        ],
      },
    ],
  },
];
