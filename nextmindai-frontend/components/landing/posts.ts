export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  tag: string;
  body: { heading?: string; paragraphs: string[] }[];
}

export const posts: BlogPost[] = [
  {
    slug: "hybrid-search-explained",
    title: "Hybrid search, explained: why we fuse BM25 with embeddings",
    excerpt:
      "Semantic search understands meaning but misses exact terms. Keyword search nails exact terms but misses meaning. Here's why NextMind runs both — and how reciprocal rank fusion merges them.",
    date: "Aug 28, 2026",
    readTime: "6 min read",
    tag: "Retrieval",
    body: [
      {
        paragraphs: [
          "Ask your knowledge base “what is our refund window?” and two very different systems can answer. A keyword engine looks for the literal words “refund” and “window”. An embedding model looks for passages that mean the same thing — even if they say “returns are accepted within 30 days” without ever using the word “refund”.",
          "Each approach fails in the other's sweet spot. Keywords miss paraphrases; embeddings drift on rare terms, part numbers, and names. Production retrieval therefore runs both and merges the rankings.",
        ],
      },
      {
        heading: "Two retrievers, one ranking",
        paragraphs: [
          "NextMind embeds every chunk with a BGE model and ranks by cosine similarity for the semantic side. In parallel, it scores the same chunks with BM25Okapi, a battle-tested keyword scorer. Each retriever returns its top 20 candidates.",
          "The two lists are then combined with reciprocal rank fusion (RRF): a chunk that ranks #2 semantically and #5 by keyword outscores one that ranks #1 in only a single list. RRF needs no score normalization, which is exactly why it works when the two scoring scales are incomparable.",
        ],
      },
      {
        heading: "Why top-20 and not top-5?",
        paragraphs: [
          "Retrieval is a funnel. The hybrid stage optimizes for recall — casting a wide net so the right passage is somewhere in the candidate set. A cross-encoder reranker then reads each candidate pair (query, passage) and keeps the best 5 for the answer. Broad recall first, precise ordering second.",
        ],
      },
    ],
  },
  {
    slug: "reranking-top-chunks",
    title: "How reranking picks the 5 chunks that answer you",
    excerpt:
      "Bi-encoders retrieve fast; cross-encoders read carefully. Learn how a second, slower model pass turns 40 rough candidates into the 5 passages your answer is built on.",
    date: "Aug 20, 2026",
    readTime: "5 min read",
    tag: "Retrieval",
    body: [
      {
        paragraphs: [
          "Embedding search is fast because the query and every passage are encoded independently — relevance is just a dot product. The price of that speed is shallow understanding: the model never actually reads the query and passage together.",
        ],
      },
      {
        heading: "The careful reader",
        paragraphs: [
          "A cross-encoder (we use ms-marco-MiniLM) takes the query and a candidate passage as one input and scores their true relevance. It's too slow to run over a whole corpus, but perfect as a second stage over 40 candidates.",
          "Each candidate gets a rerank score, the list is resorted, and only the top 5 reach the language model. In practice this is where answer quality is won or lost: grounding the model in the right five passages eliminates most hallucinations before generation even starts.",
        ],
      },
    ],
  },
  {
    slug: "organizing-with-collections",
    title: "Organizing knowledge with collections",
    excerpt:
      "One workspace, many domains. Collections let you split engineering docs, contracts, and research into focused bases — and scope every chat to exactly the right one.",
    date: "Aug 12, 2026",
    readTime: "4 min read",
    tag: "Guides",
    body: [
      {
        paragraphs: [
          "A single flat pile of documents works until it doesn't. The moment your workspace holds both the deploy runbook and the parental-leave policy, unscoped search starts mixing answers across domains.",
        ],
      },
      {
        heading: "Scope the retrieval, not just the files",
        paragraphs: [
          "A collection in NextMind isn't a folder — it's a retrieval boundary. When a chat is scoped to a collection, dense search, keyword search, and reranking all operate only on that collection's chunks.",
          "Practical pattern: one collection per domain (Engineering, Legal, Research), plus targeted chats per project. Upload once into the right collection, and every future question in that scope stays clean.",
        ],
      },
    ],
  },
  {
    slug: "bring-your-own-keys",
    title: "Bring your own keys: 23 providers, one workspace",
    excerpt:
      "No markups, no lock-in. Connect your own API keys from OpenAI to Zhipu, pick a different model per chat, and start on free tiers.",
    date: "Aug 4, 2026",
    readTime: "5 min read",
    tag: "Product",
    body: [
      {
        paragraphs: [
          "Every AI workspace eventually faces the model question: which provider, which model, at what price? Our answer is to not decide for you. NextMind connects to 23+ providers through your own API keys — OpenAI, Anthropic, Gemini, DeepSeek, Qwen, Zhipu, Mistral, Groq, and more.",
        ],
      },
      {
        heading: "A model per conversation",
        paragraphs: [
          "Different chats deserve different models. Use a frontier model for the tricky contract review, a free flash model for daily Q&A, and a long-context model for the 500-page manual. The model picker lives in every chat, and your choice is remembered per conversation.",
          "Because you bring the keys, you pay provider prices directly — including generous free tiers like Gemini Flash and GLM Flash. NextMind never sees your usage beyond routing it.",
        ],
      },
    ],
  },
];
